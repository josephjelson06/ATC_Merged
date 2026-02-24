from __future__ import annotations

from typing import List, Union

from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.auth.security import create_access_token, verify_password
from app.core.config import get_settings
from app.models.platform import PlatformUser
from app.models.tenant import TenantUser
from app.schemas.auth import LoginRequest, UserResponse


settings = get_settings()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, response: Response, login_data: LoginRequest) -> UserResponse:
        # Try Platform User first
        user: Union[PlatformUser, TenantUser, None] = (
            self.db.query(PlatformUser)
            .filter(PlatformUser.email == login_data.email)
            .first()
        )
        user_table = "platform"

        if not user:
            # Try Tenant User
            user = (
                self.db.query(TenantUser)
                .filter(TenantUser.email == login_data.email)
                .first()
            )
            user_table = "tenant"

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )

        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )

        # Generate Token
        role_id = user.role_id
        tenant_id = getattr(user, "tenant_id", None)

        access_token = create_access_token(
            subject=user.id,
            user_table=user_table,
            role_id=role_id,
            tenant_id=tenant_id,
        )

        response.set_cookie(
            key=settings.access_token_cookie_name,
            value=f"Bearer {access_token}",
            httponly=True,
            samesite=settings.access_token_cookie_samesite,
            secure=settings.cookie_secure,
        )

        # Prepare Response
        role_name = user.role.name if user.role else None
        permissions = [p.key for p in user.role.permissions] if user.role else []

        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            user_type=user_table,
            tenant_id=tenant_id,
            role_name=role_name,
            permissions=permissions,
            access_token=access_token,
        )

    def logout(self, response: Response) -> dict[str, str]:
        response.delete_cookie(settings.access_token_cookie_name)
        return {"message": "Logged out successfully"}
