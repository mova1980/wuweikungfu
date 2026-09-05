import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const kind = body?.kind === "seminar" ? "seminar" : "class";

  if (!body?.fullName || !body?.phone) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (kind === "seminar" && !body?.seminarTitle) {
    return NextResponse.json({ error: "seminar required" }, { status: 400 });
  }

  const regs = await readCollection<any[]>("registrations");
  const item: any = {
    id: newId(),
    kind,
    fullName: String(body.fullName).slice(0, 120),
    phone: String(body.phone).slice(0, 30),
    email: String(body.email || "").slice(0, 160),
    age: String(body.age || "").slice(0, 5),
    date: new Date().toISOString(),
    status: "pending",
  };

  if (kind === "seminar") {
    item.seminarId = String(body.seminarId || "").slice(0, 60);
    item.seminarTitle = String(body.seminarTitle).slice(0, 160);
    item.seminarDate = String(body.seminarDate || "").slice(0, 30);
    item.note = String(body.note || "").slice(0, 600);
  } else {
    item.sports = Array.isArray(body.sports) ? body.sports.slice(0, 13).map((x: any) => String(x).slice(0, 40)) : [];
    item.classType = String(body.classType || "").slice(0, 60);
    item.classLabel = String(body.classLabel || body.classType || body.level || "").slice(0, 80);
    item.price = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;
    item.time = String(body.time || "").slice(0, 80);
  }

  regs.unshift(item);
  await writeCollection("registrations", regs);
  return NextResponse.json({ ok: true });
}
