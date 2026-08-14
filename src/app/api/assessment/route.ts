import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.name || !body?.phone) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const items = await readCollection<any[]>("assessments");
  items.unshift({
    id: newId(),
    name: String(body.name).slice(0, 120),
    phone: String(body.phone).slice(0, 30),
    age: String(body.age || "").slice(0, 5),
    note: String(body.note || "").slice(0, 1000),
    date: new Date().toISOString(),
    status: "new", // new → contacted
  });
  await writeCollection("assessments", items);
  return NextResponse.json({ ok: true });
}
