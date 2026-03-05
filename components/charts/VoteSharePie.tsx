"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PartyStats } from "@/lib/api";

const COLORS = [
  "#1e40af", "#16a34a", "#dc2626", "#7c3aed",
  "#ca8a04", "#ea580c", "#0891b2", "#d946ef",
  "#65a30d", "#e11d48",
];

interface VoteSharePieProps {
  data: PartyStats[];
}

export function VoteSharePie({ data }: VoteSharePieProps) {
  const pieData = data
    .filter((p) => p.vote_share > 1)
    .slice(0, 8)
    .map((p, i) => ({
      name: p.short_name || p.party.slice(0, 12),
      value: p.vote_share,
      fullName: p.party,
      color: COLORS[i % COLORS.length],
    }));

  const otherShare = data
    .filter((p) => p.vote_share <= 1)
    .reduce((sum, p) => sum + p.vote_share, 0);

  if (otherShare > 0) {
    pieData.push({
      name: "Others",
      value: Math.round(otherShare * 100) / 100,
      fullName: "Other Parties",
      color: "#6b7280",
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          🗳️ Vote Share Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pieData.length > 0 && data.some((p) => p.total_votes > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={((value: number) => [`${value.toFixed(1)}%`, "Vote Share"]) as any}
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-foreground)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            <div className="text-center">
              <p className="text-4xl mb-2">🗳️</p>
              <p>Vote share will appear here</p>
              <p className="text-xs mt-1">Data populates as votes are counted</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
