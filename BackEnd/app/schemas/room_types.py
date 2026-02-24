from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class RoomTypeCreate(BaseModel):
    name: str
    code: str
    price: Decimal
    amenities: list[str] = []
    image_url: str | None = None


class RoomTypeUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    price: Decimal | None = None
    amenities: list[str] | None = None
    image_url: str | None = None


class RoomTypeRead(ORMBase):
    id: UUID
    tenant_id: UUID
    name: str
    code: str
    price: Decimal
    amenities: list[str] | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime
