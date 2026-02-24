from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.guests import GuestCreate, GuestRead, GuestUpdate
from app.services.guest_service import GuestService


router = APIRouter(prefix="/api/hotels/{hotel_id}/guests", tags=["Guests"])


@router.get("", response_model=list[GuestRead])
def list_guests(
    hotel_id: UUID,
    skip: int = 0,
    limit: int = 100,
    q: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:guests:read")),
):
    service = GuestService(db)
    return service.get_all(hotel_id, skip=skip, limit=limit, q=q)


@router.post("", response_model=GuestRead)
def create_guest(
    hotel_id: UUID,
    payload: GuestCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:guests:write")),
):
    service = GuestService(db)
    return service.create(hotel_id, payload)


@router.put("/{guest_id}", response_model=GuestRead)
def update_guest(
    hotel_id: UUID,
    guest_id: UUID,
    payload: GuestUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:guests:write")),
):
    service = GuestService(db)
    guest = service.update(hotel_id, guest_id, payload)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest
