import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CheckIn(Base):
    __tablename__ = "check_ins"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    booking_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("guests.id", ondelete="RESTRICT"), nullable=False
    )
    room_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False
    )
    kiosk_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("kiosks.id", ondelete="SET NULL")
    )
    checked_in_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    checked_out_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)
    key_card_issued: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="check_ins")
    booking = relationship("Booking", back_populates="check_in")
    guest = relationship("Guest", back_populates="check_ins")
    room = relationship("Room", back_populates="check_ins")
    kiosk = relationship("Kiosk", back_populates="check_ins")
