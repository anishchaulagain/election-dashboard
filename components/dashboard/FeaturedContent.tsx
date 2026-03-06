"use client";

import { useFeaturedContent } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy } from "lucide-react";
import Link from "next/link";

export function FeaturedContent() {
  const { data, isLoading } = useFeaturedContent();

  if (isLoading || !data) return null;

  const { featuredCandidates = [], featuredAreas = [] } = data;

  if (featuredCandidates.length === 0 && featuredAreas.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Featured Candidates Section */}
      {featuredCandidates.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full" />
              <h2 className="text-2xl font-black tracking-tight uppercase">Featured Candidates</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredCandidates.map((candidate) => (
              <Card key={candidate.candidateId} className="overflow-hidden border-blue-500/10 hover:border-blue-500/30 transition-all group">
                <CardContent className="p-0">
                  <div className="flex items-center p-4 gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-slate-800 shadow-xl group-hover:scale-105 transition-transform bg-slate-900 flex-shrink-0">
                      <img src={candidate.imageUrl} alt={candidate.candidateEnglishName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {candidate.leading && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-4">
                            LEADING
                          </Badge>
                        )}
                        {candidate.winner && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] h-4">
                            WINNER
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-100 truncate text-lg leading-tight">
                        {candidate.candidateName}
                      </h3>
                      <p className="text-sm text-slate-400 truncate">{candidate.politicalPartyName}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Votes Count</p>
                        <p className="text-2xl font-black text-white italic">
                          {candidate.votes.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                         <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                            <MapPin size={12} />
                            <span>{candidate.districtName}</span>
                         </div>
                         <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-400">
                           {candidate.areaName}
                         </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Featured Areas Section */}
      {featuredAreas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-red-600 rounded-full" />
            <h2 className="text-2xl font-black tracking-tight uppercase">Hot Contests</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredAreas.map((area) => {
              const top2 = [...area.candidateResults].sort((a, b) => b.votes - a.votes).slice(0, 2);
              const leader = top2[0];
              const runnerUp = top2[1];
              const gap = leader && runnerUp ? leader.votes - runnerUp.votes : 0;
              const total = area.totalCountedVotes || 1;
              
              return (
                <Card key={area.areaId} className="border-slate-800 bg-slate-900/40 overflow-hidden">
                  <CardHeader className="pb-2 border-b border-white/5 bg-slate-900/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <MapPin size={18} className="text-red-500" />
                          {area.districtName} - {area.areaName}
                        </CardTitle>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                          {area.stateName}
                        </p>
                      </div>
                      <Badge variant={area.resultFinal ? "default" : "secondary"} 
                             className={area.resultFinal ? "bg-emerald-600" : "bg-blue-600"}>
                        {area.resultStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-8 relative">
                      {/* Connector Line */}
                      <div className="absolute left-1/2 top-4 bottom-4 w-[1px] bg-white/5 -translate-x-1/2 hidden md:block" />

                      {/* Leader */}
                      {leader && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-500/20 flex-shrink-0">
                              <img src={leader.imageUrl} alt={leader.candidateEnglishName} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Leading</p>
                               <p className="font-bold truncate text-slate-100">{leader.candidateName}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400 font-medium">{leader.votes.toLocaleString()} votes</span>
                              <span className="text-emerald-400 font-bold">{((leader.votes / total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(leader.votes / total) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Runner up */}
                      {runnerUp && (
                        <div className="space-y-3 text-right">
                          <div className="flex items-center gap-3 justify-end">
                             <div className="min-w-0">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Trailing</p>
                               <p className="font-bold truncate text-slate-100">{runnerUp.candidateName}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-700 flex-shrink-0">
                              <img src={runnerUp.imageUrl} alt={runnerUp.candidateEnglishName} className="h-full w-full object-cover" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500 font-bold">{((runnerUp.votes / total) * 100).toFixed(1)}%</span>
                              <span className="text-slate-400 font-medium">{runnerUp.votes.toLocaleString()} votes</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-slate-600 rounded-full" style={{ width: `${(runnerUp.votes / total) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {gap > 0 && (
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Trophy size={14} className="text-amber-500" />
                           <span>Margin of Lead:</span>
                        </div>
                        <span className="font-black text-white italic text-lg tracking-tighter">
                          {gap.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
