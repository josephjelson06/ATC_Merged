from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.room import Room
from app.models.room_type import RoomType
from app.modules.limits import check_room_limit
from app.schemas.rooms import RoomCreate, RoomStatusUpdate, RoomUpdate


class RoomService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        tenant_id: UUID,
        status_filter: str | None = None,
        room_type_id: UUID | None = None,
        available_only: bool = False,
    ) -> list[Room]:
        query = self.db.query(Room).filter(Room.tenant_id == tenant_id)
        if available_only:
            query = query.filter(Room.status == "available")
        elif status_filter:
            query = query.filter(Room.status == status_filter)
        if room_type_id:
            query = query.filter(Room.room_type_id == room_type_id)
        return query.order_by(Room.room_number.asc()).all()

    def get_by_id(self, tenant_id: UUID, room_id: UUID) -> Room | None:
        return (
            self.db.query(Room)
            .filter(Room.id == room_id, Room.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: RoomCreate) -> Room:
        check_room_limit(self.db, tenant_id)

        room_type = (
            self.db.query(RoomType)
            .filter(
                RoomType.id == payload.room_type_id,
                RoomType.tenant_id == tenant_id,
            )
            .first()
        )
        if not room_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room type for this hotel",
            )

        existing = (
            self.db.query(Room.id)
            .filter(
                Room.tenant_id == tenant_id,
                Room.room_number == payload.room_number,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room number already exists for this hotel",
            )

        room = Room(tenant_id=tenant_id, **payload.model_dump())
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room

    def update(self, tenant_id: UUID, room_id: UUID, payload: RoomUpdate) -> Room | None:
        room = self.get_by_id(tenant_id, room_id)
        if not room:
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
                    detail="Invalid room type for this hotel",
                )

        if "room_number" in updates and updates["room_number"] != room.room_number:
            existing = (
                self.db.query(Room.id)
                .filter(
                    Room.tenant_id == tenant_id,
                    Room.room_number == updates["room_number"],
                    Room.id != room.id,
                )
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Room number already exists for this hotel",
                )

        for key, value in updates.items():
            setattr(room, key, value)

        self.db.commit()
        self.db.refresh(room)
        return room

    def update_status(
        self, tenant_id: UUID, room_id: UUID, payload: RoomStatusUpdate
    ) -> Room | None:
        room = self.get_by_id(tenant_id, room_id)
        if not room:
            return None
        room.status = payload.status
        self.db.commit()
        self.db.refresh(room)
        return room
