"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PartyTop5 } from "@/lib/api";

interface PartyStandingsCardProps {
  parties: PartyTop5[];
}

export function PartyStandingsCard({ parties }: PartyStandingsCardProps) {
  if (!parties || parties.length === 0) return null;

  return (
    <Card className="col-span-full border-2 border-primary/10 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <CardTitle className="text-xl font-black tracking-tight">
              Official Party Standings
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
            LIVE HOR STATUS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 divide-y sm:divide-y-0 sm:gap-4">
          {parties.map((party) => (
            <div 
              key={party.PartyId}
              className="relative overflow-hidden p-5 sm:rounded-2xl border-0 sm:border bg-card/50 hover:bg-card hover:shadow-xl transition-all duration-300 group"
            >
              {/* Massive background symbol watermark */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none grayscale">
                <img 
                  src={`https://result.election.gov.np/Handlers/SymbolImage.ashx?ID=${party.SymbolID}`} 
                  alt="" 
                  className="h-32 w-32 object-contain rotate-12"
                />
              </div>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border p-2 group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={`https://result.election.gov.np/Handlers/SymbolImage.ashx?ID=${party.SymbolID}`} 
                      alt={party.PoliticalPartyName} 
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {party.PoliticalPartyName}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-500/5 ring-1 ring-green-500/10 group-hover:bg-green-500/10 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-green-600/70 tracking-tighter">Seats Won</span>
                    <span className="text-3xl font-black text-green-600 tabular-nums leading-none mt-1">
                      {party.TotWin}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/5 ring-1 ring-blue-500/10 group-hover:bg-blue-500/10 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-blue-600/70 tracking-tighter">Leading In</span>
                    <span className="text-3xl font-black text-blue-600 tabular-nums leading-none mt-1">
                      {party.TotLead}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-70">Total Strength</span>
                    <span className="text-xs font-semibold text-muted-foreground/80">Combined Win + Lead</span>
                  </div>
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {party.TotWinLead}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
