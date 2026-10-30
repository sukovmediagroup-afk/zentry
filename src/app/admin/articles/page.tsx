import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; new?: string }>;
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const user = await requireAdmin();
  const { status, q, new: isNew } = await searchParams;

  const articles = await db.article.findMany({
    where: {
      ...(status ? { status: status.toUpperCase() } : {}),
      ...(q ? { title: { contains: q } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, title: true, slug: true, status: true,
      publishedAt: true, createdAt: true, sourceName: true,
      isBreaking: true, featured: true, keepForever: true,
      views: true, aiConfidence: true,
      category: { select: { name: true, slug: true, color: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage publications, drafts, and the moderation queue.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
          <Link href="/admin/articles/new"><Plus size={14} className="mr-1.5" /> New article</Link>
        </Button>
      </header>

      {isNew && (
        <div className="p-3 rounded-md border border-emerald-500/30 bg-emerald-950/30 text-sm text-emerald-200">
          Article created successfully.
        </div>
      )}

      {/* Filters */}
      <form className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by title..."
            className="pl-9 h-9 bg-graphite/60 border-bronze/20"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "PUBLISHED", "PENDING", "DRAFT", "ARCHIVED", "REJECTED"].map((s) => (
            <Link
              key={s}
              href={`/admin/articles${s === "ALL" ? "" : `?status=${s}`}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                (status?.toUpperCase() ?? "ALL") === s
                  ? "bg-bronze/25 text-amber-glow border border-bronze/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-graphite/60"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </form>

      <Card className="border-bronze/15 bg-graphite/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-graphite/60 border-b border-bronze/15">
              <tr className="text-left">
                <th className="p-3 font-medium text-muted-foreground">Title</th>
                <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="p-3 font-medium text-muted-foreground">Status</th>
                <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Source</th>
                <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="p-3 font-medium text-muted-foreground text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No articles found.</td></tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-bronze/10 hover:bg-graphite/40">
                    <td className="p-3">
                      <Link href={`/admin/articles/${a.id}`} className="font-medium text-foreground hover:text-amber-glow">
                        {a.title}
                      </Link>
                      {a.isBreaking && <span className="ml-2 text-[10px] text-red-400">BREAKING</span>}
                      {a.keepForever && <span className="ml-2 text-[10px] text-amber-glow">PINNED</span>}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {a.category && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${a.category.color}25`, color: a.category.color ?? undefined }}
                        >
                          {a.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={
                        a.status === "PUBLISHED" ? "border-emerald-500/30 text-emerald-400" :
                        a.status === "PENDING" ? "border-amber-glow/30 text-amber-glow" :
                        a.status === "REJECTED" ? "border-red-500/30 text-red-400" :
                        a.status === "ARCHIVED" ? "border-bronze/30 text-muted-foreground" :
                        "border-bronze/30 text-muted-foreground"
                      }>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">{a.sourceName}</td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {new Date(a.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="p-3 text-right text-muted-foreground tabular-nums">{a.views.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {articles.length} article{articles.length === 1 ? "" : "s"} · Signed in as {user.email}
      </p>
    </div>
  );
}
