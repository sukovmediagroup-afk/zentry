"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token || token.length < 32) {
      setValidToken(false);
      return;
    }
    setValidToken(true);
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Reset failed");
        return;
      }
      setDone(true);
      toast.success("Password reset — please sign in");
      setTimeout(() => router.push("/admin/login"), 2000);
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
            <Lock size={24} className="text-espresso" />
          </div>
          <CardTitle className="font-serif text-2xl">
            {done ? "Password updated" : "Set new password"}
          </CardTitle>
          <CardDescription>
            {done ? "Redirecting to login…" : "Choose a strong password (min 8 characters)"}
          </CardDescription>
        </CardHeader>

        {validToken === false && (
          <CardContent className="text-center space-y-4">
            <AlertTriangle size={40} className="mx-auto text-red-400" />
            <p className="text-sm text-foreground/90">
              This reset link is invalid or incomplete.
            </p>
            <p className="text-xs text-muted-foreground">
              Reset links expire after 1 hour and can only be used once.
            </p>
          </CardContent>
        )}

        {validToken === true && done && (
          <CardContent className="text-center space-y-4">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
            <p className="text-sm text-foreground/90">
              Your password has been updated. All existing sessions were signed out.
            </p>
          </CardContent>
        )}

        {validToken === true && !done && (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    minLength={8}
                    placeholder="••••••••"
                    className="bg-graphite/60 border-bronze/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-glow"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="bg-graphite/60 border-bronze/20"
                />
              </div>
              <div className="text-xs text-muted-foreground p-3 rounded-md bg-graphite/40 border border-bronze/15">
                <p className="font-medium text-foreground mb-1">Strong password tips:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Use at least 12 characters</li>
                  <li>Mix letters, numbers, and symbols</li>
                  <li>Avoid common words or sequences</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Update password
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="justify-center pt-0">
          <Link href="/admin/forgot-password" className="text-xs text-muted-foreground hover:text-amber-glow">
            Need a new reset link?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
