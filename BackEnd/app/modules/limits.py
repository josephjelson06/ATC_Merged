from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.tenant import Tenant, TenantUser, TenantRole
from app.models.billing import Plan
from app.models.room import Room


def _load_plan_for_tenant(db: Session, tenant_id: UUID) -> Plan:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    if not tenant.plan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant is not linked to a plan",
        )

    plan = db.query(Plan).filter(Plan.id == tenant.plan_id).first()
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Linked plan not found",
        )
    return plan


def check_user_limit(db: Session, tenant_id: UUID) -> None:
    plan = _load_plan_for_tenant(db, tenant_id)
    if plan.max_users is None:
        return

    current_users = (
        db.query(TenantUser).filter(TenantUser.tenant_id == tenant_id).count()
    )
    if current_users >= plan.max_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User limit reached for current plan ({plan.max_users})",
        )


def check_role_limit(db: Session, tenant_id: UUID) -> None:
    plan = _load_plan_for_tenant(db, tenant_id)
    if plan.max_roles is None:
        return

    current_roles = (
        db.query(TenantRole).filter(TenantRole.tenant_id == tenant_id).count()
    )
    if current_roles >= plan.max_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role limit reached for current plan ({plan.max_roles})",
        )


def check_room_limit(db: Session, tenant_id: UUID) -> None:
    plan = _load_plan_for_tenant(db, tenant_id)
    if plan.max_rooms is None:
        return

    current_rooms = db.query(Room).filter(Room.tenant_id == tenant_id).count()
    if current_rooms >= plan.max_rooms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room limit reached for current plan ({plan.max_rooms})",
        )
