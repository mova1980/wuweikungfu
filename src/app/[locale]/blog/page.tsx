import { getDict, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";
import BlogList from "@/components/BlogList";

export const dynamic = "force-dynamic";

export default async function Blog({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const posts = await readCollection<any[]>("posts");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-32">
      <Reveal className="text-center">
        <div className="badge mx-auto mb-4">✍️ 文章</div>
        <h1 className="gold-text text-4xl font-black md:text-5xl">{dict.blog.title}</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">{dict.blog.sub}</p>
      </Reveal>
      <BlogList posts={posts} locale={locale} dict={dict} />
    </div>
  );
}
