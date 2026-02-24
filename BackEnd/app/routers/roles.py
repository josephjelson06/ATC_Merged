from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.platform import PlatformRoleRead
from app.schemas.tenant_roles import TenantRoleRead, TenantRoleCreate
from app.services.platform_role_service import PlatformRoleService
from app.services.tenant_role_service import TenantRoleService
from app.modules.rbac import require_permission

router = APIRouter(tags=["Roles"])

# --- Platform Roles ---


@router.get("/api/platform/roles", response_model=List[PlatformRoleRead])
def get_platform_roles(
    db: Session = Depends(get_db), _=Depends(require_permission("platform:roles:read"))
):
    service = PlatformRoleService(db)
    return service.get_all()


@router.post("/api/platform/roles", response_model=PlatformRoleRead)
def create_platform_role(
    name: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:roles:write")),
):
    service = PlatformRoleService(db)
    return service.create(name)


@router.get("/api/platform/roles/{role_id}/permissions", response_model=List[str])
def get_platform_role_permissions(
    role_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:roles:read")),
):
    service = PlatformRoleService(db)
    return service.get_permissions(role_id)


@router.put("/api/platform/roles/{role_id}/permissions")
def update_platform_role_permissions(
    role_id: UUID,
    permissions: List[str] = Body(...),
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:roles:write")),
):
    service = PlatformRoleService(db)
    service.update_permissions(role_id, permissions)
    return {"message": "Permissions updated"}


# --- Tenant Roles ---


@router.get("/api/hotels/{hotel_id}/roles", response_model=List[TenantRoleRead])
def get_tenant_roles(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:roles:read")),
):
    service = TenantRoleService(db)
    return service.get_all(hotel_id)


@router.post("/api/hotels/{hotel_id}/roles", response_model=TenantRoleRead)
def create_tenant_role(
    hotel_id: UUID,
    payload: TenantRoleCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:roles:write")),
):
    service = TenantRoleService(db)
    return service.create(hotel_id, payload)


@router.put("/api/hotels/{hotel_id}/roles/{role_id}/permissions")
def update_tenant_role_permissions(
    hotel_id: UUID,
    role_id: UUID,
    permissions: List[str] = Body(...),
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:roles:write")),
):
    service = TenantRoleService(db)
    service.update_permissions(hotel_id, role_id, permissions)
    return {"message": "Permissions updated"}
