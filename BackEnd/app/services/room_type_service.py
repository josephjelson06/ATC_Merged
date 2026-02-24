from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.room_type import RoomType
from app.schemas.room_types import RoomTypeCreate, RoomTypeUpdate


class RoomTypeService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, tenant_id: UUID) -> list[RoomType]:
        return (
            self.db.query(RoomType)
            .filter(RoomType.tenant_id == tenant_id)
            .order_by(RoomType.created_at.desc())
            .all()
        )

    def get_by_id(self, tenant_id: UUID, room_type_id: UUID) -> RoomType | None:
        return (
            self.db.query(RoomType)
            .filter(RoomType.id == room_type_id, RoomType.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: RoomTypeCreate) -> RoomType:
        exists = (
            self.db.query(RoomType)
            .filter(
                RoomType.tenant_id == tenant_id,
                RoomType.code == payload.code,
            )
            .first()
        )
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Room type code already exists for this hotel",
            )

        room_type = RoomType(tenant_id=tenant_id, **payload.model_dump())
        self.db.add(room_type)
        self.db.commit()
        self.db.refresh(room_type)
        return room_type

    def update(
        self, tenant_id: UUID, room_type_id: UUID, payload: RoomTypeUpdate
    ) -> RoomType | None:
        room_type = self.get_by_id(tenant_id, room_type_id)
        if not room_type:
            return None

        updates = payload.model_dump(exclude_unset=True)
        new_code = updates.get("code")
        if new_code and new_code != room_type.code:
            exists = (
                self.db.query(RoomType.id)
                .filter(
                    RoomType.tenant_id == tenant_id,
                    RoomType.code == new_code,
                    RoomType.id != room_type.id,
                )
                .first()
            )
            if exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Room type code already exists for this hotel",
                )

        for key, value in updates.items():
            setattr(room_type, key, value)

        self.db.commit()
        self.db.refresh(room_type)
        return room_type

    def delete(self, tenant_id: UUID, room_type_id: UUID) -> bool:
        room_type = self.get_by_id(tenant_id, room_type_id)
        if not room_type:
            return False
        self.db.delete(room_type)
        self.db.commit()
        return True
