import datetime
import re
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.tenant import Tenant, TenantUser, TenantRole
from app.models.billing import Plan, Subscription
from app.schemas.onboarding import TenantOnboardRequest
from app.core.auth.security import get_password_hash
from app.models.mappings import tenant_role_permissions
from app.models.permissions import Permission


class OnboardingService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _slugify(value: str) -> str:
        base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        return base or "hotel"

    def _next_available_slug(self, base_slug: str) -> str:
        candidate = base_slug
        suffix = 2
        while self.db.query(Tenant.id).filter(Tenant.slug == candidate).first():
            candidate = f"{base_slug}-{suffix}"
            suffix += 1
        return candidate

    def onboard_tenant(self, payload: TenantOnboardRequest) -> Tenant:
        # 1. Create Tenant (owner_user_id = NULL)
        # Note: We need a default plan. For now assume "Starter" or fetch first available.
        default_plan = self.db.query(Plan).first()
        if not default_plan:
            raise HTTPException(status_code=400, detail="No plans available in system")

        slug_seed = payload.slug or payload.hotel_name
        tenant_slug = self._next_available_slug(self._slugify(slug_seed))

        tenant = Tenant(
            hotel_name=payload.hotel_name,
            slug=tenant_slug,
            address=payload.address,
            plan_id=default_plan.id,
        )
        self.db.add(tenant)
        self.db.flush()  # Get ID

        # 2. Create Tenant Role (Owner)
        owner_role = TenantRole(tenant_id=tenant.id, name="Owner", status=True)
        self.db.add(owner_role)
        self.db.flush()

        # 3. Assign Permissions (All hotel permissions)
        hotel_perms = (
            self.db.query(Permission).filter(Permission.key.like("hotel:%")).all()
        )
        for p in hotel_perms:
            self.db.execute(
                tenant_role_permissions.insert().values(
                    role_id=owner_role.id, permission_id=p.id
                )
            )

        # 4. Create Tenant User (Manager/Owner)
        manager = TenantUser(
            tenant_id=tenant.id,
            email=payload.manager_email,
            name=payload.manager_name,
            phone=payload.manager_phone,
            password_hash=get_password_hash(payload.password),
            role_id=owner_role.id,
        )
        self.db.add(manager)
        self.db.flush()

        # 5. Update tenants.owner_user_id
        tenant.owner_user_id = manager.id

        # 6. Create initial subscription
        sub = Subscription(
            tenant_id=tenant.id,
            start_date=datetime.datetime.utcnow(),
            end_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
            status="active",
        )
        self.db.add(sub)

        self.db.commit()
        self.db.refresh(tenant)
        return tenant
