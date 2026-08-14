import Image from "next/image";
import { getDict, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import AssessmentForm from "@/components/AssessmentForm";

export default function Assessment({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4 border-[#c41e24]/50 bg-[#c41e24]/10 !text-[#ff8a85]">🩺 {dict.assessment.badge}</div>
        <h1 className="gold-text mx-auto max-w-3xl text-3xl font-black leading-snug md:text-5xl md:leading-snug">{dict.assessment.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.assessment.sub}</p>
      </Reveal>

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="card sheen relative overflow-hidden rounded-3xl">
              <div className="relative h-64">
                <Image src="/images/qigong.jpg" alt="" fill className="img-gold object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="kanji-watermark bottom-2 text-[6rem] ltr:right-3 rtl:left-3">正</div>
              </div>
              <div className="p-7">
                <p className="leading-8 text-[var(--fg)]/88">{dict.assessment.pitch}</p>
              </div>
            </div>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {(dict.assessment.benefits as string[]).map((b, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="card flex items-center gap-3 rounded-2xl p-4 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(201,168,76,0.15)] text-[#e5c878]">✦</span>
                  <span className="leading-6">{b}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150} variant="scale">
          <AssessmentForm locale={locale} dict={dict} />
        </Reveal>
      </div>
    </div>
  );
}
