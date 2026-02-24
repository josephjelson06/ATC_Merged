from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class RoomCreate(BaseModel):
    room_type_id: UUID
    room_number: str
    floor: int | None = None
    status: str = "available"


class RoomUpdate(BaseModel):
    room_type_id: UUID | None = None
    room_number: str | None = None
    floor: int | None = None
    status: str | None = None


class RoomStatusUpdate(BaseModel):
    status: str


class RoomRead(ORMBase):
    id: UUID
    tenant_id: UUID
    room_type_id: UUID
    room_number: str
    floor: int | None
    status: str
    created_at: datetime
    updated_at: datetime
