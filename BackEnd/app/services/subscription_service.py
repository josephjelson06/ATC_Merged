from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.billing import Subscription, Plan
from app.schemas.billing import SubscriptionRead


class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Subscription]:
        return self.db.query(Subscription).offset(skip).limit(limit).all()

    def get_by_tenant(self, tenant_id: UUID) -> Optional[Subscription]:
        # Return simpler active logic for now, or the latest
        return (
            self.db.query(Subscription)
            .filter(Subscription.tenant_id == tenant_id)
            .order_by(Subscription.end_date.desc())
            .first()
        )

    def create(
        self, tenant_id: UUID, start_date, end_date, status="active"
    ) -> Subscription:
        sub = Subscription(
            tenant_id=tenant_id, start_date=start_date, end_date=end_date, status=status
        )
        self.db.add(sub)
        self.db.commit()
        self.db.refresh(sub)
        return sub
