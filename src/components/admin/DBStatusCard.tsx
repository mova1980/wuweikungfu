"use client";
import { useEffect, useState } from "react";

type Status = {
  primary: string;
  supabase: { configured: boolean; host: string | null; ping: string | null };
  redis: { configured: boolean; host: string | null };
};

export default function DBStatusCard() {
  const [st, setSt] = useState<Status | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/db-status", { cache: "no-store" });
      if (res.ok) setSt(await res.json());
    } catch {}
  };
  useEffect(() => { load(); }, []);

  if (!st) return null;

  const sbOk = st.supabase.configured && st.supabase.ping === "ok";
  const sbBad = st.supabase.configured && st.supabase.ping !== "ok";

  return (
    <div className="card mb-6 rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black text-[#e5c878]">🛢 وضعیت دیتابیس</h2>
        <button onClick={load} className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
          ↻ بررسی مجدد
        </button>
      </div>
      <div className="grid gap-3 text-xs md:grid-cols-3">
        <div className="rounded-xl border border-[var(--line)] p-3">
          <div className="mb-1 text-[10px] text-[var(--muted)]">بکاند فعال</div>
          <div className="font-bold" style={{ color: st.primary.startsWith("supabase") && !st.primary.includes("unreachable") ? "#7dd87d" : "#e5c878" }}>
            {st.primary === "supabase" ? "Supabase ✓" : st.primary === "redis" ? "Redis" : "فایل‌های محلی"}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${sbOk ? "border-green-600/40" : sbBad ? "border-[#c41e24]/50" : "border-[var(--line)]"}`}>
          <div className="mb-1 text-[10px] text-[var(--muted)]">Supabase</div>
          {st.supabase.configured ? (
            <>
              <div dir="ltr" className="truncate font-mono text-[10px] text-[var(--fg)]/80">{st.supabase.host}</div>
              <div className="mt-1 font-bold" style={{ color: sbOk ? "#7dd87d" : "#ff8a85" }}>
                {sbOk ? "متصل و سالم ✓" : `خطا: ${st.supabase.ping}`}
              </div>
            </>
          ) : (
            <div className="text-[var(--muted)]">پیکربندی نشده</div>
          )}
        </div>
        <div className="rounded-xl border border-[var(--line)] p-3">
          <div className="mb-1 text-[10px] text-[var(--muted)]">Redis (رپلیکا/جایگزین)</div>
          {st.redis.configured ? (
            <div dir="ltr" className="truncate font-mono text-[10px] text-[var(--fg)]/80">{st.redis.host}</div>
          ) : (
            <div className="text-[var(--muted)]">پیکربندی نشده</div>
          )}
        </div>
      </div>
      {sbBad && (
        <p className="mt-3 rounded-xl border border-[#c41e24]/50 bg-[#c41e24]/10 p-3 text-[11px] leading-6 text-[#ff8a85]">
          ⛔ Supabase پاسخ نمی‌دهد. مقدار <span dir="ltr" className="font-mono">SUPABASE_URL</span> باید فقط آدرس پروژه باشد
          (مثل <span dir="ltr" className="font-mono">https://xxxx.supabase.co</span>) — بدون <span dir="ltr" className="font-mono">/rest/v1</span>.
          کلید هم باید <span dir="ltr" className="font-mono">service_role</span> (مخفی) باشد، نه anon. بعد از اصلاح در Vercel، Redeploy کن.
        </p>
      )}
    </div>
  );
}
