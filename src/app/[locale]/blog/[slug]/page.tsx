import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, pick, type Locale } from "@/lib/i18n";
import { readCollection } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function Post({ params }: { params: { locale: Locale; slug: string } }) {
  const locale = params.locale;
  const dict = getDict(locale);
  const posts = await readCollection<any[]>("posts");
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 pb-10 pt-32">
      <Reveal>
        <Link href={`/${locale}/blog`} className="badge mb-6 inline-flex hover:border-[#c9a84c]">← {dict.blog.back}</Link>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <span className="badge">{pick(post.category, locale)}</span>
          <span>🗓 {post.date}</span>
          <span>✍️ {dict.blog.by}: {pick(post.author, locale)}</span>
        </div>
        <h1 className="gold-text text-3xl font-black leading-tight md:text-5xl md:leading-tight">{pick(post.title, locale)}</h1>
      </Reveal>
      <Reveal variant="scale">
        <div className="relative mt-8 h-80 overflow-hidden rounded-3xl border border-[var(--line)] md:h-[440px]">
          <Image src={post.image} alt={pick(post.title, locale)} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </Reveal>
      <Reveal>
        <div className="prose-invert mt-10 space-y-6 text-lg leading-9 text-[var(--fg)]/88">
          {pick(post.body, locale).split("\n\n").map((par: string, i: number) => (
            <p key={i} className={i === 0 ? "first-letter:float-start first-letter:me-3 first-letter:text-6xl first-letter:font-black first-letter:text-[#c9a84c]" : ""}>{par}</p>
          ))}
        </div>
        <div className="ink-divider mx-auto mt-14" />
        <div className="mt-8 flex justify-center gap-3">
          {["𝕏", "📤", "🔗"].map((s, i) => (
            <button key={i} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">{s}</button>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
