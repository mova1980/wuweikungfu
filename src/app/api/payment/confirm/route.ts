import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";

/** Confirms or cancels a MOCK-gateway payment. */
export async function POST(req: NextRequest) {
  const { orderId, action } = await req.json();
  const orders = await readCollection<any[]>("orders");
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const order = orders[idx];
  if (order.status !== "pending") {
    return NextResponse.json({ ok: true, status: order.status, refId: order.refId });
  }
  if (action === "pay") {
    order.status = "paid";
    order.refId = "WW-" + Date.now().toString().slice(-10);
    order.paidAt = new Date().toISOString();
  } else {
    order.status = "canceled";
  }
  orders[idx] = order;
  await writeCollection("orders", orders);
  return NextResponse.json({ ok: true, status: order.status, refId: order.refId });
}
