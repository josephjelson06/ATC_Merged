from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.schemas.base import ORMBase
from app.schemas.tenant_roles import TenantRoleRead


class TenantUserCreate(BaseModel):
    email: EmailStr
    phone: str | None = None
    name: str | None = None
    password: str
    role_id: UUID


class TenantUserUpdate(BaseModel):
    phone: str | None = None
    name: str | None = None
    role_id: UUID | None = None


class TenantUserRead(ORMBase):
    id: UUID
    email: EmailStr
    phone: str | None
    name: str | None
    role: TenantRoleRead
