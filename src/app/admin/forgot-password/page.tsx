"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send reset email");
        return;
      }
      setSent(true);
      toast.success("Reset link sent — check your inbox");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-espresso px-4">
      <Card className="w-full max-w-md border-bronze/30 bg-graphite/40 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
            <Mail size={24} className="text-espresso" />
          </div>
          <CardTitle className="font-serif text-2xl">
            Reset password
          </CardTitle>
          <CardDescription>
            Enter your admin email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>
        {sent ? (
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
              <p className="text-sm text-foreground/90">
                If an account exists for <strong className="text-amber-glow">{email}</strong>,
                a reset link has been sent to that email.
              </p>
              <p className="text-xs text-muted-foreground">
                The link expires in 1 hour. Check your spam folder if you don't see it.
              </p>
            </div>
          </CardContent>
        ) : (
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
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Send reset link
              </Button>
            </CardFooter>
          </form>
        )}
        <CardFooter className="justify-center pt-0">
          <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-glow">
            <ArrowLeft size={12} /> Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
