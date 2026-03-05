"use client";

import { useClosestRaces } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const competitivenessColor: Record<string, string> = {
  "Ultra Close": "bg-red-500",
  Battle: "bg-orange-500",
  Competitive: "bg-yellow-500",
  "Safe Lead": "bg-green-500",
};

export default function ClosestRacesPage() {
  const { data, isLoading } = useClosestRaces(30);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🔥 Battle Constituency Detector</h1>
        <p className="text-muted-foreground mt-1">
          Top closest races ranked by vote gap percentage. Lower gap = tighter race.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(competitivenessColor).map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.races.map((race, i) => (
            <Link
              key={`${race.district}-${race.const_number}`}
              href={`/constituency/${encodeURIComponent(race.district)}/${race.const_number}`}
            >
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {race.district} — {race.const_number}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] text-white border-0 ${
                            competitivenessColor[race.competitiveness] || "bg-gray-500"
                          }`}
                        >
                          {race.competitiveness}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {race.state} • {race.candidates_count} candidates
                      </p>
                      {race.leader && (
                        <p className="text-xs mt-1">
                          🥇{" "}
                          <span className="font-medium">
                            {race.leader.CandidateName}
                          </span>{" "}
                          ({race.leader.PoliticalPartyName?.slice(0, 30)}) —{" "}
                          {race.leader.TotalVoteReceived.toLocaleString()} votes
                        </p>
                      )}
                      {race.runner_up && (
                        <p className="text-xs text-muted-foreground">
                          🥈 {race.runner_up.CandidateName} (
                          {race.runner_up.PoliticalPartyName?.slice(0, 30)}) —{" "}
                          {race.runner_up.TotalVoteReceived.toLocaleString()} votes
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold">
                      {race.gap_percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Vote Gap</p>
                    <p className="text-sm font-medium mt-1">
                      {race.total_votes.toLocaleString()} votes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {data?.races.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              <p className="text-4xl mb-3">🗳️</p>
              <p>No vote data available yet. Races will appear once counting begins.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
