/**
 * Voice & TTS Type Definitions
 *
 * All event and state types for the voice pipeline (STT + TTS).
 */

// --- STT / Voice Events ---

export type VoiceEvent =
    | { type: "VOICE_SESSION_STARTED" }
    | { type: "VOICE_TRANSCRIPT_PARTIAL"; transcript: string }
    | { type: "VOICE_TRANSCRIPT_READY"; transcript: string }
    | { type: "VOICE_SESSION_ENDED" }
    | { type: "VOICE_SESSION_ABORTED" }  // Watchdog/silence timeout
    | { type: "VOICE_SESSION_ERROR" };   // STT/TTS failure

// --- TTS Events ---

export type TtsEvent =
    | { type: "TTS_STARTED"; text: string }
    | { type: "TTS_ENDED" }
    | { type: "TTS_CANCELLED" }
    | { type: "TTS_ERROR"; error: string };

export type TtsState = "IDLE" | "SPEAKING";
