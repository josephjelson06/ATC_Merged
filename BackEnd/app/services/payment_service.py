from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.payment import Payment
from app.schemas.payments import PaymentCreate, PaymentUpdate


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, tenant_id: UUID, booking_id: UUID | None = None) -> list[Payment]:
        query = self.db.query(Payment).filter(Payment.tenant_id == tenant_id)
        if booking_id:
            query = query.filter(Payment.booking_id == booking_id)
        return query.order_by(Payment.created_at.desc()).all()

    def get_by_id(self, tenant_id: UUID, payment_id: UUID) -> Payment | None:
        return (
            self.db.query(Payment)
            .filter(Payment.id == payment_id, Payment.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: PaymentCreate) -> Payment:
        booking = (
            self.db.query(Booking)
            .filter(Booking.id == payload.booking_id, Booking.tenant_id == tenant_id)
            .first()
        )
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking not found for this hotel",
            )

        payment = Payment(tenant_id=tenant_id, **payload.model_dump())
        self.db.add(payment)

        if payment.status.lower() == "completed":
            booking.payment_ref = payment.reference
            if booking.status == "DRAFT":
                booking.status = "CONFIRMED"

        self.db.commit()
        self.db.refresh(payment)
        return payment

    def update(self, tenant_id: UUID, payment_id: UUID, payload: PaymentUpdate) -> Payment | None:
        payment = self.get_by_id(tenant_id, payment_id)
        if not payment:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(payment, key, value)
        self.db.commit()
        self.db.refresh(payment)
        return payment
