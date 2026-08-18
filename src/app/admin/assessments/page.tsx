"use client";
import { useEffect, useState } from "react";

const STATUS: Record<string, [string, string]> = {
  new: ["جدید", "#e5c878"],
  contacted: ["تماس گرفته شد", "#4caf50"],
};

export default function AssessmentsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const res = await fetch("/api/admin/assessments");
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (r: any, status: string) => {
    await fetch("/api/admin/assessments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...r, status }) });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/assessments?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#e5c878]">درخواست‌های ارزیابی قامتی رایگان</h1>
        <span className="badge">🆕 جدید: {items.filter((x) => x.status === "new").length}</span>
      </div>
      <div className="space-y-4">
        {items.map((r) => {
          const [label, color] = STATUS[r.status] || STATUS.new;
          return (
            <div key={r.id} className={`card rounded-2xl p-5 ${r.status === "contacted" ? "opacity-70" : "border-[#c9a84c]/50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {r.status === "new" && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#c41e24]" />}
                  <span className="font-bold">{r.name}</span>
                  <a href={`tel:${r.phone}`} dir="ltr" className="badge hover:border-[#c9a84c]">📞 {r.phone}</a>
                  {r.age && <span className="badge">سن: {r.age}</span>}
                  <span className="badge" style={{ color, borderColor: color + "66" }}>{label}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <span dir="ltr">{new Date(r.date).toLocaleString("fa-IR")}</span>
                  {r.status === "new" && <button onClick={() => setStatus(r, "contacted")} className="badge hover:border-green-500">✓ تماس گرفته شد</button>}
                  <button onClick={() => del(r.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
                </div>
              </div>
              {r.note && <p className="mt-3 text-sm leading-7 text-[var(--fg)]/85">💬 {r.note}</p>}
            </div>
          );
        })}
        {!items.length && <p className="card rounded-2xl py-12 text-center text-[var(--muted)]">هنوز درخواستی ثبت نشده است.</p>}
      </div>
    </div>
  );
}
