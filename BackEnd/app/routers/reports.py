from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.guest import Guest
from app.models.invoice import Invoice
from app.models.kiosk import Kiosk
from app.models.room import Room
from app.models.tenant import Tenant
from app.models.billing import Plan
from app.modules.rbac import require_permission
from app.schemas.reports import (
    GuestDemographicRead,
    PlatformRevenueReportRead,
    TenantOccupancyReportRead,
)


router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/tenant/{hotel_id}/occupancy", response_model=TenantOccupancyReportRead)
def get_tenant_occupancy_report(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:reports:read")),
):
    total_rooms = db.query(func.count(Room.id)).filter(Room.tenant_id == hotel_id).scalar() or 0
    occupied_rooms = (
        db.query(func.count(Room.id))
        .filter(Room.tenant_id == hotel_id, Room.status == "occupied")
        .scalar()
        or 0
    )
    total_bookings = (
        db.query(func.count(Booking.id)).filter(Booking.tenant_id == hotel_id).scalar() or 0
    )
    revenue_from_bookings = (
        db.query(func.coalesce(func.sum(Booking.total_price), 0))
        .filter(Booking.tenant_id == hotel_id)
        .scalar()
        or Decimal("0")
    )

    demographics_rows = (
        db.query(Guest.id_type, func.count(Guest.id))
        .filter(Guest.tenant_id == hotel_id)
        .group_by(Guest.id_type)
        .all()
    )
    guest_demographics = [
        GuestDemographicRead(segment=(row[0] or "UNKNOWN"), count=row[1])
        for row in demographics_rows
    ]

    occupancy_rate = (occupied_rooms / total_rooms * 100.0) if total_rooms else 0.0

    return TenantOccupancyReportRead(
        tenant_id=hotel_id,
        total_rooms=total_rooms,
        occupied_rooms=occupied_rooms,
        occupancy_rate=round(occupancy_rate, 2),
        total_bookings=total_bookings,
        revenue_from_bookings=revenue_from_bookings,
        guest_demographics=guest_demographics,
    )


@router.get("/platform/revenue", response_model=PlatformRevenueReportRead)
def get_platform_revenue_report(
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:reports:read")),
):
    total_mrr = (
        db.query(func.coalesce(func.sum(Plan.price), 0.0))
        .select_from(Tenant)
        .join(Plan, Tenant.plan_id == Plan.id, isouter=True)
        .scalar()
        or Decimal("0")
    )
    active_tenants = db.query(func.count(Tenant.id)).scalar() or 0
    total_kiosks = db.query(func.count(Kiosk.id)).scalar() or 0
    paid_invoice_revenue = (
        db.query(func.coalesce(func.sum(Invoice.amount), 0))
        .filter(Invoice.status == "PAID")
        .scalar()
        or Decimal("0")
    )
    overdue_invoice_amount = (
        db.query(func.coalesce(func.sum(Invoice.amount), 0))
        .filter(Invoice.status == "OVERDUE")
        .scalar()
        or Decimal("0")
    )

    return PlatformRevenueReportRead(
        total_mrr=total_mrr,
        active_tenants=active_tenants,
        total_kiosks=total_kiosks,
        paid_invoice_revenue=paid_invoice_revenue,
        overdue_invoice_amount=overdue_invoice_amount,
    )
