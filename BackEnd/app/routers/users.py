from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.platform import PlatformUserRead, PlatformUserCreate
from app.schemas.tenant_users import TenantUserRead, TenantUserCreate, TenantUserUpdate
from app.services.platform_user_service import PlatformUserService
from app.services.tenant_user_service import TenantUserService
from app.modules.rbac import require_permission, require_admin_role

# We can split this into two routers or keep one with different prefixes
router = APIRouter(tags=["Users"])

# --- Platform Users ---


@router.get("/api/platform/users", response_model=List[PlatformUserRead])
def get_platform_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:users:read")),
):
    service = PlatformUserService(db)
    return service.get_all(skip, limit)


@router.post("/api/platform/users", response_model=PlatformUserRead)
def create_platform_user(
    payload: PlatformUserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:users:write")),
):
    service = PlatformUserService(db)
    return service.create(payload)


@router.delete("/api/platform/users/{user_id}")
def delete_platform_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:users:write")),
):
    service = PlatformUserService(db)
    if not service.delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


# --- Tenant Users ---


@router.get("/api/hotels/{hotel_id}/users", response_model=List[TenantUserRead])
def get_tenant_users(
    hotel_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # Gate: must be platform admin OR tenant user with permission
    _=Depends(require_permission("hotel:users:read")),
):
    service = TenantUserService(db)
    return service.get_all(hotel_id, skip, limit)


@router.post("/api/hotels/{hotel_id}/users", response_model=TenantUserRead)
def create_tenant_user(
    hotel_id: UUID,
    payload: TenantUserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:users:write")),
):
    service = TenantUserService(db)
    return service.create(hotel_id, payload)


@router.put("/api/hotels/{hotel_id}/users/{user_id}", response_model=TenantUserRead)
def update_tenant_user(
    hotel_id: UUID,
    user_id: UUID,
    payload: TenantUserUpdate,  # We should use schema, but update service took dict. Let's fix service usage.
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:users:write")),
):
    service = TenantUserService(db)
    updated = service.update(hotel_id, user_id, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.delete("/api/hotels/{hotel_id}/users/{user_id}")
def delete_tenant_user(
    hotel_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:users:write")),
):
    service = TenantUserService(db)
    if not service.delete(hotel_id, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
