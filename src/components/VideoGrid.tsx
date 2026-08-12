"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export default function VideoGrid({ videos, locale, dict }: { videos: any[]; locale: Locale; dict: any }) {
  const [cat, setCat] = useState("all");
  const [playing, setPlaying] = useState<any | null>(null);

  const cats = useMemo(() => Array.from(new Set(videos.map((v) => pick(v.category, locale)))), [videos, locale]);
  const filtered = videos.filter((v) => cat === "all" || pick(v.category, locale) === cat);

  return (
    <>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button onClick={() => setCat("all")} className={`badge ${cat === "all" ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>{dict.videos.all}</button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`badge ${cat === c ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>{c}</button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v, i) => (
          <Reveal key={v.id} delay={i * 90}>
            <button onClick={() => setPlaying(v)} className="card sheen group block w-full overflow-hidden text-start">
              <div className="relative h-52 overflow-hidden">
                <Image src={v.image} alt={pick(v.title, locale)} fill className="img-gold object-cover" />
                <div className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover:bg-black/10">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-[#e5c878]/70 bg-black/50 text-xl text-[#e5c878] backdrop-blur transition group-hover:scale-110" style={{ boxShadow: "0 0 30px rgba(201,168,76,0.4)" }}>▶</span>
                </div>
                <span className="absolute bottom-3 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white ltr:right-3 rtl:left-3" dir="ltr">{v.duration}</span>
                <span className="absolute top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-[#e5c878] ltr:left-3 rtl:right-3">{pick(v.category, locale)}</span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold leading-6 transition group-hover:text-[#e5c878]">{pick(v.title, locale)}</h3>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {playing && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/85 p-4 backdrop-blur" onClick={() => setPlaying(null)}>
          <div className="card w-full max-w-3xl overflow-hidden rounded-2xl border-[#c9a84c]/40 bg-[#0d0c0e]" onClick={(e) => e.stopPropagation()}>
            <div className="relative grid aspect-video place-items-center bg-black">
              <Image src={playing.image} alt="" fill className="object-cover opacity-40" />
              <div className="relative z-10 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-full border border-[#e5c878] text-2xl text-[#e5c878]">▶</div>
                <p className="px-6 text-sm text-white/80">{pick(playing.title, locale)}</p>
                <a href={`https://www.aparat.com/${(playing.src || "").replace("aparat:", "")}`} target="_blank" rel="noreferrer" className="badge mt-4 inline-flex hover:border-[#c9a84c]">Aparat ↗</a>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-[#e5c878]">{pick(playing.title, locale)}</span>
              <button onClick={() => setPlaying(null)} className="badge hover:border-[#c41e24]">✕</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
