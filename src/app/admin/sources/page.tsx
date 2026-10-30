import Link from "next/link";
import { Rss, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  await requireAdmin();

  const sources = await db.source.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, slug: true, type: true, url: true,
      pollIntervalSec: true, enabled: true, lastPolledAt: true,
      lastSuccessAt: true, lastError: true, lastErrorAt: true,
      totalIngested: true, category: { select: { name: true, slug: true, color: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <Rss size={20} className="text-amber-glow" />
            Sources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            RSS feeds and API endpoints polled every 10 minutes by the ARENA USA AI ingestion agents.
          </p>
        </div>
        <Button disabled className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold opacity-60">
          <Plus size={14} className="mr-1.5" /> Add source (Phase 2)
        </Button>
      </header>

      <Card className="border-amber-glow/30 bg-amber-glow/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-glow shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Phase 1 status</p>
            <p className="text-muted-foreground text-xs">
              Source registry and the 10-minute polling scheduler ship in Phase 2. In Phase 1, the platform accepts articles from{" "}
              <Link href="/admin/api-keys" className="text-amber-glow hover:underline">API keys</Link> via{" "}
              <code className="text-amber-glow">/api/ingest</code>, and editors can publish manually via{" "}
              <Link href="/admin/articles/new" className="text-amber-glow hover:underline">New article</Link>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-bronze/15 bg-graphite/30 overflow-hidden">
        <CardHeader className="border-b border-bronze/15">
          <CardTitle className="font-serif text-lg">Configured sources ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sources.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Rss size={32} className="mx-auto mb-3 opacity-50" />
              <p>No sources registered yet.</p>
              <p className="text-xs mt-2">Phase 2 will introduce a built-in RSS registry with permitted feeds.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-graphite/60 border-b border-bronze/15">
                  <tr className="text-left">
                    <th className="p-3 font-medium text-muted-foreground">Name</th>
                    <th className="p-3 font-medium text-muted-foreground">Type</th>
                    <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">URL</th>
                    <th className="p-3 font-medium text-muted-foreground">Interval</th>
                    <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Last polled</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">Ingested</th>
                    <th className="p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.id} className="border-b border-bronze/10 hover:bg-graphite/40">
                      <td className="p-3 font-medium text-foreground">{s.name}</td>
                      <td className="p-3"><Badge variant="outline" className="border-bronze/30 text-amber-glow">{s.type}</Badge></td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground truncate max-w-xs">{s.url}</td>
                      <td className="p-3 text-muted-foreground">{s.pollIntervalSec}s</td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {s.lastPolledAt ? new Date(s.lastPolledAt).toLocaleString("en-US") : "never"}
                      </td>
                      <td className="p-3 text-right text-muted-foreground tabular-nums">{s.totalIngested.toLocaleString()}</td>
                      <td className="p-3">
                        {s.enabled
                          ? <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">active</Badge>
                          : <Badge variant="outline" className="border-bronze/30 text-muted-foreground">paused</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
