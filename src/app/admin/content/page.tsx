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

  const setPricing = (fn: (p: any) => any) => setContent((c: any) => ({ ...c, pricing: fn(c.pricing) }));

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

      <div className="card mb-6 rounded-2xl p-6">
        <h2 className="mb-1 font-black text-[#e5c878]">💰 شهریه کلاس‌ها (نوع کلاس در ثبت‌نام)</h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          این مقادیر در مرحلهٔ سوم ثبت‌نام نمایش داده می‌شوند (عمومی / نیمه خصوصی / خصوصی) و مبلغ هر ثبت‌نام بر اساس همان ذخیره می‌شود.
        </p>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          {(["fa", "en", "zh"] as const).map((l) => (
            <label key={l} className="block">
              <span className="mb-1 block text-xs text-[var(--muted)]">واحد پول ({l.toUpperCase()})</span>
              <input dir={l === "fa" ? "rtl" : "ltr"} className="input"
                value={content.pricing?.currency?.[l] || ""}
                onChange={(e) => setPricing((p: any) => ({ ...p, currency: { ...p?.currency, [l]: e.target.value } }))} />
            </label>
          ))}
        </div>
        <div className="space-y-4">
          {(content.pricing?.classes || []).map((c: any, i: number) => (
            <div key={i} className="rounded-xl border border-[var(--line)] p-4">
              <div className="grid items-end gap-3 md:grid-cols-[repeat(3,1fr)_140px_auto]">
                {(["fa", "en", "zh"] as const).map((l) => (
                  <label key={l} className="block">
                    <span className="mb-1 block text-[10px] text-[var(--muted)]">عنوان {l.toUpperCase()}</span>
                    <input dir={l === "fa" ? "rtl" : "ltr"} className="input !py-2 text-xs"
                      value={(typeof c.label === "object" ? c.label?.[l] : c.label) || ""}
                      onChange={(e) => setPricing((p: any) => ({ ...p, classes: p.classes.map((x: any, k: number) => k === i ? { ...x, label: { ...(typeof x.label === "object" ? x.label : {}), [l]: e.target.value } } : x) }))} />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1 block text-[10px] text-[var(--muted)]">مبلغ ماهانه (تومان)</span>
                  <input dir="ltr" type="number" className="input !py-2 text-xs"
                    value={c.monthly ?? 0}
                    onChange={(e) => setPricing((p: any) => ({ ...p, classes: p.classes.map((x: any, k: number) => k === i ? { ...x, monthly: Number(e.target.value) } : x) }))} />
                </label>
                <button onClick={() => setPricing((p: any) => ({ ...p, classes: p.classes.filter((_: any, k: number) => k !== i) }))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c41e24]/40 text-xs text-[#ff8a85] transition hover:bg-[#c41e24]/20">✕</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setPricing((p: any) => ({ ...p, classes: [...(p?.classes || []), { id: `cls-${Date.now().toString(36)}`, label: { fa: "", en: "", zh: "" }, monthly: 0 }] }))}
          className="mt-4 rounded-full border border-[#c9a84c]/60 bg-[#c9a84c]/10 px-5 py-2 text-xs font-bold text-[#e5c878] transition hover:scale-105">
          + افزودن نوع کلاس
        </button>
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
