from uuid import UUID
from typing import List
from sqlalchemy.orm import Session

from app.models.support import SupportTicket
from app.schemas.support import SupportTicketCreate


class SupportService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_tenant(self, tenant_id: UUID) -> List[SupportTicket]:
        return (
            self.db.query(SupportTicket)
            .filter(SupportTicket.tenant_id == tenant_id)
            .all()
        )

    def get_all(self) -> List[SupportTicket]:
        return self.db.query(SupportTicket).all()

    def get_by_id(self, ticket_id: UUID) -> SupportTicket | None:
        return (
            self.db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
        )

    def create(self, tenant_id: UUID, payload: SupportTicketCreate) -> SupportTicket:
        ticket = SupportTicket(
            **payload.model_dump(), tenant_id=tenant_id, status="open"
        )
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def add_message(
        self,
        ticket_id: UUID,
        payload: str,
        sender_id: UUID | None,
        is_internal: bool = False,
    ):
        from app.models.support import SupportMessage

        msg = SupportMessage(
            ticket_id=ticket_id,
            sender_id=sender_id,
            message=payload,
            is_internal=is_internal,
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def update_status(self, ticket_id: UUID, status: str):
        ticket = self.get_by_id(ticket_id)
        if ticket:
            ticket.status = status
            self.db.commit()
            self.db.refresh(ticket)
        return ticket
