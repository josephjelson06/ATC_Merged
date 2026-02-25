from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class KioskCreate(BaseModel):
    name: str
    api_key: str | None = None
    firmware_version: str | None = None
    status: str = "offline"


class KioskHeartbeat(BaseModel):
    firmware_version: str | None = None


class KioskUpdate(BaseModel):
    name: str | None = None
    firmware_version: str | None = None
    status: str | None = None


class KioskRead(ORMBase):
    id: UUID
    tenant_id: UUID
    name: str
    api_key: str
    firmware_version: str | None
    status: str
    last_heartbeat_at: datetime | None
    created_at: datetime
    updated_at: datetime


class KioskTenantRead(ORMBase):
    id: UUID
    hotel_name: str
    slug: str


class KioskTenantListItem(ORMBase):
    slug: str
    name: str
    logo_url: str | None = None


class KioskRoomTypeRead(ORMBase):
    id: UUID
    name: str
    code: str
    price: Decimal
    amenities: list[str] | None
    image_url: str | None
