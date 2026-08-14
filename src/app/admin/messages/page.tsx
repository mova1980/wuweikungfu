"use client";
import { useEffect, useState } from "react";

export default function MessagesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const res = await fetch("/api/admin/messages");
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { load(); }, []);

  const markRead = async (m: any) => {
    await fetch("/api/admin/messages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...m, read: true }) });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-[#e5c878]">پیام‌های تماس</h1>
      <div className="space-y-4">
        {items.map((m) => (
          <div key={m.id} className={`card rounded-2xl p-5 ${m.read ? "opacity-60" : "border-[#c9a84c]/50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!m.read && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#c41e24]" />}
                <span className="font-bold">{m.name}</span>
                <a href={`tel:${m.phone || ""}`} dir="ltr" className="text-xs text-[#c9a84c]">{m.phone || m.email || ""}</a>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                <span dir="ltr">{new Date(m.date).toLocaleString("fa-IR")}</span>
                {!m.read && <button onClick={() => markRead(m)} className="badge hover:border-[#c9a84c]">خوانده شد ✓</button>}
                <button onClick={() => del(m.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--fg)]/85">{m.message}</p>
          </div>
        ))}
        {!items.length && <p className="card rounded-2xl py-12 text-center text-[var(--muted)]">هنوز پیامی دریافت نشده است.</p>}
      </div>
    </div>
  );
}
