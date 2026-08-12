import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const messages = await readCollection<any[]>("messages");
  messages.unshift({
    id: newId(),
    name: String(body.name).slice(0, 120),
    email: String(body.email).slice(0, 160),
    message: String(body.message).slice(0, 3000),
    date: new Date().toISOString(),
    read: false,
  });
  await writeCollection("messages", messages);
  return NextResponse.json({ ok: true });
}
