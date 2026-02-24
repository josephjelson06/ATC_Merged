from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class BookingCreate(BaseModel):
    guest_id: UUID | None = None
    guest_name: str
    check_in_date: date
    check_out_date: date
    adults: int
    children: int | None = None
    nights: int | None = None
    total_price: Decimal | None = None
    session_id: str | None = None
    idempotency_key: str | None = None
    payment_ref: str | None = None
    status: str = "DRAFT"
    room_type_id: UUID


class BookingUpdate(BaseModel):
    guest_id: UUID | None = None
    guest_name: str | None = None
    check_in_date: date | None = None
    check_out_date: date | None = None
    adults: int | None = None
    children: int | None = None
    nights: int | None = None
    total_price: Decimal | None = None
    session_id: str | None = None
    idempotency_key: str | None = None
    payment_ref: str | None = None
    status: str | None = None
    room_type_id: UUID | None = None


class BookingStatusUpdate(BaseModel):
    status: str


class BookingRead(ORMBase):
    id: UUID
    tenant_id: UUID
    guest_id: UUID | None
    guest_name: str
    check_in_date: date
    check_out_date: date
    adults: int
    children: int | None
    nights: int
    total_price: Decimal | None
    session_id: str | None
    idempotency_key: str | None
    payment_ref: str | None
    status: str
    room_type_id: UUID
    created_at: datetime
    updated_at: datetime
