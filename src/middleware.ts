// ARENA USA — centralized auth middleware.
//
// Redirects unauthenticated users from /admin/* (except login, forgot, reset)
// to /admin/login. Pages still call requireAdmin() for fine-grained role checks.
//
// Middleware runs on Edge Runtime — it cannot query the DB. Instead it checks
// only for the presence of the session cookie. The actual session validity
// is checked by the route handler via getCurrentUser().

import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
const SESSION_COOKIE = "arena_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only enforce auth on /admin/* paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check session cookie presence
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionCookie || sessionCookie.length < 16) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all /admin/* paths except static assets
  matcher: ["/admin/:path*"],
};