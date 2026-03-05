"use client";

import { useElectionStore } from "@/lib/store";
import { useEvents } from "@/lib/hooks";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function LiveTicker() {
  const { events, addEvents } = useElectionStore();
  const { data } = useEvents();

  useEffect(() => {
    if (data?.events && data.events.length > 0) {
      addEvents(data.events);
    }
  }, [data, addEvents]);

  const displayEvents =
    events.length > 0
      ? events
      : [
          { type: "info", emoji: "📡", message: "Connecting to election data stream...", timestamp: new Date().toISOString() },
          { type: "info", emoji: "🗳️", message: "Nepal General Election 2082 — Real-time monitoring active", timestamp: new Date().toISOString() },
          { type: "info", emoji: "📊", message: "Waiting for constituency vote reports...", timestamp: new Date().toISOString() },
          { type: "info", emoji: "🇳🇵", message: "Election Intelligence Dashboard — Powered by live data", timestamp: new Date().toISOString() },
        ];

  return (
    <div className="relative overflow-hidden border-y bg-gradient-to-r from-red-950/20 via-background to-blue-950/20">
      {/* Live badge */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-red-600 to-red-700 px-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Ticker content */}
      <div className="ml-20 overflow-hidden py-2.5">
        <div className="ticker-animate flex whitespace-nowrap">
          {[...displayEvents, ...displayEvents].map((event, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 px-5 text-sm",
                event.type === "lead_change" && "text-yellow-500 font-medium",
                event.type === "vote_spike" && "text-orange-500 font-medium",
                event.type === "close_race" && "text-red-500 font-medium",
                event.type === "new_reporting" && "text-green-500 font-medium",
                event.type === "info" && "text-muted-foreground"
              )}
            >
              <span>{event.emoji}</span>
              <span>{event.message}</span>
              <span className="text-muted-foreground/50">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
