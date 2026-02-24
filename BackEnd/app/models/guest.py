import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)
    id_type: Mapped[str | None] = mapped_column(String(80))
    id_number: Mapped[str | None] = mapped_column(String(120))
    id_scan_url: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="guests")
    bookings = relationship("Booking", back_populates="guest")
    check_ins = relationship("CheckIn", back_populates="guest")
