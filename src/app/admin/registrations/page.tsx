"use client";
import { useEffect, useState } from "react";

const STATUS: Record<string, [string, string]> = {
  pending: ["در انتظار", "#e5c878"],
  approved: ["تأیید شده", "#4caf50"],
  rejected: ["رد شده", "#e04b46"],
};

export default function RegistrationsAdmin() {
  const [items, setItems] = useState<any[]>([]);
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-[#e5c878]">ثبت‌نام‌های کلاس</h1>
      <div className="card overflow-x-auto rounded-2xl">
        <table className="admin-table w-full">
          <thead>
            <tr><th>نام</th><th>تلفن</th><th>رشته‌ها</th><th>سطح</th><th>زمان</th><th>وضعیت</th><th>عملیات</th></tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const [label, color] = STATUS[r.status] || STATUS.pending;
              return (
                <tr key={r.id} className="transition hover:bg-white/[0.03]">
                  <td className="font-bold">{r.fullName}<div className="text-[10px] font-normal text-[var(--muted)]" dir="ltr">{r.email}</div></td>
                  <td dir="ltr">{r.phone}</td>
                  <td className="max-w-44"><span className="line-clamp-2 text-xs">{Array.isArray(r.sports) && r.sports.length ? r.sports.join("، ") : "—"}</span></td>
                  <td>{r.level}</td>
                  <td className="max-w-40 truncate">{r.time}</td>
                  <td><span className="badge" style={{ color, borderColor: color + "66" }}>{label}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => setStatus(r, "approved")} className="badge hover:border-green-500">✓</button>
                      <button onClick={() => setStatus(r, "rejected")} className="badge hover:border-[#c41e24]">✗</button>
                      <button onClick={() => del(r.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && <tr><td colSpan={7} className="py-12 text-center text-[var(--muted)]">هنوز ثبت‌نامی انجام نشده است.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
