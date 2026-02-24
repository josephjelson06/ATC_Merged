from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class PaymentCreate(BaseModel):
    booking_id: UUID
    amount: Decimal
    currency: str = "USD"
    method: str
    status: str = "pending"
    reference: str | None = None


class PaymentUpdate(BaseModel):
    amount: Decimal | None = None
    currency: str | None = None
    method: str | None = None
    status: str | None = None
    reference: str | None = None


class PaymentRead(ORMBase):
    id: UUID
    tenant_id: UUID
    booking_id: UUID
    amount: Decimal
    currency: str
    method: str
    status: str
    reference: str | None
    created_at: datetime
    updated_at: datetime
