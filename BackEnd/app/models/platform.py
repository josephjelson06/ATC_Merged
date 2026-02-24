import uuid
from sqlalchemy import String, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.db.base import Base


class PlatformRole(Base):
    __tablename__ = "platform_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    users = relationship("PlatformUser", back_populates="role")
    permissions = relationship(
        "Permission",
        secondary="platform_role_permissions",
        back_populates="platform_roles",
    )


class PlatformUser(Base):
    __tablename__ = "platform_users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String)
    name: Mapped[str | None] = mapped_column(String)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("platform_roles.id"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    role = relationship("PlatformRole", back_populates="users")
