"use client";

import { useEffect, useRef } from "react";
import { useElectionStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { addEvents, setWsConnected, setLastUpdate } = useElectionStore();

  useEffect(() => {
    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[WS] Connected");
          setWsConnected(true);
          // Start ping interval
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send("ping");
            }
          }, 30000);
          ws.addEventListener("close", () => clearInterval(pingInterval));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "events" && data.data) {
              addEvents(data.data);
            }
            if (data.type === "update" && data.timestamp) {
              setLastUpdate(data.timestamp);
            }
          } catch {
            // Ignore pong responses
          }
        };

        ws.onclose = () => {
          console.log("[WS] Disconnected, reconnecting in 5s...");
          setWsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error("[WS] Connection error:", err);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [addEvents, setWsConnected, setLastUpdate]);
}
