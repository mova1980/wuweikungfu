"use client";
import { useEffect, useState } from "react";

const STATUS: Record<string, [string, string]> = {
  pending: ["در انتظار پرداخت", "#e5c878"],
  paid: ["پرداخت شده", "#4caf50"],
  failed: ["ناموفق", "#e04b46"],
  canceled: ["لغو شده", "#8a8a8a"],
  shipped: ["ارسال شده", "#6f9fd8"],
};

export default function OrdersAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (o: any, status: string) => {
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...o, status }) });
    load();
    setDetail(null);
  };
  const del = async (id: string) => {
    if (!confirm("سفارش حذف شود؟")) return;
    await fetch(`/api/admin/orders?id=${id}`, { method: "DELETE" });
    load();
    setDetail(null);
  };

  const fmt = (n: number) => n.toLocaleString("fa-IR");
  const filtered = filter === "all" ? items : items.filter((o) => o.status === filter);
  const revenue = items.filter((o) => ["paid", "shipped"].includes(o.status)).reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-[#e5c878]">سفارش‌ها و پرداخت</h1>
        <div className="badge">💰 درآمد تأییدشده: <b className="gold-text">{fmt(revenue)}</b> تومان</div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`badge ${filter === "all" ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`}>همه ({items.length})</button>
        {Object.entries(STATUS).map(([k, [label, color]]) => (
          <button key={k} onClick={() => setFilter(k)} className={`badge ${filter === k ? "border-[#c9a84c] bg-[rgba(201,168,76,0.2)]" : ""}`} style={{ color }}>
            {label} ({items.filter((o) => o.status === k).length})
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto rounded-2xl">
        <table className="admin-table w-full">
          <thead>
            <tr><th>سفارش</th><th>خریدار</th><th>مبلغ</th><th>درگاه</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const [label, color] = STATUS[o.status] || STATUS.pending;
              return (
                <tr key={o.id} className="cursor-pointer transition hover:bg-white/[0.03]" onClick={() => setDetail(o)}>
                  <td dir="ltr" className="text-xs">#{o.id}</td>
                  <td className="font-bold">{o.customer?.name}<div className="text-[10px] font-normal text-[var(--muted)]" dir="ltr">{o.customer?.phone}</div></td>
                  <td className="gold-text font-bold">{fmt(o.total)}</td>
                  <td><span className="badge">{o.gateway === "zarinpal" ? "زرین‌پال" : "آزمایشی"}</span></td>
                  <td><span className="badge" style={{ color, borderColor: color + "66" }}>{label}</span></td>
                  <td dir="ltr" className="text-xs text-[var(--muted)]">{new Date(o.date).toLocaleString("fa-IR")}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      {o.status === "paid" && <button onClick={() => setStatus(o, "shipped")} className="badge hover:border-[#6f9fd8]">🚚 ارسال شد</button>}
                      <button onClick={() => del(o.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={7} className="py-12 text-center text-[var(--muted)]">سفارشی وجود ندارد.</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="card glass-strong max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#0d0c0f] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-[#e5c878]">جزئیات سفارش <span dir="ltr" className="text-xs">#{detail.id}</span></h2>
              <button onClick={() => setDetail(null)} className="badge">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="rounded-xl border border-[var(--line)] p-3">
                <b>{detail.customer?.name}</b> — <span dir="ltr">{detail.customer?.phone}</span>
                {detail.customer?.email && <div dir="ltr" className="mt-1 text-xs text-[var(--muted)]">{detail.customer.email}</div>}
                {detail.customer?.address && <div className="mt-1 text-xs leading-6 text-[var(--muted)]">📍 {detail.customer.address}</div>}
              </div>
              {detail.items?.map((it: any) => (
                <div key={it.id} className="flex justify-between rounded-xl border border-[var(--line)] p-3 text-xs">
                  <span>{it.title?.fa} ×{it.qty}</span>
                  <span className="font-bold">{fmt(it.price * it.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between rounded-xl border border-[#c9a84c]/40 bg-[rgba(201,168,76,0.07)] p-3 font-black">
                <span>جمع کل</span><span className="gold-text">{fmt(detail.total)} تومان</span>
              </div>
              {detail.refId && (
                <div className="flex justify-between rounded-xl border border-green-500/30 p-3 text-xs">
                  <span>کد پیگیری</span><span dir="ltr" className="font-bold text-green-400">{detail.refId}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["paid", "shipped", "canceled"].map((s) => (
                <button key={s} onClick={() => setStatus(detail, s)} className="badge hover:border-[#c9a84c]">{STATUS[s][0]}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
