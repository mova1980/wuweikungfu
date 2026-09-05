"use client";
import { useState } from "react";
import { type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

const SPORT_ICONS = ["🐉", "🥋", "☯️", "🛡️", "⚔️", "🤸", "🧘", "🏋️", "💪", "🩰", "🪢", "🦴", "💃"];

type Cls = { id: string; label: Record<string, string> | string; monthly?: number };
type Seminar = { id: string; date?: string; title: any; location?: any };

const lblOf = (c: Cls, locale: string) =>
  (typeof c.label === "string" ? c.label : c.label?.[locale] || c.label?.fa || c.id) as string;

export default function RegisterClient({ locale, dict, pricing, seminars = [] }: { locale: Locale; dict: any; pricing?: any; seminars?: Seminar[] }) {
  const [mode, setMode] = useState<"" | "class" | "seminar">("");
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const classes: Cls[] =
    pricing?.classes?.length
      ? pricing.classes
      : (dict.register.levels as string[]).map((l) => ({ id: l, label: l, monthly: 0 }));
  const currency: string =
    (typeof pricing?.currency === "object" && (pricing.currency[locale] || pricing.currency.fa)) || "";
  const fmt = (n: number) => Number(n || 0).toLocaleString(locale === "fa" ? "fa-IR" : locale === "zh" ? "zh-CN" : "en-US");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    age: "",
    sports: [] as string[],
    classType: classes[0]?.id || "",
    time: dict.register.times[0],
    seminarId: "",
    seminarTitle: "",
    seminarDate: "",
    note: "",
  });

  const selCls = classes.find((c) => c.id === form.classType) || classes[0];

  const toggleSport = (s: string) =>
    setForm((f) => ({
      ...f,
      sports: f.sports.includes(s) ? f.sports.filter((x) => x !== s) : [...f.sports, s],
    }));

  const submit = async () => {
    const base = { kind: mode, fullName: form.fullName, phone: form.phone, email: form.email, age: form.age };
    const body =
      mode === "seminar"
        ? { ...base, seminarId: form.seminarId, seminarTitle: form.seminarTitle, seminarDate: form.seminarDate, note: form.note }
        : { ...base, sports: form.sports, classType: form.classType, classLabel: selCls ? lblOf(selCls, locale) : form.classType, price: selCls?.monthly ?? 0, time: form.time };
    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setDone(true);
  };

  /* ---------- steps metadata per mode ---------- */
  const isSeminar = mode === "seminar";
  const steps = isSeminar
    ? [dict.register.step1, dict.register.chooseSeminar, dict.register.step3]
    : [dict.register.step1, dict.register.stepSports, dict.register.step2, dict.register.step3];
  const lastStep = steps.length - 1;

  const canNext = step === 0
    ? Boolean(form.fullName && form.phone)
    : step === 1 && !isSeminar
      ? form.sports.length > 0
      : step === 1 && isSeminar
        ? Boolean(form.seminarTitle)
        : true;

  /* ---------- mode choice screen ---------- */
  if (!mode) {
    return (
      <div className="mx-auto mt-14 max-w-2xl">
        <Reveal variant="scale">
          <div className="card soft-edge p-8">
            <h2 className="gold-text mb-1 text-center text-2xl font-black">{dict.register.modeTitle}</h2>
            <p className="mb-7 text-center text-xs text-[var(--muted)]">{dict.register.modeSub}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button onClick={() => { setMode("class"); setStep(0); }}
                className="group rounded-2xl border border-[#c9a84c]/50 bg-[rgba(201,168,76,0.06)] p-7 text-center transition-all duration-300 hover:scale-[1.03] hover:border-[#c9a84c] hover:bg-[rgba(201,168,76,0.14)] hover:shadow-[0_0_30px_-8px_rgba(201,168,76,0.6)]">
                <span className="block text-4xl transition-transform duration-300 group-hover:scale-110">🥋</span>
                <span className="mt-3 block text-sm font-black text-[#e5c878]">{dict.register.modeClass}</span>
                <span className="mt-2 block text-[11px] leading-5 text-[var(--muted)]">{dict.register.modeClassDesc}</span>
              </button>
              <button onClick={() => { setMode("seminar"); setStep(0); }}
                className="group rounded-2xl border border-[#c41e24]/50 bg-[rgba(196,30,36,0.06)] p-7 text-center transition-all duration-300 hover:scale-[1.03] hover:border-[#c41e24] hover:bg-[rgba(196,30,36,0.14)] hover:shadow-[0_0_30px_-8px_rgba(196,30,36,0.6)]">
                <span className="block text-4xl transition-transform duration-300 group-hover:scale-110">🎯</span>
                <span className="mt-3 block text-sm font-black text-[#ff8a85]">{dict.register.modeSeminar}</span>
                <span className="mt-2 block text-[11px] leading-5 text-[var(--muted)]">{dict.register.modeSeminarDesc}</span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-14 max-w-2xl">
      {/* progress — luminous path */}
      <div className="mb-10 flex items-center">
        {steps.map((s: string, i: number) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`grid h-11 w-11 place-items-center rounded-full border-2 text-sm font-black transition-all duration-500 ${i <= step ? "border-[#c9a84c] bg-[#c9a84c] text-black shadow-[0_0_24px_rgba(201,168,76,0.5)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
                {done || i < step ? "✓" : i + 1}
              </div>
              <div className={`mt-2 max-w-24 text-center text-[10px] leading-4 ${i <= step ? "text-[#e5c878]" : "text-[var(--muted)]"}`}>{s}</div>
            </div>
            {i < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 transition-all duration-700 ${i < step ? "bg-[#c9a84c]" : "bg-[var(--line)]"}`} />}
          </div>
        ))}
      </div>

      <Reveal variant="scale">
        <div className="card soft-edge p-8">
          {done ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 grid h-20 w-20 animate-bounce place-items-center rounded-full bg-green-600/20 text-4xl">🎉</div>
              <h2 className="gold-text text-2xl font-black">{dict.register.success}</h2>
            </div>
          ) : (
            <>
              {/* step 0 — personal info (shared) */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.register.fullName} *</label>
                    <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.register.phone} *</label>
                      <input dir="ltr" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.register.age}</label>
                      <input dir="ltr" type="number" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.register.email}</label>
                    <input dir="ltr" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              )}

              {/* step 1 — CLASS: disciplines (multi-select) */}
              {step === 1 && !isSeminar && (
                <div>
                  <p className="mb-4 text-center text-xs text-[var(--muted)]">✨ {dict.register.sportsHint}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(dict.register.sports as string[]).map((s, i) => {
                      const on = form.sports.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSport(s)}
                          className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${on ? "border-[#c9a84c] bg-[rgba(201,168,76,0.16)] shadow-[0_0_24px_-6px_rgba(201,168,76,0.5)] scale-[1.02]" : "border-[var(--line)] hover:border-[#c9a84c]/60 hover:bg-[rgba(201,168,76,0.05)]"}`}>
                          <span className={`text-2xl transition-transform duration-300 ${on ? "scale-125" : "group-hover:scale-110"}`}>{SPORT_ICONS[i] || "🥋"}</span>
                          <span className={`text-xs font-bold leading-5 ${on ? "text-[#e5c878]" : "text-[var(--fg)]/80"}`}>{s}</span>
                          <span className={`absolute top-2 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black transition-all duration-300 ltr:right-2 rtl:left-2 ${on ? "bg-[#c9a84c] text-black scale-100" : "scale-0"}`}>✓</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.sports.length > 0 && (
                    <p className="mt-4 text-center text-xs text-[#e5c878]">
                      {form.sports.length} ✓ — {form.sports.join(" · ")}
                    </p>
                  )}
                </div>
              )}

              {/* step 1 — SEMINAR: choose seminar */}
              {step === 1 && isSeminar && (
                <div className="space-y-6">
                  <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.register.chooseSeminar} *</label>
                  {seminars.length ? (
                    <div className="space-y-3">
                      {seminars.map((s) => {
                        const on = form.seminarId === s.id;
                        return (
                          <button key={s.id}
                            onClick={() => setForm({ ...form, seminarId: s.id, seminarTitle: (s.title?.[locale] || s.title?.fa || ""), seminarDate: String(s.date || "") })}
                            className={`block w-full rounded-2xl border p-4 text-start transition-all duration-300 ${on ? "border-[#c41e24] bg-[rgba(196,30,36,0.12)] shadow-[0_0_24px_-8px_rgba(196,30,36,0.6)]" : "border-[var(--line)] hover:border-[#c41e24]/60"}`}>
                            <div className="flex items-center justify-between gap-3">
                              <span className={`text-sm font-black ${on ? "text-[#ff8a85]" : "text-[var(--fg)]/90"}`}>🎯 {s.title?.[locale] || s.title?.fa}</span>
                              {on && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#c41e24] text-[10px] font-black text-white">✓</span>}
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                              {s.date && <span dir="ltr">📅 {s.date}</span>}
                              {s.location && <span>📍 {s.location?.[locale] || s.location?.fa}</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <p className="mb-3 rounded-xl border border-[#c41e24]/40 bg-[rgba(196,30,36,0.08)] p-3 text-[11px] leading-6 text-[#ff8a85]">{dict.register.noSeminars}</p>
                      <input className="input" placeholder={dict.register.chooseSeminar} value={form.seminarTitle}
                        onChange={(e) => setForm({ ...form, seminarId: "manual", seminarTitle: e.target.value })} />
                    </div>
                  )}
                </div>
              )}

              {/* step 2 — CLASS: class type & time */}
              {step === 2 && !isSeminar && (
                <div className="space-y-7">
                  <div>
                    <label className="mb-3 block text-xs text-[var(--muted)]">{dict.register.level}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {classes.map((c) => {
                        const on = form.classType === c.id;
                        return (
                          <button key={c.id} onClick={() => setForm({ ...form, classType: c.id })}
                            className={`rounded-2xl border p-3.5 text-center transition-all duration-300 ${on ? "border-[#c9a84c] bg-[rgba(201,168,76,0.15)] text-[#e5c878] shadow-[0_0_24px_-8px_rgba(201,168,76,0.6)] scale-[1.02]" : "border-[var(--line)] text-[var(--muted)] hover:border-[#c9a84c]/50"}`}>
                            <span className="block text-sm font-black">{lblOf(c, locale)}</span>
                            {Boolean(c.monthly) && (
                              <span className={`mt-1.5 block text-[11px] font-bold ${on ? "text-[#e5c878]" : "text-[var(--fg)]/60"}`}>
                                {fmt(c.monthly!)} {currency}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selCls?.monthly ? (
                      <p className="mt-3 text-center text-xs text-[#e5c878]">
                        💰 {dict.register.tuitionFee}: {fmt(selCls.monthly)} {currency} — {dict.register.perMonth}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-3 block text-xs text-[var(--muted)]">{dict.register.time}</label>
                    <div className="space-y-3">
                      {dict.register.times.map((t: string) => (
                        <button key={t} onClick={() => setForm({ ...form, time: t })}
                          className={`block w-full rounded-xl border p-3.5 text-start text-sm transition ${form.time === t ? "border-[#c9a84c] bg-[rgba(201,168,76,0.15)] text-[#e5c878]" : "border-[var(--line)] text-[var(--muted)] hover:border-[#c9a84c]/50"}`}>
                          🕒 {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* last step — confirmation (+ note for seminar) */}
              {step === lastStep && (
                <div className="space-y-3">
                  {[
                    [dict.register.modeTitle, isSeminar ? dict.register.modeSeminar : dict.register.modeClass],
                    [dict.register.fullName, form.fullName],
                    [dict.register.phone, form.phone],
                    [dict.register.email, form.email || "—"],
                    [dict.register.age, form.age || "—"],
                    ...(isSeminar
                      ? [[dict.register.chooseSeminar, form.seminarTitle || "—"] as [string, string]]
                      : [
                          [dict.register.stepSports, form.sports.join("، ") || "—"] as [string, string],
                          [dict.register.level, selCls ? lblOf(selCls, locale) : "—"] as [string, string],
                          ...(selCls?.monthly ? [[dict.register.tuitionFee, `${fmt(selCls.monthly)} ${currency} — ${dict.register.perMonth}`] as [string, string]] : []),
                          [dict.register.time, form.time] as [string, string],
                        ]),
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-4 rounded-xl border border-[var(--line)] p-3.5 text-sm">
                      <span className="shrink-0 text-[var(--muted)]">{k}</span>
                      <span className="text-end font-bold text-[#e5c878]">{v}</span>
                    </div>
                  ))}
                  {isSeminar && (
                    <div>
                      <label className="mb-1.5 mt-2 block text-xs text-[var(--muted)]">{dict.register.seminarNote}</label>
                      <textarea rows={3} className="input resize-none" placeholder={dict.register.seminarPlaceholder}
                        value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => (step === 0 ? (setMode(""), setStep(0)) : setStep((s) => s - 1))}
                  className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm text-[var(--muted)] transition hover:border-[#c9a84c]"
                >
                  ← {step === 0 ? dict.register.modeTitle : dict.register.prev}
                </button>
                {step < lastStep ? (
                  <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext}
                    className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-2.5 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-40">
                    {dict.register.next} →
                  </button>
                ) : (
                  <button onClick={submit}
                    className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-2.5 text-sm font-black text-black transition hover:brightness-110">
                    {dict.register.submit}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Reveal>

      {/* tuition — only for class mode */}
      {mode === "class" && (
        <Reveal>
          <h3 className="mb-4 mt-14 text-center text-xl font-black text-[#e5c878]">{dict.register.tuition}</h3>
          <div className="card overflow-hidden rounded-2xl">
            {classes.some((c) => c.monthly)
              ? classes.filter((c) => c.monthly).map((c) => (
                  <div key={c.id} className="flex justify-between border-b border-[var(--line)]/50 p-4 text-sm transition last:border-0 hover:bg-[rgba(201,168,76,0.05)]">
                    <span className="text-[var(--muted)]">{lblOf(c, locale)}</span>
                    <span className="font-bold">{fmt(c.monthly!)} {currency} <span className="text-[10px] font-normal text-[var(--muted)]">/ {dict.register.perMonth}</span></span>
                  </div>
                ))
              : dict.register.tuitionRows.map(([k, v]: [string, string], i: number) => (
                  <div key={i} className="flex justify-between border-b border-[var(--line)]/50 p-4 text-sm transition last:border-0 hover:bg-[rgba(201,168,76,0.05)]">
                    <span className="text-[var(--muted)]">{k}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
