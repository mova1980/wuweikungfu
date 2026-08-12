import Image from "next/image";
import Link from "next/link";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function Events({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const events = await readCollection<any[]>("events");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">🏆 賽</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.events.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.events.sub}</p>
      </Reveal>

      <div className="mt-14 space-y-8">
        {events.map((e, i) => {
          const d = new Date(e.date);
          return (
            <Reveal key={e.id} delay={i * 120}>
              <div className="card sheen group grid overflow-hidden md:grid-cols-[280px_1fr]">
                <div className="relative h-52 md:h-auto">
                  <Image src={e.image} alt={pick(e.title, locale)} fill className="img-gold object-cover" />
                  <div className="absolute top-3 rounded-xl bg-black/70 px-3 py-2 text-center backdrop-blur ltr:left-3 rtl:right-3">
                    <div className="gold-text text-2xl font-black leading-none">{d.getDate()}</div>
                    <div className="text-[10px] text-white/70">{d.toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US", { month: "short", year: "numeric" })}</div>
                  </div>
                </div>
                <div className="flex flex-col p-7">
                  <h2 className="text-xl font-black transition group-hover:text-[#e5c878]">{pick(e.title, locale)}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">{pick(e.desc, locale)}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <span className="badge">📍 {pick(e.location, locale)}</span>
                    <span className="badge">🗓 {dict.events.date}: {e.date}</span>
                    <span className="badge">👥 {dict.events.capacity}: {e.capacity}</span>
                  </div>
                  <div className="mt-5">
                    <Link href={`/${locale}/register`} className="btn-energy inline-block rounded-full bg-gradient-to-l from-[#c9a84c] to-[#9a7b2e] px-6 py-2.5 text-xs font-black text-black transition hover:scale-105">
                      {dict.events.register} ⚡
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
