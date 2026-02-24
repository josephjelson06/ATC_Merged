from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tenant import TenantRead, TenantCreate
from app.services.tenant_service import TenantService
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])


@router.get("", response_model=List[TenantRead])
def get_tenants(
    skip: int = 0,
    limit: int = 100,
    q: str = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:read")),
):
    service = TenantService(db)
    return service.get_all(skip, limit, q)


@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:read")),
):
    service = TenantService(db)
    tenant = service.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.post("", response_model=TenantRead)
def create_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    return service.create(payload)


@router.patch("/{tenant_id}", response_model=TenantRead)
def update_tenant(
    tenant_id: UUID,
    payload: dict,  # Using dict for partial update simplicity for now
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    tenant = service.update(tenant_id, payload)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.delete("/{tenant_id}")
def delete_tenant(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    success = service.delete(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted"}
