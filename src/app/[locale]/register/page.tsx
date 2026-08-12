import { getDict, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import RegisterClient from "@/components/RegisterClient";

export default function Register({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">⚡ 入門</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.register.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.register.sub}</p>
      </Reveal>
      <RegisterClient locale={locale} dict={dict} />
    </div>
  );
}
