"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import {
  ArrowLeft, Loader2, Save, CheckCircle2, XCircle, Archive,
  Eye, EyeOff, Calendar, Sparkles, Trash2, Pin, Flame,
} from "lucide-react";
import { toast } from "sonner";

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  status: string;
  isBreaking: boolean;
  featured: boolean;
  keepForever: boolean;
  readingMinutes: number;
  views: number;
  aiSummary: string | null;
  aiConfidence: number | null;
  moderationNotes: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  sourcePublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  category: { id: string; name: string; slug: string; color: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "border-bronze/30 text-muted-foreground",
  PENDING: "border-amber-glow/30 text-amber-glow",
  PUBLISHED: "border-emerald-500/30 text-emerald-400",
  ARCHIVED: "border-bronze/30 text-muted-foreground",
  REJECTED: "border-red-500/30 text-red-400",
  SCHEDULED: "border-blue-500/30 text-blue-400",
};

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.article) setArticle(data.article);
        else toast.error(data.error ?? "Not found");
      })
      .catch(() => toast.error("Network error"))
      .finally(() => setLoading(false));
  }, [id]);

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Save failed");
        return null;
      }
      if (data.article) setArticle(data.article);
      return data.article;
    } catch {
      toast.error("Network error");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveField = async (field: string, value: unknown) => {
    if (!article) return;
    return patch({ [field]: value });
  };

  const handleApprove = async () => {
    const a = await patch({ action: "approve" });
    if (a) toast.success("Article approved & published");
  };

  const handleReject = async () => {
    const a = await patch({ action: "reject", moderationNotes: rejectReason });
    if (a) {
      toast.success("Article rejected");
      setRejectDialog(false);
      setRejectReason("");
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this article? It will be removed from the public feed but kept in the database.")) return;
    const a = await patch({ action: "archive" });
    if (a) toast.success("Article archived");
  };

  const handleUnpublish = async () => {
    if (!confirm("Move this article back to draft?")) return;
    const a = await patch({ action: "unpublish" });
    if (a) toast.success("Article moved to draft");
  };

  const handleSchedule = async () => {
    if (!scheduleAt) {
      toast.error("Pick a date/time first");
      return;
    }
    const a = await patch({ action: "schedule", scheduledAt: scheduleAt, keepForever: article?.keepForever });
    if (a) {
      toast.success("Article scheduled");
      setShowSchedule(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("HARD DELETE — this is irreversible. The article will be permanently removed from the database. Are you sure?")) return;
    if (!confirm("Last warning: really permanently delete?")) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Delete failed");
        return;
      }
      toast.success("Article deleted");
      router.push("/admin/articles");
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-glow" size={24} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Article not found.</p>
        <Button asChild className="mt-4"><Link href="/admin/articles">Back to articles</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link href="/admin/articles" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-glow mb-2">
            <ArrowLeft size={12} /> Back to articles
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground truncate">{article.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-muted-foreground">
            <Badge variant="outline" className={STATUS_COLORS[article.status] ?? ""}>{article.status}</Badge>
            {article.category && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${article.category.color}25`, color: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            {article.isBreaking && <Badge className="bg-red-900/70 text-red-200">Breaking</Badge>}
            {article.featured && <Badge variant="outline" className="border-amber-glow/30 text-amber-glow">Featured</Badge>}
            {article.keepForever && <Badge variant="outline" className="border-amber-glow/30 text-amber-glow"><Pin size={10} className="mr-1" />Pinned</Badge>}
            <span>·</span>
            <span>{article.views.toLocaleString()} views</span>
            <span>·</span>
            <span>{article.readingMinutes} min read</span>
          </div>
        </div>
      </header>

      {/* Action bar */}
      <Card className="border-bronze/15 bg-graphite/30">
        <CardContent className="p-4 flex flex-wrap items-center gap-2">
          {(article.status === "PENDING" || article.status === "DRAFT") && (
            <Button onClick={handleApprove} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <CheckCircle2 size={14} className="mr-1.5" />}
              Approve & publish
            </Button>
          )}
          {(article.status === "PENDING" || article.status === "DRAFT") && (
            <Button onClick={() => setRejectDialog(true)} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-950/30">
              <XCircle size={14} className="mr-1.5" /> Reject
            </Button>
          )}
          {article.status === "PUBLISHED" && (
            <Button onClick={handleUnpublish} variant="outline" className="border-bronze/30 text-amber-glow hover:bg-bronze/10">
              <EyeOff size={14} className="mr-1.5" /> Unpublish
            </Button>
          )}
          {(article.status === "PUBLISHED" || article.status === "SCHEDULED") && (
            <Button onClick={handleArchive} variant="outline" className="border-bronze/30 text-muted-foreground hover:bg-graphite/60">
              <Archive size={14} className="mr-1.5" /> Archive
            </Button>
          )}
          {(article.status === "PENDING" || article.status === "DRAFT") && !showSchedule && (
            <Button onClick={() => setShowSchedule(true)} variant="ghost" className="text-muted-foreground hover:text-amber-glow">
              <Calendar size={14} className="mr-1.5" /> Schedule
            </Button>
          )}

          {showSchedule && (
            <div className="flex items-center gap-2 p-2 rounded-md border border-bronze/20 bg-graphite/40 w-full mt-2">
              <Calendar size={14} className="text-amber-glow" />
              <Input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="bg-graphite/60 border-bronze/20 h-8 max-w-xs"
              />
              <Button onClick={handleSchedule} size="sm" className="h-8 bg-amber-glow text-espresso hover:opacity-90">Schedule</Button>
              <Button onClick={() => setShowSchedule(false)} size="sm" variant="ghost" className="h-8">Cancel</Button>
            </div>
          )}

          <a
            href={`/article/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 text-sm"
          >
            <Eye size={14} /> View live
          </a>
          <Button onClick={handleDelete} variant="ghost" size="sm" className="text-red-400 hover:bg-red-950/30">
            <Trash2 size={14} />
          </Button>
        </CardContent>
      </Card>

      {/* Reject dialog */}
      {rejectDialog && (
        <Card className="border-red-500/30 bg-red-950/20">
          <CardHeader><CardTitle className="text-lg text-red-200">Reject article</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="reject">Reason (visible to authors)</Label>
            <Textarea
              id="reject"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why this article is being rejected..."
              className="bg-graphite/60 border-red-500/20"
            />
            <div className="flex gap-2">
              <Button onClick={handleReject} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Confirm rejection
              </Button>
              <Button onClick={() => setRejectDialog(false)} variant="ghost">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI metadata */}
      {(article.aiSummary || article.aiConfidence || article.moderationNotes) && (
        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles size={14} className="text-amber-glow" />AI metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {article.aiSummary && (
              <div>
                <Label className="text-xs uppercase text-muted-foreground">AI summary</Label>
                <p className="italic text-foreground/90 mt-1">"{article.aiSummary}"</p>
              </div>
            )}
            {article.aiConfidence !== null && (
              <div className="flex items-center gap-2">
                <Label className="text-xs uppercase text-muted-foreground">Confidence</Label>
                <Badge variant="outline" className="border-bronze/30 text-amber-glow">
                  {(article.aiConfidence * 100).toFixed(0)}%
                </Badge>
              </div>
            )}
            {article.moderationNotes && (
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Moderation notes</Label>
                <p className="text-red-300 mt-1">{article.moderationNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editable content */}
      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader><CardTitle className="text-lg">Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              defaultValue={article.title}
              onBlur={(e) => e.target.value !== article.title && saveField("title", e.target.value)}
              className="bg-graphite/60 border-bronze/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              defaultValue={article.excerpt ?? ""}
              rows={2}
              onBlur={(e) => e.target.value !== article.excerpt && saveField("excerpt", e.target.value)}
              className="bg-graphite/60 border-bronze/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Body (Markdown)</Label>
            <Textarea
              id="content"
              defaultValue={article.content}
              rows={16}
              onBlur={(e) => e.target.value !== article.content && saveField("content", e.target.value)}
              className="bg-graphite/60 border-bronze/20 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cover">Cover image URL</Label>
              <Input
                id="cover"
                defaultValue={article.coverImageUrl ?? ""}
                onBlur={(e) => e.target.value !== article.coverImageUrl && saveField("coverImageUrl", e.target.value)}
                className="bg-graphite/60 border-bronze/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverAlt">Cover alt text</Label>
              <Input
                id="coverAlt"
                defaultValue={article.coverImageAlt ?? ""}
                onBlur={(e) => e.target.value !== article.coverImageAlt && saveField("coverImageAlt", e.target.value)}
                className="bg-graphite/60 border-bronze/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              defaultValue={article.category?.slug ?? CATEGORIES[0].slug}
              onValueChange={(v) => saveField("categoryId", v)}
            >
              <SelectTrigger className="bg-graphite/60 border-bronze/20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-2">
            <ToggleRow
              label="Breaking news" desc="Red badge in feed and breaking banner"
              icon={<Flame size={14} className="text-red-400" />}
              checked={article.isBreaking}
              onChange={(v) => saveField("isBreaking", v)}
            />
            <ToggleRow
              label="Featured" desc="Appear in Top Story section"
              checked={article.featured}
              onChange={(v) => saveField("featured", v)}
            />
            <ToggleRow
              label="Pinned forever" desc="Skip 48-hour retention rule"
              icon={<Pin size={14} className="text-amber-glow" />}
              checked={article.keepForever}
              onChange={(v) => saveField("keepForever", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Source provenance */}
      {article.sourceName && (
        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader><CardTitle className="text-lg">Source</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><Label className="text-xs uppercase text-muted-foreground">Source name</Label><div className="text-foreground">{article.sourceName}</div></div>
            {article.sourceUrl && (
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Source URL (internal)</Label>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline block break-all">{article.sourceUrl}</a>
              </div>
            )}
            {article.sourcePublishedAt && (
              <div><Label className="text-xs uppercase text-muted-foreground">Original published</Label><div className="text-foreground">{new Date(article.sourcePublishedAt).toLocaleString("en-US")}</div></div>
            )}
            <div><Label className="text-xs uppercase text-muted-foreground">Ingested</Label><div className="text-foreground">{new Date(article.createdAt).toLocaleString("en-US")}</div></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ToggleRow({ label, desc, icon, checked, onChange }: {
  label: string;
  desc: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-bronze/15 bg-graphite/40">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
