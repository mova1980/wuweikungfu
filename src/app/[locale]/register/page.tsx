import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import RegisterClient from "@/components/RegisterClient";

export const dynamic = "force-dynamic";

export default async function Register({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const [content, events] = await Promise.all([
    readCollection<any>("content"),
    readCollection<any[]>("events"),
  ]);
  const seminars = (Array.isArray(events) ? events : [])
    .slice()
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .map((e) => ({ id: e.id, date: e.date, title: e.title, location: e.location }));

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">⚡ 入門</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.register.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.register.sub}</p>
      </Reveal>
      <RegisterClient locale={locale} dict={dict} pricing={content?.pricing} seminars={seminars} />
    </div>
  );
}
