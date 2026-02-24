from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.tenant import TenantUser
from app.schemas.tenant_users import TenantUserCreate
from app.core.auth.security import get_password_hash
from app.modules.limits import check_user_limit


class TenantUserService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self, tenant_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[TenantUser]:
        return (
            self.db.query(TenantUser)
            .filter(TenantUser.tenant_id == tenant_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, tenant_id: UUID, user_id: UUID) -> Optional[TenantUser]:
        return (
            self.db.query(TenantUser)
            .filter(TenantUser.id == user_id, TenantUser.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: TenantUserCreate) -> TenantUser:
        check_user_limit(self.db, tenant_id)

        existing = (
            self.db.query(TenantUser)
            .filter(
                TenantUser.tenant_id == tenant_id, TenantUser.email == payload.email
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400, detail="Email already registered in this tenant"
            )

        data = payload.model_dump()
        password = data.pop("password")
        data["password_hash"] = get_password_hash(password)
        data["tenant_id"] = tenant_id

        user = TenantUser(**data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(
        self, tenant_id: UUID, user_id: UUID, payload: dict
    ) -> Optional[TenantUser]:
        user = self.get_by_id(tenant_id, user_id)
        if not user:
            return None

        if "password" in payload:
            payload["password_hash"] = get_password_hash(payload.pop("password"))

        for k, v in payload.items():
            setattr(user, k, v)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, tenant_id: UUID, user_id: UUID) -> bool:
        user = self.get_by_id(tenant_id, user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True
