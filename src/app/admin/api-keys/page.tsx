"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, KeyRound, Plus, Trash2, Check, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  enabled: boolean;
  lastUsedAt: string | null;
  totalCalls: number;
  rateLimitPerMin: number;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // New key form
  const [name, setName] = useState("");
  const [scopesIngest, setScopesIngest] = useState(true);
  const [scopesRead, setScopesRead] = useState(false);
  const [rateLimit, setRateLimit] = useState(60);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys");
      const data = await res.json();
      setKeys(data.apiKeys ?? []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const scopes = [
      scopesIngest ? "ingest" : null,
      scopesRead ? "read" : null,
    ].filter(Boolean).join(" ");
    if (!scopes) {
      toast.error("Select at least one scope");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, scopes, rateLimitPerMin: rateLimit,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create key");
        return;
      }
      setNewKey(data.apiKey.key);
      setName(""); setExpiresAt("");
      setScopesIngest(true); setScopesRead(false);
      setShowCreate(false);
      toast.success("API key created — copy it now!");
      load();
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  };

  const disable = async (id: string) => {
    if (!confirm("Disable this API key? Active parsers will stop working immediately.")) return;
    const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("API key disabled");
      load();
    } else {
      toast.error("Failed to disable");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <KeyRound size={20} className="text-amber-glow" />
            API Keys
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Issue keys for third-party parsers and integrations. Keys allow external services to submit articles to{" "}
            <code className="text-amber-glow">/api/ingest</code>.
          </p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)} className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
          <Plus size={14} className="mr-1.5" /> New key
        </Button>
      </header>

      {/* Newly created key — shown ONCE */}
      {newKey && (
        <Card className="border-emerald-500/40 bg-emerald-950/30">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2 text-emerald-200">
              <Check size={16} /> Key created — copy now
            </CardTitle>
            <CardDescription className="text-emerald-200/70">
              This is the only time the full key will be shown. Store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 rounded-md bg-espresso/80 border border-emerald-500/30 text-amber-glow font-mono text-sm break-all">
                {newKey}
              </code>
              <Button onClick={() => copy(newKey)} variant="outline" className="border-emerald-500/30 text-emerald-200">
                <Copy size={14} />
              </Button>
              <Button variant="ghost" onClick={() => setNewKey(null)}>Dismiss</Button>
            </div>
            <div className="mt-4 p-3 rounded-md bg-espresso/60 border border-bronze/20">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Example usage:</p>
              <pre className="text-xs text-amber-glow/80 overflow-x-auto"><code>{`curl -X POST https://arena-usa.vercel.app/api/ingest \\
  -H "Authorization: Bearer ${newKey.slice(0, 12)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"title":"...","text":"...","url":"..."}'`}</code></pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreate && (
        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Create new API key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="e.g. Parser-bot-1, RSS-fetcher-prod"
                  className="bg-graphite/60 border-bronze/20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="space-y-2">
                    <ScopeToggle label="ingest" desc="Submit articles via /api/ingest" checked={scopesIngest} onChange={setScopesIngest} />
                    <ScopeToggle label="read" desc="Read published articles via /api/articles" checked={scopesRead} onChange={setScopesRead} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate limit (per minute)</Label>
                  <Input id="rate" type="number" min={1} max={600} value={rateLimit}
                    onChange={(e) => setRateLimit(parseInt(e.target.value || "60", 10))}
                    className="bg-graphite/60 border-bronze/20" />
                  <Label htmlFor="exp" className="mt-2">Expires at (optional)</Label>
                  <Input id="exp" type="datetime-local" value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-graphite/60 border-bronze/20" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={creating} className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
                  {creating ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Plus size={14} className="mr-1.5" />}
                  Generate key
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      <Card className="border-bronze/15 bg-graphite/30 overflow-hidden">
        <CardHeader className="border-b border-bronze/15">
          <CardTitle className="font-serif text-lg">Active keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 size={20} className="animate-spin inline mr-2" />
              Loading…
            </div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <KeyRound size={32} className="mx-auto mb-3 opacity-50" />
              <p>No API keys yet. Create one to enable third-party parsers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-graphite/60 border-b border-bronze/15">
                  <tr className="text-left">
                    <th className="p-3 font-medium text-muted-foreground">Name</th>
                    <th className="p-3 font-medium text-muted-foreground">Prefix</th>
                    <th className="p-3 font-medium text-muted-foreground">Scopes</th>
                    <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Last used</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">Calls</th>
                    <th className="p-3 font-medium text-muted-foreground">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-b border-bronze/10 hover:bg-graphite/40">
                      <td className="p-3 font-medium text-foreground">{k.name}</td>
                      <td className="p-3">
                        <code className="text-xs text-amber-glow/80 font-mono">{k.keyPrefix}…</code>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.split(/\s+/).filter(Boolean).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] border-bronze/30 text-amber-glow">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("en-US") : "never"}
                      </td>
                      <td className="p-3 text-right text-muted-foreground tabular-nums">{k.totalCalls.toLocaleString()}</td>
                      <td className="p-3">
                        {k.enabled
                          ? <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">active</Badge>
                          : <Badge variant="outline" className="border-bronze/30 text-muted-foreground">disabled</Badge>}
                      </td>
                      <td className="p-3 text-right">
                        {k.enabled && (
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => disable(k.id)}
                            className="text-muted-foreground hover:text-red-400 h-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security notice */}
      <div className="p-4 rounded-lg border border-bronze/25 bg-graphite/30 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-glow shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Security notes</p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>Keys are stored as SHA-256 hashes — only the prefix is visible in this list.</li>
            <li>The full key is shown exactly once at creation. Lost keys cannot be recovered.</li>
            <li>Disable compromised keys immediately. Disabled keys return 403 on all requests.</li>
            <li>All key usage is logged in <code className="text-amber-glow">auditLogs</code> for forensic review.</li>
            <li>Never commit keys to your GitHub repository. Use Vercel environment variables.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScopeToggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-md border border-bronze/15 bg-graphite/40">
      <div>
        <div className="text-sm font-medium text-foreground font-mono">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
