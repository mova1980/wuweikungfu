"use client";
import { useState } from "react";
import { type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export default function ContactClient({ locale, dict }: { locale: Locale; dict: any }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setState("sent");
  };

  return (
    <div className="mt-14 grid gap-8 lg:grid-cols-2">
      <Reveal>
        <form onSubmit={submit} className="card soft-edge space-y-5 p-8">
          {state === "sent" ? (
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 animate-bounce place-items-center rounded-full bg-green-600/20 text-3xl">✓</div>
                <p className="text-[#e5c878]">{dict.contact.sent}</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.name}</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.email}</label>
                <input required type="email" dir="ltr" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.message}</label>
                <textarea required rows={6} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button disabled={state === "sending"}
                className="btn-energy w-full rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] py-3.5 font-black text-black transition hover:brightness-110 disabled:opacity-60">
                {state === "sending" ? dict.contact.sending : `${dict.contact.send} ⚡`}
              </button>
            </>
          )}
        </form>
      </Reveal>

      <Reveal delay={150}>
        <div className="space-y-5">
          <div className="card rounded-2xl p-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-[#e5c878]"><span>📍</span>{dict.contact.address}</h3>
            <p className="text-sm leading-7 text-[var(--muted)]">{dict.contact.addressVal}</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <a href="tel:09123686344" className="card rounded-2xl p-6 transition hover:border-[#c9a84c]">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#e5c878]"><span>📞</span>{dict.contact.phone}</h3>
              <p dir="ltr" className="text-sm text-[var(--muted)]">0912 368 6344</p>
            </a>
            <a href="mailto:info@wuweikungfu.com" className="card rounded-2xl p-6 transition hover:border-[#c9a84c]">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#e5c878]"><span>✉️</span>Email</h3>
              <p dir="ltr" className="break-all text-xs text-[var(--muted)]">info@wuweikungfu.com</p>
            </a>
          </div>
          <div className="card rounded-2xl p-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-[#e5c878]"><span>🌐</span>{dict.contact.socials}</h3>
            <div className="flex flex-wrap gap-3">
              <a className="badge hover:border-[#c9a84c]" href="https://instagram.com/sifu_shayanfar_chinese_kung_fu" target="_blank" rel="noreferrer">📸 Instagram</a>
              <a className="badge hover:border-[#c9a84c]" href="https://www.aparat.com/A_136369" target="_blank" rel="noreferrer">🎬 Aparat</a>
              <a className="badge hover:border-[#c9a84c]" href="https://youtube.com" target="_blank" rel="noreferrer">▶️ YouTube</a>
            </div>
          </div>
          {/* stylized map */}
          <div className="card relative h-56 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-40"
              style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(201,168,76,0.12) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(201,168,76,0.12) 29px)" }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="relative mx-auto block h-5 w-5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c41e24] opacity-60" />
                <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c41e24] text-[10px]">📍</span>
              </span>
              <div className="mt-2 text-xs text-[#e5c878]">Karaj · کرج</div>
              <a className="badge mt-2 hover:border-[#c9a84c]" href="https://maps.google.com/?q=Karaj+Azadegan+Barghan" target="_blank" rel="noreferrer">Google Maps ↗</a>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
