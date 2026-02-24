from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.room_types import RoomTypeCreate, RoomTypeRead, RoomTypeUpdate
from app.services.room_type_service import RoomTypeService


router = APIRouter(prefix="/api/hotels/{hotel_id}/room-types", tags=["Room Types"])


@router.get("", response_model=list[RoomTypeRead])
def list_room_types(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:read")),
):
    service = RoomTypeService(db)
    return service.get_all(hotel_id)


@router.post("", response_model=RoomTypeRead, status_code=status.HTTP_201_CREATED)
def create_room_type(
    hotel_id: UUID,
    payload: RoomTypeCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomTypeService(db)
    return service.create(hotel_id, payload)


@router.put("/{room_type_id}", response_model=RoomTypeRead)
def update_room_type(
    hotel_id: UUID,
    room_type_id: UUID,
    payload: RoomTypeUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomTypeService(db)
    room_type = service.update(hotel_id, room_type_id, payload)
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    return room_type


@router.delete("/{room_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room_type(
    hotel_id: UUID,
    room_type_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomTypeService(db)
    deleted = service.delete(hotel_id, room_type_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Room type not found")
    return None
