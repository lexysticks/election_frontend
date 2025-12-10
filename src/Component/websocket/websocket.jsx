// src/components/Election/useWebSocket.js
import { useEffect, useRef } from "react";

export default function useWebSocket(wsUrl, onMessage, deps = []) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log("WS opened", wsUrl);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage && onMessage(data);
      } catch (err) {
        // console.warn("WS parse error", err);
      }
    };

    ws.onerror = (e) => {
      // console.error("WS error", e);
    };

    ws.onclose = () => {
      // console.log("WS closed", wsUrl);
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // deps from caller
}
