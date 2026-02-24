from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings
from pydantic_settings import SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_ROOT / ".env"), str(BACKEND_ROOT / ".env.local")),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = Field(validation_alias="DATABASE_URL")
    jwt_secret: str = Field(
        default="CHANGE_THIS_TO_A_SECURE_SECRET_IN_PRODUCTION",
        validation_alias="JWT_SECRET",
    )
    access_token_expire_minutes: int = Field(
        default=60 * 24,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    cookie_secure: bool = Field(default=False, validation_alias="COOKIE_SECURE")
    access_token_cookie_name: str = Field(
        default="access_token",
        validation_alias="ACCESS_TOKEN_COOKIE_NAME",
    )
    access_token_cookie_samesite: str = Field(
        default="lax",
        validation_alias="ACCESS_TOKEN_COOKIE_SAMESITE",
    )
    groq_api_key: str | None = Field(default=None, validation_alias="GROQ_API_KEY")
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        validation_alias="GROQ_MODEL",
    )
    groq_timeout_seconds: float = Field(
        default=20.0,
        validation_alias="GROQ_TIMEOUT_SECONDS",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
