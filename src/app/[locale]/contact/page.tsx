import { getDict, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import ContactClient from "@/components/ContactClient";

export default function Contact({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">✉️ 聯</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.contact.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.contact.sub}</p>
      </Reveal>
      <ContactClient locale={locale} dict={dict} />
    </div>
  );
}
