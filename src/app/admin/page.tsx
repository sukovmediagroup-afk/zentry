import Link from "next/link";
import { FileText, KeyRound, Rss, Activity, Cpu, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireAdmin();

  const [articleCounts, apiKeyCount, sourceCount, agentRuns, pendingArticles, recentArticles] = await Promise.all([
    db.article.groupBy({ by: ["status"], _count: { _all: true } }),
    db.apiKey.count(),
    db.source.count(),
    db.agentRun.groupBy({ by: ["status"], _count: { _all: true } }),
    db.article.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, sourceName: true, createdAt: true, aiConfidence: true },
    }),
    db.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, status: true, createdAt: true, sourceName: true, category: { select: { name: true, color: true } } },
    }),
  ]);

  const count = (status: string) => articleCounts.find((c) => c.status === status)?._count._all ?? 0;
  const agentRun = (status: string) => agentRuns.find((c) => c.status === status)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles size={20} className="text-amber-glow" />
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ARENA USA control panel — manage publications, AI agents, API keys and integrations.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
          <Link href="/admin/articles?new=1">
            <FileText size={14} className="mr-1.5" /> New article
          </Link>
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Published"
          value={count("PUBLISHED")}
          icon={<FileText size={14} />}
          accent="#4bc97a"
        />
        <StatCard
          label="Pending review"
          value={count("PENDING")}
          icon={<AlertTriangle size={14} />}
          accent="#e8a85a"
        />
        <StatCard
          label="Drafts"
          value={count("DRAFT")}
          icon={<FileText size={14} />}
          accent="#b8a890"
        />
        <StatCard
          label="Archived"
          value={count("ARCHIVED")}
          icon={<FileText size={14} />}
          accent="#8a6234"
        />
        <StatCard
          label="API Keys"
          value={apiKeyCount}
          icon={<KeyRound size={14} />}
          accent="#4b9bc9"
          href="/admin/api-keys"
        />
        <StatCard
          label="Sources"
          value={sourceCount}
          icon={<Rss size={14} />}
          accent="#c9a04b"
          href="/admin/sources"
        />
        <StatCard
          label="AI agent runs"
          value={agentRuns.reduce((acc, c) => acc + c._count._all, 0)}
          icon={<Cpu size={14} />}
          accent="#9b4bc9"
        />
        <StatCard
          label="Failed runs"
          value={agentRun("FAILED") + agentRun("DEAD_LETTER")}
          icon={<AlertTriangle size={14} />}
          accent="#c93f4b"
        />
      </div>

      {/* Pending review list */}
      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader className="border-b border-bronze/15">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-glow" />
            Pending review ({count("PENDING")})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No articles awaiting review.</p>
          ) : (
            <ul className="divide-y divide-bronze/10">
              {pendingArticles.map((a) => (
                <li key={a.id} className="flex items-center gap-3 p-4 hover:bg-graphite/40">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/articles/${a.id}`} className="font-medium text-foreground hover:text-amber-glow truncate block">
                      {a.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.sourceName} · {new Date(a.createdAt).toLocaleString("en-US")}
                      {a.aiConfidence && (
                        <Badge variant="outline" className="ml-2 text-[10px] border-bronze/30 text-amber-glow">
                          AI {(a.aiConfidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader className="border-b border-bronze/15">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Activity size={16} className="text-amber-glow" />
            Recent articles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-bronze/10">
            {recentArticles.map((a) => (
              <li key={a.id} className="flex items-center gap-3 p-4 hover:bg-graphite/40">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/articles/${a.id}`} className="font-medium text-foreground hover:text-amber-glow truncate block">
                    {a.title}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                    {a.category && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${a.category.color}25`, color: a.category.color ?? undefined }}
                      >
                        {a.category.name}
                      </span>
                    )}
                    <span>{a.sourceName}</span>
                    <span>·</span>
                    <span>{new Date(a.createdAt).toLocaleString("en-US")}</span>
                  </div>
                </div>
                <Badge variant="outline" className={
                  a.status === "PUBLISHED" ? "border-emerald-500/30 text-emerald-400" :
                  a.status === "PENDING" ? "border-amber-glow/30 text-amber-glow" :
                  a.status === "REJECTED" ? "border-red-500/30 text-red-400" :
                  "border-bronze/30 text-muted-foreground"
                }>
                  {a.status}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  href?: string;
}) {
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      href={href ?? "#"}
      className="block p-4 rounded-lg border border-bronze/15 bg-graphite/30 hover:border-bronze/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className="font-serif text-2xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</div>
    </Wrapper>
  );
}
