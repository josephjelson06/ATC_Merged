from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class AuditLogCreate(BaseModel):
    tenant_id: UUID | None = None
    user_id: UUID | None = None
    action: str
    resource_type: str
    resource_id: str
    details: dict[str, Any] | None = None
    ip_address: str | None = None


class AuditLogRead(ORMBase):
    id: UUID
    tenant_id: UUID | None
    user_id: UUID | None
    action: str
    resource_type: str
    resource_id: str
    details: dict[str, Any] | None
    ip_address: str | None
    created_at: datetime
