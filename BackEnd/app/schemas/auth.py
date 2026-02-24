from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None
    user_type: str  # "platform" or "tenant"
    tenant_id: UUID | None = None

    # Flattened role info for frontend convenience
    role_name: str | None = None
    permissions: List[str] = []

    access_token: str | None = None

    class Config:
        from_attributes = True
