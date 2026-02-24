from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class CheckInCreate(BaseModel):
    booking_id: UUID
    guest_id: UUID
    room_id: UUID
    kiosk_id: UUID | None = None
    key_card_issued: bool = False


class CheckOutCreate(BaseModel):
    checked_out_at: datetime | None = None


class CheckInRead(ORMBase):
    id: UUID
    tenant_id: UUID
    booking_id: UUID
    guest_id: UUID
    room_id: UUID
    kiosk_id: UUID | None
    checked_in_at: datetime
    checked_out_at: datetime | None
    key_card_issued: bool
    created_at: datetime
