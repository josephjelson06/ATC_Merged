/**
 * Voice Utilities — Pure functions extracted from adapter.ts
 *
 * These functions have NO side effects and NO internal state dependency.
 * They transform input → output deterministically.
 */

import { UiState } from "./states";

// --- Sentiment Analysis ---

export type Sentiment = "URGENT" | "FRUSTRATED" | "POSITIVE" | "NEUTRAL";

const URGENT_WORDS = ["manager", "human", "supervisor", "emergency", "shutup", "shut up"];
const FRUSTRATED_WORDS = [
    "stupid", "hate", "broken", "doesn't work", "confused",
    "ridiculous", "slow", "shit", "damn", "useless", "wrong",
];
const POSITIVE_WORDS = ["thanks", "good", "great", "cool", "perfect"];

export function analyzeSentiment(text: string): Sentiment {
    const lower = text.toLowerCase();
    if (URGENT_WORDS.some((w) => lower.includes(w))) return "URGENT";
    if (FRUSTRATED_WORDS.some((w) => lower.includes(w))) return "FRUSTRATED";
    if (POSITIVE_WORDS.some((w) => lower.includes(w))) return "POSITIVE";
    return "NEUTRAL";
}

// --- LLM Intent → Machine Event Mapping ---

export function mapIntentToEvent(llmIntent: string, currentState: UiState): string {
    const upper = (llmIntent || "").toUpperCase().trim();

    switch (upper) {
        case "CHECK_IN":
            return "CHECK_IN_SELECTED";
        case "BOOK_ROOM":
            return "BOOK_ROOM_SELECTED";
        case "RECOMMEND_ROOM":
            return "ROOM_SELECTED";
        case "HELP":
            return "HELP_SELECTED";
        case "SCAN_ID":
            return "SCAN_COMPLETED";
        case "PAYMENT":
            return "CONFIRM_PAYMENT";
        case "WELCOME":
            return "CANCEL_REQUESTED";
        case "IDLE":
            return "RESET";
        case "SELECT_ROOM":
            return currentState === "ROOM_SELECT" ? "ROOM_SELECTED" : "SELECT_ROOM";
        case "PROVIDE_GUESTS":
        case "PROVIDE_DATES":
        case "PROVIDE_NAME":
        case "CONFIRM_BOOKING":
        case "MODIFY_BOOKING":
        case "CANCEL_BOOKING":
        case "ASK_ROOM_DETAIL":
        case "ASK_PRICE":
            return upper;
        case "REPEAT":
        case "GENERAL_QUERY":
        case "UNKNOWN":
            return "GENERAL_QUERY";
    }

    // Fuzzy fallback mapping
    if (upper.includes("CHECK_IN") || upper.includes("RESERVATION"))
        return "CHECK_IN_SELECTED";
    if (upper.includes("BOOK") || upper.includes("NEW_RESERVATION"))
        return "BOOK_ROOM_SELECTED";
    if (upper.includes("HELP") || upper.includes("SUPPORT")) return "HELP_SELECTED";
    if (upper.includes("SCAN")) return "SCAN_COMPLETED";
    if (upper.includes("PAYMENT") || upper.includes("PAY"))
        return "CONFIRM_PAYMENT";
    if (
        upper.includes("WELCOME") ||
        upper.includes("HOME") ||
        upper.includes("START")
    )
        return "CANCEL_REQUESTED";
    if (upper.includes("CANCEL")) return "CANCEL_BOOKING";
    if (upper.includes("MODIFY") || upper.includes("CHANGE"))
        return "MODIFY_BOOKING";
    if (upper.includes("DATE")) return "PROVIDE_DATES";
    if (upper.includes("GUEST")) return "PROVIDE_GUESTS";
    if (upper.includes("NAME")) return "PROVIDE_NAME";

    return "GENERAL_QUERY";
}

// --- Room Inference from Transcript ---

export function inferRoomFromTranscript(
    transcript: string,
    availableRooms: any[],
): any | null {
    if (!availableRooms?.length) return null;
    const lower = transcript.toLowerCase();
    for (const room of availableRooms) {
        const roomName = (room.name || "").toLowerCase();
        const roomCode = (room.code || "").toLowerCase();
        if (lower.includes(roomName) || lower.includes(roomCode)) {
            return room;
        }
    }
    return null;
}

// --- Simple NLP Helpers ---

export function isAffirmative(text: string): boolean {
    return /\b(yes|yeah|yep|correct|confirm|sure|okay|ok|right|affirmative)\b/i.test(text);
}

export function isNegative(text: string): boolean {
    return /\b(no|nah|nope|cancel|never|wrong|don't|stop|quit)\b/i.test(text);
}
