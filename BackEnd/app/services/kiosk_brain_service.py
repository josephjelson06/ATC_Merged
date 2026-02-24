from __future__ import annotations

import json
import logging
import re
import threading
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.tenant import Tenant
from app.schemas.kiosk_chat import (
    KioskBookingChatResponse,
    KioskChatRequest,
    KioskChatResponse,
)
from app.services.kiosk_service import KioskService


LOGGER = logging.getLogger(__name__)


@dataclass
class _SessionMemory:
    history: list[dict[str, str]] = field(default_factory=list)
    last_activity: datetime = field(default_factory=datetime.utcnow)


@dataclass
class _BookingSessionMemory(_SessionMemory):
    slots: dict[str, Any] = field(default_factory=dict)


class KioskBrainService:
    _GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    _MAX_HISTORY_MESSAGES = 10
    _SESSION_TTL = timedelta(minutes=5)
    _BOOKING_REQUIRED_SLOTS = ("guests", "checkInDate", "checkOutDate", "guestName")

    _GENERAL_INTENTS = {
        "CHECK_IN",
        "BOOK_ROOM",
        "HELP",
        "SCAN_ID",
        "PAYMENT",
        "WELCOME",
        "IDLE",
        "SELECT_ROOM",
        "PROVIDE_GUESTS",
        "PROVIDE_DATES",
        "PROVIDE_NAME",
        "CONFIRM_BOOKING",
        "MODIFY_BOOKING",
        "CANCEL_BOOKING",
        "ASK_ROOM_DETAIL",
        "ASK_PRICE",
        "COMPARE_ROOMS",
        "REPEAT",
        "GENERAL_QUERY",
        "UNKNOWN",
    }

    _BOOKING_INTENTS = {
        "SELECT_ROOM",
        "PROVIDE_GUESTS",
        "PROVIDE_DATES",
        "PROVIDE_NAME",
        "CONFIRM_BOOKING",
        "MODIFY_BOOKING",
        "CANCEL_BOOKING",
        "ASK_ROOM_DETAIL",
        "ASK_PRICE",
        "COMPARE_ROOMS",
        "GENERAL_QUERY",
        "HELP",
        "REPEAT",
        "UNKNOWN",
    }

    _general_sessions: dict[str, _SessionMemory] = {}
    _booking_sessions: dict[str, _BookingSessionMemory] = {}
    _lock = threading.Lock()

    def __init__(self, db: Session):
        self.db = db
        self.kiosk_service = KioskService(db)
        self.settings = get_settings()

    def chat(self, tenant: Tenant, payload: KioskChatRequest) -> KioskChatResponse:
        session_id = self._resolve_session_id(payload.sessionId)
        current_state = (payload.currentState or "IDLE").strip().upper()
        transcript = (payload.transcript or "").strip()

        if current_state in {"WELCOME", "IDLE"}:
            self._clear_session(session_id, booking=False)

        if not transcript:
            return KioskChatResponse(speech="", intent="UNKNOWN", confidence=0.0)

        session = self._get_or_create_session(session_id, booking=False)
        history_text = self._format_history(session.history)
        system_prompt = self._build_general_prompt(
            tenant.hotel_name, current_state, history_text
        )

        llm_result = self._invoke_llm(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript},
            ]
        )

        if llm_result:
            intent = self._normalize_intent(
                llm_result.get("intent"), self._GENERAL_INTENTS
            )
            confidence = self._normalize_confidence(
                llm_result.get("confidence"), default=0.0
            )
            speech = self._normalize_speech(
                llm_result.get("speech"),
                fallback=self._default_general_speech(intent),
            )
            response = KioskChatResponse(
                speech=speech, intent=intent, confidence=confidence
            )
        else:
            response = self._fallback_general_response(transcript)

        self._append_history(session, "user", transcript)
        self._append_history(session, "assistant", response.speech)
        return response

    def booking_chat(
        self,
        tenant: Tenant,
        payload: KioskChatRequest,
    ) -> KioskBookingChatResponse:
        session_id = self._resolve_session_id(payload.sessionId)
        current_state = (payload.currentState or "BOOKING_COLLECT").strip().upper()
        transcript = (payload.transcript or "").strip()

        if current_state in {"WELCOME", "IDLE"}:
            self._clear_session(session_id, booking=True)

        session = self._get_or_create_session(session_id, booking=True)

        if not transcript:
            missing_slots = self._missing_slots(session.slots)
            return KioskBookingChatResponse(
                speech="Please tell me your booking details.",
                intent="UNKNOWN",
                confidence=0.0,
                extractedSlots={},
                accumulatedSlots=dict(session.slots),
                missingSlots=missing_slots,
                nextSlotToAsk=missing_slots[0] if missing_slots else None,
                isComplete=len(missing_slots) == 0,
                persistedBookingId=None,
            )

        room_lines = self._format_room_inventory(tenant.slug)
        history_text = self._format_history(session.history)
        missing_before = self._missing_slots(session.slots)
        system_prompt = self._build_booking_prompt(
            hotel_name=tenant.hotel_name,
            current_state=current_state,
            history_text=history_text,
            room_inventory=room_lines,
            current_slots=session.slots,
            missing_slots=missing_before,
        )

        llm_result = self._invoke_llm(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript},
            ]
        )

        if llm_result:
            extracted_slots = self._normalize_slots(llm_result.get("extractedSlots"))
            intent = self._normalize_intent(
                llm_result.get("intent"), self._BOOKING_INTENTS
            )
            confidence = self._normalize_confidence(
                llm_result.get("confidence"), default=0.0
            )
            speech = self._normalize_speech(
                llm_result.get("speech"),
                fallback=self._default_booking_speech(intent),
            )
            llm_next_slot = llm_result.get("nextSlotToAsk")
        else:
            fallback = self._fallback_booking_response(transcript)
            extracted_slots = fallback["extracted_slots"]
            intent = fallback["intent"]
            confidence = fallback["confidence"]
            speech = fallback["speech"]
            llm_next_slot = None

        self._merge_slots(session.slots, extracted_slots)
        missing_after = self._missing_slots(session.slots)
        is_complete = len(missing_after) == 0

        next_slot = (
            str(llm_next_slot).strip()
            if llm_next_slot and str(llm_next_slot).strip() in missing_after
            else (missing_after[0] if missing_after else None)
        )

        response = KioskBookingChatResponse(
            speech=speech,
            intent=intent,
            confidence=confidence,
            extractedSlots=extracted_slots,
            accumulatedSlots=dict(session.slots),
            missingSlots=missing_after,
            nextSlotToAsk=next_slot,
            isComplete=is_complete,
            persistedBookingId=None,
        )

        self._append_history(session, "user", transcript)
        self._append_history(session, "assistant", response.speech)
        return response

    def _invoke_llm(self, messages: list[dict[str, str]]) -> dict[str, Any] | None:
        api_key = self.settings.groq_api_key
        if not api_key:
            LOGGER.warning(
                "GROQ_API_KEY is not configured; using fallback intent logic"
            )
            return None

        payload = {
            "model": self.settings.groq_model,
            "temperature": 0,
            "max_tokens": 400,
            "response_format": {"type": "json_object"},
            "messages": messages,
        }
        request = Request(
            self._GROQ_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "ATC-KioskBrain/1.0",
            },
            method="POST",
        )

        try:
            with urlopen(
                request, timeout=float(self.settings.groq_timeout_seconds)
            ) as response:
                response_body = response.read().decode("utf-8")
        except HTTPError as exc:
            details = exc.read().decode("utf-8", errors="ignore")
            LOGGER.warning("Groq request failed (%s): %s", exc.code, details)
            return None
        except URLError as exc:
            LOGGER.warning("Groq connection error: %s", exc)
            return None
        except Exception:
            LOGGER.exception("Unexpected Groq call failure")
            return None

        try:
            envelope = json.loads(response_body)
            raw_content = envelope["choices"][0]["message"]["content"]
        except (KeyError, TypeError, IndexError, json.JSONDecodeError):
            LOGGER.warning("Groq returned malformed envelope: %s", response_body)
            return None

        parsed = self._extract_json(raw_content)
        if parsed is None:
            LOGGER.warning("Groq response content was not valid JSON: %s", raw_content)
        return parsed

    @staticmethod
    def _extract_json(raw_content: Any) -> dict[str, Any] | None:
        if isinstance(raw_content, dict):
            return raw_content

        if not isinstance(raw_content, str):
            return None

        text = raw_content.strip()
        if not text:
            return None

        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", text)
            if not match:
                return None
            try:
                parsed = json.loads(match.group(0))
                return parsed if isinstance(parsed, dict) else None
            except json.JSONDecodeError:
                return None

    def _build_general_prompt(
        self,
        hotel_name: str,
        current_state: str,
        history_text: str,
    ) -> str:
        intents = ", ".join(sorted(self._GENERAL_INTENTS))
        return (
            "You are a hotel kiosk concierge assistant.\n"
            f"Hotel: {hotel_name}\n"
            f"Current kiosk state: {current_state}\n"
            f"Valid intents: {intents}\n\n"
            "Conversation history:\n"
            f"{history_text}\n\n"
            "Rules:\n"
            "1) Pick exactly one intent from the valid list.\n"
            "2) speech must be polite and concise (max 2 sentences).\n"
            "3) confidence must be a number from 0 to 1.\n"
            "4) If uncertain, use intent UNKNOWN.\n\n"
            "Return JSON only in this shape:\n"
            '{"speech":"string","intent":"VALID_INTENT","confidence":0.0}\n'
        )

    def _build_booking_prompt(
        self,
        hotel_name: str,
        current_state: str,
        history_text: str,
        room_inventory: str,
        current_slots: dict[str, Any],
        missing_slots: list[str],
    ) -> str:
        intents = ", ".join(sorted(self._BOOKING_INTENTS))
        slots_json = json.dumps(current_slots, ensure_ascii=True)
        missing_text = ", ".join(missing_slots) if missing_slots else "none"
        today = date.today().isoformat()
        return (
            "You are a hotel kiosk booking assistant.\n"
            f"Hotel: {hotel_name}\n"
            f"Current kiosk state: {current_state}\n"
            f"Today: {today}\n"
            f"Valid intents: {intents}\n\n"
            "Room inventory:\n"
            f"{room_inventory}\n\n"
            "Current booking slots:\n"
            f"{slots_json}\n"
            f"Missing slots: {missing_text}\n\n"
            "Conversation history:\n"
            f"{history_text}\n\n"
            "Rules:\n"
            "1) Keep speech concise and helpful.\n"
            "2) Extract booking slots when spoken by user.\n"
            "3) Slot keys allowed: guests, checkInDate, checkOutDate, guestName, roomType.\n"
            "4) Use ISO dates when possible.\n"
            "5) If uncertain, use intent UNKNOWN.\n\n"
            "Return JSON only in this shape:\n"
            '{"speech":"string","intent":"VALID_INTENT","confidence":0.0,'
            '"extractedSlots":{"guests":2},"nextSlotToAsk":"checkOutDate","isComplete":false}\n'
        )

    def _format_room_inventory(self, slug: str) -> str:
        room_types = self.kiosk_service.get_room_types_by_slug(slug)
        if not room_types:
            return "- No room types available."
        lines: list[str] = []
        for room in room_types:
            amenities = ", ".join(room.amenities or [])
            price = float(room.price) if room.price is not None else 0.0
            amenity_text = amenities if amenities else "No amenities listed"
            lines.append(f"- {room.name} ({room.code}): {price:.2f} | {amenity_text}")
        return "\n".join(lines)

    @classmethod
    def _format_history(cls, history: list[dict[str, str]]) -> str:
        if not history:
            return "(conversation start)"

        recent_history = history[-cls._MAX_HISTORY_MESSAGES :]
        lines: list[str] = []
        for message in recent_history:
            role = "Guest" if message.get("role") == "user" else "Assistant"
            content = message.get("content", "").strip()
            if content:
                lines.append(f"{role}: {content}")
        return "\n".join(lines) if lines else "(conversation start)"

    @classmethod
    def _resolve_session_id(cls, session_id: str | None) -> str:
        resolved = (session_id or "").strip()
        return resolved if resolved else "default"

    @classmethod
    def _get_or_create_session(
        cls,
        session_id: str,
        *,
        booking: bool,
    ) -> _SessionMemory | _BookingSessionMemory:
        with cls._lock:
            cls._evict_expired_locked()
            store: dict[str, _SessionMemory | _BookingSessionMemory]
            if booking:
                store = cls._booking_sessions
                session = store.get(session_id)
                if session is None:
                    session = _BookingSessionMemory()
                    store[session_id] = session
            else:
                store = cls._general_sessions
                session = store.get(session_id)
                if session is None:
                    session = _SessionMemory()
                    store[session_id] = session

            session.last_activity = datetime.utcnow()
            return session

    @classmethod
    def _clear_session(cls, session_id: str, *, booking: bool) -> None:
        with cls._lock:
            if booking:
                cls._booking_sessions.pop(session_id, None)
            else:
                cls._general_sessions.pop(session_id, None)

    @classmethod
    def _evict_expired_locked(cls) -> None:
        now = datetime.utcnow()
        cutoff = now - cls._SESSION_TTL

        for session_id, session in list(cls._general_sessions.items()):
            if session.last_activity < cutoff:
                cls._general_sessions.pop(session_id, None)

        for session_id, session in list(cls._booking_sessions.items()):
            if session.last_activity < cutoff:
                cls._booking_sessions.pop(session_id, None)

    @classmethod
    def _append_history(
        cls,
        session: _SessionMemory | _BookingSessionMemory,
        role: str,
        content: str,
    ) -> None:
        text = content.strip()
        if not text:
            session.last_activity = datetime.utcnow()
            return

        with cls._lock:
            session.history.append({"role": role, "content": text})
            if len(session.history) > cls._MAX_HISTORY_MESSAGES:
                session.history = session.history[-cls._MAX_HISTORY_MESSAGES :]
            session.last_activity = datetime.utcnow()

    @classmethod
    def _normalize_intent(cls, raw_intent: Any, allowed: set[str]) -> str:
        if not isinstance(raw_intent, str):
            return "UNKNOWN"
        candidate = raw_intent.strip().upper().replace("-", "_").replace(" ", "_")
        if candidate in allowed:
            return candidate
        return "UNKNOWN"

    @staticmethod
    def _normalize_confidence(raw_confidence: Any, *, default: float) -> float:
        try:
            value = float(raw_confidence)
        except (TypeError, ValueError):
            value = default
        return max(0.0, min(1.0, value))

    @staticmethod
    def _normalize_speech(raw_speech: Any, *, fallback: str) -> str:
        if isinstance(raw_speech, str):
            text = raw_speech.strip()
            if text:
                return text
        return fallback

    @staticmethod
    def _normalize_slots(raw_slots: Any) -> dict[str, Any]:
        if not isinstance(raw_slots, dict):
            return {}

        normalized: dict[str, Any] = {}
        for key, value in raw_slots.items():
            if not isinstance(key, str):
                continue
            key_text = key.strip()
            if not key_text or value is None:
                continue
            normalized[key_text] = value
        return normalized

    @classmethod
    def _missing_slots(cls, slots: dict[str, Any]) -> list[str]:
        missing: list[str] = []
        for slot in cls._BOOKING_REQUIRED_SLOTS:
            value = slots.get(slot)
            if value is None:
                missing.append(slot)
            elif isinstance(value, str) and not value.strip():
                missing.append(slot)
        return missing

    @staticmethod
    def _merge_slots(target: dict[str, Any], extracted: dict[str, Any]) -> None:
        for key, value in extracted.items():
            if value is None:
                continue
            if isinstance(value, str) and not value.strip():
                continue
            target[key] = value

    def _fallback_general_response(self, transcript: str) -> KioskChatResponse:
        text = transcript.lower()

        if any(token in text for token in ("check in", "check-in", "reservation")):
            return KioskChatResponse(
                speech="Sure, I can help with check-in. Please scan your ID to continue.",
                intent="CHECK_IN",
                confidence=0.6,
            )
        if any(token in text for token in ("book", "room", "reservation")):
            return KioskChatResponse(
                speech="I can help you book a room. Let's start with your stay details.",
                intent="BOOK_ROOM",
                confidence=0.6,
            )
        if any(token in text for token in ("help", "support", "staff", "human")):
            return KioskChatResponse(
                speech="I can help right away. Tell me what you need.",
                intent="HELP",
                confidence=0.58,
            )
        if any(token in text for token in ("scan", "passport", "license", "id")):
            return KioskChatResponse(
                speech="Please scan your ID when you're ready.",
                intent="SCAN_ID",
                confidence=0.55,
            )
        if any(token in text for token in ("pay", "payment", "card")):
            return KioskChatResponse(
                speech="Payment is available after we confirm your booking details.",
                intent="PAYMENT",
                confidence=0.55,
            )
        if "repeat" in text:
            return KioskChatResponse(
                speech="Sure, please say that again and I will repeat the instructions.",
                intent="REPEAT",
                confidence=0.52,
            )

        return KioskChatResponse(
            speech="Could you rephrase that so I can help you better?",
            intent="GENERAL_QUERY",
            confidence=0.4,
        )

    def _fallback_booking_response(self, transcript: str) -> dict[str, Any]:
        text = transcript.lower()
        extracted: dict[str, Any] = {}

        guests_match = re.search(
            r"\b(\d{1,2})\s*(guests?|adults?|people|persons?)\b",
            text,
        )
        if guests_match:
            extracted["guests"] = int(guests_match.group(1))

        iso_dates = re.findall(r"\b\d{4}-\d{2}-\d{2}\b", text)
        if iso_dates:
            extracted["checkInDate"] = iso_dates[0]
            if len(iso_dates) > 1:
                extracted["checkOutDate"] = iso_dates[1]

        if "tomorrow" in text and "checkInDate" not in extracted:
            extracted["checkInDate"] = (date.today() + timedelta(days=1)).isoformat()

        name_match = re.search(
            r"\b(?:my name is|name is|i am)\s+([a-z][a-z\s'.-]{1,60})", text
        )
        if name_match:
            extracted["guestName"] = name_match.group(1).strip().title()

        if any(token in text for token in ("cancel", "start over", "go back")):
            intent = "CANCEL_BOOKING"
            speech = "Okay, I can cancel this booking flow. Say continue if you want to keep going."
            confidence = 0.62
        elif "confirm" in text:
            intent = "CONFIRM_BOOKING"
            speech = (
                "Great, I'll confirm once all required booking details are complete."
            )
            confidence = 0.56
        elif "modify" in text or "change" in text:
            intent = "MODIFY_BOOKING"
            speech = "Sure, tell me which detail you want to change."
            confidence = 0.56
        elif "price" in text or "cost" in text or "how much" in text:
            intent = "ASK_PRICE"
            speech = "I can explain room pricing. Which room type are you considering?"
            confidence = 0.55
        elif "amenit" in text or "detail" in text or "feature" in text:
            intent = "ASK_ROOM_DETAIL"
            speech = (
                "I can share room details. Which room would you like to hear about?"
            )
            confidence = 0.55
        elif "compare" in text:
            intent = "COMPARE_ROOMS"
            speech = (
                "I can compare room options for you. Tell me which ones to compare."
            )
            confidence = 0.55
        elif any(slot in extracted for slot in ("checkInDate", "checkOutDate")):
            intent = "PROVIDE_DATES"
            speech = "Thanks. I captured your dates."
            confidence = 0.53
        elif "guestName" in extracted:
            intent = "PROVIDE_NAME"
            speech = "Thanks, I captured the guest name."
            confidence = 0.53
        elif "guests" in extracted:
            intent = "PROVIDE_GUESTS"
            speech = "Thanks, I captured your guest count."
            confidence = 0.53
        elif any(token in text for token in ("deluxe", "suite", "standard", "room")):
            intent = "SELECT_ROOM"
            speech = "Great choice. Now please share your guest count and travel dates."
            confidence = 0.54
        elif "help" in text:
            intent = "HELP"
            speech = "I can walk you through the booking step by step."
            confidence = 0.54
        elif "repeat" in text:
            intent = "REPEAT"
            speech = "Sure, please say your booking details again."
            confidence = 0.52
        else:
            intent = "GENERAL_QUERY"
            speech = "Please share your guest count, dates, and reservation name."
            confidence = 0.4

        return {
            "intent": intent,
            "speech": speech,
            "confidence": confidence,
            "extracted_slots": extracted,
        }

    @staticmethod
    def _default_general_speech(intent: str) -> str:
        defaults = {
            "CHECK_IN": "Sure, I can help with check-in.",
            "BOOK_ROOM": "Sure, I can help you book a room.",
            "HELP": "I can help. Tell me what you need.",
            "SCAN_ID": "Please scan your ID to continue.",
            "PAYMENT": "Let's continue to payment when you're ready.",
            "WELCOME": "Welcome. How may I assist you today?",
            "IDLE": "",
            "REPEAT": "I can repeat that. Please tell me what you need repeated.",
            "GENERAL_QUERY": "How can I help with your stay today?",
            "UNKNOWN": "I didn't catch that. Please repeat your request.",
        }
        return defaults.get(intent, "How can I help you today?")

    @staticmethod
    def _default_booking_speech(intent: str) -> str:
        defaults = {
            "SELECT_ROOM": "Please tell me which room type you prefer.",
            "PROVIDE_GUESTS": "How many guests will be staying?",
            "PROVIDE_DATES": "Please share your check-in and check-out dates.",
            "PROVIDE_NAME": "Please share the reservation name.",
            "CONFIRM_BOOKING": "I'll confirm your booking details now.",
            "MODIFY_BOOKING": "Tell me what you'd like to change.",
            "CANCEL_BOOKING": "Okay, I can cancel the booking flow.",
            "ASK_ROOM_DETAIL": "I can share room details.",
            "ASK_PRICE": "I can share room pricing.",
            "COMPARE_ROOMS": "I can compare available room options.",
            "GENERAL_QUERY": "Please share your booking details.",
            "HELP": "I can help you complete this booking.",
            "REPEAT": "Please repeat your booking details.",
            "UNKNOWN": "I didn't catch that. Could you repeat?",
        }
        return defaults.get(intent, "Please share your booking details.")
