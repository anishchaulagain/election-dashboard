"use client";

import { useCandidates } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CandidatesListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCandidates({
    search: search || undefined,
    page,
    limit: 50,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">👥 Candidates</h1>
        <p className="text-muted-foreground mt-1">
          Browse and search all election candidates.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by candidate name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
            Showing {data?.candidates.length || 0} of {data?.total || 0} candidates
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4 font-medium">Candidate</th>
                  <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Party</th>
                  <th className="text-left py-2 pr-4 font-medium hidden lg:table-cell">District</th>
                  <th className="text-right py-2 px-3 font-medium">Votes</th>
                  <th className="text-right py-2 pl-3 font-medium hidden sm:table-cell">Age</th>
                  <th className="text-right py-2 pl-3 font-medium hidden sm:table-cell">Gender</th>
                </tr>
              </thead>
              <tbody>
                {data?.candidates.map((c) => (
                  <tr
                    key={c.CandidateID}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/candidate/${c.CandidateID}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {c.CandidateName}
                      </Link>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {c.PoliticalPartyName?.slice(0, 30)}
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 text-xs truncate max-w-[200px] hidden md:table-cell">
                      {c.PoliticalPartyName}
                    </td>
                    <td className="py-2.5 pr-4 text-xs hidden lg:table-cell">
                      {c.DistrictName} — {c.ConstName}
                    </td>
                    <td className="text-right py-2.5 px-3 font-semibold">
                      {c.TotalVoteReceived.toLocaleString()}
                    </td>
                    <td className="text-right py-2.5 pl-3 text-muted-foreground hidden sm:table-cell">
                      {c.AGE_YR || "—"}
                    </td>
                    <td className="text-right py-2.5 pl-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px]">
                        {c.Gender || "—"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(data?.candidates.length || 0) < 50}
              className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
