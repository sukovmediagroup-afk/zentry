"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      toast.success("Welcome back!");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-espresso px-4">
      <Card className="w-full max-w-md border-bronze/30 bg-graphite/40 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
            <ShieldCheck size={24} className="text-espresso" />
          </div>
          <CardTitle className="font-serif text-2xl">
            ARENA <span className="arena-text-gradient">USA</span> Admin
          </CardTitle>
          <CardDescription>
            Sign in to manage articles, API keys, and integrations.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@arena-usa.com"
                className="bg-graphite/60 border-bronze/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-graphite/60 border-bronze/20"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign in
            </Button>
            <Link
              href="/admin/forgot-password"
              className="text-xs text-muted-foreground hover:text-amber-glow text-center transition-colors"
            >
              Forgot password?
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              Default admin created from{" "}
              <code className="text-amber-glow">ADMIN_EMAIL</code> /{" "}
              <code className="text-amber-glow">ADMIN_PASSWORD</code> env vars.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
