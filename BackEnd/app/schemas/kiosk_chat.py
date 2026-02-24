from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class KioskChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    transcript: str | None = Field(default=None)
    currentState: str | None = Field(default=None)
    sessionId: str | None = Field(default=None)


class KioskChatResponse(BaseModel):
    speech: str
    intent: str
    confidence: float = Field(ge=0.0, le=1.0)


class KioskBookingChatResponse(KioskChatResponse):
    extractedSlots: dict[str, Any] | None = None
    accumulatedSlots: dict[str, Any] | None = None
    missingSlots: list[str] | None = None
    nextSlotToAsk: str | None = None
    isComplete: bool | None = None
    persistedBookingId: str | None = None
