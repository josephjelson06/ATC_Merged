from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.bookings import (
    BookingCreate,
    BookingRead,
    BookingStatusUpdate,
    BookingUpdate,
)
from app.services.booking_service import BookingService


router = APIRouter(prefix="/api/hotels/{hotel_id}/bookings", tags=["Bookings"])


@router.get("", response_model=list[BookingRead])
def list_bookings(
    hotel_id: UUID,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:read")),
):
    service = BookingService(db)
    return service.get_all(hotel_id, status_filter=status_filter)


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    hotel_id: UUID,
    payload: BookingCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:write")),
):
    service = BookingService(db)
    return service.create(hotel_id, payload)


@router.put("/{booking_id}", response_model=BookingRead)
def update_booking(
    hotel_id: UUID,
    booking_id: UUID,
    payload: BookingUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:write")),
):
    service = BookingService(db)
    booking = service.update(hotel_id, booking_id, payload)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.patch("/{booking_id}/status", response_model=BookingRead)
def update_booking_status(
    hotel_id: UUID,
    booking_id: UUID,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:write")),
):
    service = BookingService(db)
    booking = service.update_status(hotel_id, booking_id, payload)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
