"use client";

import { useEvents, useFeaturedContent } from "@/lib/hooks";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ElectionEvent } from "@/lib/api";

export function LiveTicker() {
  const { data: eventData } = useEvents();
  const { data: featuredData } = useFeaturedContent();

  const events = eventData?.events || [];

  const tickerItems = useMemo(() => {
    const items: ElectionEvent[] = [];

    // 1. Add Featured Candidates
    if (featuredData?.featuredCandidates) {
      featuredData.featuredCandidates.forEach((c) => {
        if (c.leading || c.winner) {
          items.push({
            type: c.winner ? "new_reporting" : "lead_change",
            emoji: c.winner ? "🏆" : "📈",
            message: `${c.candidateName} (${c.politicalPartyName}) ${c.winner ? "declared winner" : "leading"} in ${c.districtName} ${c.areaName} with ${c.votes.toLocaleString()} votes`,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    // 2. Add Featured Areas (Hot Contests)
    if (featuredData?.featuredAreas) {
      featuredData.featuredAreas.forEach((area) => {
        const top2 = [...area.candidateResults].sort((a, b) => b.votes - a.votes).slice(0, 2);
        if (top2.length >= 2) {
          const gap = top2[0].votes - top2[1].votes;
          items.push({
            type: "close_race",
            emoji: "🔥",
            message: `Hot Contest: ${area.districtName}-${area.areaName}. ${top2[0].candidateName} leads ${top2[1].candidateName} by ${gap.toLocaleString()} votes`,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    // 3. Add Real-time Events from store
    items.push(...events);

    // 4. Fallback if nothing is available
    if (items.length === 0) {
      return [
        { type: "info", emoji: "📡", message: "Connecting to election data stream...", timestamp: new Date().toISOString() },
        { type: "info", emoji: "🗳️", message: "Nepal General Election 2082 — Real-time monitoring active", timestamp: new Date().toISOString() },
        { type: "info", emoji: "📊", message: "Waiting for constituency vote reports...", timestamp: new Date().toISOString() },
        { type: "info", emoji: "🇳🇵", message: "Election Intelligence Dashboard — Powered by live data", timestamp: new Date().toISOString() },
      ];
    }

    return items;
  }, [featuredData, events]);

  return (
    <div className="relative overflow-hidden border-y bg-gradient-to-r from-red-950/10 via-background to-blue-950/10">
      {/* Live badge */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-red-600 to-red-700 px-3 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold text-white tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Ticker content */}
      <div className="ml-20 overflow-hidden py-2.5">
        <div className="ticker-animate flex whitespace-nowrap">
          {/* Double the items for seamless loop */}
          {[...tickerItems, ...tickerItems].map((event, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 px-6 text-sm transition-colors",
                event.type === "lead_change" && "text-blue-400 font-bold",
                event.type === "vote_spike" && "text-orange-400 font-bold",
                event.type === "close_race" && "text-red-400 font-bold",
                event.type === "new_reporting" && "text-emerald-400 font-bold uppercase tracking-tight",
                event.type === "info" && "text-slate-400 font-medium"
              )}
            >
              <span className="text-lg">{event.emoji}</span>
              <span className="filter drop-shadow-sm">{event.message}</span>
              <span className="mx-2 text-slate-800 font-black">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fade overlay for smooth exit */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
    </div>
  );
}
