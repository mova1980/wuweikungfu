import Image from "next/image";
import Link from "next/link";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import { Counter, Typewriter } from "@/components/Motion";
import EnergyButton from "@/components/EnergyButton";
import HeroMedia from "@/components/HeroMedia";
import YinYang from "@/components/YinYang";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const [content, posts, techniques] = await Promise.all([
    readCollection<any>("content"),
    readCollection<any[]>("posts"),
    readCollection<any[]>("techniques"),
  ]);

  const stats = content.stats || { students: 350, years: 25, styles: 8, medals: 40 };
  const slogan = pick(content.hero?.slogan, locale) || dict.hero.slogan;
  const slogan2 = pick(content.hero?.slogan2, locale) || dict.hero.slogan2;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <HeroMedia />
        <div className="hero-vignette absolute inset-0" />
        <div className="kanji-watermark top-28 hidden text-[11rem] opacity-40 ltr:right-4 rtl:left-4 md:block lg:text-[15rem]">無為</div>

        {/* vertical Chinese brush column — WU WEI KUNG FU */}
        <div className="pointer-events-none absolute top-1/2 z-10 hidden -translate-y-1/2 select-none flex-col items-center gap-4 ltr:left-5 rtl:right-5 xl:flex" aria-hidden>
          <span className="vertical-zh font-zh text-4xl font-black text-[#e5c878]/90" style={{ textShadow: "0 0 24px rgba(201,168,76,0.5)" }}>
            無為功夫
          </span>
          <span className="h-16 w-px bg-gradient-to-b from-[#c9a84c] to-transparent" />
          <span className="vertical-zh text-[10px] uppercase tracking-[0.5em] text-[#c9a84c]/70" style={{ textOrientation: "mixed" }}>
            WU WEI KUNG FU
          </span>
        </div>

        {/* central display title */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-40 pt-28 text-center">
          <h1 className="[text-wrap:balance]">
            <span className="hero-line1 block text-2xl font-bold tracking-wide md:text-4xl" style={{ color: "#f5f0e8" }}>
              {dict.hero.line1}
            </span>
            <span className="hero-wuwei mt-4 block text-6xl font-black leading-none sm:text-7xl md:text-8xl lg:text-9xl">
              {dict.hero.line2}
            </span>
          </h1>
          <div className="hero-brush mx-auto mt-8 w-48 md:w-72" />

          {/* mobile CTA (in-flow, centered) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:hidden">
            <EnergyButton href={`/${locale}/register`}>{dict.hero.cta}</EnergyButton>
            <EnergyButton href={`/${locale}/about`} variant="ghost">{dict.hero.cta2}</EnergyButton>
          </div>
        </div>

        {/* desktop CTA — bottom corner, mirroring the AI assistant on the other side */}
        <div className="absolute bottom-24 z-20 hidden flex-col items-stretch gap-3 sm:flex" style={{ insetInlineStart: "1.25rem" }}>
          <EnergyButton href={`/${locale}/register`}>{dict.hero.cta}</EnergyButton>
          <EnergyButton href={`/${locale}/about`} variant="ghost">{dict.hero.cta2}</EnergyButton>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
          <div className="mx-auto h-12 w-px animate-pulse bg-gradient-to-b from-transparent via-[#c9a84c] to-transparent" />
          <div className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]/80">{dict.hero.scroll}</div>
        </div>
      </section>

      {/* marquee — the silk scroll ribbon */}
      <div className="relative z-10 overflow-hidden border-y border-[var(--line)] bg-[var(--bg-2)]/80 py-3">
        <div className="marquee flex w-max gap-12 whitespace-nowrap text-sm text-[#c9a84c]/70">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-12">
              {["無為 Wu Wei", "☯ Yin · Yang", "氣 Chi", "詠春 Wing Chun", "功夫 Kung Fu", "道 Tao", "黐手 Chi Sau", "木人樁 Muk Yan Jong", "三節棍 Sanjiegun", "氣功 Qigong"].map((t) => (
                <span key={t} className="tracking-widest">{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ============ STATS ============ */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [stats.students, "+", dict.stats.students],
            [stats.years, "+", dict.stats.years],
            [stats.styles, "", dict.stats.styles],
            [stats.medals, "+", dict.stats.medals],
          ].map(([n, suf, label], i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="card hard-edge p-6 text-center">
                <div className="gold-text text-4xl font-black md:text-5xl">
                  <Counter to={Number(n)} suffix={String(suf)} />
                </div>
                <div className="mt-2 text-xs text-[var(--muted)]">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ Layer 2: INTRO — typewriter ============ */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center">
        <Reveal>
          <div className="ink-divider mx-auto mb-6" />
          <h2 className="mb-8 text-3xl font-black md:text-4xl">
            <span className="stretch-word">{dict.home.introTitle}</span>
          </h2>
        </Reveal>
        <p className="min-h-32 text-lg leading-9 text-[var(--fg)]/85">
          <Typewriter text={dict.home.intro} />
        </p>
        <Reveal delay={200}>
          <blockquote className="card soft-edge relative mt-10 overflow-hidden p-8 text-start leading-9 text-[var(--muted)]">
            <div className="kanji-watermark -bottom-8 text-[10rem] ltr:-right-2 rtl:-left-2">水</div>
            {dict.home.philosophy}
          </blockquote>
        </Reveal>
      </section>

      {/* ============ THE THREE LAYERS — cinematic scrollytelling ============ */}
      <section className="relative z-10 py-20">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-6" />
          <h2 className="text-3xl font-black md:text-4xl">{dict.home.layers}</h2>
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {/* Layer 1 — hardness: sharp deconstructed grid */}
          <Reveal delay={0}>
            <Link href={`/${locale}/techniques`} className="sheen group relative block h-[430px] overflow-hidden hard-edge border border-[#c41e24]/30">
              <Image src="/images/kick.jpg" alt="" fill className="img-gold object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-7">
                <div className="mb-2 font-zh text-5xl font-black text-[#c41e24]">力</div>
                <h3 className="text-2xl font-black text-white">{dict.home.layer1}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{dict.home.layer1d}</p>
              </div>
            </Link>
          </Reveal>
          {/* Layer 2 — technique */}
          <Reveal delay={150}>
            <Link href={`/${locale}/techniques`} className="sheen group relative block h-[430px] overflow-hidden rounded-2xl border border-[#c9a84c]/30 md:mt-10">
              <Image src="/images/dummy.jpg" alt="" fill className="img-gold object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-7">
                <div className="mb-2 font-zh text-5xl font-black text-[#c9a84c]">衡</div>
                <h3 className="text-2xl font-black text-white">{dict.home.layer2}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{dict.home.layer2d}</p>
              </div>
            </Link>
          </Reveal>
          {/* Layer 3 — stillness: organic curves, indigo */}
          <Reveal delay={300}>
            <Link href={`/${locale}/about`} className="sheen group relative block h-[430px] overflow-hidden soft-edge border border-[#3a6ea5]/40 md:mt-20">
              <Image src="/images/qigong.jpg" alt="" fill className="img-gold object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101c28] via-[#101c28]/40 to-transparent" />
              <div className="absolute bottom-0 p-7">
                <div className="mb-2 font-zh text-5xl font-black text-[#6f9fd8]">化</div>
                <h3 className="text-2xl font-black text-white">{dict.home.layer3}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{dict.home.layer3d}</p>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ SLOGAN BAND ============ */}
      <section className="relative z-10 overflow-hidden py-20">
        <div className="kanji-watermark left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[13rem] md:text-[18rem]">水</div>
        <Reveal variant="scale" className="relative text-center">
          <div className="ink-divider mx-auto mb-8" />
          <p className="slogan-shimmer mx-auto max-w-4xl px-4 text-3xl font-black leading-relaxed md:text-5xl md:leading-relaxed">
            « {slogan} »
          </p>
          <div className="mt-6 text-sm tracking-[0.4em] text-[var(--muted)]">無為 · WU WEI · 功夫</div>
          <div className="ink-divider mx-auto mt-8" />
        </Reveal>
      </section>

      {/* ============ BOOK ============ */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="card soft-edge grid items-center gap-10 overflow-hidden p-8 md:grid-cols-2 md:p-12">
          <Reveal variant="scale">
            <div className="group relative mx-auto h-[380px] w-[270px] animate-float">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-[#c9a84c]/20 blur-3xl" />
              <Image src="/images/book.jpg" alt="Qigong book" fill className="rounded-xl object-cover shadow-[0_30px_80px_-20px_rgba(201,168,76,0.5)] transition duration-700 group-hover:rotate-2 group-hover:scale-105" />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <div className="badge mb-4">📖 氣功</div>
              <h2 className="gold-text text-3xl font-black md:text-4xl">{dict.home.bookTitle}</h2>
              <p className="mt-5 leading-8 text-[var(--muted)]">{dict.home.bookDesc}</p>
              <div className="mt-8">
                <EnergyButton href={`/${locale}/shop`}>{dict.home.bookCta}</EnergyButton>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ LATEST ============ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <div className="ink-divider mb-4" />
            <h2 className="text-3xl font-black">{dict.home.latest}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{dict.home.latestSub}</p>
          </div>
          <Link href={`/${locale}/blog`} className="badge hover:border-[#c9a84c]">{dict.home.viewAll} →</Link>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 130}>
              <Link href={`/${locale}/blog/${p.slug}`} className="card sheen group block overflow-hidden">
                <div className="relative h-52 overflow-hidden">
                  <Image src={p.image} alt={pick(p.title, locale)} fill className="img-gold object-cover" />
                  <span className="absolute top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-[#e5c878] backdrop-blur ltr:left-3 rtl:right-3">
                    {pick(p.category, locale)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold leading-7 transition group-hover:text-[#e5c878]">{pick(p.title, locale)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{pick(p.excerpt, locale)}</p>
                  <div className="mt-4 text-xs text-[#c9a84c]">{dict.home.readMore} →</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {/* technique chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {techniques.map((t) => (
            <Link key={t.id} href={`/${locale}/techniques#${t.slug}`} className="badge transition hover:scale-105 hover:border-[#c9a84c]">
              <span className="font-zh text-base">{t.icon}</span> {pick(t.title, locale)}
            </Link>
          ))}
        </div>
      </section>

      {/* ============ ESSENTIAL LINKS ============ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{dict.home.links.title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{dict.home.links.sub}</p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <a href="https://athlete.ifsm.ir/login" target="_blank" rel="noreferrer"
              className="card link-card sheen group flex items-center gap-5 overflow-hidden rounded-3xl p-7">
              <span className="link-icon grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-[#3E9B5F]/40 bg-[#3E9B5F]/10 text-[#5fc98a]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
                  <path d="M12 8v6M9 11h6" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="block text-lg font-black transition group-hover:text-[#e5c878]">{dict.home.links.insurance}</span>
                <span className="mt-1.5 block text-sm leading-6 text-[var(--muted)]">{dict.home.links.insuranceDesc}</span>
                <span className="badge mt-3 group-hover:border-[#c9a84c]">{dict.home.links.insuranceCta} ↗</span>
              </span>
            </a>
          </Reveal>
          <Reveal delay={150}>
            <a href="https://iranwushufed.ir/" target="_blank" rel="noreferrer"
              className="card link-card sheen group flex items-center gap-5 overflow-hidden rounded-3xl p-7">
              <span className="link-icon grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.1)] text-[#e5c878]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3 10h18M7 15h4" />
                  <circle cx="16.5" cy="15" r="1.4" />
                </svg>
              </span>
              <span className="flex-1">
                <span className="block text-lg font-black transition group-hover:text-[#e5c878]">{dict.home.links.wushu}</span>
                <span className="mt-1.5 block text-sm leading-6 text-[var(--muted)]">{dict.home.links.wushuDesc}</span>
                <span className="badge mt-3 group-hover:border-[#c9a84c]">{dict.home.links.wushuCta} ↗</span>
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 text-center">
        <Reveal variant="scale">
          <div className="card relative overflow-hidden rounded-3xl border-[#c9a84c]/30 p-14">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.14),transparent_60%)]" />
            <YinYang size={64} className="yinyang mx-auto mb-6" />
            <h2 className="slogan-shimmer mx-auto max-w-3xl text-2xl font-black leading-relaxed md:text-4xl md:leading-relaxed">« {slogan2} »</h2>
            <div className="mt-8">
              <EnergyButton href={`/${locale}/register`}>{dict.hero.cta}</EnergyButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
