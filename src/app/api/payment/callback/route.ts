import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";

/** ZarinPal callback: verifies the transaction, then redirects to the result page. */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  const authority = req.nextUrl.searchParams.get("Authority");
  const statusParam = req.nextUrl.searchParams.get("Status");

  const orders = await readCollection<any[]>("orders");
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return NextResponse.redirect(new URL("/fa/shop", req.url));
  const order = orders[idx];
  const resultUrl = new URL(`/${order.locale}/payment/result?order=${order.id}`, req.url);

  if (order.status !== "pending") return NextResponse.redirect(resultUrl);

  if (statusParam !== "OK" || !authority) {
    order.status = "failed";
  } else {
    try {
      const content = await readCollection<any>("content");
      const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/verify.json", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ merchant_id: content.payment?.merchantId, amount: order.total * 10, authority }),
      });
      const data = await res.json();
      if (data?.data?.code === 100 || data?.data?.code === 101) {
        order.status = "paid";
        order.refId = String(data.data.ref_id);
        order.paidAt = new Date().toISOString();
      } else {
        order.status = "failed";
      }
    } catch {
      order.status = "failed";
    }
  }
  orders[idx] = order;
  await writeCollection("orders", orders);
  return NextResponse.redirect(resultUrl);
}
