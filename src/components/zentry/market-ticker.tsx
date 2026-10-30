"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change24h?: number;
  currency?: string;
}

function formatPrice(value: number): string {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function TickerPill({ item }: { item: TickerItem }) {
  const up = (item.change24h ?? 0) >= 0;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-r border-bronze/10 shrink-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-glow">
        {item.symbol}
      </span>
      <span className="text-xs text-foreground/90 tabular-nums">
        {item.currency === "USD" ? "$" : ""}{formatPrice(item.price)}
      </span>
      <span className={`flex items-center gap-0.5 text-[11px] tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {up ? "+" : ""}{item.change24h?.toFixed(2)}%
      </span>
    </div>
  );
}

export function MarketTicker({ items }: { items: TickerItem[] }) {
  // Duplicate the list for a seamless marquee loop.
  const doubled = [...items, ...items];

  return (
    <div className="relative border-b border-bronze/15 bg-graphite/40 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-espresso to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-espresso to-transparent pointer-events-none" />

      <div className="flex items-center">
        <div className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-bronze/15 border-r border-bronze/30 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="arena-pulse absolute inline-flex h-full w-full rounded-full bg-amber-glow opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-glow" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-glow">Markets</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="arena-marquee-track flex items-center w-max">
            {doubled.map((item, i) => (
              <TickerPill key={`${item.symbol}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
