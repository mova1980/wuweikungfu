"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type Locale } from "@/lib/i18n";

export default function SearchClient({ locale, dict }: { locale: Locale; dict: any }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}&type=${type}`);
      setResults(await res.json());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, type, locale]);

  const hrefOf = (r: any) =>
    r.type === "post" ? `/${locale}/blog/${r.slug}` :
    r.type === "technique" ? `/${locale}/techniques#${r.slug}` :
    r.type === "video" ? `/${locale}/videos` :
    r.type === "event" ? `/${locale}/events` : `/${locale}/shop`;

  const highlight = (text: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-[#c9a84c]/40 px-0.5 text-[#f0d98c]">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div className="relative">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.searchPage.ph}
          className="input py-4 text-lg shadow-[0_0_50px_-15px_rgba(201,168,76,0.4)]" />
        <span className="absolute top-1/2 -translate-y-1/2 text-[#c9a84c] ltr:right-4 rtl:left-4">{loading ? "⏳" : "🔍"}</span>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["all", "post", "technique", "video", "event", "product"].map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`badge ${type === t ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>
            {t === "all" ? dict.blog.all : dict.searchPage.types[t]}
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {q.length >= 2 && !loading && (
          <p className="text-center text-xs text-[var(--muted)]">{results.length} {dict.searchPage.results}</p>
        )}
        {results.map((r, i) => (
          <Link key={i} href={hrefOf(r)} className="card block rounded-xl p-5 transition hover:border-[#c9a84c]">
            <div className="flex items-center gap-3">
              <span className="badge shrink-0">{dict.searchPage.types[r.type]}</span>
              <div>
                <div className="font-bold">{highlight(r.title)}</div>
                {r.snippet && <div className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{highlight(r.snippet)}</div>}
              </div>
            </div>
          </Link>
        ))}
        {q.length >= 2 && !loading && results.length === 0 && (
          <p className="py-10 text-center text-[var(--muted)]">{dict.searchPage.none}</p>
        )}
      </div>
    </div>
  );
}
