import Link from "next/link";
import Image from "next/image";
import { getDict, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import EnergyButton from "@/components/EnergyButton";

export default function Corrective({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const c = dict.corrective;
  const icons = ["🧠", "🐢", "🌙", "🌀", "🦵", "🦶"];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">🦴 正骨</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{c.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{c.sub}</p>
      </Reveal>

      {/* intro */}
      <Reveal variant="scale">
        <div className="card soft-edge relative mx-auto mt-14 max-w-4xl overflow-hidden p-10">
          <div className="kanji-watermark -bottom-8 text-[10rem] ltr:-right-2 rtl:-left-2">衡</div>
          <div className="ink-divider mb-6" />
          <p className="text-lg leading-9 text-[var(--fg)]/88">{c.intro}</p>
        </div>
      </Reveal>

      {/* issues */}
      <section className="mt-20">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{c.issuesTitle}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(c.issues as [string, string][]).map(([title, desc], i) => (
            <Reveal key={i} delay={i * 90}>
              <div className={`card sheen group overflow-hidden p-6 ${i % 2 ? "soft-edge" : "hard-edge"}`}>
                <div className="mb-3 text-3xl transition-transform duration-500 group-hover:scale-125">{icons[i]}</div>
                <h3 className="font-black text-[#e5c878]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* steps */}
      <section className="mt-20">
        <Reveal className="text-center">
          <div className="ink-divider mx-auto mb-4" />
          <h2 className="text-3xl font-black">{c.stepsTitle}</h2>
        </Reveal>
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="absolute top-7 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent md:block" />
          <div className="grid gap-8 md:grid-cols-4">
            {(c.steps as [string, string][]).map(([title, desc], i) => (
              <Reveal key={i} delay={i * 140} className="text-center">
                <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#c9a84c] bg-[var(--bg)] text-lg font-black text-[#e5c878] shadow-[0_0_24px_rgba(201,168,76,0.4)]">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-black text-[#e5c878]">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + book note */}
      <Reveal variant="scale">
        <div className="card relative mx-auto mt-20 max-w-4xl overflow-hidden rounded-3xl border-[#c9a84c]/30 p-12 text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.14),transparent_60%)]" />
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-[#c41e24]/50 bg-[#c41e24]/10 text-2xl">🩺</div>
          <h2 className="gold-text text-2xl font-black md:text-3xl">{dict.assessment.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{dict.assessment.sub}</p>
          <div className="mt-7">
            <EnergyButton href={`/${locale}/assessment`}>{c.cta}</EnergyButton>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-2xl border border-[var(--line)] p-5">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
            <Image src="/images/book.jpg" alt="" fill className="object-cover" />
          </div>
          <p className="text-xs leading-6 text-[var(--muted)]">📖 {c.bookNote}</p>
          <Link href={`/${locale}/shop`} className="badge shrink-0 hover:border-[#c9a84c]">→</Link>
        </div>
      </Reveal>
    </div>
  );
}
