from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.invoices import (
    InvoiceCreate,
    InvoiceMarkPaid,
    InvoiceRead,
    InvoiceUpdate,
)
from app.services.invoice_service import InvoiceService


router = APIRouter(tags=["Invoices"])


@router.get("/api/platform/invoices", response_model=list[InvoiceRead])
def list_platform_invoices(
    tenant_id: UUID | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:invoices:read")),
):
    service = InvoiceService(db)
    return service.get_all(tenant_id=tenant_id, status_filter=status_filter)


@router.post(
    "/api/platform/invoices",
    response_model=InvoiceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_invoice(
    payload: InvoiceCreate,
    request: Request,
    current_user=Depends(require_permission("platform:invoices:write")),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    return service.create(
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )


@router.patch("/api/platform/invoices/{invoice_id}", response_model=InvoiceRead)
def update_invoice(
    invoice_id: UUID,
    payload: InvoiceUpdate,
    request: Request,
    current_user=Depends(require_permission("platform:invoices:write")),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    invoice = service.update(
        invoice_id,
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.patch("/api/platform/invoices/{invoice_id}/mark-paid", response_model=InvoiceRead)
def mark_invoice_paid(
    invoice_id: UUID,
    payload: InvoiceMarkPaid,
    request: Request,
    current_user=Depends(require_permission("platform:invoices:write")),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    invoice = service.mark_paid(
        invoice_id,
        payload,
        user_id=getattr(current_user, "id", None),
        ip_address=request.client.host if request.client else None,
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/api/hotels/{hotel_id}/invoices", response_model=list[InvoiceRead])
def list_hotel_invoices(
    hotel_id: UUID,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:billing:read")),
):
    service = InvoiceService(db)
    return service.get_for_tenant(hotel_id, status_filter=status_filter)
