from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.check_in import CheckIn
from app.models.guest import Guest
from app.models.kiosk import Kiosk
from app.models.room import Room
from app.schemas.checkins import CheckInCreate


class CheckInService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, tenant_id: UUID, checkin_id: UUID) -> CheckIn | None:
        return (
            self.db.query(CheckIn)
            .filter(CheckIn.id == checkin_id, CheckIn.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: CheckInCreate) -> CheckIn:
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

        guest = (
            self.db.query(Guest)
            .filter(Guest.id == payload.guest_id, Guest.tenant_id == tenant_id)
            .first()
        )
        if not guest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Guest not found for this hotel",
            )

        room = (
            self.db.query(Room)
            .filter(Room.id == payload.room_id, Room.tenant_id == tenant_id)
            .first()
        )
        if not room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room not found for this hotel",
            )
        if room.status != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room is not available",
            )

        if payload.kiosk_id:
            kiosk = (
                self.db.query(Kiosk.id)
                .filter(Kiosk.id == payload.kiosk_id, Kiosk.tenant_id == tenant_id)
                .first()
            )
            if not kiosk:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kiosk not found for this hotel",
                )

        active = (
            self.db.query(CheckIn.id)
            .filter(
                CheckIn.booking_id == payload.booking_id,
                CheckIn.checked_out_at.is_(None),
            )
            .first()
        )
        if active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking already checked in",
            )

        checkin = CheckIn(tenant_id=tenant_id, **payload.model_dump())
        booking.status = "CHECKED_IN"
        room.status = "occupied"

        self.db.add(checkin)
        self.db.commit()
        self.db.refresh(checkin)
        return checkin

    def checkout(self, tenant_id: UUID, checkin_id: UUID) -> CheckIn | None:
        checkin = self.get_by_id(tenant_id, checkin_id)
        if not checkin:
            return None
        if checkin.checked_out_at is None:
            checkin.checked_out_at = datetime.utcnow()
            if checkin.booking:
                checkin.booking.status = "CHECKED_OUT"
            if checkin.room:
                checkin.room.status = "available"
            self.db.commit()
            self.db.refresh(checkin)
        return checkin
