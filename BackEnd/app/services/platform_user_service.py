from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.platform import PlatformUser
from app.schemas.platform import PlatformUserCreate
from app.core.auth.security import get_password_hash


class PlatformUserService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[PlatformUser]:
        return self.db.query(PlatformUser).offset(skip).limit(limit).all()

    def get_by_id(self, user_id: UUID) -> Optional[PlatformUser]:
        return self.db.query(PlatformUser).filter(PlatformUser.id == user_id).first()

    def create(self, payload: PlatformUserCreate) -> PlatformUser:
        existing = (
            self.db.query(PlatformUser)
            .filter(PlatformUser.email == payload.email)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        data = payload.model_dump()
        password = data.pop("password")
        data["password_hash"] = get_password_hash(password)

        user = PlatformUser(**data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user_id: UUID, payload: dict) -> Optional[PlatformUser]:
        user = self.get_by_id(user_id)
        if not user:
            return None

        if "password" in payload:
            payload["password_hash"] = get_password_hash(payload.pop("password"))

        for k, v in payload.items():
            setattr(user, k, v)

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: UUID) -> bool:
        user = self.get_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True
