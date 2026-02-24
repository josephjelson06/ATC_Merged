import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    platform_roles = relationship(
        "PlatformRole",
        secondary="platform_role_permissions",
        back_populates="permissions",
    )

    tenant_roles = relationship(
        "TenantRole", secondary="tenant_role_permissions", back_populates="permissions"
    )
