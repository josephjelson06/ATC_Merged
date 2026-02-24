import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, TIMESTAMP, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id",
            "idempotency_key",
            name="uq_bookings_tenant_idempotency_key",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    guest_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("guests.id", ondelete="SET NULL")
    )
    guest_name: Mapped[str] = mapped_column(String(255), nullable=False)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, nullable=False)
    children: Mapped[int | None] = mapped_column(Integer)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    session_id: Mapped[str | None] = mapped_column(String(120))
    idempotency_key: Mapped[str | None] = mapped_column(String(190))
    payment_ref: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="DRAFT")
    room_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("room_types.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="bookings")
    guest = relationship("Guest", back_populates="bookings")
    room_type = relationship("RoomType", back_populates="bookings")
    check_in = relationship("CheckIn", back_populates="booking", uselist=False)
    payments = relationship("Payment", back_populates="booking")
