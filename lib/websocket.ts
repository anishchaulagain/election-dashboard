import { useElectionStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectInterval = 5000;
  private maxReconnectAttempts = 10;
  private reconnectAttempts = 0;

  connect() {
    try {
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log("[WS] Connected");
        this.reconnectAttempts = 0;
        useElectionStore.getState().setWsConnected(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("[WS] Message:", payload.type);

          if (payload.type === "events") {
            // New events received
            // Note: The store will merge these if we implemented it that way, 
            // but for now we just log. The polling hook will catch them on next tick anyway.
          } else if (payload.type === "update") {
            // Stats updated
          }
        } catch (e) {
          console.error("[WS] Error parsing message:", e);
        }
      };

      this.socket.onclose = () => {
        console.log("[WS] Disconnected");
        useElectionStore.getState().setWsConnected(false);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("[WS] Error:", error);
      };
    } catch (e) {
      console.error("[WS] Connection error:", e);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WS] Reconnecting attempt ${this.reconnectAttempts}...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new WebSocketClient();
