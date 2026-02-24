from uuid import UUID
from pydantic import BaseModel
from app.schemas.base import ORMBase
from app.schemas.permissions import PermissionRead


class TenantRoleCreate(BaseModel):
    name: str


class TenantRoleRead(ORMBase):
    id: UUID
    name: str
    status: bool
    permissions: list[PermissionRead] = []
