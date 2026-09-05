"use client";
import { useEffect, useState } from "react";

const STATUS: Record<string, [string, string]> = {
  pending: ["در انتظار", "#e5c878"],
  contacted: ["تماس گرفته شد", "#6f9fd8"],
  approved: ["تأیید شده", "#4caf50"],
  rejected: ["رد شده", "#e04b46"],
};
type Tab = "all" | "class" | "seminar";

export default function RegistrationsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  const load = async () => {
    const res = await fetch("/api/admin/registrations");
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (r: any, status: string) => {
    await fetch("/api/admin/registrations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...r, status }) });
    load();
  };
  const del = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/registrations?id=${id}`, { method: "DELETE" });
    load();
  };

  const of = (k: Tab) => items.filter((r) => (k === "all" ? true : (r.kind || "class") === k));
  const shown = of(tab);
  const counts = { all: items.length, class: of("class").length, seminar: of("seminar").length };

  const TABS: [Tab, string, string][] = [
    ["all", "همه", "✦"],
    ["class", "کلاس‌ها", "🥋"],
    ["seminar", "سمینارها", "🎯"],
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-[#e5c878]">ثبت‌نام‌ها (کلاس و سمینار)</h1>

      {/* kind tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([k, label, icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${tab === k
              ? "border-transparent bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] text-black shadow-lg"
              : "border-[var(--line)] text-[var(--muted)] hover:border-[#c9a84c] hover:text-[#e5c878]"}`}>
            {icon} {label}
            <span className={`rounded-full px-1.5 text-[10px] ${tab === k ? "bg-black/20" : "bg-white/10"}`}>{counts[k]}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto rounded-2xl">
        <table className="admin-table w-full">
          <thead>
            <tr><th>نام</th><th>تلفن</th><th>نوع</th><th>جزئیات</th><th>وضعیت</th><th className="w-40">عملیات</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const [label, color] = STATUS[r.status] || STATUS.pending;
              const isSeminar = (r.kind || "class") === "seminar";
              return (
                <tr key={r.id} className="transition hover:bg-white/[0.03]">
                  <td className="font-bold">
                    {r.fullName}
                    {r.email && <div className="text-[10px] font-normal text-[var(--muted)]" dir="ltr">{r.email}</div>}
                    {r.age && <div className="text-[10px] font-normal text-[var(--muted)]">{r.age} ساله</div>}
                  </td>
                  <td dir="ltr">
                    <a href={`tel:${r.phone}`} className="transition hover:text-[#e5c878] hover:underline">{r.phone}</a>
                  </td>
                  <td>
                    <span className={`badge ${isSeminar ? "!border-[#6f9fd8]/50 !text-[#9ec9f0]" : "!border-[#c9a84c]/50 !text-[#e5c878]"}`}>
                      {isSeminar ? "🎯 سمینار" : "🥋 کلاس"}
                    </span>
                  </td>
                  <td className="max-w-sm">
                    {isSeminar ? (
                      <div className="text-xs leading-6">
                        <div className="font-bold text-[#e5c878]">{r.seminarTitle || "—"}</div>
                        {r.note && <div className="mt-0.5 text-[var(--muted)]">📝 {r.note}</div>}
                        {r.seminarDate && <div className="text-[10px] text-[var(--muted)]" dir="ltr">{r.seminarDate}</div>}
                      </div>
                    ) : (
                      <div className="text-xs leading-6">
                        <div className="line-clamp-1">{Array.isArray(r.sports) && r.sports.length ? r.sports.join("، ") : "—"}</div>
                        <div className="mt-0.5 text-[var(--muted)]">
                          {r.classLabel || r.level || "—"}
                          {r.time ? ` · ${r.time}` : ""}
                        </div>
                        {Boolean(r.price) && <div className="text-[10px] text-[#c9a84c]">{Number(r.price).toLocaleString("fa-IR")} تومان</div>}
                      </div>
                    )}
                  </td>
                  <td><span className="badge" style={{ color, borderColor: color + "66" }}>{label}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <a href={`tel:${r.phone}`} title="تماس" className="badge hover:border-[#6f9fd8]" aria-label="call">📞</a>
                      <button onClick={() => setStatus(r, "contacted")} title="تماس گرفته شد" className="badge hover:border-[#6f9fd8]">☎</button>
                      <button onClick={() => setStatus(r, "approved")} title="تأیید" className="badge hover:border-green-500">✓</button>
                      <button onClick={() => setStatus(r, "rejected")} title="رد" className="badge hover:border-[#c41e24]">✗</button>
                      <button onClick={() => del(r.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={6} className="py-12 text-center text-[var(--muted)]">موردی وجود ندارد.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
