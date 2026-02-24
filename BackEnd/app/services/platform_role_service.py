from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.platform import PlatformRole
from app.models.mappings import platform_role_permissions
from app.models.permissions import Permission


class PlatformRoleService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[PlatformRole]:
        return self.db.query(PlatformRole).all()

    def get_by_id(self, role_id: UUID) -> Optional[PlatformRole]:
        return self.db.query(PlatformRole).filter(PlatformRole.id == role_id).first()

    def create(self, name: str) -> PlatformRole:
        role = PlatformRole(name=name)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def get_permissions(self, role_id: UUID) -> List[str]:
        result = (
            self.db.query(Permission.key)
            .join(
                platform_role_permissions,
                Permission.id == platform_role_permissions.c.permission_id,
            )
            .filter(platform_role_permissions.c.role_id == role_id)
            .all()
        )
        return [row[0] for row in result]

    def update_permissions(self, role_id: UUID, permission_keys: List[str]):
        # Clear existing
        self.db.execute(
            platform_role_permissions.delete().where(
                platform_role_permissions.c.role_id == role_id
            )
        )

        # Add new
        perms = (
            self.db.query(Permission).filter(Permission.key.in_(permission_keys)).all()
        )
        if len(perms) != len(permission_keys):
            found_keys = {p.key for p in perms}
            missing = set(permission_keys) - found_keys
            raise HTTPException(
                status_code=400, detail=f"Invalid permissions: {missing}"
            )

        for p in perms:
            self.db.execute(
                platform_role_permissions.insert().values(
                    role_id=role_id, permission_id=p.id
                )
            )
        self.db.commit()
