"use client";

import { useFactChecks } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FactCheckResult } from "@/lib/api";

export function FactCheckFeed() {
  const { data, isLoading } = useFactChecks();
  const results = data?.results || [];

  const getVerdictStyles = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "true":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          label: "VERIFIED TRUE"
        };
      case "mostly_true":
        return {
          icon: CheckCircle2,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          label: "MOSTLY TRUE"
        };
      case "false":
      case "fake":
        return {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          badge: "bg-red-500/20 text-red-400 border-red-500/30",
          label: "FALSE / FAKE"
        };
      case "misleading":
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
          label: "MISLEADING"
        };
      default:
        return {
          icon: Info,
          color: "text-slate-500",
          bg: "bg-slate-500/10",
          border: "border-slate-500/20",
          badge: "bg-slate-500/20 text-slate-400 border-slate-500/30",
          label: "UNVERIFIED"
        };
    }
  };

  return (
    <Card className="col-span-full border-2 border-red-500/10 shadow-lg overflow-hidden bg-gradient-to-b from-background to-red-950/5">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <CardTitle className="text-lg font-bold tracking-tight">
              Live Fact Check Feed
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse mr-1" />
            AI VERIFIED
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Monitoring misinformation and verifying election news 24/7.
        </p>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 p-6 italic text-muted-foreground text-sm">
            <div className="text-center">
              <div className="h-8 w-8 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              Scanning news reports...
            </div>
          </div>
        ) : results.length > 0 ? (
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y md:divide-y-0 md:gap-px bg-border/20">
              {results.map((result) => {
                const styles = getVerdictStyles(result.verdict);
                const Icon = styles.icon;
                
                return (
                  <div key={result.id} className="p-4 bg-background hover:bg-muted/30 transition-colors group">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0", styles.badge)}>
                          {styles.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                          {new Date(result.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {result.story_title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                          <span className="bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">{result.story_source}</span>
                          <a 
                            href={result.story_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
                          >
                            Read Source <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>

                      <div className={cn("p-3 rounded-lg border text-xs leading-relaxed", styles.bg, styles.border)}>
                        <div className="flex items-start gap-2">
                          <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", styles.color)} />
                          <div>
                             <p className="text-muted-foreground font-medium mb-1 line-clamp-2">
                              {result.verdict_summary}
                            </p>
                            {result.key_finding && (
                              <div className="mt-2 pt-2 border-t border-border/20">
                                <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Key Finding</p>
                                <p className="text-muted-foreground italic">
                                  {result.key_finding}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Claims Breakdown (Mini) */}
                      {result.claims_analyzed.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase opacity-60">Analyzed Claims</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.claims_analyzed.map((claim, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={cn(
                                  "text-[9px] py-0 px-1.5 border-dashed",
                                  claim.verdict === "true" ? "text-emerald-500 border-emerald-500/30" : 
                                  claim.verdict === "false" ? "text-red-500 border-red-500/30" : 
                                  "text-slate-400 border-slate-500/30"
                                )}
                              >
                                {claim.verdict === "true" ? "✓" : claim.verdict === "false" ? "✗" : "?"} Claim {idx + 1}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>AI Confidence: <b>{(result.confidence * 100).toFixed(0)}%</b></span>
                        </div>
                        <span className="text-muted-foreground font-medium">{result.claims_analyzed.length} Checks</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-64 p-6 text-center text-muted-foreground">
            <div>
              <Search className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No recent fact checks matched.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
