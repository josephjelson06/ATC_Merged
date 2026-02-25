import dynamic from "next/dynamic";

// The entire Kiosk app is client-only (browser APIs: AudioContext, WebSocket, TTS).
// We disable SSR entirely so Next.js never attempts to render it on the server.
const App = dynamic(() => import("../app/App"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#94a3b8",
        fontSize: "1rem",
        fontFamily: "monospace",
      }}
    >
      Loading Kiosk...
    </div>
  ),
});

export default function RootPage() {
  return <App />;
}
