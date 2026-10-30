import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Hide framework fingerprint
  poweredByHeader: false,
  // Enable instrumentation hook for env loading
  // Allow image optimization for stock-photo and partner CDNs.
  // In production on Vercel, this enables the Image Optimization edge network.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "arena-usa.vercel.app" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    minimumCacheTTL: 60 * 60, // 1 hour
  },
  // SEO + security headers
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // HSTS — only sent over HTTPS (Vercel terminates TLS for us)
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];

    return [
      // Public site: full security headers, no CORS for browser privacy
      {
        source: "/((?!api|admin|_next).*)",
        headers: securityHeaders,
      },
      // Admin panel: full security headers + restrictive CSP (no external scripts)
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js dev needs unsafe-eval; production drops it
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
      // Public API: CORS open for reads (no cookies), no CORS for admin routes
      {
        source: "/api/articles",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          ...securityHeaders,
        ],
      },
      {
        source: "/api/categories",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          ...securityHeaders,
        ],
      },
      {
        source: "/api/health",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          ...securityHeaders,
        ],
      },
      // Admin API: NO CORS headers — only same-origin (cookie-auth)
      {
        source: "/api/admin/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/ingest",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Api-Key" },
          ...securityHeaders,
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin-home", destination: "/admin", permanent: true },
    ];
  },
};

export default nextConfig;
