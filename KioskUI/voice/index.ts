/**
 * Voice Module — Public API
 *
 * Import voice infrastructure from this barrel.
 * Internal structure: audio/, stt/, tts/, runtime/, utils/
 */

// Types
export type { VoiceEvent, TtsEvent, TtsState } from "./types";

// Runtime
export { VoiceRuntime } from "./runtime/VoiceRuntime";
export type { VoiceTurnState } from "./runtime/VoiceRuntime";

// TTS
export { TTSController } from "./tts/TTSController";

// Audio
export { AudioCapture } from "./audio/audioCapture";

// STT
export { DeepgramClient } from "./stt/deepgramClient";

// Utils
export { normalizeTranscript } from "./utils/normalizeTranscript";
