import Link from "next/link";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function NewsPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const news = await readCollection<any[]>("news");
  const sorted = [...(Array.isArray(news) ? news : [])].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  const [featured, ...rest] = sorted;

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
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">日消息</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.news.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.news.sub}</p>
        <div className="ink-divider mx-auto mt-6" />
      </Reveal>

      {!sorted.length ? (
        <div className="card mt-14 p-16 text-center text-sm text-[var(--muted)]">{dict.news.empty}</div>
      ) : (
        <>
          {/* featured — latest / pinned */}
          {featured && (
            <Reveal variant="scale" className="mt-14">
              <Link href={`/${locale}/news/${featured.id}`} className="card sheen group grid overflow-hidden rounded-3xl lg:grid-cols-2">
                <div className={`relative h-64 overflow-hidden lg:h-auto ${featured.image ? "" : "grid place-items-center bg-[linear-gradient(140deg,rgba(201,168,76,0.14),rgba(196,30,36,0.08))]"} `}>
                  {featured.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.image} alt={pick(featured.title, locale)} className="img-gold h-full w-full object-cover" />
                  ) : (
                    <span className="font-zh text-7xl font-black text-[#c9a84c]/40">消息</span>
                  )}
                  {Boolean(featured.pinned) && (
                    <span className="badge absolute top-3 border-[#c41e24]/50 bg-black/70 backdrop-blur-sm" style={{ insetInlineStart: "0.75rem" }}>📌</span>
                  )}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <div className="text-[11px] font-bold tracking-wider text-[#c9a84c]">{fmtDate(featured.date)}</div>
                  <h2 className="mt-3 text-2xl font-black leading-9 transition group-hover:text-[#e5c878] md:text-3xl">
                    {pick(featured.title, locale)}
                  </h2>
                  <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{pick(featured.summary, locale)}</p>
                  <div className="mt-6 text-xs font-bold text-[#c9a84c]">{dict.news.readMore} →</div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* the rest */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((n, i) => (
              <Reveal key={n.id} delay={i * 120}>
                <Link href={`/${locale}/news/${n.id}`} className="card sheen group flex h-full flex-col overflow-hidden rounded-2xl">
                  <div className={`relative h-44 overflow-hidden ${n.image ? "" : "grid place-items-center bg-[linear-gradient(140deg,rgba(201,168,76,0.1),transparent)]"}`}>
                    {n.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.image} alt={pick(n.title, locale)} className="img-gold h-full w-full object-cover" />
                    ) : (
                      <span className="font-zh text-5xl font-black text-[#c9a84c]/30">消息</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[10px] font-bold tracking-wider text-[#c9a84c]">{fmtDate(n.date)}</div>
                    <h3 className="mt-2 font-bold leading-7 transition group-hover:text-[#e5c878]">{pick(n.title, locale)}</h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--muted)]">{pick(n.summary, locale)}</p>
                    <div className="mt-4 text-xs text-[#c9a84c]">{dict.news.readMore} →</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
