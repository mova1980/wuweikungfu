import { getDict, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import VideoGrid from "@/components/VideoGrid";

export const dynamic = "force-dynamic";

export default async function Videos({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const videos = await readCollection<any[]>("videos");
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">🎬 影</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.videos.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.videos.sub}</p>
      </Reveal>
      <VideoGrid videos={videos} locale={locale} dict={dict} />
    </div>
  );
}
