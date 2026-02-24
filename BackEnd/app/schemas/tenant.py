from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.schemas.base import ORMBase


# ---------- TENANT ----------


class TenantCreate(BaseModel):
    hotel_name: str
    slug: str | None = None
    address: str | None = None
    plan_id: UUID | None = None


class TenantRead(ORMBase):
    id: UUID
    hotel_name: str
    slug: str
    address: str | None
    plan_id: UUID | None
    owner_user_id: UUID | None
