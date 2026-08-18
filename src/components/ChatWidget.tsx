"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * AI Assistant launcher — floating button.
 * Clicking it now opens the dedicated Wu Wei AI assistant app
 * (a standalone React app deployed on Vercel) instead of the
 * old in-page chat panel.
 */

export const AI_APP_URL = "https://wuweikungfu-ai.vercel.app/";

export default function ChatWidget({ dict }: { locale?: string; dict?: any }) {
  const [hint, setHint] = useState(false);

  // a gentle one-time attention hint after 6s (same rhythm as before)
  useEffect(() => {
    const t = setTimeout(() => setHint(true), 6000);
    const t2 = setTimeout(() => setHint(false), 14000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const label = dict?.chat?.title || "دستیار هوش مصنوعی وو وی";

  return (
    <div className="fixed bottom-24 z-[65]" style={{ insetInlineEnd: "1.25rem" }}>
      {hint && (
        <div
          className="chat-hint absolute bottom-full mb-3 w-max max-w-[220px] rounded-2xl border border-[#c9a84c]/40 bg-black/80 px-4 py-2.5 text-xs leading-5 text-[#e5c878] shadow-2xl backdrop-blur-md"
          style={{ insetInlineEnd: 0 }}
        >
          💬 {dict?.chat?.subtitle || "دستیار هوشمند وو وی"}
        </div>
      )}
      <a
        href={AI_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="chat-fab group relative grid h-16 w-16 place-items-center rounded-full border border-[#c9a84c]/60 bg-black/70 backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {/* rotating energy ring */}
        <span className="chat-ring absolute inset-[-4px] rounded-full" aria-hidden />
        <Image
          src="/images/logo.png"
          alt=""
          width={52}
          height={52}
          className="logo-glow relative z-10 rounded-full"
        />
        {/* external-link badge on hover */}
        <span
          className="absolute -top-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] text-[10px] font-black text-black opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
          style={{ insetInlineEnd: "-0.15rem" }}
        >
          ↗
        </span>
      </a>
    </div>
  );
}
