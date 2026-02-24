from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.schemas.base import ORMBase


class SupportTicketCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    priority: str | None = None


class SupportTicketRead(ORMBase):
    id: UUID
    title: str
    description: str | None
    category: str | None
    priority: str | None
    status: str | None
    created_at: datetime | None = None


class SupportMessageCreate(BaseModel):
    message: str
    is_internal: bool = False


class SupportMessageRead(ORMBase):
    id: UUID
    ticket_id: UUID
    sender_id: UUID | None
    message: str
    created_at: datetime | None = None
    is_internal: bool


class SupportTicketDetail(SupportTicketRead):
    messages: list[SupportMessageRead] = []
