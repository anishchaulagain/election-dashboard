"use client";

import { useWebSocket } from "@/lib/websocket";

export function WebSocketInit() {
  useWebSocket();
  return null;
}
