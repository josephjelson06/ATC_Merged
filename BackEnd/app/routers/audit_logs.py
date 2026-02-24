from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.audit_logs import AuditLogRead
from app.services.audit_log_service import AuditLogService


router = APIRouter(tags=["Audit Logs"])


@router.get("/api/platform/audit-logs", response_model=list[AuditLogRead])
def list_audit_logs(
    tenant_id: UUID | None = None,
    action: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:audit-logs:read")),
):
    service = AuditLogService(db)
    return service.get_all(
        tenant_id=tenant_id, action=action, skip=skip, limit=limit
    )
