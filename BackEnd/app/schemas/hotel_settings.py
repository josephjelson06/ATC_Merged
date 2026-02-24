from datetime import time
from uuid import UUID

from pydantic import BaseModel


class HotelSettingsRead(BaseModel):
    tenant_id: UUID
    hotel_name: str
    address: str | None = None
    timezone: str
    support_phone: str | None = None
    check_in_time: time | None = None


class HotelSettingsUpdate(BaseModel):
    hotel_name: str | None = None
    address: str | None = None
    timezone: str | None = None
    support_phone: str | None = None
    check_in_time: time | None = None
