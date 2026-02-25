import secrets
from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.kiosk import Kiosk
from app.models.room_type import RoomType
from app.models.tenant import Tenant
from app.schemas.kiosks import KioskCreate, KioskHeartbeat, KioskUpdate


class KioskService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _generate_api_key() -> str:
        return secrets.token_urlsafe(32)

    def get_all(self, tenant_id: UUID) -> list[Kiosk]:
        return (
            self.db.query(Kiosk)
            .filter(Kiosk.tenant_id == tenant_id)
            .order_by(Kiosk.created_at.desc())
            .all()
        )

    def get_by_id(self, tenant_id: UUID, kiosk_id: UUID) -> Kiosk | None:
        return (
            self.db.query(Kiosk)
            .filter(Kiosk.id == kiosk_id, Kiosk.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: KioskCreate) -> Kiosk:
        api_key = payload.api_key or self._generate_api_key()
        existing = self.db.query(Kiosk.id).filter(Kiosk.api_key == api_key).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kiosk api_key already exists",
            )

        kiosk = Kiosk(
            tenant_id=tenant_id,
            name=payload.name,
            api_key=api_key,
            firmware_version=payload.firmware_version,
            status=payload.status,
        )
        self.db.add(kiosk)
        self.db.commit()
        self.db.refresh(kiosk)
        return kiosk

    def heartbeat(
        self, tenant_id: UUID, kiosk_id: UUID, payload: KioskHeartbeat
    ) -> Kiosk | None:
        kiosk = self.get_by_id(tenant_id, kiosk_id)
        if not kiosk:
            return None
        kiosk.last_heartbeat_at = datetime.utcnow()
        kiosk.status = "online"
        if payload.firmware_version is not None:
            kiosk.firmware_version = payload.firmware_version
        self.db.commit()
        self.db.refresh(kiosk)
        return kiosk

    def update(self, tenant_id: UUID, kiosk_id: UUID, payload: KioskUpdate) -> Kiosk | None:
        kiosk = self.get_by_id(tenant_id, kiosk_id)
        if not kiosk:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(kiosk, key, value)
        self.db.commit()
        self.db.refresh(kiosk)
        return kiosk

    def get_tenant_by_slug(self, slug: str) -> Tenant | None:
        return self.db.query(Tenant).filter(Tenant.slug == slug).first()

    def get_room_types_by_slug(self, slug: str) -> list[RoomType]:
        tenant = self.get_tenant_by_slug(slug)
        if not tenant:
            return []
        return (
            self.db.query(RoomType)
            .filter(RoomType.tenant_id == tenant.id)
            .order_by(RoomType.created_at.desc())
            .all()
        )

    def list_tenants_for_kiosk_launcher(self) -> list[Tenant]:
        return self.db.query(Tenant).order_by(Tenant.hotel_name.asc()).all()
