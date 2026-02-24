from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.billing import PlanRead, PlanCreate, PlanUpdate
from app.services.plan_service import PlanService

router = APIRouter(prefix="/api/plans", tags=["Plans"])


@router.get("", response_model=List[PlanRead])
def get_plans(
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    return service.get_all()


@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    plan = service.get_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.post("", response_model=PlanRead, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    return service.create(plan_in)


@router.patch("/{plan_id}", response_model=PlanRead)
def update_plan(
    plan_id: UUID,
    plan_in: PlanUpdate,
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    plan = service.update(plan_id, plan_in)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    success = service.delete(plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
    return None
