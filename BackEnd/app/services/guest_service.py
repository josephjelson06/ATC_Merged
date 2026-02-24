from uuid import UUID

from sqlalchemy.orm import Session

from app.models.guest import Guest
from app.schemas.guests import GuestCreate, GuestUpdate


class GuestService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self, tenant_id: UUID, skip: int = 0, limit: int = 100, q: str | None = None
    ) -> list[Guest]:
        query = self.db.query(Guest).filter(Guest.tenant_id == tenant_id)
        if q:
            like = f"%{q}%"
            query = query.filter(
                (Guest.name.ilike(like))
                | (Guest.email.ilike(like))
                | (Guest.phone.ilike(like))
                | (Guest.id_number.ilike(like))
            )
        return query.order_by(Guest.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, tenant_id: UUID, guest_id: UUID) -> Guest | None:
        return (
            self.db.query(Guest)
            .filter(Guest.id == guest_id, Guest.tenant_id == tenant_id)
            .first()
        )

    def create(self, tenant_id: UUID, payload: GuestCreate) -> Guest:
        guest = Guest(tenant_id=tenant_id, **payload.model_dump())
        self.db.add(guest)
        self.db.commit()
        self.db.refresh(guest)
        return guest

    def update(self, tenant_id: UUID, guest_id: UUID, payload: GuestUpdate) -> Guest | None:
        guest = self.get_by_id(tenant_id, guest_id)
        if not guest:
            return None
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(guest, key, value)
        self.db.commit()
        self.db.refresh(guest)
        return guest
