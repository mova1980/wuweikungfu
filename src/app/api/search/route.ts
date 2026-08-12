import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").toLowerCase().trim();
  const locale = req.nextUrl.searchParams.get("locale") || "fa";
  const type = req.nextUrl.searchParams.get("type") || "all";
  if (q.length < 2) return NextResponse.json([]);

  const pick = (o: any) => (o ? o[locale] || o.fa || o.en || "" : "");
  const results: any[] = [];

  const scan = async (coll: any, t: string, fields: string[], snippetField: string, slugKey = "slug") => {
    if (type !== "all" && type !== t) return;
    const items = await readCollection<any[]>(coll);
    for (const it of items) {
      const hay = fields.map((f) => pick(it[f])).join(" ").toLowerCase();
      if (hay.includes(q)) {
        results.push({ type: t, slug: it[slugKey] || it.id, title: pick(it.title), snippet: pick(it[snippetField]) });
      }
    }
  };

  await scan("posts", "post", ["title", "excerpt", "body", "category"], "excerpt");
  await scan("techniques", "technique", ["title", "desc"], "desc");
  await scan("videos", "video", ["title", "category"], "category");
  await scan("events", "event", ["title", "desc", "location"], "desc");
  await scan("products", "product", ["title", "desc"], "desc");

  return NextResponse.json(results.slice(0, 30));
}
