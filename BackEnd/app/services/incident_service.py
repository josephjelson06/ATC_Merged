+++++++++++from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.kiosk import Kiosk
from app.models.room import Room
from app.schemas.incidents import IncidentCreate, IncidentPriority, IncidentUpdate
from app.services.audit_log_service import AuditLogService


class IncidentService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_logs = AuditLogService(db)

    def get_all(
        self,
        tenant_id: UUID,
        status_filter: str | None = None,
        priority_filter: str | None = None,
    ) -> list[Incident]:
        query = self.db.query(Incident).filter(Incident.tenant_id == tenant_id)
        if status_filter:
            query = query.filter(Incident.status == status_filter)
        if priority_filter:
            query = query.filter(Incident.priority == priority_filter)
        return query.order_by(Incident.created_at.desc()).all()

    def get_by_id(self, tenant_id: UUID, incident_id: UUID) -> Incident | None:
        return (
            self.db.query(Incident)
            .filter(Incident.id == incident_id, Incident.tenant_id == tenant_id)
            .first()
        )

    def _validate_kiosk(self, tenant_id: UUID, kiosk_id: UUID | None) -> None:
        if kiosk_id is None:
            return
        kiosk = (
            self.db.query(Kiosk.id)
            .filter(Kiosk.id == kiosk_id, Kiosk.tenant_id == tenant_id)
            .first()
        )
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid kiosk for this hotel",
            )

    def _validate_room(self, tenant_id: UUID, room_id: UUID | None) -> None:
        if room_id is None:
            return
        room = (
            self.db.query(Room.id)
            .filter(Room.id == room_id, Room.tenant_id == tenant_id)
            .first()
        )
        if not room:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid room for this hotel",
            )

    def create(
        self,
        tenant_id: UUID,
        payload: IncidentCreate,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> Incident:
        self._validate_kiosk(tenant_id, payload.kiosk_id)
        self._validate_room(tenant_id, payload.room_id)

        incident = Incident(
            tenant_id=tenant_id,
            kiosk_id=payload.kiosk_id,
            room_id=payload.room_id,
            reported_by=payload.reported_by,
            description=payload.description,
            status="OPEN",
            priority=payload.priority.value,
        )
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)

        self.audit_logs.record(
            action="INCIDENT_CREATED",
            resource_type="incident",
            resource_id=str(incident.id),
            tenant_id=tenant_id,
            user_id=user_id,
            details={"priority": incident.priority},
            ip_address=ip_address,
        )
        return incident

    def update(
        self,
        tenant_id: UUID,
        incident_id: UUID,
        payload: IncidentUpdate,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> Incident | None:
        incident = self.get_by_id(tenant_id, incident_id)
        if not incident:
            return None

        updates = payload.model_dump(exclude_unset=True)
        if "kiosk_id" in updates:
            self._validate_kiosk(tenant_id, updates["kiosk_id"])
        if "room_id" in updates:
            self._validate_room(tenant_id, updates["room_id"])
        if "priority" in updates and isinstance(updates["priority"], IncidentPriority):
            updates["priority"] = updates["priority"].value
        if "status" in updates and hasattr(updates["status"], "value"):
            updates["status"] = updates["status"].value

        for key, value in updates.items():
            setattr(incident, key, value)

        self.db.commit()
        self.db.refresh(incident)

        self.audit_logs.record(
            action="INCIDENT_UPDATED",
            resource_type="incident",
            resource_id=str(incident.id),
            tenant_id=tenant_id,
            user_id=user_id,
            details={"fields": list(updates.keys())},
            ip_address=ip_address,
        )
        return incident

    def delete(
        self,
        tenant_id: UUID,
        incident_id: UUID,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> bool:
        incident = self.get_by_id(tenant_id, incident_id)
        if not incident:
            return False

        incident_id_str = str(incident.id)
        self.db.delete(incident)
        self.db.commit()

        self.audit_logs.record(
            action="INCIDENT_DELETED",
            resource_type="incident",
            resource_id=incident_id_str,
            tenant_id=tenant_id,
            user_id=user_id,
            ip_address=ip_address,
        )
        return True
