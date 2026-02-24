from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.billing import Subscription
from app.models.invoice import Invoice
from app.models.tenant import Tenant
from app.schemas.invoices import InvoiceCreate, InvoiceMarkPaid, InvoiceStatus, InvoiceUpdate
from app.services.audit_log_service import AuditLogService


class InvoiceService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_logs = AuditLogService(db)

    def get_all(
        self,
        tenant_id: UUID | None = None,
        status_filter: str | None = None,
    ) -> list[Invoice]:
        query = self.db.query(Invoice)
        if tenant_id is not None:
            query = query.filter(Invoice.tenant_id == tenant_id)
        if status_filter:
            query = query.filter(Invoice.status == status_filter)
        return query.order_by(Invoice.created_at.desc()).all()

    def get_by_id(self, invoice_id: UUID) -> Invoice | None:
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()

    def get_for_tenant(
        self, tenant_id: UUID, status_filter: str | None = None
    ) -> list[Invoice]:
        return self.get_all(tenant_id=tenant_id, status_filter=status_filter)

    def _validate_links(self, tenant_id: UUID, subscription_id: UUID) -> None:
        tenant = self.db.query(Tenant.id).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid tenant",
            )

        subscription = (
            self.db.query(Subscription.id)
            .filter(
                Subscription.id == subscription_id,
                Subscription.tenant_id == tenant_id,
            )
            .first()
        )
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription for this tenant",
            )

    def create(
        self,
        payload: InvoiceCreate,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> Invoice:
        self._validate_links(payload.tenant_id, payload.subscription_id)

        invoice = Invoice(
            tenant_id=payload.tenant_id,
            subscription_id=payload.subscription_id,
            amount=payload.amount,
            currency=payload.currency,
            status=payload.status.value,
            due_date=payload.due_date,
        )
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)

        self.audit_logs.record(
            action="INVOICE_CREATED",
            resource_type="invoice",
            resource_id=str(invoice.id),
            tenant_id=invoice.tenant_id,
            user_id=user_id,
            details={"status": invoice.status, "amount": str(invoice.amount)},
            ip_address=ip_address,
        )
        return invoice

    def update(
        self,
        invoice_id: UUID,
        payload: InvoiceUpdate,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> Invoice | None:
        invoice = self.get_by_id(invoice_id)
        if not invoice:
            return None

        updates = payload.model_dump(exclude_unset=True)
        if "status" in updates and isinstance(updates["status"], InvoiceStatus):
            updates["status"] = updates["status"].value

        if updates.get("status") == InvoiceStatus.PAID.value and not updates.get(
            "paid_at"
        ):
            updates["paid_at"] = datetime.utcnow()

        for key, value in updates.items():
            setattr(invoice, key, value)

        self.db.commit()
        self.db.refresh(invoice)

        self.audit_logs.record(
            action="INVOICE_UPDATED",
            resource_type="invoice",
            resource_id=str(invoice.id),
            tenant_id=invoice.tenant_id,
            user_id=user_id,
            details={"fields": list(updates.keys())},
            ip_address=ip_address,
        )
        return invoice

    def mark_paid(
        self,
        invoice_id: UUID,
        payload: InvoiceMarkPaid,
        user_id: UUID | None = None,
        ip_address: str | None = None,
    ) -> Invoice | None:
        invoice = self.get_by_id(invoice_id)
        if not invoice:
            return None

        invoice.status = InvoiceStatus.PAID.value
        invoice.paid_at = payload.paid_at or datetime.utcnow()
        self.db.commit()
        self.db.refresh(invoice)

        self.audit_logs.record(
            action="INVOICE_MARKED_PAID",
            resource_type="invoice",
            resource_id=str(invoice.id),
            tenant_id=invoice.tenant_id,
            user_id=user_id,
            details={"paid_at": invoice.paid_at.isoformat()},
            ip_address=ip_address,
        )
        return invoice
