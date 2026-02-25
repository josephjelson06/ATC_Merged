import { UiState } from "./states";

// State-based speech responses (deterministic, no LLM)
export const STATE_SPEECH_MAP: Partial<Record<UiState, string>> = {
    WELCOME: "Welcome to {{TENANT_NAME}}. How may I assist you today?",
    AI_CHAT: "I'm listening. You can say check in, book a room, or ask for help.",
    MANUAL_MENU: "Please select an option from the menu.",
    SCAN_ID: "Please scan your ID or passport.",
    ROOM_SELECT: "Please select your preferred room.",
    BOOKING_COLLECT: "Let me help you book a room. I'll need a few details.",
    BOOKING_SUMMARY: "Let me confirm your booking details.",
    PAYMENT: "Please complete your payment.",
    KEY_DISPENSING: "Please wait while I prepare your key.",
    COMPLETE: "Thank you for choosing {{TENANT_NAME}}. Enjoy your stay.",
    ERROR: "I'm sorry, something went wrong. Please tap to try again.",
};
