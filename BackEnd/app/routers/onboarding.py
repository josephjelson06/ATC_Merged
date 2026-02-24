from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.onboarding import TenantOnboardRequest
from app.schemas.tenant import TenantRead
from app.services.onboarding_service import OnboardingService

router = APIRouter(prefix="/api/onboard", tags=["Onboarding"])


@router.post("", response_model=TenantRead)
def onboard_tenant(payload: TenantOnboardRequest, db: Session = Depends(get_db)):
    service = OnboardingService(db)
    return service.onboard_tenant(payload)
