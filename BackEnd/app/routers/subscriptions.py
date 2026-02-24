from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.billing import SubscriptionRead
from app.services.subscription_service import SubscriptionService
from app.modules.rbac import require_permission

from typing import List

router = APIRouter(tags=["Subscriptions"])


def _serialize_subscription(sub):
    return {
        "id": sub.id,
        "tenant_id": sub.tenant_id,
        "plan_id": getattr(sub.tenant, "plan_id", None),
        "start_date": sub.start_date,
        "end_date": sub.end_date,
        "status": sub.status,
    }


@router.get("/api/subscriptions", response_model=List[SubscriptionRead])
@router.get("/api/subscriptions/", response_model=List[SubscriptionRead])
def get_subscriptions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # _=Depends(require_permission("platform:billing:read")),
):
    service = SubscriptionService(db)
    subs = service.get_all(skip, limit)
    return [_serialize_subscription(sub) for sub in subs]


@router.get("/api/hotels/{hotel_id}/subscription", response_model=SubscriptionRead)
def get_subscription(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:billing:read")),
):
    service = SubscriptionService(db)
    sub = service.get_by_tenant(hotel_id)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return _serialize_subscription(sub)
