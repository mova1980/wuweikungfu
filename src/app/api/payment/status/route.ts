import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";

/** Public (safe) order status for the result page — exposes no admin data. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const orders = await readCollection<any[]>("orders");
  const o = orders.find((x) => x.id === id);
  if (!o) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    id: o.id,
    status: o.status,
    refId: o.refId,
    total: o.total,
    items: o.items,
    date: o.date,
  });
}
