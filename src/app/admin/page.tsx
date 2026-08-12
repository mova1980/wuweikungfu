"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const cards: [string, string, string, string][] = [
  ["orders", "🧾", "سفارش‌ها", "/admin/orders"],
  ["posts", "✍️", "مقالات", "/admin/posts"],
  ["techniques", "🥋", "تکنیک‌ها", "/admin/techniques"],
  ["videos", "🎬", "ویدئوها", "/admin/videos"],
  ["events", "🏆", "رویدادها", "/admin/events"],
  ["products", "🛍", "محصولات", "/admin/products"],
  ["testimonials", "💬", "نظرات", "/admin/testimonials"],
  ["messages", "✉️", "پیام‌ها", "/admin/messages"],
  ["registrations", "📝", "ثبت‌نام‌ها", "/admin/registrations"],
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [backup, setBackup] = useState("");

  useEffect(() => {
    (async () => {
      // fetch everything in parallel — fast dashboard load
      const colls = [...cards.map(([c]) => c), "content"];
      const responses = await Promise.all(
        colls.map((c) => fetch(`/api/admin/${c}`).then((r) => (r.ok ? r.json() : null)).catch(() => null))
      );
      const out: Record<string, number> = {};
      const all: Record<string, any> = {};
      colls.forEach((c, i) => {
        const data = responses[i];
        if (data == null) return;
        all[c] = data;
        if (c !== "content") out[c] = Array.isArray(data) ? data.length : 1;
      });
      setCounts(out);
      setBackup(JSON.stringify(all, null, 2));
    })();
  }, []);

  const downloadBackup = () => {
    const blob = new Blob([backup], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wuwei-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#e5c878]">داشبورد مدیریت</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">مدیریت کامل محتوای وب‌سایت وو وی کونگ فو</p>
        </div>
        <button onClick={downloadBackup} disabled={!backup} className="badge hover:border-[#c9a84c] disabled:opacity-40">
          💾 پشتیبان‌گیری کامل (JSON)
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([coll, icon, label, href]) => (
          <Link key={coll} href={href} className="card rounded-2xl p-6 transition hover:border-[#c9a84c]">
            <div className="text-3xl">{icon}</div>
            <div className="gold-text mt-3 text-3xl font-black">{counts[coll] ?? "…"}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
          </Link>
        ))}
      </div>
      <div className="card mt-8 rounded-2xl p-6">
        <h2 className="mb-3 font-black text-[#e5c878]">راهنمای سریع</h2>
        <ul className="space-y-2 text-sm leading-7 text-[var(--muted)]">
          <li>• تمام محتوا سه‌زبانه است: هر فیلد دارای نسخهٔ فارسی (FA)، انگلیسی (EN) و چینی (ZH) است.</li>
          <li>• از بخش «محتوای سایت» آمار صفحهٔ اصلی، تایم‌لاین، افتخارات، مربیان و کمربندها را ویرایش کنید.</li>
          <li>• پیام‌های فرم تماس و ثبت‌نام کلاس‌ها به‌صورت خودکار در بخش‌های مربوطه ذخیره می‌شوند.</li>
          <li>• با دکمهٔ پشتیبان‌گیری، نسخهٔ کامل دیتابیس را دانلود کنید.</li>
        </ul>
      </div>
    </div>
  );
}
