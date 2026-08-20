"use client";
import { useEffect, useState } from "react";

export default function SettingsAdmin() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [hasPanelPw, setHasPanelPw] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/db-status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }, []);

  const strength = (() => {
    let s = 0;
    if (next.length >= 8) s++;
    if (next.length >= 12) s++;
    if (/[A-Z]/.test(next) && /[a-z]/.test(next)) s++;
    if (/\d/.test(next)) s++;
    if (/[^A-Za-z0-9]/.test(next)) s++;
    return s; // 0..5
  })();
  const strengthMeta = [
    { t: "—", c: "#6e6452" },
    { t: "خیلی ضعیف", c: "#e04b46" },
    { t: "ضعیف", c: "#e04b46" },
    { t: "متوسط", c: "#e5c878" },
    { t: "خوب", c: "#a9d65c" },
    { t: "عالی", c: "#7dd87d" },
  ][strength];

  const submit = async () => {
    setMsg(null);
    if (next !== confirm) return setMsg({ ok: false, text: "رمز جدید و تکرارش یکسان نیستند" });
    if (next.length < 8) return setMsg({ ok: false, text: "رمز جدید باید حداقل ۸ کاراکتر باشد" });
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: "✓ رمز عبور با موفقیت تغییر کرد — از این پس با رمز جدید وارد شوید" });
        setCurrent(""); setNext(""); setConfirm("");
        setHasPanelPw(true);
      } else {
        setMsg({ ok: false, text: data?.error || `خطا (${res.status})` });
      }
    } catch {
      setMsg({ ok: false, text: "خطای شبکه" });
    }
    setBusy(false);
  };

  return (
    <div dir="rtl">
      <h1 className="mb-6 text-2xl font-black"><span className="gold-text">⚙️ تنظیمات</span></h1>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-1 font-black text-[#e5c878]">🔐 تغییر رمز عبور مدیر</h2>
        <p className="mb-5 text-xs leading-6 text-[var(--muted)]">
          رمز جدید به‌صورت هش‌شده (scrypt + salt) در دیتابیس ذخیره می‌شود و جایگزین رمز محیطی
          <code className="mx-1 rounded bg-black/40 px-1" dir="ltr">ADMIN_PASSWORD</code>
          می‌گردد. حتی مدیر سرور نمی‌تواند رمز را بخواند — فقط قابل تغییر است.
        </p>

        <div className="grid max-w-xl gap-4">
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">رمز عبور فعلی *</span>
            <input dir="ltr" type={show ? "text" : "password"} className="input" value={current}
              onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">رمز عبور جدید * (حداقل ۸ کاراکتر)</span>
            <input dir="ltr" type={show ? "text" : "password"} className="input" value={next}
              onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            {next && (
              <span className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-1.5 w-6 rounded-full"
                      style={{ background: i < strength ? strengthMeta.c : "rgba(255,255,255,0.1)" }} />
                  ))}
                </span>
                <span style={{ color: strengthMeta.c }}>{strengthMeta.t}</span>
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">تکرار رمز جدید *</span>
            <input dir="ltr" type={show ? "text" : "password"} className="input" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShow(!show)} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
              {show ? "🙈 پنهان" : "👁 نمایش"}
            </button>
            <button disabled={busy || !current || !next} onClick={submit}
              className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-2.5 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-40">
              {busy ? "⏳ …" : "تغییر رمز ✓"}
            </button>
            {hasPanelPw && <span className="badge">رمز اختصاصی فعال است</span>}
          </div>

          {msg && (
            <div className={`rounded-xl border px-4 py-3 text-sm leading-7 ${msg.ok
              ? "border-green-600/40 bg-green-600/10 text-[#7dd87d]"
              : "border-[#c41e24]/50 bg-[#c41e24]/10 text-[#ff8a85]"}`}>
              {msg.ok ? "✅" : "⛔"} {msg.text}
            </div>
          )}
        </div>
      </div>

      <div className="card rounded-2xl p-6 text-xs leading-7 text-[var(--muted)]">
        <h2 className="mb-2 font-black text-[#e5c878]">🛡 نکات امنیتی فعال</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>هش رمز با الگوریتم <span dir="ltr" className="font-mono">scrypt</span> + نمک تصادفی ۱۶ بایتی ذخیره می‌شود (استاندارد Node.js)</li>
          <li>مقایسه‌ها زمان‌ثابت است (ضد حملات timing)</li>
          <li>بیش از ۸ تلاش ناموفق ورود در ۵ دقیقه → موقتاً مسدود می‌شود (ضد بروت‌فورس)</li>
          <li>کوکی نشست <span dir="ltr" className="font-mono">httpOnly</span> و در محیط پروداکشن <span dir="ltr" className="font-mono">Secure</span> است — ۱۲ ساعت اعتبار</li>
          <li>اولویت رمز: رمز تغییر‌یافته از پنل ← متغیر محیطی <span dir="ltr" className="font-mono">ADMIN_PASSWORD</span> ← رمز پیش‌فرض توسعهٔ محلی</li>
          <li>⚠️ رمز را جایی امن نگه دارید؛ بازیابی آن فقط از طریق پاک‌کردن <span dir="ltr" className="font-mono">settings.adminPassword</span> در دیتابیس ممکن است</li>
        </ul>
      </div>
    </div>
  );
}
