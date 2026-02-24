from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hotel_config import HotelConfig
from app.models.tenant import Tenant
from app.schemas.hotel_settings import HotelSettingsRead, HotelSettingsUpdate
from app.services.audit_log_service import AuditLogService


class HotelSettingsService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_logs = AuditLogService(db)

    def _get_tenant(self, tenant_id: UUID) -> Tenant:
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hotel not found",
            )
        return tenant

    def _get_or_create_config(self, tenant_id: UUID) -> HotelConfig:
        config = (
            self.db.query(HotelConfig)
            .filter(HotelConfig.tenant_id == tenant_id)
            .first()
        )
        if config:
            return config

        config = HotelConfig(tenant_id=tenant_id, timezone="UTC")
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        return config

    def get_settings(self, tenant_id: UUID) -> HotelSettingsRead:
        tenant = self._get_tenant(tenant_id)
        config = self._get_or_create_config(tenant_id)
        return HotelSettingsRead(
            tenant_id=tenant.id,
            hotel_name=tenant.hotel_name,
            address=tenant.address,
            timezone=config.timezone,
            support_phone=config.support_phone,
            check_in_time=config.check_in_time,
        )

    def update_settings(
        self,
        tenant_id: UUID,
        payload: HotelSettingsUpdate,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> HotelSettingsRead:
        tenant = self._get_tenant(tenant_id)
        config = self._get_or_create_config(tenant_id)

        updates = payload.model_dump(exclude_unset=True)
        tenant_fields = {"hotel_name", "address"}
        config_fields = {"timezone", "support_phone", "check_in_time"}

        for key, value in updates.items():
            if key in tenant_fields:
                setattr(tenant, key, value)
            if key in config_fields:
                setattr(config, key, value)

        self.db.commit()
        self.db.refresh(tenant)
        self.db.refresh(config)

        self.audit_logs.record(
            action="HOTEL_SETTINGS_UPDATED",
            resource_type="hotel_settings",
            resource_id=str(tenant.id),
            tenant_id=tenant.id,
            user_id=user_id,
            details={"fields": list(updates.keys())},
            ip_address=ip_address,
        )

        return HotelSettingsRead(
            tenant_id=tenant.id,
            hotel_name=tenant.hotel_name,
            address=tenant.address,
            timezone=config.timezone,
            support_phone=config.support_phone,
            check_in_time=config.check_in_time,
        )
