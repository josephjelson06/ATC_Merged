type InterimCallback = (transcript: string, isFinal: boolean) => void;
type EndOfTurnCallback = (accumulatedTranscript: string, confidence?: number) => void;
type SpeechStartedCallback = () => void;
type ErrorCallback = (error: Error) => void;

import { AudioCapture } from "./audioCapture";

const DG_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || "";
const DG_MODEL = "nova-2";
const DG_LANGUAGE = import.meta.env.VITE_DEEPGRAM_LANGUAGE || "en-IN";
const DG_URL = "wss://api.deepgram.com/v1/listen";

const KEEP_ALIVE_INTERVAL_MS = 5000;
const RETRY_DELAY_MS = 1000;
const MAX_BUFFERED_CHUNKS = 256;

type DeepgramCloseCode = "DATA-0000" | "NET-0000" | "NET-0001" | "UNKNOWN";

class DeepgramWsClient {
  private socket: WebSocket | null = null;
  private interimCallback: InterimCallback | null = null;
  private endOfTurnCallback: EndOfTurnCallback | null = null;
  private speechStartedCallback: SpeechStartedCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private isConnected = false;
  private isClosing = false;

  private interimTimer: ReturnType<typeof setTimeout> | null = null;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;
  private accumulatedTranscript = "";
  private lastInterimTranscript = "";
  private lastConfidence = 0;

  private sampleRate = 48000;
  private reconnectAttempted = false;
  private pendingReconnect = false;
  private bufferedAudio: Int16Array[] = [];
  private lastAudioSendAtMs = 0;

  // Timestamp offset (seconds) to preserve continuity across reconnects.
  private streamOffsetSeconds = 0;
  private streamSecondsThisConnection = 0;

  constructor() {
    console.log("[Deepgram] Client initialized for direct browser WebSocket");
  }

  public onInterim(callback: InterimCallback) {
    this.interimCallback = callback;
  }

  public onEndOfTurn(callback: EndOfTurnCallback) {
    this.endOfTurnCallback = callback;
  }

  public onSpeechStarted(callback: SpeechStartedCallback) {
    this.speechStartedCallback = callback;
  }

  public onError(callback: ErrorCallback) {
    this.errorCallback = callback;
  }

  public connect(sampleRateOverride?: number): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (!DG_API_KEY) {
      this.errorCallback?.(new Error("VITE_DEEPGRAM_API_KEY is not configured"));
      return;
    }

    console.warn(`[Deepgram Debug] BROWSER PARSED KEY: "${DG_API_KEY}" (Length: ${DG_API_KEY.length})`);

    this.sampleRate = sampleRateOverride || AudioCapture.getSampleRate() || 48000;

    if (!this.pendingReconnect) {
      this.resetReconnectState();
    }

    const wsUrl = this.buildWsUrl(this.sampleRate);
    console.warn(`[Deepgram Debug] 1. ATTEMPTING CONNECTION to: wss://api.deepgram.com/v1/listen...`);
    console.warn(`[Deepgram Debug] 1a. URL Params length: ${wsUrl.split('?')[1]?.length || 0} characters.`);
    const connectStartTime = Date.now();

    try {
      // Deepgram browser auth: pass API key via Sec-WebSocket-Protocol header.
      // Browsers cannot set custom headers on WebSocket, so Deepgram uses the
      // subprotocol field: new WebSocket(url, ['token', 'YOUR_API_KEY'])
      this.socket = new WebSocket(wsUrl, ['token', DG_API_KEY]);
      console.warn(`[Deepgram Debug] 2. WebSocket object created with Sec-WebSocket-Protocol auth. readyState: ${this.socket.readyState} (0=CONNECTING)`);
    } catch (wsCreationError) {
      console.error(`[Deepgram Debug] FATAL: Browser refused to even create the WebSocket object:`, wsCreationError);
      this.errorCallback?.(new Error("Browser blocked WebSocket creation"));
      return;
    }

    this.socket.onopen = () => {
      console.warn(`[Deepgram Debug] 3. SUCCESS: onopen fired after ${Date.now() - connectStartTime}ms. readyState: ${this.socket?.readyState}`);
      this.isConnected = true;
      this.lastAudioSendAtMs = Date.now();
      console.log(`[Deepgram] Connected (sample_rate=${this.sampleRate})`);
      this.startKeepAlive();

      if (this.pendingReconnect) {
        this.pendingReconnect = false;
        this.flushBufferedAudio();
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const adjusted = this.applyTimestampOffset(parsed);
        this.handleNovaMessage(adjusted);
      } catch (parseError) {
        console.error("[Deepgram] Failed to parse message:", parseError);
      }
    };

    this.socket.onerror = (ev) => {
      console.error(`[Deepgram Debug] 4. ERROR: onerror fired after ${Date.now() - connectStartTime}ms. readyState: ${this.socket?.readyState}`);
      console.error(`[Deepgram Debug] 4a. The browser provides no HTTP status in onerror due to security (CORS/WSS spec). If onclose immediately follows with 1006, it means the connection dropped before completing the TLS handshake, or an extension/firewall blocked it.`);
      this.errorCallback?.(new Error("Deepgram WebSocket error"));
    };

    this.socket.onclose = (event) => {
      this.isConnected = false;
      this.stopKeepAlive();

      console.warn(
        `[Deepgram Debug] 5. CLOSE: onclose fired after ${Date.now() - connectStartTime}ms. code=${event.code} wasClean=${event.wasClean} reason="${event.reason || "(empty)"}"`
      );

      if (event.code === 1006) {
        console.error(
          "[Deepgram Debug] CRITICAL: Code 1006 means the browser abruptly killed the connection. " +
          "Because your API key worked in PowerShell, this is NOT a Deepgram account issue. " +
          "It MUST be one of these three browser-level issues:\n" +
          "1. Adblocker / Privacy Extension (uBlock, Privacy Badger, Brave Shields) is blocking 'api.deepgram.com'.\n" +
          "2. Corporate VPN / Antivirus Web-Shield (Avast/Kaspersky) is intercepting the `wss://` TLS handshake.\n" +
          "3. You are serving the site over HTTP but Deepgram is WSS (mix-content block, though usually allowed on localhost)."
        );
        this.errorCallback?.(new Error("Deepgram 1006: connection rejected — check API key."));
        return;
      }

      if (this.isClosing) {
        this.isClosing = false;
        return;
      }

      const dgCode = this.resolveDeepgramCloseCode(event.code, event.reason || "");
      console.warn(`[Deepgram] Closed code=${event.code} reason=${event.reason || "(empty)"} interpreted=${dgCode}`);

      if (dgCode === "DATA-0000") {
        this.errorCallback?.(new Error("Deepgram DATA-0000: invalid audio format."));
        return;
      }

      if (dgCode === "NET-0000") {
        this.errorCallback?.(new Error("Deepgram NET-0000: server timeout. Falling back to touch mode."));
        return;
      }

      if (dgCode === "NET-0001") {
        this.retryOnceWithBuffer();
        return;
      }
    };
  }

  private resetReconnectState(): void {
    this.reconnectAttempted = false;
    this.pendingReconnect = false;
    this.bufferedAudio = [];
    this.streamOffsetSeconds = 0;
    this.streamSecondsThisConnection = 0;
  }

  private buildWsUrl(sampleRate: number): string {
    // Auth is handled via Sec-WebSocket-Protocol header, NOT via URL param.
    const params = new URLSearchParams({
      model: DG_MODEL,
      language: DG_LANGUAGE,
      encoding: "linear16",
      sample_rate: String(sampleRate),
      channels: "1",
      smart_format: "true",
      interim_results: "true",
      endpointing: "300",
      utterance_end_ms: "1500",
      vad_events: "true",
    });
    return `${DG_URL}?${params.toString()}`;
  }

  private resolveDeepgramCloseCode(code: number, reason: string): DeepgramCloseCode {
    const upperReason = reason.toUpperCase();

    if (upperReason.includes("DATA-0000")) {
      return "DATA-0000";
    }
    if (upperReason.includes("NET-0001")) {
      return "NET-0001";
    }
    if (upperReason.includes("NET-0000")) {
      return "NET-0000";
    }

    if (code === 1008) {
      return "DATA-0000";
    }
    if (code === 1011) {
      return "NET-0001";
    }

    return "UNKNOWN";
  }

  private retryOnceWithBuffer(): void {
    if (this.reconnectAttempted) {
      this.errorCallback?.(new Error("Deepgram NET-0001: reconnect already attempted."));
      return;
    }

    this.reconnectAttempted = true;
    this.pendingReconnect = true;
    this.streamOffsetSeconds += this.streamSecondsThisConnection;
    this.streamSecondsThisConnection = 0;

    setTimeout(() => {
      this.connect(this.sampleRate);
    }, RETRY_DELAY_MS);
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      const ws = this.socket;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return;
      }

      const silenceMs = Date.now() - this.lastAudioSendAtMs;
      if (silenceMs < KEEP_ALIVE_INTERVAL_MS) {
        return;
      }

      try {
        ws.send(JSON.stringify({ type: "KeepAlive" }));
      } catch (sendError) {
        console.error("[Deepgram] KeepAlive send failed:", sendError);
      }
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private bufferAudioChunk(chunk: Int16Array): void {
    if (this.bufferedAudio.length >= MAX_BUFFERED_CHUNKS) {
      this.bufferedAudio.shift();
    }
    this.bufferedAudio.push(new Int16Array(chunk));
  }

  private flushBufferedAudio(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.bufferedAudio.length === 0) {
      return;
    }

    const queued = [...this.bufferedAudio];
    this.bufferedAudio = [];

    for (const chunk of queued) {
      this.send(chunk);
    }
  }

  private applyTimestampOffset(data: any): any {
    const offset = this.streamOffsetSeconds;
    if (!offset || !data || typeof data !== "object") {
      return data;
    }

    if (data.type === "Results") {
      const adjusted = { ...data };
      if (typeof adjusted.start === "number") {
        adjusted.start = adjusted.start + offset;
      }

      const channel = adjusted.channel;
      if (channel && Array.isArray(channel.alternatives)) {
        adjusted.channel = {
          ...channel,
          alternatives: channel.alternatives.map((alternative: any) => {
            if (!alternative || !Array.isArray(alternative.words)) {
              return alternative;
            }

            return {
              ...alternative,
              words: alternative.words.map((word: any) => ({
                ...word,
                start: typeof word?.start === "number" ? word.start + offset : word?.start,
                end: typeof word?.end === "number" ? word.end + offset : word?.end,
              })),
            };
          }),
        };
      }

      return adjusted;
    }

    if (data.type === "UtteranceEnd" && typeof data.last_word_end === "number") {
      return {
        ...data,
        last_word_end: data.last_word_end + offset,
      };
    }

    return data;
  }

  private handleNovaMessage(data: any) {
    const msgType = data.type;

    switch (msgType) {
      case "Results": {
        const channel = data.channel;
        const alternative = channel?.alternatives?.[0];
        const transcript = alternative?.transcript || "";
        const confidence = alternative?.confidence ?? 0;
        const isFinal = data.is_final === true;

        if (!transcript) {
          break;
        }

        this.interimCallback?.(transcript, isFinal);

        if (isFinal) {
          this.clearInterimTimer();
          this.accumulatedTranscript = transcript.trim();
          this.lastConfidence = confidence;
          this.triggerEndOfTurn();
        } else {
          this.lastInterimTranscript = transcript.trim();
          this.lastConfidence = confidence;
          this.startInterimTimer();
        }
        break;
      }

      case "SpeechStarted":
        this.clearInterimTimer();
        this.accumulatedTranscript = "";
        this.lastInterimTranscript = "";
        this.speechStartedCallback?.();
        break;

      case "UtteranceEnd":
        this.triggerEndOfTurn();
        break;

      case "Metadata":
        break;

      default:
        break;
    }
  }

  private triggerEndOfTurn() {
    this.clearInterimTimer();
    const finalText = this.accumulatedTranscript || this.lastInterimTranscript;

    if (finalText && finalText.trim().length > 0) {
      this.endOfTurnCallback?.(finalText.trim(), this.lastConfidence);
      this.accumulatedTranscript = "";
      this.lastInterimTranscript = "";
      this.lastConfidence = 0;
    }
  }

  private startInterimTimer() {
    this.clearInterimTimer();
    this.interimTimer = setTimeout(() => {
      this.accumulatedTranscript = this.lastInterimTranscript;
      this.triggerEndOfTurn();
    }, 2000);
  }

  private clearInterimTimer() {
    if (this.interimTimer) {
      clearTimeout(this.interimTimer);
      this.interimTimer = null;
    }
  }

  public send(audioChunk: Int16Array): void {
    if (!audioChunk || audioChunk.length === 0) {
      return;
    }

    const ws = this.socket;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      this.bufferAudioChunk(audioChunk);
      return;
    }

    this.lastAudioSendAtMs = Date.now();
    this.streamSecondsThisConnection += audioChunk.length / this.sampleRate;

    try {
      ws.send(audioChunk.buffer);
    } catch (sendError) {
      console.error("[Deepgram] Audio send failed:", sendError);
      this.bufferAudioChunk(audioChunk);
    }
  }

  public close(): string {
    const transcript = this.accumulatedTranscript;

    this.clearInterimTimer();
    this.stopKeepAlive();
    this.isClosing = true;
    this.pendingReconnect = false;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: "CloseStream" }));
      } catch (closeStreamError) {
        console.warn("[Deepgram] CloseStream failed:", closeStreamError);
      }
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnected = false;
    this.bufferedAudio = [];
    this.accumulatedTranscript = "";
    this.lastInterimTranscript = "";
    this.lastConfidence = 0;

    return transcript;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const DeepgramClient = new DeepgramWsClient();
