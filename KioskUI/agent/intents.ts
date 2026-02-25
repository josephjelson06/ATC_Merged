import { Intent } from "@contracts/intents";
import { UiState } from "./states";

// Voice → Intent Mapping per state
export const VOICE_COMMAND_MAP: Record<UiState, Partial<Record<string, Intent>>> = {
    IDLE: {},
    WELCOME: {
        "check in": "CHECK_IN_SELECTED",
        "book room": "BOOK_ROOM_SELECTED",
        "i need a room": "BOOK_ROOM_SELECTED",
    },
    AI_CHAT: {
        "check in": "CHECK_IN_SELECTED",
        "book room": "BOOK_ROOM_SELECTED",
        "go back": "BACK_REQUESTED",
        "cancel": "CANCEL_REQUESTED",
    },
    MANUAL_MENU: {
        "check in": "CHECK_IN_SELECTED",
        "book room": "BOOK_ROOM_SELECTED",
        "go back": "BACK_REQUESTED",
        "cancel": "CANCEL_REQUESTED",
    },
    ROOM_SELECT: {
        "go back": "BACK_REQUESTED",
        "cancel": "CANCEL_REQUESTED",
    },
    BOOKING_COLLECT: {
        "go back": "BACK_REQUESTED",
        "cancel": "CANCEL_BOOKING",
    },
    BOOKING_SUMMARY: {
        "confirm": "CONFIRM_PAYMENT",
        "go back": "BACK_REQUESTED",
        "cancel": "CANCEL_BOOKING",
    },
    SCAN_ID: {},
    PAYMENT: {},
    KEY_DISPENSING: {},
    COMPLETE: {},
    ERROR: {},
};
