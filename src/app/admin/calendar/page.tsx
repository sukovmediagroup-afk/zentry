import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Pin, Flame, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}
function getMonthName(month: number): string {
  return ["January","February","March","April","May","June","July","August","September","October","November","December"][month];
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const user = await requireAdmin();
  const { month: monthParam } = await searchParams;

  // Parse YYYY-MM format, default to current month
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();
  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    if (y && m >= 1 && m <= 12) {
      viewYear = y;
      viewMonth = m - 1;
    }
  }

  const monthStart = startOfMonth(new Date(viewYear, viewMonth, 1));
  const monthEnd = endOfMonth(new Date(viewYear, viewMonth, 1));

  // Fetch articles with publication dates in this month + scheduled + pending
  const [published, scheduled, pending, drafts] = await Promise.all([
    db.article.findMany({
      where: { publishedAt: { gte: monthStart, lte: monthEnd } },
      orderBy: { publishedAt: "asc" },
      select: {
        id: true, title: true, slug: true, status: true,
        publishedAt: true, isBreaking: true, featured: true, keepForever: true,
        coverImageUrl: true,
        category: { select: { name: true, color: true } },
      },
    }),
    db.article.findMany({
      where: { status: "SCHEDULED", publishedAt: { gte: monthStart, lte: monthEnd } },
      orderBy: { publishedAt: "asc" },
      select: {
        id: true, title: true, slug: true, status: true, publishedAt: true,
        isBreaking: true, featured: true, keepForever: true, coverImageUrl: true,
        category: { select: { name: true, color: true } },
      },
    }),
    db.article.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, createdAt: true, aiConfidence: true, sourceName: true, category: { select: { name: true, color: true } } },
      take: 50,
    }),
    db.article.findMany({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, updatedAt: true, category: { select: { name: true, color: true } } },
      take: 50,
    }),
  ]);

  // Build calendar grid (6 weeks = 42 cells)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const grid: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(viewYear, viewMonth, d));
  while (grid.length % 7 !== 0) grid.push(null);

  // Index articles by date
  const byDate = new Map<string, Array<typeof published[number] | typeof scheduled[number]>>();
  for (const a of published) {
    if (!a.publishedAt) continue;
    const key = a.publishedAt.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(a);
  }
  // Also index scheduled articles
  for (const a of scheduled) {
    if (!a.publishedAt) continue;
    const key = a.publishedAt.toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(a);
  }

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const prevMonth = new Date(viewYear, viewMonth - 1, 1);
  const nextMonth = new Date(viewYear, viewMonth + 1, 1);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-glow mb-2">
          <ArrowLeft size={12} /> Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays size={20} className="text-amber-glow" />
              Editorial Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Published and scheduled articles across {getMonthName(viewMonth)} {viewYear}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/calendar?month=${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`} className="px-3 py-1.5 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 text-sm">
              ← {getMonthName(prevMonth.getMonth())}
            </Link>
            <span className="px-4 py-1.5 font-serif font-bold text-foreground">
              {getMonthName(viewMonth)} {viewYear}
            </span>
            <Link href={`/admin/calendar?month=${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`} className="px-3 py-1.5 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 text-sm">
              {getMonthName(nextMonth.getMonth())} →
            </Link>
          </div>
        </div>
      </header>

      {/* Calendar grid */}
      <Card className="border-bronze/15 bg-graphite/30 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-bronze/15 bg-graphite/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-bronze/10 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((date, i) => {
              if (!date) {
                return <div key={i} className="min-h-[110px] border-r border-b border-bronze/10 bg-graphite/10 last:border-r-0" />;
              }
              const key = date.toISOString().slice(0, 10);
              const items = byDate.get(key) ?? [];
              const isToday = key === todayKey;
              const isPast = date < today && !isToday;

              return (
                <div key={i} className={`min-h-[110px] border-r border-b border-bronze/10 last:border-r-0 p-2 flex flex-col gap-1 ${isToday ? "bg-amber-glow/5" : isPast ? "bg-graphite/10" : ""}`}>
                  <div className={`text-xs font-medium ${isToday ? "text-amber-glow font-bold" : "text-muted-foreground"}`}>
                    {date.getDate()}
                    {isToday && <span className="ml-1 text-[10px] uppercase">today</span>}
                  </div>
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {items.slice(0, 3).map((a) => (
                      <Link
                        key={a.id}
                        href={`/admin/articles/${a.id}`}
                        className="block p-1 rounded text-[10px] leading-tight hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: a.category ? `${a.category.color}25` : "rgba(232,168,90,0.15)",
                          borderLeft: `2px solid ${a.category?.color ?? "#e8a85a"}`,
                        }}
                        title={a.title}
                      >
                        <div className="flex items-center gap-1">
                          {a.status === "SCHEDULED" && <Clock size={9} className="text-blue-400 shrink-0" />}
                          {a.isBreaking && <Flame size={9} className="text-red-400 shrink-0" />}
                          {a.keepForever && <Pin size={9} className="text-amber-glow shrink-0" />}
                          <span className="truncate text-foreground/90">{a.title}</span>
                        </div>
                      </Link>
                    ))}
                    {items.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">+{items.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending review queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader className="border-b border-bronze/15">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Clock size={14} className="text-amber-glow" />
              Pending review ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto arena-scroll">
            {pending.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No articles awaiting review.</p>
            ) : (
              <ul className="divide-y divide-bronze/10">
                {pending.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/articles/${a.id}`} className="block p-3 hover:bg-graphite/40">
                      <div className="flex items-center gap-2 mb-1">
                        {a.category && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${a.category.color ?? "#888"}25`, color: a.category.color ?? undefined }}>
                            {a.category.name}
                          </span>
                        )}
                        {a.aiConfidence !== null && (
                          <span className="text-[10px] text-muted-foreground">AI {(a.aiConfidence * 100).toFixed(0)}%</span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.sourceName ?? "ARENA USA"} · {new Date(a.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader className="border-b border-bronze/15">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <CalendarDays size={14} className="text-blue-400" />
              Scheduled & drafts ({scheduled.length + drafts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto arena-scroll">
            <ul className="divide-y divide-bronze/10">
              {scheduled.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/articles/${a.id}`} className="block p-3 hover:bg-graphite/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">SCHEDULED</Badge>
                      {a.category && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${a.category.color ?? "#888"}25`, color: a.category.color ?? undefined }}>
                          {a.category.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Goes live: {new Date(a.publishedAt!).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </Link>
                </li>
              ))}
              {drafts.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/articles/${a.id}`} className="block p-3 hover:bg-graphite/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-bronze/30 text-muted-foreground text-[10px]">DRAFT</Badge>
                      {a.category && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${a.category.color ?? "#888"}25`, color: a.category.color ?? undefined }}>
                          {a.category.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Updated: {new Date(a.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </Link>
                </li>
              ))}
              {scheduled.length === 0 && drafts.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">No scheduled or draft articles.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
