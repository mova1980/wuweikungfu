"use client";
import { useEffect, useState } from "react";

export default function ContentAdmin() {
  const [content, setContent] = useState<any | null>(null);
  const [raw, setRaw] = useState("");
  const [bad, setBad] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        setRaw(JSON.stringify({ timeline: data.timeline, honors: data.honors, coaches: data.coaches, belts: data.belts }, null, 2));
      }
    })();
  }, []);

  if (!content) return <p className="text-[var(--muted)]">در حال بارگذاری…</p>;

  const save = async () => {
    let extra = {};
    try {
      extra = JSON.parse(raw);
      setBad(false);
    } catch {
      setBad(true);
      return;
    }
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...content, ...extra }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#e5c878]">محتوای سایت</h1>
        <button onClick={save} className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-6 py-2 text-sm font-black text-black">
          {saved ? "ذخیره شد ✓" : "ذخیرهٔ همه"}
        </button>
      </div>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-4 font-black text-[#e5c878]">آمار صفحهٔ اصلی</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(["students", "years", "styles", "medals"] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">{{ students: "هنرجویان", years: "سال تجربه", styles: "سبک‌ها", medals: "افتخارات" }[k]}</span>
              <input dir="ltr" type="number" className="input" value={content.stats?.[k] ?? 0}
                onChange={(e) => setContent({ ...content, stats: { ...content.stats, [k]: Number(e.target.value) } })} />
            </label>
          ))}
        </div>
      </div>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-1 font-black text-[#e5c878]">درگاه پرداخت</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          حالت «آزمایشی» از درگاه شبیه‌سازی‌شدهٔ داخلی استفاده می‌کند. برای پرداخت واقعی، حالت «زرین‌پال» را انتخاب و مرچنت‌کد ۳۶ رقمی خود را وارد کنید.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">حالت درگاه</span>
            <select className="input" value={content.payment?.mode || "mock"}
              onChange={(e) => setContent({ ...content, payment: { ...content.payment, mode: e.target.value } })}>
              <option value="mock">آزمایشی (شبیه‌ساز داخلی)</option>
              <option value="zarinpal">زرین‌پال (واقعی)</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs text-[var(--muted)]">مرچنت‌کد زرین‌پال</span>
            <input dir="ltr" className="input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={content.payment?.merchantId || ""}
              onChange={(e) => setContent({ ...content, payment: { ...content.payment, merchantId: e.target.value.trim() } })} />
          </label>
        </div>
        {content.payment?.mode === "zarinpal" && !content.payment?.merchantId && (
          <p className="mt-3 text-xs text-[#e04b46]">⚠️ بدون مرچنت‌کد، سیستم به‌صورت خودکار از درگاه آزمایشی استفاده می‌کند.</p>
        )}
      </div>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-4 font-black text-[#e5c878]">شعار هیرو (سه‌زبانه)</h2>
        <div className="space-y-3">
          {(["fa", "en", "zh"] as const).map((l) => (
            <label key={l} className="flex items-center gap-3">
              <span className="w-8 text-xs text-[var(--muted)]">{l.toUpperCase()}</span>
              <input dir={l === "fa" ? "rtl" : "ltr"} className="input"
                value={content.hero?.slogan?.[l] || ""}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, slogan: { ...content.hero?.slogan, [l]: e.target.value } } })} />
            </label>
          ))}
        </div>
      </div>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-1 font-black text-[#e5c878]">🤖 دستیار هوشمند (استاد همراه)</h2>
        <p className="mb-4 text-xs leading-6 text-[var(--muted)]">
          با هر سرویس سازگار با OpenAI کار می‌کند (OpenAI، OpenRouter، Groq، DeepSeek، AvalAI و…). اگر متغیرهای محیطی
          <code className="mx-1 rounded bg-black/40 px-1" dir="ltr">AI_API_KEY / AI_BASE_URL / AI_MODEL</code>
          روی سرور تنظیم شده باشند، بر این مقادیر اولویت دارند.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">Base URL</span>
            <input dir="ltr" className="input" placeholder="https://api.openai.com/v1"
              value={content.ai?.baseUrl || ""}
              onChange={(e) => setContent({ ...content, ai: { ...content.ai, baseUrl: e.target.value.trim() } })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">API Key</span>
            <input dir="ltr" type="password" className="input" placeholder="sk-…"
              value={content.ai?.apiKey || ""}
              onChange={(e) => setContent({ ...content, ai: { ...content.ai, apiKey: e.target.value.trim() } })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[var(--muted)]">مدل</span>
            <input dir="ltr" className="input" placeholder="gpt-4o-mini"
              value={content.ai?.model || ""}
              onChange={(e) => setContent({ ...content, ai: { ...content.ai, model: e.target.value.trim() } })} />
          </label>
        </div>
        {!content.ai?.apiKey && (
          <p className="mt-3 text-xs text-[#e5c878]">ℹ️ تا زمانی که کلید API وارد نشود، دستیار پیام «پیکربندی نشده» نمایش می‌دهد.</p>
        )}
      </div>

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-4 font-black text-[#e5c878]">اطلاعات تماس</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(["phone", "email", "instagram", "aparat"] as const).map((k) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">{k}</span>
              <input dir="ltr" className="input" value={content[k] || ""} onChange={(e) => setContent({ ...content, [k]: e.target.value })} />
            </label>
          ))}
        </div>
      </div>

      <div className="card rounded-2xl p-6">
        <h2 className="mb-1 font-black text-[#e5c878]">تایم‌لاین، افتخارات، مربیان و کمربندها (JSON)</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">ساختار سه‌زبانه: {"{ \"fa\": \"...\", \"en\": \"...\", \"zh\": \"...\" }"}</p>
        <textarea dir="ltr" rows={20} className={`input font-mono text-xs ${bad ? "border-[#c41e24]" : ""}`} value={raw} onChange={(e) => setRaw(e.target.value)} />
        {bad && <p className="mt-2 text-xs text-[#e04b46]">JSON نامعتبر است — ذخیره انجام نشد.</p>}
      </div>
    </div>
  );
}
