from __future__ import annotations

import uuid
from typing import Union

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.auth.security import ALGORITHM, SECRET_KEY
from app.core.config import get_settings
from app.database import get_db
from app.models.platform import PlatformUser
from app.models.kiosk import Kiosk
from app.models.tenant import TenantUser


settings = get_settings()


def _extract_bearer_token(request: Request) -> str | None:
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:].strip()

    cookie_value = request.cookies.get(settings.access_token_cookie_name)
    if not cookie_value:
        return None
    if cookie_value.startswith("Bearer "):
        return cookie_value[7:].strip()
    return cookie_value


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Union[PlatformUser, TenantUser, Kiosk]:
    token = _extract_bearer_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        user_table = payload.get("user_table") or payload.get("device_table")

        if not subject or not user_table:
            raise ValueError("Invalid token payload")

        user_id = uuid.UUID(str(subject))
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from exc

    user = None
    if user_table == "platform":
        user = db.query(PlatformUser).filter(PlatformUser.id == user_id).first()
    elif user_table == "tenant":
        user = db.query(TenantUser).filter(TenantUser.id == user_id).first()
    elif user_table == "kiosk":
        user = db.query(Kiosk).filter(Kiosk.id == user_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown user scope",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Note: 'is_active' field is removed in new schema, status is on Role or we assume active if exists?
    # New schema doesn't have is_active on User. PlatformRole/TenantRole have status.
    # We can check role status if needed, but for now just returning user.

    return user
