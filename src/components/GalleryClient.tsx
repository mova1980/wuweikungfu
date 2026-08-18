"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Img = { id: string; src: string; caption?: string; desc?: string };
type Cat = { id: string; title: string; titleEn?: string; titleZh?: string; icon?: string; order?: number; images: Img[] };

const PLACEHOLDER = "/images/gallery/placeholder.svg";

export function catTitle(c: Cat, locale: Locale) {
  if (locale === "fa") return c.title;
  if (locale === "zh") return c.titleZh || c.title;
  return c.titleEn || c.title;
}

export default function GalleryClient({ locale, dict, cats }: { locale: Locale; dict: any; cats: Cat[] }) {
  const rtl = locale === "fa";
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");
  const [lb, setLb] = useState<number | null>(null); // index into visible list
  const searchRef = useRef<HTMLInputElement>(null);

  const t = dict.gallery || {};

  const visible = useMemo(() => {
    const base = active === "all" ? cats : cats.filter((c) => c.id === active);
    let items: { cat: Cat; img: Img }[] = [];
    for (const c of base) for (const img of c.images || []) items.push({ cat: c, img });
    const s = q.trim().toLowerCase();
    if (s) items = items.filter(({ img, cat }) =>
      (img.caption || "").toLowerCase().includes(s) ||
      (img.desc || "").toLowerCase().includes(s) ||
      catTitle(cat, locale).toLowerCase().includes(s));
    return items;
  }, [cats, active, q, locale]);

  // keyboard nav + scroll lock for lightbox
  useEffect(() => {
    if (lb === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowRight") setLb((i) => (i === null ? null : rtl ? Math.max(0, i - 1) : Math.min(visible.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setLb((i) => (i === null ? null : rtl ? Math.min(visible.length - 1, i + 1) : Math.max(0, i - 1)));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lb, visible.length, rtl]);

  const cur = lb !== null ? visible[lb] : null;

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.dataset.fallback !== "1") {
      el.dataset.fallback = "1";
      el.src = PLACEHOLDER;
    }
  };

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: 0 };
    for (const c of cats) {
      m[c.id] = (c.images || []).length;
      m.all += (c.images || []).length;
    }
    return m;
  }, [cats]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28">
      {/* ---------- header ---------- */}
      <div className="mb-8 text-center">
        <div className="ink-divider mx-auto mb-6" />
        <h1 className="stretch-word text-3xl font-black md:text-5xl">
          <span className="gold-text">{t.title || "گالری"}</span>
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{t.sub}</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[var(--fg)]/80">{t.intro}</p>
      </div>

      {/* ---------- sticky tabs + search ---------- */}
      <div className="glass-strong sticky top-[72px] z-30 -mx-2 mb-8 rounded-2xl border border-[var(--line)] px-3 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="g-tabs flex flex-1 flex-wrap items-center gap-2">
            <button
              onClick={() => { setActive("all"); }}
              className={`g-tab ${active === "all" ? "g-tab-active" : ""}`}
            >
              ✦ {t.all || "همه"}
              <span className="g-tab-count">{counts.all}</span>
            </button>
            {cats.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`g-tab ${active === c.id ? "g-tab-active" : ""}`}>
                <span>{c.icon || "🖼️"}</span> {catTitle(c, locale)}
                <span className="g-tab-count">{counts[c.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative md:w-64">
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search || "جستجو…"}
              className="input !rounded-full !py-2.5 pe-10 text-sm"
            />
            <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--muted)]" style={{ insetInlineEnd: "0.9rem" }}>
              {q ? "✕" : "🔍"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- masonry grid ---------- */}
      {visible.length === 0 ? (
        <div className="card p-16 text-center text-sm text-[var(--muted)]">{q ? t.noResult : t.empty}</div>
      ) : (
        <div className="g-grid">
          {visible.map(({ cat, img }, i) => (
            <button
              key={`${cat.id}-${img.id}-${i}`}
              onClick={() => setLb(i)}
              className="g-item group relative mb-4 block w-full overflow-hidden rounded-xl border border-[var(--line)] bg-black/30 text-start"
              aria-label={img.caption || catTitle(cat, locale)}
            >
              <img
                src={img.src}
                alt={img.caption || catTitle(cat, locale)}
                loading="lazy"
                onError={onImgError}
                className="w-full transition-transform duration-[1200ms] [transition-timing-function:cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.06]"
              />
              <span className="g-item-veil absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {img.caption && <span className="block truncate text-[13px] font-bold text-[#f5f0e8]">{img.caption}</span>}
                <span className="mt-0.5 block text-[10px] text-[#e5c878]/90">
                  {catTitle(cat, locale)}{img.desc ? ` · ${img.desc}` : ""}
                </span>
              </span>
              <span className="absolute top-2 grid h-7 w-7 place-items-center rounded-full border border-[#c9a84c]/50 bg-black/60 text-[11px] text-[#e5c878] opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100" style={{ insetInlineEnd: "0.5rem" }}>⤢</span>
            </button>
          ))}
        </div>
      )}

      {/* ---------- lightbox ---------- */}
      {cur && (
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 backdrop-blur-md"
          style={{ animation: "lbIn .3s cubic-bezier(.2,.8,.2,1) both" }}
          onClick={() => setLb(null)}
        >
          <button
            onClick={() => setLb(null)}
            aria-label="close"
            className="absolute top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-[#c9a84c]/50 bg-black/70 text-lg text-[#e5c878] transition hover:scale-110 hover:bg-[#c41e24]/30"
            style={{ insetInlineEnd: "1rem" }}
          >
            ✕
          </button>

          <div className="absolute top-5 text-xs tracking-wider text-[#c9a84c]" style={{ insetInlineStart: "1.25rem" }}>
            {lb! + 1} / {visible.length}
          </div>

          {lb! > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLb(lb! - 1); }}
              aria-label="prev"
              className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#c9a84c]/40 bg-black/60 text-xl text-[#e5c878] backdrop-blur-sm transition hover:scale-110 hover:border-[#c9a84c]"
              style={{ insetInlineStart: "0.75rem" }}
            >
              {rtl ? "›" : "‹"}
            </button>
          )}
          {lb! < visible.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLb(lb! + 1); }}
              aria-label="next"
              className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#c9a84c]/40 bg-black/60 text-xl text-[#e5c878] backdrop-blur-sm transition hover:scale-110 hover:border-[#c9a84c]"
              style={{ insetInlineEnd: "0.75rem" }}
            >
              {rtl ? "‹" : "›"}
            </button>
          )}

          <figure
            className="max-h-[92vh] max-w-[94vw]"
            style={{ animation: "lbZoom .35s cubic-bezier(.2,.8,.2,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={cur.img.src}
              alt={cur.img.caption || ""}
              onError={onImgError}
              className="max-h-[80vh] max-w-full rounded-xl border border-[#c9a84c]/35 object-contain shadow-[0_30px_120px_-30px_rgba(201,168,76,0.4)]"
            />
            {(cur.img.caption || cur.img.desc) && (
              <figcaption className="mt-3 text-center">
                {cur.img.caption && <div className="gold-text text-sm font-bold">{cur.img.caption}</div>}
                {cur.img.desc && <div className="mt-1 text-xs text-[var(--muted)]">{cur.img.desc}</div>}
                <div className="mt-1 text-[10px] tracking-widest text-[#c9a84c]/70">{catTitle(cur.cat, locale)}</div>
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
