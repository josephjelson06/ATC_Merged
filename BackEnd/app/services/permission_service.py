from typing import List
from sqlalchemy.orm import Session

from app.models.permissions import Permission
from app.schemas.permissions import PermissionRead


class PermissionService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Permission]:
        return self.db.query(Permission).all()
