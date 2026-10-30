"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, KeyRound, Rss, LogOut,
  ExternalLink, Newspaper, Pin, Megaphone, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  user: { id: string; email: string; name: string; role: string } | null;
  counts: { articles: number; apiKeys: number; sources: number; pending: number } | null;
  children: React.ReactNode;
}

export function AdminShell({ user, counts, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Standalone auth routes render without the shell chrome
  const isStandaloneRoute =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname.startsWith("/admin/reset-password");

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  if (!user) {
    // Will be redirected by the login page if no session
    return <div className="min-h-screen flex items-center justify-center bg-espresso text-muted-foreground">
      <div className="text-center">
        <p>Redirecting to login…</p>
        <Button asChild className="mt-3"><Link href="/admin/login">Go to login</Link></Button>
      </div>
    </div>;
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, count: null, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText, count: counts?.articles ?? 0 },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays, count: counts?.pending ?? 0 },
    { href: "/admin/api-keys", label: "API Keys", icon: KeyRound, count: counts?.apiKeys ?? 0 },
    { href: "/admin/sources", label: "Sources", icon: Rss, count: counts?.sources ?? 0 },
    { href: "/admin/ads", label: "Ad Campaigns", icon: Megaphone, count: null },
  ];

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-espresso flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-bronze/15 bg-graphite/30">
        <div className="px-4 py-5 border-b border-bronze/15">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
              <span className="font-serif font-black text-espresso">A</span>
            </div>
            <div className="leading-none">
              <div className="font-serif font-bold text-sm text-foreground">
                ARENA <span className="arena-text-gradient">USA</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-bronze/20 text-amber-glow font-medium"
                    : "text-foreground/80 hover:bg-graphite/60 hover:text-foreground",
                )}
              >
                <Icon size={15} />
                <span className="flex-1">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-bronze/30 text-amber-glow">
                    {item.count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-bronze/15 space-y-1">
          {counts && counts.pending > 0 && (
            <div className="px-3 py-2 rounded-md bg-amber-glow/10 border border-amber-glow/30 text-[11px] text-amber-glow flex items-center gap-2">
              <Pin size={11} />
              <span>{counts.pending} pending review</span>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-amber-glow hover:bg-graphite/60"
          >
            <ExternalLink size={15} /> View site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-red-400 hover:bg-graphite/60"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-bronze/15 bg-graphite/40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
              <span className="font-serif font-black text-espresso text-xs">A</span>
            </div>
            <span className="font-serif font-bold text-sm">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-muted-foreground"><ExternalLink size={16} /></Link>
            <button onClick={logout} className="text-muted-foreground"><LogOut size={16} /></button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-3 py-2 border-b border-bronze/15 bg-graphite/20">
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded text-xs whitespace-nowrap",
                  isActive ? "bg-bronze/20 text-amber-glow" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-auto p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
