from uuid import UUID
from pydantic import BaseModel
from app.schemas.base import ORMBase


class PermissionRead(ORMBase):
    id: UUID
    key: str
    description: str | None = None
