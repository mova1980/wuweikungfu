"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { formatJalali, isoToJalali, J_MONTHS } from "@/lib/jalali";

type Img = { id: string; src: string; caption?: string; desc?: string; date?: string };
type Cat = { id: string; title: string; titleEn?: string; titleZh?: string; icon?: string; order?: number; images: Img[] };

const PLACEHOLDER = "/images/gallery/placeholder.svg";

export function catTitle(c: Cat, locale: Locale) {
  if (locale === "fa") return c.title;
  if (locale === "zh") return c.titleZh || c.title;
  return c.titleEn || c.title;
}

/** localized date label — Shamsi for fa, Gregorian for en/zh */
function dateLabel(iso: string | undefined, locale: Locale): string {
  if (!iso) return "";
  if (locale === "fa") return formatJalali(iso);
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-GB", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

/** every searchable form of the date (iso, jalali fa/latin digits, month name, years) */
function dateHaystack(iso: string | undefined): string {
  if (!iso) return "";
  const j = isoToJalali(iso);
  const parts = [iso, iso.replace(/-/g, "/")];
  if (j) {
    parts.push(formatJalali(iso, false));            // 20 Shahrivar 1405 (latin)
    parts.push(String(j.jy), String(j.jy + 621));    // jalali + gregorian year
    parts.push(J_MONTHS[j.jm - 1]);                  // month name
    const fa = formatJalali(iso, true);
    parts.push(fa, fa.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))); // fa digits + latin
  }
  return parts.join(" ");
}

export default function GalleryClient({ locale, dict, cats }: { locale: Locale; dict: any; cats: Cat[] }) {
  const rtl = locale === "fa";
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [lb, setLb] = useState<number | null>(null); // index into visible list
  const searchRef = useRef<HTMLInputElement>(null);

  const t = dict.gallery || {};

  const visible = useMemo(() => {
    const base = active === "all" ? cats : cats.filter((c) => c.id === active);
    let items: { cat: Cat; img: Img; i: number }[] = [];
    let n = 0;
    for (const c of base) for (const img of c.images || []) items.push({ cat: c, img, i: n++ });
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter(({ img, cat }) =>
        (img.caption || "").toLowerCase().includes(s) ||
        (img.desc || "").toLowerCase().includes(s) ||
        dateHaystack(img.date).toLowerCase().includes(s) ||
        catTitle(cat, locale).toLowerCase().includes(s));
    }
    // sort: dated items by date; undated (legacy) keep original order
    const dated = items.filter((x) => Boolean(x.img.date));
    const undated = items.filter((x) => !Boolean(x.img.date));
    dated.sort((a, b) =>
      sort === "new"
        ? String(b.img.date).localeCompare(String(a.img.date)) || b.i - a.i
        : String(a.img.date).localeCompare(String(b.img.date)) || a.i - b.i);
    return sort === "new" ? [...dated, ...undated] : [...undated, ...dated];
  }, [cats, active, q, sort, locale]);

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

      {/* ---------- sticky tabs + search + sort ---------- */}
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
          <div className="flex items-center gap-2">
            {/* sort — newest / oldest */}
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--line)] p-1" role="group" aria-label="sort">
              {(["new", "old"] as const).map((k) => (
                <button key={k} onClick={() => setSort(k)} title={k === "new" ? t.sortNewest : t.sortOldest}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${sort === k
                    ? "bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] text-black shadow"
                    : "text-[var(--muted)] hover:text-[#e5c878]"}`}>
                  {k === "new" ? "↑" : "↓"} {k === "new" ? t.sortNewest : t.sortOldest}
                </button>
              ))}
            </div>
            <div className="relative flex-1 md:w-56">
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
              {/* date chip — always visible */}
              {img.date && (
                <span className="absolute top-2 rounded-full border border-[#c9a84c]/40 bg-black/65 px-2.5 py-1 text-[10px] font-bold text-[#e5c878] backdrop-blur-sm"
                  style={{ insetInlineStart: "0.5rem" }}>
                  📅 {dateLabel(img.date, locale)}
                </span>
              )}
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
            {(cur.img.caption || cur.img.desc || cur.img.date) && (
              <figcaption className="mt-3 text-center">
                {cur.img.caption && <div className="gold-text text-sm font-bold">{cur.img.caption}</div>}
                {cur.img.desc && <div className="mt-1 text-xs text-[var(--muted)]">{cur.img.desc}</div>}
                {cur.img.date && (
                  <div className="mx-auto mt-2 w-fit rounded-full border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.08)] px-3 py-1 text-[11px] font-bold text-[#e5c878]">
                    📅 {dateLabel(cur.img.date, locale)}
                  </div>
                )}
                <div className="mt-1.5 text-[10px] tracking-widest text-[#c9a84c]/70">{catTitle(cur.cat, locale)}</div>
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
