"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { pick, type Locale } from "@/lib/i18n";

export default function PayClient({ order, locale, dict, gatewayName }: { order: any; locale: Locale; dict: any; gatewayName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);
  const [left, setLeft] = useState(600);
  const [card, setCard] = useState({ number: "", cvv: "", exp: "", pin: "" });

  useEffect(() => {
    const iv = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const act = async (action: "pay" | "cancel") => {
    setBusy(action);
    await fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, action }),
    });
    router.push(`/${locale}/payment/result?order=${order.id}`);
  };

  const fmt = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
  const canPay = card.number.replace(/\s/g, "").length >= 16 && card.pin.length >= 4;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_340px]">
      {/* gateway card */}
      <div className="card glass-strong overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-gradient-to-l from-[rgba(201,168,76,0.12)] to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="" width={40} height={40} className="logo-glow rounded-full" />
            <div>
              <div className="text-sm font-black text-[#e5c878]">{gatewayName}</div>
              <div className="text-[10px] text-[var(--muted)]">SSL · 256-bit {locale === "fa" ? "رمزنگاری‌شده" : "encrypted"} 🔒</div>
            </div>
          </div>
          <div className="badge" dir="ltr">⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</div>
        </div>
        <div className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.cardNumber}</span>
            <input dir="ltr" inputMode="numeric" maxLength={19} placeholder="6037 99•• •••• ••••" className="input text-center tracking-[0.2em]"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").slice(0, 19) })} />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.cvv2}</span>
              <input dir="ltr" maxLength={4} className="input text-center" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.expiry}</span>
              <input dir="ltr" placeholder="12/08" maxLength={5} className="input text-center" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.pin}</span>
              <input dir="ltr" type="password" maxLength={8} className="input text-center" value={card.pin} onChange={(e) => setCard({ ...card, pin: e.target.value.replace(/\D/g, "") })} />
            </label>
          </div>
          <p className="rounded-xl border border-[#e5c878]/25 bg-[rgba(201,168,76,0.06)] p-3 text-center text-[11px] leading-5 text-[#e5c878]/90">
            ⚠️ {dict.checkout.demoNote}
          </p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => act("pay")} disabled={!canPay || !!busy}
              className="btn-energy flex-1 rounded-full bg-gradient-to-l from-[#e5c878] via-[#c9a84c] to-[#9a7b2e] py-3.5 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
              {busy === "pay" ? "⏳ …" : `${dict.checkout.pay} — ${fmt(order.total)} ${dict.shop.toman}`}
            </button>
            <button onClick={() => act("cancel")} disabled={!!busy}
              className="rounded-full border border-[#c41e24]/50 px-5 py-3.5 text-sm text-[#e04b46] transition hover:bg-[#c41e24]/10 disabled:opacity-40">
              {busy === "cancel" ? "…" : dict.checkout.cancelPay}
            </button>
          </div>
        </div>
      </div>

      {/* order summary */}
      <div className="card glass-strong h-fit rounded-3xl p-6">
        <h3 className="mb-4 font-black text-[#e5c878]">🧾 {dict.checkout.orderSummary}</h3>
        <div className="space-y-3">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex items-start justify-between gap-2 text-xs">
              <span className="leading-5 text-[var(--muted)]">{pick(it.title, locale)} ×{it.qty}</span>
              <span className="shrink-0 font-bold">{fmt(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-[var(--line)] pt-4 text-sm font-black">
          <span>{dict.checkout.amount}</span>
          <span className="gold-text">{fmt(order.total)} {dict.shop.toman}</span>
        </div>
        <div className="mt-3 text-center text-[10px] text-[var(--muted)]" dir="ltr">#{order.id}</div>
      </div>
    </div>
  );
}
