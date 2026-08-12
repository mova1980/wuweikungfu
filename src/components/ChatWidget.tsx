"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget({ locale, dict }: { locale: Locale; dict: any }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // restore conversation for this tab
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(`wuwei_chat_${locale}`) || "[]");
      if (Array.isArray(saved)) setMsgs(saved);
    } catch {}
    // a gentle one-time attention hint after 6s
    const t = setTimeout(() => setHint(true), 6000);
    const t2 = setTimeout(() => setHint(false), 14000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [locale]);

  useEffect(() => {
    try { sessionStorage.setItem(`wuwei_chat_${locale}`, JSON.stringify(msgs.slice(-30))); } catch {}
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, locale]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.reply) {
        setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
      } else if (data.offline) {
        setMsgs((m) => [...m, { role: "assistant", content: `⚙️ ${dict.chat.offline}` }]);
      } else {
        setMsgs((m) => [...m, { role: "assistant", content: `⚠️ ${dict.chat.error}` }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: `⚠️ ${dict.chat.error}` }]);
    }
    setBusy(false);
  };

  return (
    <>
      {/* ---------- floating launcher (fixed — rides with scroll) ---------- */}
      <div className="fixed bottom-24 z-[65]" style={{ insetInlineEnd: "1.25rem" }}>
        {hint && !open && (
          <div className="chat-hint absolute bottom-full mb-3 w-max max-w-[220px] rounded-2xl border border-[#c9a84c]/40 bg-black/80 px-4 py-2.5 text-xs leading-5 text-[#e5c878] shadow-2xl backdrop-blur-md"
            style={{ insetInlineEnd: 0 }}>
            💬 {dict.chat.subtitle}
          </div>
        )}
        <button
          onClick={() => { setOpen(!open); setHint(false); }}
          aria-label={dict.chat.title}
          className="chat-fab group relative grid h-16 w-16 place-items-center rounded-full border border-[#c9a84c]/60 bg-black/70 backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          {/* rotating energy ring */}
          <span className="chat-ring absolute inset-[-4px] rounded-full" aria-hidden />
          <Image src="/images/logo.png" alt="" width={52} height={52} className="logo-glow relative z-10 rounded-full" />
          {open && (
            <span className="absolute -top-1 z-20 grid h-5 w-5 place-items-center rounded-full bg-[#c41e24] text-[10px] font-bold text-white" style={{ insetInlineEnd: "-0.15rem" }}>✕</span>
          )}
        </button>
      </div>

      {/* ---------- chat panel ---------- */}
      {open && (
        <div
          dir={locale === "fa" ? "rtl" : "ltr"}
          className="chat-panel card glass-strong fixed z-[70] flex flex-col overflow-hidden rounded-3xl border-[#c9a84c]/35"
          style={{
            insetInlineEnd: "1.25rem",
            bottom: "10.5rem",
            width: "min(92vw, 390px)",
            height: "min(64vh, 540px)",
            boxShadow: "0 30px 90px -20px rgba(201,168,76,0.35), 0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-[var(--line)] bg-gradient-to-l from-[rgba(201,168,76,0.14)] to-transparent px-4 py-3">
            <div className="relative">
              <Image src="/images/logo.png" alt="" width={40} height={40} className="logo-glow rounded-full" />
              <span className="absolute bottom-0 h-2.5 w-2.5 rounded-full border-2 border-black bg-green-400" style={{ insetInlineEnd: 0 }} />
            </div>
            <div className="flex-1 leading-tight">
              <div className="gold-text text-sm font-black">{dict.chat.title}</div>
              <div className="text-[10px] text-[var(--muted)]">{dict.chat.subtitle} · 無為</div>
            </div>
            <button onClick={() => setMsgs([])} title={dict.chat.clear}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-xs text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">↺</button>
            <button onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-xs text-[var(--muted)] transition hover:border-[#c41e24] hover:text-[#e04b46]">✕</button>
          </div>

          {/* messages */}
          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {/* welcome */}
            <div className="chat-bubble flex gap-2.5">
              <Image src="/images/logo.png" alt="" width={28} height={28} className="mt-1 h-7 w-7 shrink-0 rounded-full" />
              <div className="card max-w-[85%] rounded-2xl rounded-ss-sm px-3.5 py-2.5 text-[13px] leading-6">{dict.chat.hello}</div>
            </div>

            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="chat-bubble flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-se-sm bg-gradient-to-l from-[#e5c878] to-[#b3924a] px-3.5 py-2.5 text-[13px] font-medium leading-6 text-black shadow-lg">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="chat-bubble flex gap-2.5">
                  <Image src="/images/logo.png" alt="" width={28} height={28} className="mt-1 h-7 w-7 shrink-0 rounded-full" />
                  <div className="card max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-ss-sm px-3.5 py-2.5 text-[13px] leading-6">
                    {m.content}
                  </div>
                </div>
              )
            )}

            {/* typing indicator */}
            {busy && (
              <div className="chat-bubble flex items-center gap-2.5">
                <Image src="/images/logo.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full" />
                <div className="card flex items-center gap-1.5 rounded-2xl rounded-ss-sm px-4 py-3">
                  <span className="chat-dot" /><span className="chat-dot" style={{ animationDelay: "0.15s" }} /><span className="chat-dot" style={{ animationDelay: "0.3s" }} />
                  <span className="ms-2 text-[10px] text-[var(--muted)]">{dict.chat.thinking}</span>
                </div>
              </div>
            )}

            {/* quick suggestions */}
            {msgs.length === 0 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {dict.chat.suggestions.map((s: string) => (
                  <button key={s} onClick={() => send(s)}
                    className="badge text-start transition hover:scale-[1.03] hover:border-[#c9a84c]">{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-[var(--line)] bg-black/20 p-3">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={dict.chat.placeholder} maxLength={1000}
              className="input flex-1 !rounded-full !py-2.5 text-[13px]" />
            <button disabled={busy || !input.trim()} aria-label={dict.chat.send}
              className="btn-energy grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] text-black transition hover:scale-105 disabled:opacity-40">
              {locale === "fa" ? "◀" : "▶"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
