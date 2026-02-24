from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.tenant import TenantRole
from app.models.mappings import tenant_role_permissions
from app.models.permissions import Permission
from app.schemas.tenant_roles import TenantRoleCreate
from app.modules.limits import check_role_limit


class TenantRoleService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, tenant_id: UUID) -> List[TenantRole]:
        return self.db.query(TenantRole).filter(TenantRole.tenant_id == tenant_id).all()

    def get_by_id(self, tenant_id: UUID, role_id: UUID) -> Optional[TenantRole]:
        return (
            self.db.query(TenantRole)
            .filter(TenantRole.id == role_id, TenantRole.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: TenantRoleCreate) -> TenantRole:
        check_role_limit(self.db, tenant_id)

        role = TenantRole(tenant_id=tenant_id, name=payload.name)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def update_permissions(
        self, tenant_id: UUID, role_id: UUID, permission_keys: List[str]
    ):
        role = self.get_by_id(tenant_id, role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Clear existing
        self.db.execute(
            tenant_role_permissions.delete().where(
                tenant_role_permissions.c.role_id == role_id
            )
        )

        # Add new
        perms = (
            self.db.query(Permission).filter(Permission.key.in_(permission_keys)).all()
        )
        # Optionally validate that perms are "hotel" scope

        for p in perms:
            self.db.execute(
                tenant_role_permissions.insert().values(
                    role_id=role_id, permission_id=p.id
                )
            )
        self.db.commit()
