from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.checkins import CheckInCreate, CheckInRead
from app.services.checkin_service import CheckInService


router = APIRouter(prefix="/api/hotels/{hotel_id}/check-in", tags=["Check-In"])


@router.post("", response_model=CheckInRead, status_code=status.HTTP_201_CREATED)
def create_checkin(
    hotel_id: UUID,
    payload: CheckInCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:checkin:write")),
):
    service = CheckInService(db)
    return service.create(hotel_id, payload)


@router.post("/{checkin_id}/checkout", response_model=CheckInRead)
def checkout(
    hotel_id: UUID,
    checkin_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:checkin:write")),
):
    service = CheckInService(db)
    checkin = service.checkout(hotel_id, checkin_id)
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in record not found")
    return checkin
