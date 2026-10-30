import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { ArrowLeft, Search } from "lucide-react";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={DEMO_MARKET_TICKS} />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 w-16 h-16 rounded-lg bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center shadow-[0_0_30px_-8px_rgba(232,168,90,0.5)]">
            <span className="font-serif font-black text-espresso text-2xl">404</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            It might be an old article that has been archived.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-amber-glow to-bronze text-espresso font-semibold hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 transition-colors"
            >
              <Search size={14} />
              Search articles
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
