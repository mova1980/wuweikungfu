"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

type CartItem = { id: string; qty: number };

export default function ShopClient({ products, locale, dict }: { products: any[]; locale: Locale; dict: any }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", address: "" });

  // persist cart
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wuwei_cart") || "[]");
      if (Array.isArray(saved)) setCart(saved.filter((x: any) => products.some((p) => p.id === x.id)));
    } catch {}
  }, [products]);
  useEffect(() => {
    try { localStorage.setItem("wuwei_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const add = (id: string) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === id);
      return ex ? c.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id, qty: 1 }];
    });
    setFlash(id);
    setTimeout(() => setFlash(null), 1200);
  };
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) setCart((c) => c.filter((x) => x.id !== id));
    else setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  };
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => s + x.qty * (products.find((p) => p.id === x.id)?.price || 0), 0);
  const fmt = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");

  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, customer, locale }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        router.push(data.url);
        return;
      }
      setError(data.error === "empty_cart" ? dict.checkout.emptyErr : dict.checkout.fail);
    } catch {
      setError(dict.checkout.fail);
    }
    setBusy(false);
  };

  return (
    <>
      {/* floating cart button */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 z-40 flex items-center gap-2 rounded-full border border-[#c9a84c]/50 bg-black/70 px-4 py-2.5 text-sm text-[#e5c878] backdrop-blur transition hover:scale-105"
        style={{ insetInlineEnd: "1.25rem" }}>
        🛒 {dict.shop.cart}
        {count > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#c41e24] text-[10px] font-bold text-white">{count}</span>}
      </button>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <div className="card sheen group flex h-full flex-col overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <Image src={p.image} alt={pick(p.title, locale)} fill className="img-gold object-cover" />
                {p.badge && <span className="absolute top-3 rounded-full bg-[#c41e24] px-3 py-1 text-[11px] font-bold text-white ltr:left-3 rtl:right-3">{pick(p.badge, locale)}</span>}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-bold leading-7">{pick(p.title, locale)}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{pick(p.desc, locale)}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="gold-text text-lg font-black">{fmt(p.price)} <span className="text-xs font-normal">{dict.shop.toman}</span></div>
                  <button onClick={() => add(p.id)}
                    className={`btn-energy rounded-full px-4 py-2 text-xs font-bold transition ${flash === p.id ? "bg-green-600 text-white" : "bg-gradient-to-l from-[#c9a84c] to-[#9a7b2e] text-black hover:scale-105"}`}>
                    {flash === p.id ? dict.shop.added : dict.shop.add}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* cart drawer */}
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div dir={locale === "fa" ? "rtl" : "ltr"}
            className="absolute top-0 h-full w-full max-w-md overflow-y-auto border-[var(--line)] bg-[var(--bg-2)] p-6 shadow-2xl ltr:right-0 ltr:border-l rtl:left-0 rtl:border-r"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#e5c878]">🛒 {dict.shop.cart}</h3>
              <button onClick={() => setOpen(false)} className="badge">✕</button>
            </div>
            <div className="mt-6 space-y-4">
              {cart.length === 0 && <p className="py-16 text-center text-sm text-[var(--muted)]">{dict.shop.empty}</p>}
              {cart.map((item) => {
                const p = products.find((x) => x.id === item.id)!;
                return (
                  <div key={item.id} className="card flex items-center gap-3 rounded-xl p-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={p.image} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="line-clamp-1 text-xs font-bold">{pick(p.title, locale)}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-6 w-6 place-items-center rounded-full border border-[var(--line)] text-xs hover:border-[#c9a84c]">−</button>
                        <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-6 w-6 place-items-center rounded-full border border-[var(--line)] text-xs hover:border-[#c9a84c]">+</button>
                        <span className="ms-auto text-[11px] text-[var(--muted)]">{fmt(p.price * item.qty)}</span>
                      </div>
                    </div>
                    <button onClick={() => setQty(item.id, 0)} className="text-[#c41e24]">✕</button>
                  </div>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="mt-8 border-t border-[var(--line)] pt-5">
                <div className="flex justify-between font-bold">
                  <span>{dict.shop.total}</span>
                  <span className="gold-text">{fmt(total)} {dict.shop.toman}</span>
                </div>
                <button onClick={() => { setOpen(false); setCheckout(true); }}
                  className="btn-energy mt-5 w-full rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] py-3 font-black text-black transition hover:brightness-110">
                  {dict.shop.checkout} →
                </button>
                <p className="mt-3 text-center text-[11px] text-[var(--muted)]">🔒 {dict.shop.checkoutNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* checkout modal */}
      {checkout && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => !busy && setCheckout(false)}>
          <form onSubmit={submitCheckout} dir={locale === "fa" ? "rtl" : "ltr"}
            className="card glass-strong w-full max-w-lg rounded-3xl bg-[var(--bg-2)] p-7"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#e5c878]">🧾 {dict.checkout.title}</h3>
              <button type="button" onClick={() => setCheckout(false)} className="badge">✕</button>
            </div>
            <div className="mb-4 rounded-2xl border border-[var(--line)] p-4 text-sm">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--muted)]">{dict.checkout.amount}</span>
                <span className="gold-text">{fmt(total)} {dict.shop.toman}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.name} *</span>
                  <input required className="input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.phone} *</span>
                  <input required dir="ltr" className="input" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.contact.email}</span>
                <input type="email" dir="ltr" className="input" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[var(--muted)]">{dict.checkout.address}</span>
                <textarea rows={2} className="input resize-none" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              </label>
            </div>
            {error && <p className="mt-4 rounded-xl border border-[#c41e24]/40 bg-[#c41e24]/10 p-3 text-center text-xs text-[#e04b46]">{error}</p>}
            <button disabled={busy}
              className="btn-energy mt-6 w-full rounded-full bg-gradient-to-l from-[#e5c878] via-[#c9a84c] to-[#9a7b2e] py-3.5 font-black text-black transition hover:brightness-110 disabled:opacity-60">
              {busy ? `⏳ ${dict.checkout.redirect}` : `🔒 ${dict.checkout.submit} — ${fmt(total)} ${dict.shop.toman}`}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
