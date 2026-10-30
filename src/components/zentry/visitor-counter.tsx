"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";

interface VisitorCounterProps {
  initialCount: number;
  className?: string;
}

/**
 * ARENA USA live visitor counter.
 * Sends a heartbeat to /api/heartbeat every 30 seconds while the page is visible.
 * The server counts unique session_ids active in the last 60 seconds.
 * Note: counts sessions, not guaranteed unique humans (multi-device, etc.).
 */
export function VisitorCounter({ initialCount, className }: VisitorCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [connected, setConnected] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let sessionId = sessionStorage.getItem("arena_session_id");
    if (!sessionId) {
      // Cryptographically secure random — Math.random is predictable.
      const randomPart = crypto.getRandomValues(new Uint8Array(8));
      const hex = Array.from(randomPart).map((b) => b.toString(16).padStart(2, "0")).join("");
      sessionId = `s_${Date.now()}_${hex}`;
      sessionStorage.setItem("arena_session_id", sessionId);
    }

    let timer: ReturnType<typeof setInterval> | null = null;
    let visible = true;

    const sendHeartbeat = async () => {
      if (!visible) return;
      try {
        const res = await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, path: pathname }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.activeCount === "number") {
            setCount(data.activeCount);
            setConnected(true);
          }
        }
      } catch {
        setConnected(false);
      }
    };

    sendHeartbeat();
    timer = setInterval(sendHeartbeat, 30_000);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) sendHeartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      // Best-effort goodbye
      try {
        fetch("/api/heartbeat?sessionId=" + sessionId, { method: "DELETE" }).catch(() => {});
      } catch {}
    };
  }, [pathname]);

  return (
    <div className={className}>
      <span className="relative flex h-2 w-2">
        <span className={`arena-pulse absolute inline-flex h-full w-full rounded-full ${connected ? "bg-emerald-400" : "bg-amber-glow"} opacity-60`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-glow"}`} />
      </span>
    </div>
  );
}
