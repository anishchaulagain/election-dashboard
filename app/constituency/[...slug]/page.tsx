"use client";

import { useConstituency } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#1e40af", "#16a34a", "#dc2626", "#7c3aed", "#ca8a04",
  "#ea580c", "#0891b2", "#d946ef", "#65a30d", "#e11d48",
  "#6b7280", "#475569", "#64748b", "#94a3b8",
];

const COMPETITIVENESS_COLOR: Record<string, string> = {
  "Ultra Close": "text-red-500 bg-red-500/10",
  Battle: "text-orange-500 bg-orange-500/10",
  Competitive: "text-yellow-500 bg-yellow-500/10",
  "Safe Lead": "text-green-500 bg-green-500/10",
};

export default function ConstituencyDetailPage() {
  const params = useParams();
  const slug = params.slug as string[];
  const districtCd = Number(slug?.[0] || 0);
  const scConstId = slug?.[1] || "";
  
  const { data, isLoading } = useConstituency(districtCd, scConstId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.candidates) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg text-muted-foreground">Constituency not found</p>
        <Link href="/" className="text-primary underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const voteBarData = data.candidates.slice(0, 10).map((c, i) => ({
    name: c.CandidateName?.slice(0, 15) || "Unknown",
    votes: c.TotalVoteReceived,
    party: c.PoliticalPartyName?.slice(0, 20) || "Unknown",
    color: COLORS[i % COLORS.length],
  }));

  const pieData = data.candidates
    .filter((c) => c.TotalVoteReceived > 0)
    .slice(0, 8)
    .map((c, i) => ({
      name: c.CandidateName?.slice(0, 12) || "Unknown",
      value: c.TotalVoteReceived,
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.district} — Constituency {data.const_number}
          </h1>
          <p className="text-muted-foreground mt-1">{data.state}</p>
        </div>
        <Badge
          variant="outline"
          className={COMPETITIVENESS_COLOR[data.competitiveness] || ""}
        >
          {data.competitiveness}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Votes</p>
          <p className="text-2xl font-bold mt-1">{data.total_votes.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Vote Gap</p>
          <p className="text-2xl font-bold mt-1">{data.vote_gap.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{data.gap_percentage.toFixed(1)}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Candidates</p>
          <p className="text-2xl font-bold mt-1">{data.candidates_count}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Leading Party</p>
          <p className="text-sm font-bold mt-1 truncate">{data.leading_party || "—"}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Vote Count by Candidate</CardTitle>
          </CardHeader>
          <CardContent>
            {voteBarData.some((d) => d.votes > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={voteBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={110} fontSize={10} tick={{ fill: "var(--color-foreground)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={((value: number) => [value.toLocaleString(), "Votes"]) as any}
                  />
                  <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={18}>
                    {voteBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No votes counted yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🗳️ Vote Share</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={((value: number) => [value.toLocaleString(), "Votes"]) as any}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                No votes counted yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Leaderboard Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🏆 Candidate Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-2 font-medium">Rank</th>
                  <th className="text-left py-2 pr-4 font-medium">Candidate</th>
                  <th className="text-left py-2 pr-4 font-medium">Party</th>
                  <th className="text-right py-2 px-3 font-medium">Votes</th>
                  <th className="text-right py-2 pl-3 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.candidates.map((c, i) => (
                  <tr
                    key={c.CandidateID}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2.5 pr-2">
                      <span className={`font-bold ${i < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/candidate/${c.CandidateID}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {c.CandidateName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {c.Gender} • {c.Age} yrs
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 text-xs truncate max-w-[200px]">
                      {c.PoliticalPartyName}
                    </td>
                    <td className="text-right py-2.5 px-3 font-semibold">
                      {c.TotalVoteReceived.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 pl-3">
                      {c.vote_percentage?.toFixed(1) || 0}%
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
