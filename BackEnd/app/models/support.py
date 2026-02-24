import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    category: Mapped[str | None] = mapped_column(String)
    priority: Mapped[str | None] = mapped_column(String)
    status: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="tickets")
    messages = relationship(
        "SupportMessage", back_populates="ticket", cascade="all, delete-orphan"
    )


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("support_tickets.id"), nullable=False
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )  # User ID
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    is_internal: Mapped[bool] = mapped_column(default=False)

    ticket = relationship("SupportTicket", back_populates="messages")
