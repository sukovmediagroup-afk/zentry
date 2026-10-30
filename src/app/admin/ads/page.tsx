"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader2, Megaphone, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  format: string;
  priceUsd: number;
  paid: boolean;
  status: string;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
  targetUrl: string;
  impressions: number;
  clicks: number;
}

export default function AdminAdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // New campaign form
  const [name, setName] = useState("");
  const [advertiser, setAdvertiser] = useState("");
  const [format, setFormat] = useState("sidebar");
  const [priceUsd, setPriceUsd] = useState(99);
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState(7); // days
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !advertiser || !targetUrl) {
      toast.error("Name, advertiser and target URL are required");
      return;
    }
    setCreating(true);
    try {
      const now = new Date();
      const endAt = new Date(now.getTime() + duration * 24 * 3600 * 1000);
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, advertiser, format, priceUsd, targetUrl, imageUrl,
          startAt: now.toISOString(),
          endAt: endAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      toast.success("Campaign created");
      setName(""); setAdvertiser(""); setTargetUrl(""); setImageUrl("");
      setShowCreate(false);
      load();
    } catch {
      toast.error("Network error");
    } finally {
      setCreating(false);
    }
  };

  const checkout = async (campaignId: string) => {
    try {
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone size={20} className="text-amber-glow" />
            Ad Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create ad placements, send advertisers to Stripe checkout, then moderate and publish.
          </p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)} className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
          New campaign
        </Button>
      </header>

      {showCreate && (
        <Card className="border-bronze/15 bg-graphite/30">
          <CardHeader><CardTitle className="font-serif text-lg">Create campaign</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Summer Sale 2026" className="bg-graphite/60 border-bronze/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adv">Advertiser email</Label>
                  <Input id="adv" type="email" value={advertiser} onChange={(e) => setAdvertiser(e.target.value)} required
                    placeholder="advertiser@company.com" className="bg-graphite/60 border-bronze/20" />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="bg-graphite/60 border-bronze/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar (300×250)</SelectItem>
                      <SelectItem value="in_feed">In-feed</SelectItem>
                      <SelectItem value="header_banner">Header banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" min={1} step="0.01" value={priceUsd}
                    onChange={(e) => setPriceUsd(parseFloat(e.target.value || "0"))}
                    className="bg-graphite/60 border-bronze/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dur">Duration (days)</Label>
                  <Input id="dur" type="number" min={1} max={365} value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value || "7", 10))}
                    className="bg-graphite/60 border-bronze/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="img">Image URL (optional)</Label>
                  <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..." className="bg-graphite/60 border-bronze/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="turl">Target URL</Label>
                <Input id="turl" type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required
                  placeholder="https://advertiser.com/landing-page" className="bg-graphite/60 border-bronze/20" />
              </div>
              <Button type="submit" disabled={creating} className="bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold">
                {creating ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : null}
                Create & continue to payment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-bronze/15 bg-graphite/30 overflow-hidden">
        <CardHeader className="border-b border-bronze/15">
          <CardTitle className="font-serif text-lg">Campaigns ({campaigns.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 size={20} className="animate-spin inline mr-2" /> Loading…
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Megaphone size={32} className="mx-auto mb-3 opacity-50" />
              No campaigns yet. Create one to start monetizing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-graphite/60 border-b border-bronze/15">
                  <tr className="text-left">
                    <th className="p-3 font-medium text-muted-foreground">Campaign</th>
                    <th className="p-3 font-medium text-muted-foreground">Advertiser</th>
                    <th className="p-3 font-medium text-muted-foreground">Format</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">Price</th>
                    <th className="p-3 font-medium text-muted-foreground">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-bronze/10 hover:bg-graphite/40">
                      <td className="p-3">
                        <div className="font-medium text-foreground">{c.name}</div>
                        <a href={c.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-glow hover:underline flex items-center gap-1">
                          <ExternalLink size={10} /> {c.targetUrl.slice(0, 40)}
                        </a>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.advertiser}</td>
                      <td className="p-3"><Badge variant="outline" className="border-bronze/30 text-amber-glow">{c.format}</Badge></td>
                      <td className="p-3 text-right font-medium text-foreground">${c.priceUsd.toFixed(2)}</td>
                      <td className="p-3">
                        {c.paid ? (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                            <Check size={10} className="mr-1" /> Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-glow/30 text-amber-glow">{c.status}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!c.paid && (
                          <Button size="sm" onClick={() => checkout(c.id)} variant="outline"
                            className="border-bronze/40 text-amber-glow hover:bg-bronze/10 h-8">
                            <CreditCard size={12} className="mr-1" /> Pay
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
    </div>
  );
}
