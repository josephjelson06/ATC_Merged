from __future__ import annotations

from uuid import UUID
from typing import Union

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.models.platform import PlatformUser, PlatformRole
from app.models.kiosk import Kiosk
from app.models.tenant import TenantUser, TenantRole


SUPER_ADMIN_ROLE = "super admin"
GENERAL_MANAGER_ROLE = "general manager"


def _normalized_role_name(role_name: str | None) -> str:
    return (role_name or "").strip().lower()


def require_permission(permission: str):
    """Permission + tenant-boundary authorization gate."""

    required_scope = permission.split(":", 1)[0].lower() if ":" in permission else ""

    def dependency(
        hotel_id: UUID | None = None,
        current_user: Union[PlatformUser, TenantUser, Kiosk] = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> Union[PlatformUser, TenantUser, Kiosk]:

        # Determine user type and role
        is_platform = isinstance(current_user, PlatformUser)
        is_kiosk = isinstance(current_user, Kiosk)
        user_type = "platform" if is_platform else "kiosk" if is_kiosk else "hotel"

        if is_kiosk:
            kiosk_permissions = {
                "hotel:kiosks:read",
                "hotel:kiosks:write",
                "hotel:rooms:read",
                "hotel:bookings:read",
                "hotel:bookings:write",
                "hotel:checkin:write",
                "hotel:payments:read",
                "hotel:payments:write",
                "hotel:guests:read",
                "hotel:guests:write",
            }
            if permission and permission not in kiosk_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Kiosk token cannot access permission: {permission}",
                )
            if hotel_id is not None and current_user.tenant_id != hotel_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cross-tenant kiosk access denied",
                )
            return current_user

        # Get role and permissions via relationship
        role = current_user.role
        if not role:
            # Should technically not happen due to FK constraints, but safe guard
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned",
            )

        # Gather permission keys
        permissions = {p.key for p in role.permissions}

        if required_scope == "platform" and not is_platform:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Platform scope required",
            )

        if required_scope == "hotel" and user_type not in {"hotel", "platform"}:
            # Platform users generally can access hotel scope if they have permission?
            # Usually platform users have platform scope permissions like "platform:hotels:read".
            # If a platform user tries to access a hotel route, strict tenant check might block them unless logic allows.
            # For now, following old logic: platform users are super admins usually.
            pass

        if (
            permission
            and permission not in permissions
            and "*" not in permissions
            and "*:*:*" not in permissions
        ):
            if not (
                is_platform
                and required_scope == "hotel"
                and _normalized_role_name(role.name) == SUPER_ADMIN_ROLE
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing permission: {permission}",
                )

        # Tenant boundary check
        # Platform users: can access any tenant if they have permission?
        # Tenant users: must match tenant_id
        if required_scope == "hotel" and hotel_id is not None:
            if not is_platform:
                # current_user is TenantUser
                if current_user.tenant_id != hotel_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cross-tenant access denied",
                    )
            # Platform users: allowed to access hotel_id if they have permission

        return current_user

    return dependency


def require_admin_role(scope: str):
    """Role-identity gate for privileged actions.

    - `platform`: Super Admin only.
    - `hotel`: Super Admin or General Manager (within tenant).
    """

    normalized_scope = (scope or "").strip().lower()

    def dependency(
        hotel_id: UUID | None = None,
        current_user: Union[PlatformUser, TenantUser, Kiosk] = Depends(get_current_user),
    ) -> Union[PlatformUser, TenantUser]:

        if isinstance(current_user, Kiosk):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Kiosk tokens cannot perform admin actions",
            )

        is_platform = isinstance(current_user, PlatformUser)
        role_name = _normalized_role_name(current_user.role.name)

        has_sa = is_platform and role_name == SUPER_ADMIN_ROLE
        has_gm = not is_platform and role_name == GENERAL_MANAGER_ROLE

        if normalized_scope == "platform":
            if not has_sa:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Super Admin role required",
                )
            return current_user

        if normalized_scope == "hotel":
            if not is_platform:
                if hotel_id is not None and current_user.tenant_id != hotel_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cross-tenant admin access denied",
                    )

            if not (has_sa or has_gm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hotel admin role required",
                )
            return current_user

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid admin scope '{scope}'",
        )

    return dependency
