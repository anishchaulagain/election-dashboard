"use client";

import { useConstituencies } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ConstituenciesListPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useConstituencies({ search: search || undefined });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🗺️ Constituencies</h1>
        <p className="text-muted-foreground mt-1">
          Browse all election constituencies with vote summaries.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {data?.total || 0} constituencies found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.constituencies.map((c) => (
              <Link
                key={`${c.district}-${c.const_number}`}
                href={`/constituency/${encodeURIComponent(c.district)}/${c.const_number}`}
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {c.district} — {c.const_number}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.state}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {c.candidates_count} candidates
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm">
                        {c.total_votes > 0
                          ? `${c.total_votes.toLocaleString()} votes`
                          : "No votes yet"}
                      </span>
                      {c.leading_party && (
                        <span className="text-xs font-medium text-primary truncate max-w-[150px]">
                          {c.leading_party.slice(0, 25)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
