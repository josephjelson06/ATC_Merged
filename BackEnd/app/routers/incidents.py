from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.incidents import IncidentCreate, IncidentRead, IncidentUpdate
from app.services.incident_service import IncidentService


router = APIRouter(prefix="/api/hotels/{hotel_id}/incidents", tags=["Incidents"])


@router.get("", response_model=list[IncidentRead])
def list_incidents(
    hotel_id: UUID,
    status_filter: str | None = None,
    priority_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:incidents:read")),
):
    service = IncidentService(db)
    return service.get_all(
        hotel_id, status_filter=status_filter, priority_filter=priority_filter
    )


@router.post("", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(
    hotel_id: UUID,
    payload: IncidentCreate,
    request: Request,
    current_user=Depends(require_permission("hotel:incidents:write")),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    return service.create(
        hotel_id,
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )


@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(
    hotel_id: UUID,
    incident_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:incidents:read")),
):
    service = IncidentService(db)
    incident = service.get_by_id(hotel_id, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=IncidentRead)
def update_incident(
    hotel_id: UUID,
    incident_id: UUID,
    payload: IncidentUpdate,
    request: Request,
    current_user=Depends(require_permission("hotel:incidents:write")),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    incident = service.update(
        hotel_id,
        incident_id,
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    hotel_id: UUID,
    incident_id: UUID,
    request: Request,
    current_user=Depends(require_permission("hotel:incidents:write")),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    deleted = service.delete(
        hotel_id,
        incident_id,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Incident not found")
    return None
