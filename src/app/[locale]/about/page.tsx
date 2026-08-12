import Image from "next/image";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import EnergyButton from "@/components/EnergyButton";

export const dynamic = "force-dynamic";

export default async function About({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const content = await readCollection<any>("content");
  const gallery = ["/images/class.jpg", "/images/dummy.jpg", "/images/kick.jpg", "/images/weapons.jpg", "/images/qigong.jpg", "/images/hero.jpg"];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      {/* header */}
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">☯ {dict.about.title}</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.about.sifuTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{dict.about.sifuRole}</p>
      </Reveal>

      {/* sifu bio */}
      <section className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <Reveal variant="scale">
          <div className="group relative h-[520px] overflow-hidden hard-edge border border-[var(--line)]">
            <Image src="/images/sifu.jpg" alt="Sifu Ehsan Shayanfar" fill className="img-gold object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="kanji-watermark bottom-4 text-[7rem] ltr:right-4 rtl:left-4">師父</div>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <div className="ink-divider mb-6" />
            <p className="text-lg leading-9 text-[var(--fg)]/90">{dict.about.sifuBio}</p>
          </Reveal>
          <Reveal delay={200}>
            <h3 className="mt-10 mb-4 font-black text-[#e5c878]">{dict.about.honors}</h3>
            <ul className="space-y-3">
              {(content.honors || []).map((h: any, i: number) => (
                <li key={i} className="card flex items-center gap-3 rounded-xl p-3.5 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(201,168,76,0.15)] text-[#e5c878]">✦</span>
                  {pick(h, locale)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* timeline */}
      <section className="mt-24">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{dict.about.timeline}</h2>
        </Reveal>
        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="timeline-line absolute top-0 h-full ltr:left-4 rtl:right-4 md:ltr:left-1/2 md:rtl:right-1/2" />
          {(content.timeline || []).map((t: any, i: number) => (
            <Reveal key={i} delay={i * 80}>
              <div className={`relative mb-10 flex ps-12 md:w-1/2 md:ps-0 ${i % 2 ? "md:ms-auto md:ps-12" : "md:pe-12 md:text-end rtl:md:text-start"}`}>
                <span className="belt-dot absolute top-1 h-3.5 w-3.5 rounded-full bg-[#c9a84c] text-[#c9a84c] ltr:left-[9px] rtl:right-[9px] md:ltr:left-auto md:rtl:right-auto"
                  style={{ [i % 2 ? "insetInlineStart" : "insetInlineEnd"]: "-7px" } as any} />
                <div className="card w-full rounded-xl p-5">
                  <div className="text-xs font-bold text-[#c9a84c]">{t.year}</div>
                  <div className="mt-1.5 text-sm leading-7">{pick(t, locale)}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* philosophy */}
      <section className="mt-20">
        <Reveal variant="scale">
          <div className="card soft-edge relative overflow-hidden p-10 md:p-14">
            <div className="kanji-watermark -top-10 text-[14rem] ltr:-right-6 rtl:-left-6">無為</div>
            <div className="ink-divider mb-6" />
            <h2 className="text-3xl font-black text-[#e5c878]">{dict.about.philosophyTitle}</h2>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[var(--fg)]/85">{dict.home.philosophy}</p>
          </div>
        </Reveal>
      </section>

      {/* book */}
      <section className="mt-20 grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <div className="badge mb-4">📖 氣功</div>
          <h2 className="gold-text text-3xl font-black">{dict.about.bookTitle}</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">{dict.home.bookDesc}</p>
          <div className="mt-7">
            <EnergyButton href={`/${locale}/shop`}>{dict.home.bookCta}</EnergyButton>
          </div>
        </Reveal>
        <Reveal variant="scale">
          <div className="relative mx-auto h-[400px] w-[290px] animate-float">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-[#c9a84c]/20 blur-3xl" />
            <Image src="/images/book.jpg" alt="book" fill className="rounded-xl object-cover shadow-2xl" />
          </div>
        </Reveal>
      </section>

      {/* coaches */}
      <section className="mt-24">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{locale === "fa" ? "تیم مربیان" : locale === "zh" ? "教练团队" : "Coaching Team"}</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {(content.coaches || []).map((c: any, i: number) => (
            <Reveal key={i} delay={i * 130}>
              <div className="card rounded-2xl p-7 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.08)] text-2xl">🥋</div>
                <div className="font-bold text-[#e5c878]">{pick(c.name, locale)}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">{pick(c, locale)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* gallery */}
      <section className="mt-24">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{dict.about.galleryTitle}</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((src, i) => (
            <Reveal key={src} delay={i * 90} variant="scale">
              <div className={`group relative h-56 overflow-hidden ${i % 2 ? "soft-edge" : "hard-edge"} border border-[var(--line)]`}>
                <Image src={src} alt="gallery" fill className="img-gold object-cover" />
                <div className="absolute inset-0 bg-black/25 opacity-0 transition group-hover:opacity-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
