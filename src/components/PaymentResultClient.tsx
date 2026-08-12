"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";

export default function PaymentResultClient({ orderId, locale, dict }: { orderId: string; locale: Locale; dict: any }) {
  const [order, setOrder] = useState<any | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/payment/status?id=${orderId}`);
      if (!res.ok) return setErr(true);
      const o = await res.json();
      setOrder(o);
      if (o.status === "paid") {
        try { localStorage.removeItem("wuwei_cart"); } catch {}
      }
    })();
  }, [orderId]);

  if (err) return <p className="py-20 text-center text-[var(--muted)]">404</p>;
  if (!order) return <p className="py-20 text-center text-[var(--muted)]">…</p>;

  const ok = order.status === "paid";
  const fmt = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

  return (
    <div className="card glass-strong relative mx-auto max-w-xl overflow-hidden rounded-3xl p-10 text-center">
      {/* celebratory particles */}
      {ok && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="confetti absolute block h-1.5 w-1.5 rounded-full"
              style={{
                left: `${(i * 53) % 100}%`,
                background: i % 3 ? "#c9a84c" : "#c41e24",
                animationDelay: `${(i % 9) * 0.35}s`,
                animationDuration: `${2.6 + (i % 5) * 0.5}s`,
              }} />
          ))}
        </div>
      )}
      <div className={`mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full text-5xl ${ok ? "bg-green-600/15 text-green-400" : "bg-[#c41e24]/15 text-[#e04b46]"}`}
        style={{ boxShadow: ok ? "0 0 60px rgba(74,222,128,0.25)" : "0 0 60px rgba(196,30,36,0.25)", animation: "popIn 0.6s cubic-bezier(0.2,1.4,0.4,1)" }}>
        {ok ? "✓" : "✕"}
      </div>
      <h1 className={`text-2xl font-black md:text-3xl ${ok ? "text-green-400" : "text-[#e04b46]"}`}>
        {ok ? dict.checkout.success : dict.checkout.fail}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
        {ok ? dict.checkout.successDesc : dict.checkout.failDesc}
      </p>

      <div className="mx-auto mt-8 max-w-sm space-y-2 text-sm">
        <div className="flex justify-between rounded-xl border border-[var(--line)] p-3">
          <span className="text-[var(--muted)]">{dict.checkout.orderId}</span>
          <span dir="ltr" className="font-bold">#{order.id}</span>
        </div>
        {ok && order.refId && (
          <div className="flex justify-between rounded-xl border border-green-500/30 bg-green-500/5 p-3">
            <span className="text-[var(--muted)]">{dict.checkout.refId}</span>
            <span dir="ltr" className="font-black text-green-400">{order.refId}</span>
          </div>
        )}
        <div className="flex justify-between rounded-xl border border-[var(--line)] p-3">
          <span className="text-[var(--muted)]">{dict.checkout.amount}</span>
          <span className="gold-text font-black">{fmt(order.total)} {dict.shop.toman}</span>
        </div>
        <div className="pt-2 text-start text-xs text-[var(--muted)]">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex justify-between py-1">
              <span>• {pick(it.title, locale)} ×{it.qty}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}/shop`} className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-3 text-sm font-black text-black">
          {ok ? dict.checkout.backShop : dict.checkout.retry} →
        </Link>
        <Link href={`/${locale}`} className="rounded-full border border-[var(--line)] px-7 py-3 text-sm text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
          {dict.nav.home}
        </Link>
      </div>

      <style jsx>{`
        @keyframes popIn { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .confetti { top: -8px; animation-name: confettiFall; animation-iteration-count: infinite; animation-timing-function: linear; }
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(480px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
