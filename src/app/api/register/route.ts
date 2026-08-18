import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.fullName || !body?.phone) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const regs = await readCollection<any[]>("registrations");
  regs.unshift({
    id: newId(),
    fullName: String(body.fullName).slice(0, 120),
    phone: String(body.phone).slice(0, 30),
    email: String(body.email || "").slice(0, 160),
    age: String(body.age || "").slice(0, 5),
    sports: Array.isArray(body.sports) ? body.sports.slice(0, 13).map((x: any) => String(x).slice(0, 40)) : [],
    classType: String(body.classType || "").slice(0, 60),
    classLabel: String(body.classLabel || body.classType || body.level || "").slice(0, 80),
    price: Number.isFinite(Number(body.price)) ? Number(body.price) : 0,
    time: String(body.time || "").slice(0, 80),
    date: new Date().toISOString(),
    status: "pending",
  });
  await writeCollection("registrations", regs);
  return NextResponse.json({ ok: true });
}
