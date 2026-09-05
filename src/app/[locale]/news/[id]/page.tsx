import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function NewsDetail({ params }: { params: { locale: Locale; id: string } }) {
  const { locale, id } = params;
  const dict = getDict(locale);
  const news = await readCollection<any[]>("news");
  const item = (Array.isArray(news) ? news : []).find((n) => String(n.id) === String(id));
  if (!item) notFound();

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <article className="mx-auto max-w-3xl px-4 pb-10 pt-32">
      <Reveal>
        <div className="flex items-center justify-between">
          <Link href={`/${locale}/news`} className="badge hover:border-[#c9a84c]">→ {dict.news.back}</Link>
          <div className="text-[11px] font-bold tracking-wider text-[#c9a84c]">{fmtDate(item.date)}</div>
        </div>
        <h1 className="gold-text mt-6 text-3xl font-black leading-[1.6] md:text-4xl md:leading-[1.6]">{pick(item.title, locale)}</h1>
        <div className="ink-divider mt-6" />
      </Reveal>

      {item.image && (
        <Reveal variant="scale" className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-[#c9a84c]/35">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={pick(item.title, locale)} className="w-full object-cover" />
          </div>
        </Reveal>
      )}

      <Reveal delay={150}>
        <p className="mt-8 text-base font-bold leading-9 text-[#e5c878]">{pick(item.summary, locale)}</p>
        <div className="mt-4 space-y-5">
          {String(pick(item.body, locale) || "").split(/\n+/).filter(Boolean).map((p, i) => (
            <p key={i} className="text-[15px] leading-9 text-[var(--fg)]/88">{p}</p>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
