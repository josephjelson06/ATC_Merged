from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.schemas.base import ORMBase


class PlatformRoleRead(ORMBase):
    id: UUID
    name: str
    status: bool


class PlatformUserCreate(BaseModel):
    email: EmailStr
    phone: str | None = None
    name: str | None = None
    password: str
    role_id: UUID


class PlatformUserRead(ORMBase):
    id: UUID
    email: EmailStr
    phone: str | None
    name: str | None
    role: PlatformRoleRead
