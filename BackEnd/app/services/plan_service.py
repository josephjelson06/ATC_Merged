from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.billing import Plan
from app.schemas.billing import PlanCreate, PlanUpdate


class PlanService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Plan]:
        return self.db.query(Plan).all()

    def get_by_id(self, plan_id: UUID) -> Optional[Plan]:
        return self.db.query(Plan).filter(Plan.id == plan_id).first()

    def create(self, plan_in: PlanCreate) -> Plan:
        obj_in_data = plan_in.model_dump()
        db_obj = Plan(**obj_in_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, plan_id: UUID, plan_in: PlanUpdate) -> Optional[Plan]:
        db_obj = self.get_by_id(plan_id)
        if not db_obj or db_obj.is_archived:
            return None

        update_data = plan_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, plan_id: UUID) -> bool:
        db_obj = self.get_by_id(plan_id)
        if not db_obj or db_obj.is_archived:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True
