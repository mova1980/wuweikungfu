import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, newId } from "@/lib/db";

/**
 * Creates an order from the cart, then returns the payment URL.
 * mode "mock"     → built-in demo gateway  (/{locale}/pay/{orderId})
 * mode "zarinpal" → real ZarinPal v4 API   (requires merchantId in admin settings)
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, customer, locale } = body || {};
  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }
  if (!customer?.name || !customer?.phone) {
    return NextResponse.json({ error: "invalid_customer" }, { status: 400 });
  }

  // server-side price calculation (never trust the client)
  const products = await readCollection<any[]>("products");
  const lines: any[] = [];
  let total = 0;
  for (const it of items) {
    const p = products.find((x) => x.id === it.id);
    if (!p) continue;
    const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
    lines.push({ id: p.id, title: p.title, price: p.price, qty });
    total += p.price * qty;
  }
  if (!lines.length || total <= 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const content = await readCollection<any>("content");
  const payment = content.payment || { mode: "mock" };

  const orders = await readCollection<any[]>("orders");
  const order = {
    id: newId(),
    date: new Date().toISOString(),
    customer: {
      name: String(customer.name).slice(0, 120),
      phone: String(customer.phone).slice(0, 30),
      email: String(customer.email || "").slice(0, 160),
      address: String(customer.address || "").slice(0, 500),
    },
    items: lines,
    total,
    locale: ["fa", "en", "zh"].includes(locale) ? locale : "fa",
    gateway: payment.mode === "zarinpal" && payment.merchantId ? "zarinpal" : "mock",
    status: "pending", // pending → paid | failed | canceled → shipped
    refId: null as string | null,
    authority: null as string | null,
  };

  // ---- real ZarinPal flow ----
  if (order.gateway === "zarinpal") {
    try {
      const origin = req.nextUrl.origin;
      const res = await fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          merchant_id: payment.merchantId,
          amount: total * 10, // Toman → Rial
          callback_url: `${origin}/api/payment/callback?order=${order.id}`,
          description: `Wu Wei Kung Fu — Order ${order.id}`,
          metadata: { mobile: order.customer.phone, email: order.customer.email },
        }),
      });
      const data = await res.json();
      if (data?.data?.authority) {
        order.authority = data.data.authority;
        orders.unshift(order);
        await writeCollection("orders", orders);
        return NextResponse.json({ ok: true, orderId: order.id, url: `https://payment.zarinpal.com/pg/StartPay/${data.data.authority}` });
      }
      return NextResponse.json({ error: "gateway_error", detail: data?.errors }, { status: 502 });
    } catch {
      return NextResponse.json({ error: "gateway_unreachable" }, { status: 502 });
    }
  }

  // ---- built-in demo gateway ----
  orders.unshift(order);
  await writeCollection("orders", orders);
  return NextResponse.json({ ok: true, orderId: order.id, url: `/${order.locale}/pay/${order.id}` });
}
