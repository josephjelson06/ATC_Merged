from uuid import UUID
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.support import (
    SupportTicketRead,
    SupportTicketCreate,
    SupportTicketDetail,
    SupportMessageCreate,
    SupportMessageRead,
)
from app.services.support_service import SupportService
from app.modules.rbac import require_permission
from app.core.auth.dependencies import get_current_user
from app.models.platform import PlatformUser
from app.models.tenant import TenantUser


router = APIRouter(tags=["Support"])


@router.get(
    "/api/hotels/{hotel_id}/support/tickets", response_model=List[SupportTicketDetail]
)
def get_tickets(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:support:read")),
):
    service = SupportService(db)
    return service.get_by_tenant(hotel_id)


@router.post("/api/hotels/{hotel_id}/support/tickets", response_model=SupportTicketRead)
def create_ticket(
    hotel_id: UUID,
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:support:write")),
):
    service = SupportService(db)
    return service.create(hotel_id, payload)


@router.get("/api/platform/support/tickets", response_model=List[SupportTicketDetail])
def get_all_tickets(
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:support:read")),
):
    service = SupportService(db)
    return service.get_all()


@router.get("/api/support/tickets/{ticket_id}", response_model=SupportTicketDetail)
def get_ticket_detail(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    # Permissions? Allow both platform and tenant with access?
    # For now assuming simple auth or public for authenticated users
    # In real app, check if user belongs to tenant or is platform
):
    service = SupportService(db)
    ticket = service.get_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.post(
    "/api/support/tickets/{ticket_id}/messages", response_model=SupportMessageRead
)
def add_message(
    ticket_id: UUID,
    payload: SupportMessageCreate,
    current_user: Union[PlatformUser, TenantUser] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = SupportService(db)
    return service.add_message(
        ticket_id, payload.message, current_user.id, is_internal=payload.is_internal
    )


@router.patch(
    "/api/support/tickets/{ticket_id}/status", response_model=SupportTicketRead
)
def update_status(
    ticket_id: UUID,
    status: str,  # Should be in body ideally but query param for simplicity generic
    db: Session = Depends(get_db),
    _=Depends(
        require_permission("platform:support:write")
    ),  # Restrict to platform for resolving?
):
    service = SupportService(db)
    return service.update_status(ticket_id, status)
