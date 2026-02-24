from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.payments import PaymentCreate, PaymentRead, PaymentUpdate
from app.services.payment_service import PaymentService


router = APIRouter(prefix="/api/hotels/{hotel_id}/payments", tags=["Payments"])


@router.get("", response_model=list[PaymentRead])
def list_payments(
    hotel_id: UUID,
    booking_id: UUID | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:payments:read")),
):
    service = PaymentService(db)
    return service.get_all(hotel_id, booking_id=booking_id)


@router.post("", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    hotel_id: UUID,
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:payments:write")),
):
    service = PaymentService(db)
    return service.create(hotel_id, payload)


@router.patch("/{payment_id}", response_model=PaymentRead)
def update_payment(
    hotel_id: UUID,
    payment_id: UUID,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:payments:write")),
):
    service = PaymentService(db)
    payment = service.update(hotel_id, payment_id, payload)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
