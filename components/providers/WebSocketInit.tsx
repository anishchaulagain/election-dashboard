"use client";

import { useEffect } from "react";
import { wsClient } from "@/lib/websocket";

export default function WebSocketInit() {
  useEffect(() => {
    wsClient.connect();
    return () => wsClient.disconnect();
  }, []);

  return null;
}
