"""add_kiosk_schema_and_tenant_slug

Revision ID: f1d9a8b24b21
Revises: 703b54b67d53
Create Date: 2026-02-23 16:58:00.000000

"""

from typing import Sequence, Union
import re

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f1d9a8b24b21"
down_revision: Union[str, Sequence[str], None] = "703b54b67d53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "hotel"


def _next_available_slug(base_slug: str, used: set[str]) -> str:
    candidate = base_slug
    suffix = 2
    while candidate in used:
        candidate = f"{base_slug}-{suffix}"
        suffix += 1
    return candidate


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("tenants", sa.Column("slug", sa.String(length=120), nullable=True))

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, hotel_name FROM tenants")).fetchall()
    used_slugs: set[str] = set()

    for row in rows:
        base_slug = _slugify(row.hotel_name or "hotel")
        slug = _next_available_slug(base_slug, used_slugs)
        used_slugs.add(slug)
        bind.execute(
            sa.text("UPDATE tenants SET slug = :slug WHERE id = :tenant_id"),
            {"slug": slug, "tenant_id": row.id},
        )

    op.alter_column("tenants", "slug", existing_type=sa.String(length=120), nullable=False)
    op.create_unique_constraint("uq_tenants_slug", "tenants", ["slug"])

    op.create_table(
        "hotel_configs",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("timezone", sa.String(length=100), nullable=False),
        sa.Column("support_phone", sa.String(length=40), nullable=True),
        sa.Column("check_in_time", sa.Time(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", name="uq_hotel_configs_tenant_id"),
    )

    op.create_table(
        "room_types",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=60), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("amenities", sa.ARRAY(sa.Text()), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "code", name="uq_room_types_code"),
    )

    op.create_table(
        "rooms",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("room_type_id", sa.UUID(), nullable=False),
        sa.Column("room_number", sa.String(length=20), nullable=False),
        sa.Column("floor", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["room_type_id"], ["room_types.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tenant_id", "room_number", name="uq_rooms_room_number"),
    )

    op.create_table(
        "guests",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("id_type", sa.String(length=80), nullable=True),
        sa.Column("id_number", sa.String(length=120), nullable=True),
        sa.Column("id_scan_url", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("guest_id", sa.UUID(), nullable=True),
        sa.Column("guest_name", sa.String(length=255), nullable=False),
        sa.Column("check_in_date", sa.Date(), nullable=False),
        sa.Column("check_out_date", sa.Date(), nullable=False),
        sa.Column("adults", sa.Integer(), nullable=False),
        sa.Column("children", sa.Integer(), nullable=True),
        sa.Column("nights", sa.Integer(), nullable=False),
        sa.Column("total_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("session_id", sa.String(length=120), nullable=True),
        sa.Column("idempotency_key", sa.String(length=190), nullable=True),
        sa.Column("payment_ref", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("room_type_id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["guest_id"], ["guests.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["room_type_id"], ["room_types.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "tenant_id",
            "idempotency_key",
            name="uq_bookings_tenant_idempotency_key",
        ),
    )

    op.create_table(
        "kiosks",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("api_key", sa.String(length=190), nullable=False),
        sa.Column("firmware_version", sa.String(length=80), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("last_heartbeat_at", sa.TIMESTAMP(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("api_key", name="uq_kiosks_api_key"),
    )

    op.create_table(
        "check_ins",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("booking_id", sa.UUID(), nullable=False),
        sa.Column("guest_id", sa.UUID(), nullable=False),
        sa.Column("room_id", sa.UUID(), nullable=False),
        sa.Column("kiosk_id", sa.UUID(), nullable=True),
        sa.Column(
            "checked_in_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("checked_out_at", sa.TIMESTAMP(), nullable=True),
        sa.Column(
            "key_card_issued",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["guest_id"], ["guests.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["room_id"], ["rooms.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["kiosk_id"], ["kiosks.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("booking_id", sa.UUID(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("method", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("reference", sa.String(length=120), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("payments")
    op.drop_table("check_ins")
    op.drop_table("kiosks")
    op.drop_table("bookings")
    op.drop_table("guests")
    op.drop_table("rooms")
    op.drop_table("room_types")
    op.drop_table("hotel_configs")

    op.drop_constraint("uq_tenants_slug", "tenants", type_="unique")
    op.drop_column("tenants", "slug")
