// ARENA USA — Live sidebar data providers
// Free, no-API-key endpoints that work on Vercel Edge.
// All providers cache results in the DB to stay within rate limits.

import { db } from "./db";
import { MARKET_TICKER_SYMBOLS, ZODIAC_SIGNS } from "./constants";

const VALID_ZODIAC = new Set(ZODIAC_SIGNS);

// ────────────────────────────────────────────────────────────
//  Market data — CoinGecko (free, no API key) for crypto;
//  fallback to demo prices when rate-limited.
// ────────────────────────────────────────────────────────────
const COIN_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

export async function fetchMarketTicks() {
  try {
    // CoinGecko free simple price endpoint — no key required
    const coinIds = Object.values(COIN_ID_MAP).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();

    const ticks = MARKET_TICKER_SYMBOLS.map((sym) => {
      const coinId = COIN_ID_MAP[sym.symbol];
      if (coinId && data[coinId]) {
        return {
          ...sym,
          price: data[coinId].usd,
          change24h: data[coinId].usd_24h_change,
        };
      }
      // Stocks & commodities: Phase 2 demo values (live provider needs API key)
      const fallback = getFallbackPrice(sym.symbol);
      return { ...sym, price: fallback.price, change24h: fallback.change };
    });

    // Cache in DB for 60 seconds
    await Promise.all(ticks.slice(0, 5).map((t) =>
      db.marketTick.upsert({
        where: { symbol: t.symbol },
        create: { symbol: t.symbol, name: t.name, price: t.price, change24h: t.change24h },
        update: { price: t.price, change24h: t.change24h, updatedAt: new Date() },
      }).catch(() => {}),
    ));

    return ticks;
  } catch (err) {
    // Fallback to cached DB values or demo values
    const cached = await db.marketTick.findMany().catch(() => []);
    if (cached.length > 0) {
      return MARKET_TICKER_SYMBOLS.map((sym) => {
        const c = cached.find((t) => t.symbol === sym.symbol);
        return c ? { ...sym, price: c.price, change24h: c.change24h ?? undefined } : { ...sym, ...getFallbackPrice(sym.symbol) };
      });
    }
    return MARKET_TICKER_SYMBOLS.map((sym) => ({ ...sym, ...getFallbackPrice(sym.symbol) }));
  }
}

function getFallbackPrice(symbol: string): { price: number; change: number } {
  const fallbacks: Record<string, { price: number; change: number }> = {
    BTC: { price: 67250, change: 2.3 },
    ETH: { price: 3580, change: 1.8 },
    EURUSD: { price: 1.085, change: -0.2 },
    OIL: { price: 78.45, change: -1.1 },
    NG: { price: 2.34, change: 0.5 },
    GOLD: { price: 2380, change: 0.8 },
    SILVER: { price: 28.45, change: -0.3 },
    SPX: { price: 5670, change: 0.6 },
    TSLA: { price: 248.50, change: 4.2 },
    GOOGL: { price: 178.20, change: 0.9 },
    AMZN: { price: 188.75, change: -0.4 },
    AAPL: { price: 224.30, change: 0.7 },
    MSFT: { price: 425.10, change: 1.2 },
    NVDA: { price: 124.80, change: 3.1 },
    META: { price: 502.40, change: -0.6 },
    NFLX: { price: 612.30, change: 0.3 },
  };
  return fallbacks[symbol] ?? { price: 100, change: 0 };
}

// ────────────────────────────────────────────────────────────
//  Weather — Open-Meteo (free, no API key)
//  https://open-meteo.com/ — public, no key required
// ────────────────────────────────────────────────────────────
const WEATHER_ICONS_OPEN_METEO: Record<number, string> = {
  0: "sun", 1: "cloud-sun", 2: "cloud-sun", 3: "cloud",
  45: "cloud", 48: "cloud",
  51: "cloud-rain", 53: "cloud-rain", 55: "cloud-rain",
  61: "cloud-rain", 63: "cloud-rain", 65: "cloud-rain",
  71: "snow", 73: "snow", 75: "snow",
  80: "cloud-rain", 81: "cloud-rain", 82: "cloud-rain",
  95: "cloud-rain", 96: "cloud-rain", 99: "cloud-rain",
};

export interface WeatherForecast {
  location: string;
  today: { high: number; low: number; condition: string; icon: string };
  tomorrow: { high: number; low: number; condition: string; icon: string };
  week: { day: string; high: number; low: number; icon: string }[];
}

export async function fetchWeather(lat = 40.7128, lon = -74.0060, locationName = "New York, NY"): Promise<WeatherForecast> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=America/New_York&forecast_days=7`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();

    const daily = data.daily;
    if (!daily) throw new Error("no daily data");

    const week = daily.time.map((date: string, i: number) => ({
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      icon: WEATHER_ICONS_OPEN_METEO[daily.weather_code[i]] ?? "cloud-sun",
    }));

    return {
      location: locationName,
      today: { high: week[0].high, low: week[0].low, condition: "Today", icon: week[0].icon },
      tomorrow: { high: week[1].high, low: week[1].low, condition: "Tomorrow", icon: week[1].icon },
      week,
    };
  } catch (err) {
    // Fall back to demo weather
    const { DEMO_WEATHER } = await import("./demo-data");
    return DEMO_WEATHER;
  }
}

// ────────────────────────────────────────────────────────────
//  US events — Nager.Date free API (no key)
//  https://date.nager.at/api/v2/PublicHolidays/{year}/US
// ────────────────────────────────────────────────────────────
export interface UsEventExternal {
  date: string;
  name: string;
  type: string;
}

export async function fetchUsEvents(): Promise<UsEventExternal[]> {
  try {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const [thisYear, nextYearEvents] = await Promise.all([
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 0 },
      }).then((r) => r.ok ? r.json() : []),
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${nextYear}/US`, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 0 },
      }).then((r) => r.ok ? r.json() : []),
    ]);

    const now = new Date();
    const events: UsEventExternal[] = [
      ...thisYear.map((e: any) => ({ date: e.date, name: e.localName ?? e.name, type: e.type ?? "Public" })),
      ...nextYearEvents.map((e: any) => ({ date: e.date, name: e.localName ?? e.name, type: e.type ?? "Public" })),
    ].filter((e: UsEventExternal) => new Date(e.date) >= now)
      .slice(0, 12);

    return events;
  } catch (err) {
    // Fall back to demo
    const { DEMO_US_EVENTS } = await import("./demo-data");
    return DEMO_US_EVENTS;
  }
}

// ────────────────────────────────────────────────────────────
//  Horoscope — fetched daily, cached in HoroscopeCache
//  Uses a free public API or generates consistent daily predictions
// ────────────────────────────────────────────────────────────
const HOROSCOPE_TEMPLATES = [
  "A creative breakthrough arrives when you stop forcing it. Let the mind wander today.",
  "A conversation you've been avoiding turns out to be simpler than expected. Initiate it.",
  "Financial clarity comes from a single uncomfortable question. Ask it.",
  "Rest is productive today. Your best idea will arrive in stillness, not motion.",
  "An old friend resurfaces with a timely perspective. Listen before responding.",
  "Small disciplined actions compound today. Don't wait for motivation.",
  "Your patience is being tested. The reward for staying the course is real.",
  "A boundary you've been considering is correct. Communicate it kindly.",
  "Curiosity opens an unexpected door today. Follow the unfamiliar thread.",
  "Energy returns. Use it for the task you've been postponing.",
  "Listen to your body. It has been telling you something for weeks.",
  "A piece of news reframes a long-standing assumption. Welcome the update.",
];

export async function fetchHoroscope(sign: string): Promise<string> {
  // Validate sign against the canonical 12-sign list
  if (!VALID_ZODIAC.has(sign)) {
    return "Invalid zodiac sign.";
  }
  // Try cached first
  const cached = await db.horoscopeCache.findUnique({ where: { sign } }).catch(() => null);
  const today = new Date().toDateString();
  if (cached && new Date(cached.updatedAt).toDateString() === today) {
    try {
      const data = JSON.parse(cached.payload);
      return data.text;
    } catch {}
  }

  // Generate a deterministic daily prediction (seeded by date+sign)
  // Phase 3 upgrade: integrate with an LLM via z-ai-web-dev-sdk for personalized daily horoscopes.
  const seed = (sign + today).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = seed % HOROSCOPE_TEMPLATES.length;
  const text = HOROSCOPE_TEMPLATES[idx];

  await db.horoscopeCache.upsert({
    where: { sign },
    create: { sign, payload: JSON.stringify({ text, generatedAt: new Date().toISOString() }) },
    update: { payload: JSON.stringify({ text, generatedAt: new Date().toISOString() }) },
  }).catch(() => {});

  return text;
}
