"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export default function BlogList({ posts, locale, dict }: { posts: any[]; locale: Locale; dict: any }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const cats = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => s.add(pick(p.category, locale)));
    return Array.from(s);
  }, [posts, locale]);

  const filtered = posts.filter((p) => {
    const matchQ = !q || (pick(p.title, locale) + pick(p.excerpt, locale)).toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "all" || pick(p.category, locale) === cat;
    return matchQ && matchC;
  });

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.blog.searchPh} className="input" />
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setCat("all")} className={`badge transition ${cat === "all" ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>{dict.blog.all}</button>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`badge transition ${cat === c ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <Link href={`/${locale}/blog/${p.slug}`} className="card sheen group block overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src={p.image} alt={pick(p.title, locale)} fill className="img-gold object-cover" />
                <span className="absolute top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-[#e5c878] backdrop-blur ltr:left-3 rtl:right-3">{pick(p.category, locale)}</span>
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-center gap-3 text-[11px] text-[var(--muted)]">
                  <span>🗓 {p.date}</span><span>✍️ {pick(p.author, locale)}</span>
                </div>
                <h3 className="font-bold leading-7 transition group-hover:text-[#e5c878]">{pick(p.title, locale)}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{pick(p.excerpt, locale)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      {!filtered.length && <p className="mt-16 text-center text-[var(--muted)]">∅</p>}
    </>
  );
}
