from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"


class IncidentPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentCreate(BaseModel):
    kiosk_id: UUID | None = None
    room_id: UUID | None = None
    reported_by: str
    description: str
    priority: IncidentPriority = IncidentPriority.MEDIUM


class IncidentUpdate(BaseModel):
    kiosk_id: UUID | None = None
    room_id: UUID | None = None
    description: str | None = None
    status: IncidentStatus | None = None
    priority: IncidentPriority | None = None


class IncidentRead(ORMBase):
    id: UUID
    tenant_id: UUID
    kiosk_id: UUID | None
    room_id: UUID | None
    reported_by: str
    description: str
    status: IncidentStatus
    priority: IncidentPriority
    created_at: datetime
    updated_at: datetime
