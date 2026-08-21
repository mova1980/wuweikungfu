"use client";
import { useState } from "react";
import { type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export default function ContactClient({ locale, dict }: { locale: Locale; dict: any }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

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
                <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.phoneField}</label>
                <input required dir="ltr" inputMode="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.message}</label>
                <textarea required rows={6} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button disabled={state === "sending"}
                className="btn-energy w-full rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] py-3.5 font-black text-black transition hover:brightness-110 disabled:opacity-60">
                {state === "sending" ? dict.contact.sending : dict.contact.send}
              </button>
              <p className="text-center text-[11px] leading-5 text-[var(--muted)]">🔒 {dict.contact.note}</p>
            </>
          )}
        </form>
      </Reveal>

      <Reveal delay={150}>
        <div className="space-y-5">
          <div className="card rounded-2xl p-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-[#e5c878]"><span>📍</span>{dict.contact.address}</h3>
            <p className="text-sm leading-7 text-[var(--muted)]">{dict.contact.addressVal}</p>
            <a href="https://maps.app.goo.gl/bVbd7pewrNHg8xqy6" target="_blank" rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#e5c878] transition hover:text-[#f0d98c] hover:underline">
              🗺️ {dict.footer.academy} ↗
            </a>
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
          {/* نقشه واقعی آکادمی ورزشی رعد — هم‌تم با فوتر */}
          <div className="map-card group relative h-64 overflow-hidden rounded-2xl border border-[#c9a84c]/40">
            <iframe
              src="https://maps.google.com/maps?q=35.827001,51.002368&z=16&hl=fa&output=embed"
              title={dict.footer.academy}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-frame block h-full w-full"
            />
            <span className="map-veil" aria-hidden />
            <span className="badge pointer-events-none absolute top-3 border-[#c9a84c]/50 bg-black/70 backdrop-blur-sm" style={{ insetInlineStart: "0.75rem" }}>
              📌 {dict.footer.academy}
            </span>
            <a
              href="https://maps.app.goo.gl/bVbd7pewrNHg8xqy6"
              target="_blank"
              rel="noreferrer"
              className="btn-energy absolute bottom-3 rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-5 py-2 text-xs font-black text-black shadow-lg transition hover:scale-105"
              style={{ insetInlineEnd: "0.75rem" }}
            >
              {dict.footer.mapCta} ↗
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
