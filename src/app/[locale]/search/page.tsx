import { getDict, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import SearchClient from "@/components/SearchClient";

export default function Search({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">🔍 尋</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.searchPage.title}</h1>
      </Reveal>
      <SearchClient locale={locale} dict={dict} />
    </div>
  );
}
