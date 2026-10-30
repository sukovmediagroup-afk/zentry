"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Flame, Radio, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

interface HeaderProps {
  visitorCount: number;
}

export function Header({ visitorCount }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-bronze/20 bg-espresso/95 backdrop-blur-md supports-[backdrop-filter]:bg-espresso/80">
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1600px] items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:gap-6 lg:px-6">
        {/* Mobile menu trigger */}
        <button
          className="lg:hidden text-foreground/80 hover:text-foreground p-1.5 -ml-1.5"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center shadow-[0_0_20px_-4px_rgba(232,168,90,0.5)] group-hover:shadow-[0_0_24px_-2px_rgba(232,168,90,0.7)] transition-shadow">
            <span className="font-serif font-black text-espresso text-base sm:text-lg">A</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif font-bold text-sm sm:text-[15px] text-foreground tracking-wide">
              ARENA <span className="arena-text-gradient">USA</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              AI Media Platform
            </span>
          </div>
        </Link>

        {/* Search (desktop) */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, topics, sources..."
              className="pl-9 h-9 bg-graphite/60 border-bronze/20 focus-visible:border-amber-glow focus-visible:ring-amber-glow/30 text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {/* Live visitors counter — compact on mobile */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 h-8 sm:h-9 rounded-full bg-graphite/60 border border-bronze/15 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="arena-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Radio size={12} className="text-emerald-400 hidden xs:block" />
            <span className="text-foreground/80 font-medium tabular-nums">{visitorCount.toLocaleString()}</span>
            <span className="text-muted-foreground hidden md:inline">browsing</span>
          </div>

          {/* Breaking news pill — visible on mobile too */}
          <Link
            href="/archive?breaking=1"
            className="flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-9 rounded-full bg-gradient-to-r from-red-950/80 to-red-900/60 border border-red-500/30 text-xs font-medium hover:border-red-500/60 transition-colors"
          >
            <Flame size={12} className="text-red-400" />
            <span className="text-red-100 hidden sm:inline">Breaking</span>
          </Link>

          <Button asChild size="sm" variant="outline" className="h-8 sm:h-9 border-bronze/30 text-amber-glow hover:bg-bronze/10 hover:text-amber-glow hidden sm:inline-flex">
            <Link href="/admin" prefetch={false}>Admin</Link>
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-bronze/15 bg-espresso">
          {/* Search */}
          <div className="px-3 py-3 border-b border-bronze/10">
            <form onSubmit={onSearch}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 h-10 bg-graphite/60 border-bronze/20"
                  autoFocus
                />
              </div>
            </form>
          </div>

          {/* Categories grid */}
          <div className="px-3 py-3">
            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-glow mb-2 px-1">
              Sections
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-foreground/90 hover:bg-graphite/60 hover:text-amber-glow transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-1 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="px-3 py-3 border-t border-bronze/10 flex items-center justify-between gap-2">
            <Link
              href="/archive"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center px-3 py-2 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 text-sm font-medium"
            >
              Archive
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center px-3 py-2 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
