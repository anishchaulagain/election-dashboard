"use client";

import { useCandidate } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Vote,
  Award,
  Calendar,
  ArrowLeft,
} from "lucide-react";

export default function CandidateProfilePage() {
  const params = useParams();
  const candidateId = Number(params.id);
  const { data: candidate, isLoading } = useCandidate(candidateId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!candidate || !candidate.CandidateID) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg text-muted-foreground">Candidate not found</p>
        <Link href="/" className="text-primary underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {candidate.CandidateName}
              </h1>
              <p className="text-white/80 mt-1">{candidate.PoliticalPartyName}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-white/20 text-white border-0">
                  {candidate.SymbolName}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  {candidate.Gender}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              {candidate.rank && (
                <div className="text-5xl font-black text-white/90">#{candidate.rank}</div>
              )}
              <p className="text-white/60 text-sm">in constituency</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Vote Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{candidate.TotalVoteReceived.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Votes Received</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{candidate.vote_percentage?.toFixed(1) || 0}%</p>
              <p className="text-xs text-muted-foreground">Vote Share</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{candidate.constituency_total_votes?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Total Constituency Votes</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={Calendar} label="Age" value={`${candidate.AGE_YR || "—"} years`} />
            <InfoRow icon={User} label="Gender" value={candidate.Gender || "—"} />
            <InfoRow icon={MapPin} label="District" value={`${candidate.DistrictName} — Constituency ${candidate.ConstName}`} />
            <InfoRow icon={MapPin} label="Province" value={candidate.StateName || "—"} />
            <InfoRow icon={GraduationCap} label="Education" value={candidate.QUALIFICATION || "—"} />
            <InfoRow icon={Briefcase} label="Experience" value={candidate.EXPERIENCE || "—"} />
            <InfoRow icon={MapPin} label="Address" value={candidate.ADDRESS || "—"} />
            <InfoRow icon={User} label="Father" value={candidate.FATHER_NAME || "—"} />
          </div>

          {/* Insight */}
          {candidate.insight && (
            <>
              <Separator className="my-6" />
              <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-blue-400 mb-1">💡 AI Insight</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {candidate.insight}
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Link to constituency */}
          {candidate.DistrictName && candidate.ConstName && (
            <div className="mt-6">
              <Link
                href={`/constituency/${encodeURIComponent(candidate.DistrictName)}/${candidate.ConstName}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                View full constituency results →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
