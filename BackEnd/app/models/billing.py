import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, TIMESTAMP, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, default=0.0)  # Added price
    period_months: Mapped[int] = mapped_column()

    max_users: Mapped[int | None]
    max_roles: Mapped[int | None]
    max_rooms: Mapped[int | None]

    is_archived: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false"
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenants = relationship("Tenant", backref="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    start_date: Mapped[datetime]
    end_date: Mapped[datetime]
    status: Mapped[str]

    tenant = relationship("Tenant", back_populates="subscriptions")
