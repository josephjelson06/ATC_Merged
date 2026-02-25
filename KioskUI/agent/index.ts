/**
 * Agent Module — Public API (barrel export)
 *
 * Import from this file for backward compatibility.
 * Internals are split into: states, intents, speech, processIntent.
 */

// State machine
export type { UiState, InputMode } from "./states";
export { STATE_INPUT_MODES, TRANSITION_TABLE } from "./states";

// Intent mappings
export { VOICE_COMMAND_MAP } from "./intents";

// Speech
export { STATE_SPEECH_MAP } from "./speech";

// Pure function + types
export type { AgentResponse } from "./processIntent";
export { processIntent } from "./processIntent";
