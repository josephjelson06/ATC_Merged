from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.schemas.base import ORMBase


class GuestCreate(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    id_type: str | None = None
    id_number: str | None = None
    id_scan_url: str | None = None


class GuestUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    id_type: str | None = None
    id_number: str | None = None
    id_scan_url: str | None = None


class GuestRead(ORMBase):
    id: UUID
    tenant_id: UUID
    name: str
    email: EmailStr | None
    phone: str | None
    id_type: str | None
    id_number: str | None
    id_scan_url: str | None
    created_at: datetime
    updated_at: datetime
