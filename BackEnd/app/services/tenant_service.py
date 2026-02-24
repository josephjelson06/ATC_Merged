from uuid import UUID
from typing import List, Optional
import re
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantRead


class TenantService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _slugify(value: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
        return slug or "hotel"

    def _next_available_slug(
        self, base_slug: str, exclude_tenant_id: UUID | None = None
    ) -> str:
        candidate = base_slug
        suffix = 2
        while True:
            query = self.db.query(Tenant.id).filter(Tenant.slug == candidate)
            if exclude_tenant_id is not None:
                query = query.filter(Tenant.id != exclude_tenant_id)
            if not query.first():
                return candidate
            candidate = f"{base_slug}-{suffix}"
            suffix += 1

    def get_all(
        self, skip: int = 0, limit: int = 100, q: Optional[str] = None
    ) -> List[Tenant]:
        query = self.db.query(Tenant)
        if q:
            term = f"%{q}%"
            query = query.filter(
                or_(Tenant.hotel_name.ilike(term), Tenant.gstin.ilike(term))
            )
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, tenant_id: UUID) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def create(self, payload: TenantCreate) -> Tenant:
        # Note: Full onboarding flow should use OnboardingService.
        # This is a raw create method, mostly for admin or testing.
        payload_data = payload.model_dump()
        slug_seed = payload_data.pop("slug", None) or payload.hotel_name
        payload_data["slug"] = self._next_available_slug(self._slugify(slug_seed))
        tenant = Tenant(**payload_data)
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def update(self, tenant_id: UUID, payload: dict) -> Optional[Tenant]:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            return None

        if "slug" in payload and payload.get("slug"):
            tenant.slug = self._next_available_slug(
                self._slugify(payload["slug"]), exclude_tenant_id=tenant.id
            )
            payload = {k: v for k, v in payload.items() if k != "slug"}

        for k, v in payload.items():
            if k == "hotel_name" and not v:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="hotel_name cannot be empty",
                )
            setattr(tenant, k, v)

        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def delete(self, tenant_id: UUID) -> bool:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            return False

        self.db.delete(tenant)
        self.db.commit()
        return True
