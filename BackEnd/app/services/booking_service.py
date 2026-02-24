from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.guest import Guest
from app.models.room_type import RoomType
from app.schemas.bookings import BookingCreate, BookingStatusUpdate, BookingUpdate


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _calculate_nights(check_in_date: date, check_out_date: date) -> int:
        delta = (check_out_date - check_in_date).days
        if delta <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="check_out_date must be after check_in_date",
            )
        return delta

    def get_all(self, tenant_id: UUID, status_filter: str | None = None) -> list[Booking]:
        query = self.db.query(Booking).filter(Booking.tenant_id == tenant_id)
        if status_filter:
            query = query.filter(Booking.status == status_filter)
        return query.order_by(Booking.created_at.desc()).all()

    def get_by_id(self, tenant_id: UUID, booking_id: UUID) -> Booking | None:
        return (
            self.db.query(Booking)
            .filter(Booking.id == booking_id, Booking.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: BookingCreate) -> Booking:
        room_type = (
            self.db.query(RoomType.id)
            .filter(
                RoomType.id == payload.room_type_id,
                RoomType.tenant_id == tenant_id,
            )
            .first()
        )
        if not room_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room type for this booking",
            )

        if payload.guest_id:
            guest = (
                self.db.query(Guest.id)
                .filter(Guest.id == payload.guest_id, Guest.tenant_id == tenant_id)
                .first()
            )
            if not guest:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid guest for this booking",
                )

        if payload.idempotency_key:
            existing = (
                self.db.query(Booking)
                .filter(
                    Booking.tenant_id == tenant_id,
                    Booking.idempotency_key == payload.idempotency_key,
                )
                .first()
            )
            if existing:
                return existing

        nights = payload.nights or self._calculate_nights(
            payload.check_in_date, payload.check_out_date
        )
        booking_data = payload.model_dump()
        booking_data["nights"] = nights

        booking = Booking(tenant_id=tenant_id, **booking_data)
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def update(self, tenant_id: UUID, booking_id: UUID, payload: BookingUpdate) -> Booking | None:
        booking = self.get_by_id(tenant_id, booking_id)
        if not booking:
            return None

        updates = payload.model_dump(exclude_unset=True)
        if "room_type_id" in updates:
            room_type = (
                self.db.query(RoomType.id)
                .filter(
                    RoomType.id == updates["room_type_id"],
                    RoomType.tenant_id == tenant_id,
                )
                .first()
            )
            if not room_type:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid room type for this booking",
                )

        if "guest_id" in updates and updates["guest_id"]:
            guest = (
                self.db.query(Guest.id)
                .filter(Guest.id == updates["guest_id"], Guest.tenant_id == tenant_id)
                .first()
            )
            if not guest:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid guest for this booking",
                )

        for key, value in updates.items():
            setattr(booking, key, value)

        if booking.nights is None or (
            "check_in_date" in updates and "check_out_date" in updates
        ):
            booking.nights = self._calculate_nights(
                booking.check_in_date, booking.check_out_date
            )

        self.db.commit()
        self.db.refresh(booking)
        return booking

    def update_status(
        self, tenant_id: UUID, booking_id: UUID, payload: BookingStatusUpdate
    ) -> Booking | None:
        booking = self.get_by_id(tenant_id, booking_id)
        if not booking:
            return None
        booking.status = payload.status
        self.db.commit()
        self.db.refresh(booking)
        return booking
