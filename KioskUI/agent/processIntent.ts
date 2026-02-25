import { Intent } from "@contracts/intents";
import { UiState, TRANSITION_TABLE } from "./states";
import { STATE_SPEECH_MAP } from "./speech";

export type AgentResponse = {
    ui_state: UiState;
    speech?: string;
};

/**
 * Pure function: resolve Intent + current state → next state.
 * No side effects. Deterministic.
 */
export const processIntent = (
    intent: Intent,
    currentState: UiState,
    injectLog?: (msg: string) => void,
): AgentResponse => {
    const allowedTransitions = TRANSITION_TABLE[currentState];

    if (allowedTransitions && allowedTransitions[intent]) {
        const nextState = allowedTransitions[intent]!;
        if (injectLog) {
            injectLog(`[Agent] Transition Allowed: ${currentState} + ${intent} -> ${nextState}`);
        } else {
            console.log(`[Agent] Transition Allowed: ${currentState} + ${intent} -> ${nextState}`);
        }
        const speech = STATE_SPEECH_MAP[nextState];
        return { ui_state: nextState, speech };
    }

    // Explicit rejection (No-Op)
    return { ui_state: currentState };
};
