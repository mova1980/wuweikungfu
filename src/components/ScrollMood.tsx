"use client";
import { useEffect, useRef, useState } from "react";

/**
 * "Student Mode" — reads scroll velocity:
 *  fast scrolling → aggressive mode (red accents, fast animations)
 *  slow scrolling → meditative mode (indigo-blue accents, slow animations)
 */
export default function ScrollMood({ labels }: { labels: { mood: string; calm: string; aggr: string; neutral: string } }) {
  const [mood, setMood] = useState<"neutral" | "calm" | "aggr">("neutral");
  const lastY = useRef(0);
  const lastT = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;
    lastT.current = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastY.current);
      const dt = Math.max(now - lastT.current, 1);
      const v = dy / dt; // px per ms
      lastY.current = window.scrollY;
      lastT.current = now;

      let next: "neutral" | "calm" | "aggr" = "neutral";
      if (v > 2.2) next = "aggr";
      else if (v < 0.35 && window.scrollY > 200) next = "calm";
      setMood(next);
      document.documentElement.dataset.mood = next;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setMood("neutral");
        document.documentElement.dataset.mood = "neutral";
      }, 2600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const label = mood === "calm" ? labels.calm : mood === "aggr" ? labels.aggr : labels.neutral;
  const color = mood === "calm" ? "#6f9fd8" : mood === "aggr" ? "#e04b46" : "#c9a84c";

  return (
    <div
      className="fixed bottom-5 z-40 flex w-max max-w-[80vw] items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur-md transition-colors duration-700"
      style={{ insetInlineStart: "1.25rem", borderColor: color + "55", background: "rgba(10,10,10,0.55)", color }}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <span className="whitespace-nowrap">{labels.mood}: {label}</span>
    </div>
  );
}
