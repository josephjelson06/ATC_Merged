import uuid
from datetime import datetime, time

from sqlalchemy import ForeignKey, String, TIMESTAMP, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class HotelConfig(Base):
    __tablename__ = "hotel_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    timezone: Mapped[str] = mapped_column(String(100), nullable=False, default="UTC")
    support_phone: Mapped[str | None] = mapped_column(String(40))
    check_in_time: Mapped[time | None] = mapped_column(Time)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="hotel_config")
