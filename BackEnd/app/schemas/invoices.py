from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class InvoiceCreate(BaseModel):
    tenant_id: UUID
    subscription_id: UUID
    amount: Decimal
    currency: str = "USD"
    status: InvoiceStatus = InvoiceStatus.DRAFT
    due_date: date


class InvoiceUpdate(BaseModel):
    amount: Decimal | None = None
    currency: str | None = None
    status: InvoiceStatus | None = None
    due_date: date | None = None
    paid_at: datetime | None = None


class InvoiceMarkPaid(BaseModel):
    paid_at: datetime | None = None


class InvoiceRead(ORMBase):
    id: UUID
    tenant_id: UUID
    subscription_id: UUID
    amount: Decimal
    currency: str
    status: InvoiceStatus
    due_date: date
    paid_at: datetime | None
    created_at: datetime
    updated_at: datetime
