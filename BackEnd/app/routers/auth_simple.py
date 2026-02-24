from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import LoginRequest, UserResponse
from app.services.auth_service import AuthService
from app.core.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=UserResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.login(response, login_data)


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    return service.logout(response)


@router.get("/me", response_model=UserResponse)
def me(
    current_user=Depends(get_current_user),
):
    # current_user is already the model instance (PlatformUser or TenantUser)
    # We map it to UserResponse manually or let Pydantic handle it if fields match.
    # UserResponse expects: id, email, name, user_type, tenant_id, role_name, permissions, access_token
    if not hasattr(current_user, "email"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kiosk tokens are not supported by this endpoint",
        )

    role = current_user.role
    role_name = role.name if role else None
    permissions = [p.key for p in role.permissions] if role else []

    is_platform = not hasattr(current_user, "tenant_id")
    user_type = "platform" if is_platform else "tenant"
    tenant_id = getattr(current_user, "tenant_id", None)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        user_type=user_type,
        tenant_id=tenant_id,
        role_name=role_name,
        permissions=permissions,
        # access_token is not returned on /me, usually
    )
