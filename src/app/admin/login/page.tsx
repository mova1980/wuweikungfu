"use client";
import { useState } from "react";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // hard navigation: guarantees the fresh auth cookie is used and
        // avoids any cached client-side redirect to /admin/login
        window.location.replace("/admin");
        return; // keep the "entering…" state during navigation
      }
      setErr(true);
    } catch {
      setErr(true);
    }
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#0a090c] px-4">
      <form onSubmit={submit} className="card w-full max-w-sm rounded-3xl p-8 text-center">
        <Image src="/images/logo.png" alt="Wu Wei" width={80} height={80} priority className="logo-glow mx-auto mb-5 rounded-full" />
        <h1 className="gold-text text-xl font-black">پنل مدیریت وو وی</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">رمز عبور پیش‌فرض: wuwei2026</p>
        <input type="password" dir="ltr" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setErr(false); }}
          placeholder="••••••••" className="input mt-6 text-center" />
        {err && <p className="mt-3 text-xs text-[#e04b46]">رمز عبور اشتباه است</p>}
        <button disabled={busy}
          className="btn-energy mt-5 w-full rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] py-3 font-black text-black transition disabled:opacity-70">
          {busy ? "⏳ در حال ورود…" : "ورود ⚡"}
        </button>
      </form>
    </div>
  );
}
