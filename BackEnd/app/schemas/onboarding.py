from pydantic import BaseModel, EmailStr


class TenantOnboardRequest(BaseModel):
    hotel_name: str
    slug: str | None = None
    address: str | None = None

    manager_name: str
    manager_email: EmailStr
    manager_phone: str | None = None

    password: str
