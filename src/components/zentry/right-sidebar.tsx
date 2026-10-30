"use client";
import { useState } from "react";
import { CloudSun, Sun, Cloud, CloudRain, CloudSnow, Zap, Heart, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_DONATIONS, ZODIAC_SIGNS } from "@/lib/constants";

const WEATHER_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "cloud-sun": CloudSun,
  "sun": Sun,
  "cloud": Cloud,
  "cloud-rain": CloudRain,
  "snow": CloudSnow,
};

export interface WeatherData {
  location: string;
  today: { high: number; low: number; condition: string; icon: string };
  tomorrow: { high: number; low: number; condition: string; icon: string };
  week: { day: string; high: number; low: number; icon: string }[];
}

export interface HoroscopeData {
  sign: string;
  text: string;
}

export interface UsEventData {
  date: string;
  name: string;
  type: string;
}

interface RightSidebarProps {
  weather: WeatherData;
  horoscopes: HoroscopeData[];
  events: UsEventData[];
  visitorCount: number;
}

export function RightSidebar({ weather, horoscopes, events, visitorCount }: RightSidebarProps) {
  const [selectedSign, setSelectedSign] = useState(horoscopes[0]?.sign ?? "Aries");
  const currentHoroscope = horoscopes.find((h) => h.sign === selectedSign) ?? horoscopes[0];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      {/* Weather widget */}
      <WidgetCard title="Weather" icon={<CloudSun size={14} />}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">{weather.location}</div>
              <div className="font-serif text-2xl font-bold text-foreground">{weather.today.high}°F</div>
              <div className="text-xs text-muted-foreground">/{weather.today.low}°F · {weather.today.condition}</div>
            </div>
            <WeatherIcon icon={weather.today.icon} size={40} className="text-amber-glow" />
          </div>
          <div className="grid grid-cols-7 gap-1 pt-3 border-t border-bronze/10">
            {weather.week.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{day.day}</span>
                <WeatherIcon icon={day.icon} size={16} className="text-amber-glow/80" />
                <span className="text-[10px] text-foreground/80">{day.high}°</span>
              </div>
            ))}
          </div>
        </div>
      </WidgetCard>

      {/* Horoscope */}
      <WidgetCard title="Horoscope" icon={<Zap size={14} />}>
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1 mb-3">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedSign === sign
                    ? "bg-bronze/30 text-amber-glow border border-bronze/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-graphite/60"
                }`}
              >
                {sign.slice(0, 3)}
              </button>
            ))}
          </div>
          {currentHoroscope && (
            <p className="text-sm text-foreground/90 leading-relaxed italic">"{currentHoroscope.text}"</p>
          )}
        </div>
      </WidgetCard>

      {/* US Events */}
      <WidgetCard title="Upcoming in the US" icon={<Gift size={14} />}>
        <ul className="divide-y divide-bronze/10">
          {events.slice(0, 5).map((ev, i) => {
            const date = new Date(ev.date);
            return (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-graphite/60 border border-bronze/15 shrink-0">
                  <span className="text-[10px] uppercase text-muted-foreground">{date.toLocaleString("en-US", { month: "short" })}</span>
                  <span className="font-bold text-amber-glow leading-none">{date.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{ev.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {ev.type === "federal_holiday" ? "Federal Holiday" : ev.type === "observance" ? "Observance" : "Event"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      {/* Ad placement — "Your ad here" */}
      <WidgetCard title="Advertisement" icon={<Heart size={14} />}>
        <div className="px-4 py-6 text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-bronze/15 flex items-center justify-center">
            <Heart size={20} className="text-amber-glow/70" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Your ad could be here</p>
          <p className="text-xs text-muted-foreground mb-3">Reach {visitorCount.toLocaleString()}+ daily readers</p>
          <Button size="sm" variant="outline" className="border-bronze/40 text-amber-glow hover:bg-bronze/10 w-full">
            Book this spot
          </Button>
        </div>
      </WidgetCard>

      {/* AdSense placeholder */}
      <div className="rounded-lg border border-dashed border-bronze/20 p-4 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sponsored</div>
        <div className="text-xs text-muted-foreground/70">AdSense placement</div>
      </div>

      {/* Crypto donations */}
      <WidgetCard title="Support ARENA USA" icon={<Gift size={14} />}>
        <Tabs defaultValue={DEMO_DONATIONS[0].coin} className="w-full">
          <TabsList className="grid grid-cols-4 h-8 bg-graphite/60 p-0.5 rounded-md">
            {DEMO_DONATIONS.map((d) => (
              <TabsTrigger
                key={d.coin}
                value={d.coin}
                className="text-[11px] font-semibold data-[state=active]:bg-bronze/30 data-[state=active]:text-amber-glow"
              >
                {d.coin}
              </TabsTrigger>
            ))}
          </TabsList>
          {DEMO_DONATIONS.map((d) => (
            <TabsContent key={d.coin} value={d.coin} className="mt-3">
              <div className="text-center">
                <div className="mx-auto mb-2 w-20 h-20 rounded-md bg-white p-1.5">
                  <div className="w-full h-full bg-graphite/20 grid place-items-center">
                    <span className="text-[9px] text-muted-foreground text-center px-1">
                      QR
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {d.coin} · {d.network}
                </div>
                <code className="block text-[10px] text-amber-glow/90 bg-graphite/40 rounded px-2 py-1.5 break-all font-mono">
                  {d.address}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 w-full h-7 text-[11px] text-muted-foreground hover:text-amber-glow"
                  onClick={() => navigator.clipboard?.writeText(d.address)}
                >
                  Copy address
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </WidgetCard>

      {/* Footer note */}
      <div className="text-center text-[10px] text-muted-foreground/60 px-4 py-2">
        Demo data — Phase 2 will replace with live feeds.
      </div>
    </aside>
  );
}

function WidgetCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-bronze/15 bg-graphite/30 backdrop-blur">
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-bronze/15 bg-graphite/50">
        <span className="text-amber-glow">{icon}</span>
        <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-foreground">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function WeatherIcon({ icon, size = 24, className }: { icon: string; size?: number; className?: string }) {
  const Cmp = WEATHER_ICONS[icon] ?? CloudSun;
  return <Cmp size={size} className={className} />;
}
