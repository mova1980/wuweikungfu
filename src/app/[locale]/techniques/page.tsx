import Image from "next/image";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import BeltIcon from "@/components/BeltIcon";

export const dynamic = "force-dynamic";

export default async function Techniques({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const [techniques, content] = await Promise.all([
    readCollection<any[]>("techniques"),
    readCollection<any>("content"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">功夫</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.tech.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.tech.sub}</p>
      </Reveal>

      {/* six pillars — alternating hard/soft edges (yin-yang dialogue) */}
      <div className="mt-16 space-y-16">
        {techniques.map((t, i) => (
          <Reveal key={t.id}>
            <section id={t.slug} className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? "lg:[direction:ltr]" : ""}`}>
              <div className={`group relative h-80 overflow-hidden border border-[var(--line)] ${i < 3 ? "hard-edge" : "soft-edge"}`} dir="ltr">
                <Image src={t.image} alt={pick(t.title, locale)} fill className="img-gold object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="kanji-watermark bottom-2 right-4 text-[8rem]">{t.icon}</div>
              </div>
              <div dir={locale === "fa" ? "rtl" : "ltr"}>
                <div className="flex items-center gap-3">
                  <span className="font-zh grid h-12 w-12 place-items-center rounded-xl border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.08)] text-xl text-[#e5c878]">{t.icon}</span>
                  <h2 className="text-2xl font-black md:text-3xl">{pick(t.title, locale)}</h2>
                </div>
                <p className="mt-5 leading-8 text-[var(--muted)]">{pick(t.desc, locale)}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="badge">🎯 {dict.tech.level}: {pick(t.level, locale)}</span>
                </div>
                <h4 className="mt-6 mb-3 text-sm font-bold text-[#e5c878]">{dict.tech.keys}</h4>
                <ul className="space-y-2">
                  {(t.keys?.[locale] || t.keys?.fa || []).map((k: string, j: number) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-[var(--fg)]/85">
                      <span className="h-1.5 w-1.5 rotate-45 bg-[#c9a84c]" /> {k}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>
        ))}
      </div>

      {/* belt path — luminous path */}
      <section className="mt-28">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{dict.tech.belts}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{dict.tech.beltsSub}</p>
        </Reveal>
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute top-7 h-0.5 w-full bg-gradient-to-r from-[#f5f0e8]/30 via-[#c9a84c] to-[#1c1c1e]" />
          <div className="grid grid-cols-4 gap-y-10 md:grid-cols-8">
            {(content.belts || []).map((b: any, i: number) => (
              <Reveal key={i} delay={i * 120} className="text-center">
                <div className="relative z-10 mx-auto w-fit">
                  <BeltIcon color={b.color} />
                </div>
                <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{pick(b, locale)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* schedule */}
      <section className="mt-24">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{dict.tech.schedule}</h2>
        </Reveal>
        <Reveal variant="scale">
          <div className="card mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[rgba(201,168,76,0.06)] text-[#e5c878]">
                  <th className="p-4 text-start">{locale === "fa" ? "روزها" : locale === "zh" ? "日期" : "Days"}</th>
                  <th className="p-4 text-start">{locale === "fa" ? "ساعت" : locale === "zh" ? "时间" : "Time"}</th>
                  <th className="p-4 text-start">{dict.register.level}</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                {(dict.register.times as string[]).map((t, i) => (
                  <tr key={i} className="border-b border-[var(--line)]/50 transition hover:bg-[rgba(201,168,76,0.05)]">
                    <td className="p-4">{t.split(" ")[0]}</td>
                    <td className="p-4" dir="ltr">{t.split(" ").slice(1).join(" ")}</td>
                    <td className="p-4">{(dict.register.levels as string[])[i] || dict.register.levels[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
