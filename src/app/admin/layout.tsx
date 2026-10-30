import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/zentry/admin-shell";

export const dynamic = "force-dynamic";

// Routes that render standalone (no admin shell, no auth required)
const STANDALONE_ROUTES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  // Standalone routes (login, password reset) render without the shell
  // We can't access pathname here, so we render the shell conditionally based on user
  let counts: { articles: number; apiKeys: number; sources: number; pending: number } | null = null;
  if (user) {
    const [articles, apiKeys, sources, pending] = await Promise.all([
      db.article.count(),
      db.apiKey.count(),
      db.source.count(),
      db.article.count({ where: { status: "PENDING" } }),
    ]);
    counts = { articles, apiKeys, sources, pending };
  }

  return (
    <AdminShell user={user} counts={counts}>
      {children}
    </AdminShell>
  );
}
