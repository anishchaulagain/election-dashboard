"use client";

import { useDemographics, useDramaIndex, useRisingCandidates } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const AGE_COLORS = ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"];
const GENDER_COLORS = ["#3b82f6", "#ec4899", "#6b7280"];
const EDU_COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#6b7280"];

export default function AnalyticsPage() {
  const { data: demographics, isLoading: demoLoading } = useDemographics();
  const { data: dramaData } = useDramaIndex(15);
  const { data: risingData } = useRisingCandidates(10);

  const genderData = demographics
    ? Object.entries(demographics.gender_distribution).map(([key, value], i) => ({
        name: key,
        value,
        color: GENDER_COLORS[i % GENDER_COLORS.length],
      }))
    : [];

  const ageData = demographics
    ? Object.entries(demographics.age_distribution).map(([key, value], i) => ({
        name: key,
        count: value,
        color: AGE_COLORS[i % AGE_COLORS.length],
      }))
    : [];

  const eduData = demographics
    ? Object.entries(demographics.education_distribution).map(([key, value], i) => ({
        name: key,
        count: value,
        color: EDU_COLORS[i % EDU_COLORS.length],
      }))
    : [];

  if (demoLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📊 Demographic Analytics</h1>
        <p className="text-muted-foreground mt-1">
          In-depth analysis of candidates by gender, age, and education.
        </p>
      </div>

      {/* Key stats */}
      {demographics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Age</p>
            <p className="text-3xl font-bold mt-1">{demographics.average_age}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Female Leaders</p>
            <p className="text-3xl font-bold mt-1 text-pink-500">{demographics.female_leading_count}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Youngest</p>
            <p className="text-lg font-bold mt-1">{demographics.youngest_candidate?.age || "—"} yrs</p>
            <p className="text-xs text-muted-foreground truncate">{demographics.youngest_candidate?.name}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Oldest</p>
            <p className="text-lg font-bold mt-1">{demographics.oldest_candidate?.age || "—"} yrs</p>
            <p className="text-xs text-muted-foreground truncate">{demographics.oldest_candidate?.name}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">👥 Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {genderData.map((g, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}: {g.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📅 Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: "var(--color-foreground)" }} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {ageData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Education Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🎓 Education Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eduData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="name" width={100} fontSize={11} tick={{ fill: "var(--color-foreground)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                  {eduData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Drama Index */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🔥 Election Drama Meter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dramaData?.constituencies.slice(0, 10).map((d, i) => (
                <Link
                  key={`${d.district}-${d.const_number}`}
                  href={`/constituency/${encodeURIComponent(d.district)}/${d.const_number}`}
                >
                  <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {d.district} — {d.const_number}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.state}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500"
                          style={{ width: `${Math.min(100, d.score)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-10 text-right">
                        {d.score}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {(!dramaData || dramaData.constituencies.length === 0) && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Drama scores will appear once votes are counted
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fastest Rising Candidates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🚀 Fastest Rising Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {risingData?.candidates.slice(0, 10).map((c, i) => (
              <Link key={c.candidate_id} href={`/candidate/${c.candidate_id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="text-lg font-bold text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.party?.slice(0, 30)} • {c.district}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500 shrink-0">
                    +{c.votes_gained.toLocaleString()}
                  </Badge>
                </div>
              </Link>
            ))}
            {(!risingData || risingData.candidates.length === 0) && (
              <p className="col-span-2 text-center text-muted-foreground py-8 text-sm">
                Rising candidates will appear once vote counting begins
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
