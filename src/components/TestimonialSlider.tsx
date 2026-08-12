"use client";
import { useEffect, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";

export default function TestimonialSlider({ items, locale }: { items: any[]; locale: Locale }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI((x) => (x + 1) % items.length), 6000);
    return () => clearInterval(iv);
  }, [items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <div className="card soft-edge relative mx-auto max-w-3xl overflow-hidden p-10 text-center">
      <div className="kanji-watermark -top-6 text-[9rem] ltr:-left-4 rtl:-right-4">道</div>
      <p key={t.id} className="min-h-28 text-lg leading-9 text-[var(--fg)]/90" style={{ animation: "fadeIn 0.8s ease" }}>
        «{pick(t.text, locale)}»
      </p>
      <div className="mt-6">
        <div className="font-bold text-[#e5c878]">{pick(t.name, locale)}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">{pick(t.role, locale)}</div>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${idx === i ? "w-8 bg-[#c9a84c]" : "w-2 bg-[var(--line)]"}`} />
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
