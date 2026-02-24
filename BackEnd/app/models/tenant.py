import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Boolean, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    hotel_name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)

    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenant_users.id"), nullable=True
    )

    plan_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("plans.id"))

    gstin: Mapped[str | None] = mapped_column(String)
    pan: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    users = relationship(
        "TenantUser", back_populates="tenant", foreign_keys="TenantUser.tenant_id"
    )
    roles = relationship("TenantRole", back_populates="tenant")
    subscriptions = relationship("Subscription", back_populates="tenant")
    tickets = relationship("SupportTicket", back_populates="tenant")
    hotel_config = relationship(
        "HotelConfig",
        back_populates="tenant",
        cascade="all, delete-orphan",
        uselist=False,
    )
    room_types = relationship(
        "RoomType", back_populates="tenant", cascade="all, delete-orphan"
    )
    rooms = relationship("Room", back_populates="tenant", cascade="all, delete-orphan")
    guests = relationship(
        "Guest", back_populates="tenant", cascade="all, delete-orphan"
    )
    bookings = relationship(
        "Booking", back_populates="tenant", cascade="all, delete-orphan"
    )
    kiosks = relationship(
        "Kiosk", back_populates="tenant", cascade="all, delete-orphan"
    )
    check_ins = relationship(
        "CheckIn", back_populates="tenant", cascade="all, delete-orphan"
    )
    payments = relationship(
        "Payment", back_populates="tenant", cascade="all, delete-orphan"
    )
    incidents = relationship(
        "Incident", back_populates="tenant", cascade="all, delete-orphan"
    )
    invoices = relationship(
        "Invoice", back_populates="tenant", cascade="all, delete-orphan"
    )
    audit_logs = relationship("AuditLog", back_populates="tenant")

    owner = relationship("TenantUser", foreign_keys=[owner_user_id])


class TenantRole(Base):
    __tablename__ = "tenant_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("TenantUser", back_populates="role")

    permissions = relationship(
        "Permission", secondary="tenant_role_permissions", back_populates="tenant_roles"
    )


class TenantUser(Base):
    __tablename__ = "tenant_users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String)
    name: Mapped[str | None] = mapped_column(String)

    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenant_roles.id"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    tenant = relationship("Tenant", back_populates="users", foreign_keys=[tenant_id])
    role = relationship("TenantRole", back_populates="users")
