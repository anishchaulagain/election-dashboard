"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useElectionStore } from "@/lib/store";
import { useEvents } from "@/lib/hooks";
import {
  BarChart3,
  Users,
  Map,
  Flame,
  TrendingUp,
  Search,
  Activity,
  PieChart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/parties", label: "Parties", icon: PieChart },
  { href: "/closest-races", label: "Closest Races", icon: Flame },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/constituency", label: "Constituencies", icon: Map },
  { href: "/candidates", label: "Candidates", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLoading, isError } = useEvents();
  const { wsConnected } = useElectionStore();
  const isLive = wsConnected || (!isLoading && !isError);
  const statusLabel = wsConnected ? "LIVE (WS)" : isLive ? "LIVE" : "CONNECTING";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-blue-700">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight tracking-tight">
              Nepal Election
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Intelligence Dashboard 2082
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isLive
                  ? "bg-green-500 live-indicator"
                  : "bg-yellow-500 animate-pulse"
              )}
            />
            <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
              {statusLabel}
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              className="h-9 w-56 pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden border-t overflow-x-auto">
        <div className="container mx-auto flex gap-1 px-4 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
