"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { ImageUploader } from "@/components/zentry/image-uploader";
import { Loader2, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState(CATEGORIES[0].slug);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [keepForever, setKeepForever] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "PENDING">("DRAFT");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const runAi = async () => {
    if (content.trim().length < 80) {
      toast.error("Add at least 80 chars of content first");
      return;
    }
    setAiLoading(true);
    try {
      const [sumRes, clsRes] = await Promise.all([
        fetch("/api/agent/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawTitle: title, rawText: content }),
        }),
        fetch("/api/agent/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawTitle: title, rawText: content }),
        }),
      ]);
      const sum = await sumRes.json();
      const cls = await clsRes.json();
      if (sumRes.ok && sum.concise_summary) {
        setExcerpt(sum.concise_summary.slice(0, 280));
        if (!title && sum.proposed_title) setTitle(sum.proposed_title);
        toast.success("AI summary applied");
      } else {
        toast.error(sum.error ?? "AI summarize failed");
      }
      if (clsRes.ok && cls.primary_category) {
        setCategorySlug(cls.primary_category);
        toast.message(`Classified as ${cls.primary_category_name} (${(cls.editorial_confidence * 100).toFixed(0)}%)`);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAiLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, excerpt, content, categorySlug, coverImageUrl, coverImageAlt,
          isBreaking, featured, keepForever, status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Save failed");
        return;
      }
      toast.success("Article created");
      router.push("/admin/articles?new=1");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">New article</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manual editorial publication. AI agents can pre-fill summary and category.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={runAi}
          disabled={aiLoading}
          className="border-bronze/40 text-amber-glow hover:bg-bronze/10"
        >
          {aiLoading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Sparkles size={14} className="mr-1.5" />}
          Run AI agents
        </Button>
      </header>

      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader><CardTitle className="font-serif text-lg">Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="bg-graphite/60 border-bronze/20" placeholder="Article headline (American English)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
              className="bg-graphite/60 border-bronze/20" placeholder="One-line summary shown in feed cards" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Body</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={14} required
              className="bg-graphite/60 border-bronze/20 font-mono text-sm" placeholder="Markdown body. **bold**, ## headings, - lists supported." />
          </div>
          <div className="space-y-2">
            <ImageUploader
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              alt={coverImageAlt}
              onAltChange={setCoverImageAlt}
              label="Cover image"
              aspect="16/9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-bronze/15 bg-graphite/30">
        <CardHeader><CardTitle className="font-serif text-lg">Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger className="bg-graphite/60 border-bronze/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="bg-graphite/60 border-bronze/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft (only visible in admin)</SelectItem>
                <SelectItem value="PENDING">Pending review (queued for editor)</SelectItem>
                <SelectItem value="PUBLISHED">Publish immediately</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-2">
            <ToggleRow label="Breaking news" desc="Highlight in feed with red badge" checked={isBreaking} onChange={setIsBreaking} />
            <ToggleRow label="Featured" desc="Appear in the Top Story section" checked={featured} onChange={setFeatured} />
            <ToggleRow label="Pinned forever" desc="Skip 48-hour retention rule" checked={keepForever} onChange={setKeepForever} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
          {saving ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
          Save article
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-bronze/15 bg-graphite/40">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
