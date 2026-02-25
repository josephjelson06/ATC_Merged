from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.kiosk_chat import (
    KioskBookingChatResponse,
    KioskChatRequest,
    KioskChatResponse,
)
from app.schemas.kiosks import (
    KioskCreate,
    KioskHeartbeat,
    KioskRead,
    KioskRoomTypeRead,
    KioskTenantListItem,
    KioskTenantRead,
    KioskUpdate,
)
from app.services.kiosk_brain_service import KioskBrainService
from app.services.kiosk_service import KioskService


router = APIRouter(prefix="/api/hotels/{hotel_id}/kiosks", tags=["Kiosks"])
kiosk_launcher_router = APIRouter(prefix="/api/kiosk", tags=["Kiosk Public"])
kiosk_public_router = APIRouter(prefix="/api/kiosk/{slug}", tags=["Kiosk Public"])


@router.get("", response_model=list[KioskRead])
def list_kiosks(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:kiosks:read")),
):
    service = KioskService(db)
    return service.get_all(hotel_id)


@router.post("", response_model=KioskRead, status_code=status.HTTP_201_CREATED)
def create_kiosk(
    hotel_id: UUID,
    payload: KioskCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:kiosks:write")),
):
    service = KioskService(db)
    return service.create(hotel_id, payload)


@router.post("/{kiosk_id}/heartbeat", response_model=KioskRead)
def heartbeat(
    hotel_id: UUID,
    kiosk_id: UUID,
    payload: KioskHeartbeat,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:kiosks:write")),
):
    service = KioskService(db)
    kiosk = service.heartbeat(hotel_id, kiosk_id, payload)
    if not kiosk:
        raise HTTPException(status_code=404, detail="Kiosk not found")
    return kiosk


@router.patch("/{kiosk_id}", response_model=KioskRead)
def update_kiosk(
    hotel_id: UUID,
    kiosk_id: UUID,
    payload: KioskUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:kiosks:write")),
):
    service = KioskService(db)
    kiosk = service.update(hotel_id, kiosk_id, payload)
    if not kiosk:
        raise HTTPException(status_code=404, detail="Kiosk not found")
    return kiosk


@kiosk_launcher_router.get("/tenants", response_model=list[KioskTenantListItem])
def list_kiosk_tenants(
    db: Session = Depends(get_db),
):
    service = KioskService(db)
    tenants = service.list_tenants_for_kiosk_launcher()
    return [
        KioskTenantListItem(slug=tenant.slug, name=tenant.hotel_name, logo_url=None)
        for tenant in tenants
    ]


@kiosk_public_router.get("/tenant", response_model=KioskTenantRead)
def resolve_tenant_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    service = KioskService(db)
    tenant = service.get_tenant_by_slug(slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@kiosk_public_router.get("/rooms", response_model=list[KioskRoomTypeRead])
def list_room_types_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    service = KioskService(db)
    return service.get_room_types_by_slug(slug)


@kiosk_public_router.post("/chat", response_model=KioskChatResponse)
def kiosk_chat(
    slug: str,
    payload: KioskChatRequest,
    db: Session = Depends(get_db),
):
    kiosk_service = KioskService(db)
    tenant = kiosk_service.get_tenant_by_slug(slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    brain_service = KioskBrainService(db)
    return brain_service.chat(tenant=tenant, payload=payload)


@kiosk_public_router.post("/chat/booking", response_model=KioskBookingChatResponse)
def kiosk_booking_chat(
    slug: str,
    payload: KioskChatRequest,
    db: Session = Depends(get_db),
):
    kiosk_service = KioskService(db)
    tenant = kiosk_service.get_tenant_by_slug(slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    brain_service = KioskBrainService(db)
    return brain_service.booking_chat(tenant=tenant, payload=payload)
