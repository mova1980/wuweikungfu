import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId, type Collection } from "@/lib/db";

const ALLOWED: Collection[] = ["content", "posts", "techniques", "videos", "events", "products", "testimonials", "messages", "registrations", "orders", "coaches", "assessments"];

function guard(req: NextRequest) {
  return req.cookies.get("wuwei_admin")?.value === "granted";
}

function collOf(params: { collection: string }): Collection | null {
  return (ALLOWED as string[]).includes(params.collection) ? (params.collection as Collection) : null;
}

export async function GET(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!guard(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const coll = collOf(params);
  if (!coll) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(await readCollection(coll));
}

/** Create item (arrays) or replace whole document (content) */
export async function POST(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!guard(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const coll = collOf(params);
  if (!coll) return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json();

  if (coll === "content") {
    await writeCollection("content", body);
    return NextResponse.json({ ok: true });
  }
  const items = await readCollection<any[]>(coll);
  const item = { id: newId(), ...body };
  items.unshift(item);
  await writeCollection(coll, items);
  return NextResponse.json(item);
}

/** Update by id */
export async function PUT(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!guard(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const coll = collOf(params);
  if (!coll || coll === "content") return NextResponse.json({ error: "not found" }, { status: 404 });
  const body = await req.json();
  const items = await readCollection<any[]>(coll);
  const idx = items.findIndex((x) => x.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  items[idx] = { ...items[idx], ...body };
  await writeCollection(coll, items);
  return NextResponse.json(items[idx]);
}

/** Delete by ?id= */
export async function DELETE(req: NextRequest, { params }: { params: { collection: string } }) {
  if (!guard(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const coll = collOf(params);
  if (!coll || coll === "content") return NextResponse.json({ error: "not found" }, { status: 404 });
  const id = req.nextUrl.searchParams.get("id");
  const items = await readCollection<any[]>(coll);
  await writeCollection(coll, items.filter((x) => x.id !== id));
  return NextResponse.json({ ok: true });
}
