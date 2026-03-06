"use client";

import { useNationalStats, usePartyTop5 } from "@/lib/hooks";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PartyLeaderboard } from "@/components/dashboard/PartyLeaderboard";
import { VoteSharePie } from "@/components/charts/VoteSharePie";
import { LiveTicker } from "@/components/ticker/LiveTicker";
import { FeaturedContent } from "@/components/dashboard/FeaturedContent";
import { PartyStandingsCard } from "@/components/dashboard/PartyStandingsCard";
import { FactCheckFeed } from "@/components/dashboard/FactCheckFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Vote,
  MapPin,
  Building,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useNationalStats();
  const { data: top5, isLoading: top5Loading } = usePartyTop5();

  const isLoading = statsLoading || top5Loading;

  return (
    <div>
      {/* Live Ticker */}
      <LiveTicker />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-slate-950 via-blue-950/50 to-red-950/30">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">
              🇳🇵 LIVE ELECTION COVERAGE
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Nepal Election
              <br />
              Intelligence Dashboard
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-xl">
              Real-time analytics, live vote tracking, and deep insights for the
              Nepal General Election 2082. Powered by Election Commission data.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/closest-races">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-600 hover:text-white transition-colors px-3 py-1.5"
                >
                  🔥 Closest Races
                </Badge>
              </Link>
              <Link href="/analytics">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors px-3 py-1.5"
                >
                  📊 Demographics
                </Badge>
              </Link>
              <Link href="/parties">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-green-600 hover:text-white transition-colors px-3 py-1.5"
                >
                  🏛️ Party Dashboard
                </Badge>
              </Link>
            </div>
          </div>
          {/* Floating stats */}
          {stats && (
            <div className="absolute right-8 top-8 hidden xl:block">
              <div className="text-right space-y-1">
                <p className="text-5xl font-black text-white/90">
                  {stats.total_candidates.toLocaleString()}
                </p>
                <p className="text-sm text-slate-400">Total Candidates</p>
                <p className="text-3xl font-bold text-emerald-400 mt-3">
                  {stats.total_constituencies}
                </p>
                <p className="text-sm text-slate-400">Constituencies</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Official Standings Row */}
        {top5?.parties && top5.parties.length > 0 && (
          <PartyStandingsCard parties={top5.parties} />
        )}

        {/* Featured Content (Candidates & Areas) */}
        <FeaturedContent />

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard
            title="Total Candidates"
            value={stats?.total_candidates || 0}
            icon={Users}
            subtitle={`${stats?.parties_count || 0} parties`}
          />
          <StatsCard
            title="Total Votes"
            value={stats?.total_votes || 0}
            icon={Vote}
          />
          <StatsCard
            title="Constituencies"
            value={stats?.total_constituencies || 0}
            icon={MapPin}
          />
          <StatsCard
            title="Reporting"
            value={stats?.constituencies_reporting || 0}
            icon={Building}
            subtitle={`of ${stats?.total_constituencies || 0}`}
          />
          <StatsCard
            title="Leading Party"
            value={stats?.leading_party?.slice(0, 20) || "—"}
            icon={Trophy}
          />
          <StatsCard
            title="Last Updated"
            value={
              stats?.last_updated && stats.last_updated !== "N/A"
                ? new Date(stats.last_updated).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"
            }
            icon={TrendingUp}
            subtitle="Auto-refreshing"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PartyLeaderboard top5={top5?.parties || []} fallbackData={stats?.party_seats || []} />
          <VoteSharePie data={stats?.party_seats || []} />
        </div>

        {/* Fact Check Center */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
             <div className="h-8 w-1 bg-red-600 rounded-full" />
             <h2 className="text-2xl font-black tracking-tight uppercase">Election Integrity Center</h2>
          </div>
          <FactCheckFeed />
        </section>

        {/* Party Table */}
        {stats?.party_seats && stats.party_seats.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                📋 Party Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Party</th>
                      <th className="text-right py-2 px-3 font-medium">Seats Leading</th>
                      <th className="text-right py-2 px-3 font-medium">Total Votes</th>
                      <th className="text-right py-2 px-3 font-medium">Vote Share %</th>
                      <th className="text-right py-2 pl-3 font-medium">Candidates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.party_seats.slice(0, 15).map((party, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  party.short_name === "UML"
                                    ? "#1e40af"
                                    : party.short_name === "Congress"
                                    ? "#16a34a"
                                    : party.short_name === "Maoist"
                                    ? "#dc2626"
                                    : party.short_name === "RSP"
                                    ? "#7c3aed"
                                    : "#6b7280",
                              }}
                            />
                            <span className="font-medium truncate max-w-[200px]">
                              {party.party}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-3 font-semibold">
                          {party.seats_leading}
                        </td>
                        <td className="text-right py-2.5 px-3">
                          {party.total_votes.toLocaleString()}
                        </td>
                        <td className="text-right py-2.5 px-3">
                          {party.vote_share.toFixed(1)}%
                        </td>
                        <td className="text-right py-2.5 pl-3 text-muted-foreground">
                          {party.candidates_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">
                Loading election data from Election Commission...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
