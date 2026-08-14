import { notFound } from "next/navigation";
import { isLocale, getDict, dirOf, type Locale } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnergyField from "@/components/EnergyField";
import ScrollMood from "@/components/ScrollMood";
import ChatWidget from "@/components/ChatWidget";

export function generateStaticParams() {
  return [{ locale: "fa" }, { locale: "en" }, { locale: "zh" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDict(locale);
  const dir = dirOf(locale);
  const font = locale === "fa" ? "font-fa" : locale === "zh" ? "font-zh" : "font-latin";

  return (
    <div dir={dir} lang={locale} className={`${font} min-h-screen`}>
      <EnergyField locale={locale} />
      <ScrollMood labels={{ mood: dict.misc.mood, calm: dict.misc.moodCalm, aggr: dict.misc.moodAggr, neutral: dict.misc.moodNeutral }} />
      <Navbar locale={locale} dict={dict} />
      <main className="relative z-10">{children}</main>
      <Footer locale={locale} dict={dict} />
      <ChatWidget locale={locale} dict={dict} />
    </div>
  );
}
