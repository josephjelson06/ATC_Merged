from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class GuestDemographicRead(BaseModel):
    segment: str
    count: int


class TenantOccupancyReportRead(BaseModel):
    tenant_id: UUID
    total_rooms: int
    occupied_rooms: int
    occupancy_rate: float
    total_bookings: int
    revenue_from_bookings: Decimal
    guest_demographics: list[GuestDemographicRead]


class PlatformRevenueReportRead(BaseModel):
    total_mrr: Decimal
    active_tenants: int
    total_kiosks: int
    paid_invoice_revenue: Decimal
    overdue_invoice_amount: Decimal
