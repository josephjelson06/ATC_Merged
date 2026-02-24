from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.hotel_settings import HotelSettingsRead, HotelSettingsUpdate
from app.services.hotel_settings_service import HotelSettingsService


router = APIRouter(prefix="/api/hotels/{hotel_id}/settings", tags=["Hotel Settings"])


@router.get("", response_model=HotelSettingsRead)
def get_hotel_settings(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:settings:read")),
):
    service = HotelSettingsService(db)
    return service.get_settings(hotel_id)


@router.patch("", response_model=HotelSettingsRead)
def update_hotel_settings(
    hotel_id: UUID,
    payload: HotelSettingsUpdate,
    request: Request,
    current_user=Depends(require_permission("hotel:settings:write")),
    db: Session = Depends(get_db),
):
    service = HotelSettingsService(db)
    return service.update_settings(
        hotel_id,
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )
