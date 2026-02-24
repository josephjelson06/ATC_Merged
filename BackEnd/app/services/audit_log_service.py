from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.schemas.audit_logs import AuditLogCreate


class AuditLogService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        tenant_id: UUID | None = None,
        action: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[AuditLog]:
        query = self.db.query(AuditLog)
        if tenant_id is not None:
            query = query.filter(AuditLog.tenant_id == tenant_id)
        if action:
            query = query.filter(AuditLog.action == action)
        return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, payload: AuditLogCreate) -> AuditLog:
        log = AuditLog(**payload.model_dump())
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def record(
        self,
        action: str,
        resource_type: str,
        resource_id: str,
        tenant_id: UUID | None = None,
        user_id: UUID | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
    ) -> AuditLog:
        payload = AuditLogCreate(
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
        )
        return self.create(payload)
