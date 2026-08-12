import type { MetadataRoute } from "next";
import { readCollection } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://wuweikungfu.com";
  const posts = await readCollection<any[]>("posts");
  const pages = ["", "/about", "/techniques", "/blog", "/shop", "/videos", "/events", "/contact", "/register", "/search"];
  const out: MetadataRoute.Sitemap = [];
  for (const locale of ["fa", "en", "zh"]) {
    for (const p of pages) {
      out.push({ url: `${base}/${locale}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    }
    for (const post of posts) {
      out.push({ url: `${base}/${locale}/blog/${post.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return out;
}
