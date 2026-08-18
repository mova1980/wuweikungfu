import { getDict, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import GalleryClient from "@/components/GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const cats = await readCollection<any[]>("gallery");
  const sorted = [...(Array.isArray(cats) ? cats : [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return <GalleryClient locale={locale} dict={dict} cats={sorted} />;
}
