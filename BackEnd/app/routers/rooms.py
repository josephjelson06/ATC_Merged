from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.rooms import RoomCreate, RoomRead, RoomStatusUpdate, RoomUpdate
from app.services.room_service import RoomService


router = APIRouter(prefix="/api/hotels/{hotel_id}/rooms", tags=["Rooms"])


@router.get("", response_model=list[RoomRead])
def list_rooms(
    hotel_id: UUID,
    status_filter: str | None = None,
    room_type_id: UUID | None = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:read")),
):
    service = RoomService(db)
    return service.get_all(
        hotel_id,
        status_filter=status_filter,
        room_type_id=room_type_id,
        available_only=available_only,
    )


@router.post("", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(
    hotel_id: UUID,
    payload: RoomCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomService(db)
    return service.create(hotel_id, payload)


@router.put("/{room_id}", response_model=RoomRead)
def update_room(
    hotel_id: UUID,
    room_id: UUID,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomService(db)
    room = service.update(hotel_id, room_id, payload)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.patch("/{room_id}/status", response_model=RoomRead)
def update_room_status(
    hotel_id: UUID,
    room_id: UUID,
    payload: RoomStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = RoomService(db)
    room = service.update_status(hotel_id, room_id, payload)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
