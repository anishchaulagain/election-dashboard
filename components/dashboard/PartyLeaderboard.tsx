"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PartyStats } from "@/lib/api";

const PARTY_COLORS: Record<string, string> = {
  UML: "#1e40af",
  Congress: "#16a34a",
  Maoist: "#dc2626",
  RSP: "#7c3aed",
  RPP: "#ca8a04",
  JSP: "#ea580c",
  Other: "#6b7280",
};

interface PartyLeaderboardProps {
  data: PartyStats[];
}

export function PartyLeaderboard({ data }: PartyLeaderboardProps) {
  const chartData = data
    .filter((p) => p.seats_leading > 0 || p.candidates_count > 20)
    .slice(0, 10)
    .map((p) => ({
      name: p.short_name || p.party.slice(0, 15),
      seats: p.seats_leading,
      votes: p.total_votes,
      fullName: p.party,
      color: PARTY_COLORS[p.short_name] || PARTY_COLORS.Other,
    }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          🏛️ Party Seat Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                fontSize={12}
                tick={{ fill: "var(--color-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={((value: number, name: string) => [
                  value.toLocaleString(),
                  name === "seats" ? "Seats Leading" : "Total Votes",
                ]) as any}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="seats" radius={[0, 6, 6, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            <div className="text-center">
              <p className="text-4xl mb-2">📊</p>
              <p>Waiting for vote data...</p>
              <p className="text-xs mt-1">Charts will populate once votes are counted</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
