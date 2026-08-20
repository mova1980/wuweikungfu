"use client";
import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import { pick, type Locale } from "@/lib/i18n";

type Coach = { id?: string; image?: string; name?: any; role?: any };

/* ---------------------------------------------------------------------------
 * 🐯 Tiger Roar — a synthesized low growl built with WebAudio (no audio file).
 * Short, subtle, chest-rumbling: sub-bass sweep + growl saw + breath noise.
 * Only fired on user click (autoplay-safe) and skipped for reduced-motion.
 * ------------------------------------------------------------------------- */
function playRoar() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx: AudioContext = new AC();
    const t = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.42, t + 0.07); // attack — the pounce
    master.gain.exponentialRampToValueAtTime(0.0001, t + 1.15); // long decay — the echo
    master.connect(ctx.destination);

    // growl body — filtered saw sweeping down like a throat
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.95);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 230;
    lp.Q.value = 5;
    const og = ctx.createGain();
    og.gain.value = 0.5;
    osc.connect(lp).connect(og).connect(master);

    // sub-bass — the chest rumble
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(56, t);
    sub.frequency.exponentialRampToValueAtTime(27, t + 1.0);
    const sg = ctx.createGain();
    sg.gain.value = 0.6;
    sub.connect(sg).connect(master);

    // breath — bandpass noise sweeping with the roar
    const len = Math.floor(ctx.sampleRate * 1.15);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(520, t);
    bp.frequency.exponentialRampToValueAtTime(130, t + 1.0);
    bp.Q.value = 1.1;
    const ng = ctx.createGain();
    ng.gain.value = 0.2;
    noise.connect(bp).connect(ng).connect(master);

    // tremolo — the vibrating throat
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(17, t);
    lfo.frequency.exponentialRampToValueAtTime(7, t + 1.0);
    const lg = ctx.createGain();
    lg.gain.value = 0.16;
    lfo.connect(lg).connect(og.gain);

    [osc, sub, noise, lfo].forEach((n) => {
      n.start(t);
      n.stop(t + 1.2);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {}
}

export default function CoachesGrid({ locale, coaches }: { locale: Locale; coaches: Coach[] }) {
  const [sel, setSel] = useState<Coach | null>(null);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sel]);

  const reduced =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const open = (c: Coach) => {
    setSel(c);
    if (!reduced) playRoar();
  };

  return (
    <>
      {/* ---- the same coach cards — now clickable ---- */}
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
        {(coaches || []).map((c: any, i: number) => (
          <Reveal key={c.id || i} delay={i * 90}>
            <button
              onClick={() => open(c)}
              aria-label={pick(c.name, locale)}
              className="card sheen group block w-full cursor-zoom-in overflow-hidden text-center"
            >
              <div className="relative h-52 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image || "/images/coach-m1.jpg"} alt={pick(c.name, locale)} className="img-gold h-full w-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <span className="absolute top-2 grid h-7 w-7 place-items-center rounded-full border border-[#c9a84c]/50 bg-black/60 text-[11px] text-[#e5c878] opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100" style={{ insetInlineEnd: "0.5rem" }}>
                  ⤢
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm font-black text-[#e5c878]">{pick(c.name, locale)}</div>
                <div className="mt-1.5 text-[11px] leading-5 text-[var(--muted)]">{pick(c.role, locale)}</div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* ---- 🐯 TIGER ROAR LIGHTBOX ---- */}
      {sel && (
        <div
          dir={locale === "fa" ? "rtl" : "ltr"}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/92 backdrop-blur-md"
          style={{ animation: "lbIn .25s ease both" }}
          onClick={() => setSel(null)}
        >
          <button
            onClick={() => setSel(null)}
            aria-label="close"
            className="absolute top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-[#c9a84c]/50 bg-black/70 text-lg text-[#e5c878] transition hover:scale-110 hover:bg-[#c41e24]/30"
            style={{ insetInlineEnd: "1rem" }}
          >
            ✕
          </button>

          <figure className="relative" onClick={(e) => e.stopPropagation()}>
            {/* amber flash of the roar */}
            <span className="roar-flash" aria-hidden />
            <div className="roar-img-wrap relative overflow-hidden rounded-2xl border-2 border-[#c9a84c]/70 shadow-[0_40px_140px_-30px_rgba(201,168,76,0.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sel.image || "/images/coach-m1.jpg"}
                alt={pick(sel.name, locale)}
                className="max-h-[76vh] w-auto max-w-[88vw] object-contain"
              />
              {/* shockwave rings */}
              <span className="roar-ring" aria-hidden />
              <span className="roar-ring r2" aria-hidden />
              <span className="roar-ring r3" aria-hidden />
              {/* three claw slashes */}
              <span className="claw c1" aria-hidden />
              <span className="claw c2" aria-hidden />
              <span className="claw c3" aria-hidden />
            </div>
            <figcaption className="roar-cap mt-4 text-center">
              <div className="gold-text text-xl font-black">{pick(sel.name, locale)}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{pick(sel.role, locale)}</div>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
