"use client";

import { usePartyPerformance } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const PARTY_COLORS: Record<string, string> = {
  UML: "#1e40af",
  Congress: "#16a34a",
  Maoist: "#dc2626",
  RSP: "#7c3aed",
  RPP: "#ca8a04",
  JSP: "#ea580c",
  Other: "#6b7280",
};

export default function PartiesPage() {
  const { data, isLoading } = usePartyPerformance();

  const parties = data?.parties || [];

  const chartData = parties
    .filter((p) => p.candidates_count > 10)
    .slice(0, 12)
    .map((p) => ({
      name: p.short_name,
      seats: p.seats_leading,
      votes: p.total_votes,
      candidates: p.candidates_count,
      fullName: p.party,
      color: PARTY_COLORS[p.short_name] || PARTY_COLORS.Other,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🏛️ Party Performance Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive party-wise election performance with seat counts and vote shares.
        </p>
      </div>

      {/* Seats Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Seats Leading by Party</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some((d) => d.seats > 0) ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: "var(--color-foreground)" }} />
                <YAxis fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Bar dataKey="seats" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p>Seat data will appear once votes are counted</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Party Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detailed Party Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 pr-4 font-medium">#</th>
                  <th className="text-left py-3 pr-4 font-medium">Party</th>
                  <th className="text-right py-3 px-3 font-medium">Seats Leading</th>
                  <th className="text-right py-3 px-3 font-medium">Total Votes</th>
                  <th className="text-right py-3 px-3 font-medium">Vote Share</th>
                  <th className="text-right py-3 pl-3 font-medium">Candidates</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              PARTY_COLORS[party.short_name] || PARTY_COLORS.Other,
                          }}
                        />
                        <span className="font-medium truncate max-w-[300px]">
                          {party.party}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {party.short_name}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3">
                      <span className="font-bold text-lg">{party.seats_leading}</span>
                    </td>
                    <td className="text-right py-3 px-3">
                      {party.total_votes.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, party.vote_share)}%`,
                              backgroundColor:
                                PARTY_COLORS[party.short_name] || PARTY_COLORS.Other,
                            }}
                          />
                        </div>
                        {party.vote_share.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right py-3 pl-3 text-muted-foreground">
                      {party.candidates_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
