"use client";
import { useState } from "react";
import { type Locale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export default function RegisterClient({ locale, dict }: { locale: Locale; dict: any }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", age: "", level: dict.register.levels[0], time: dict.register.times[0] });

  const submit = async () => {
    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setDone(true);
  };

  const steps = [dict.register.step1, dict.register.step2, dict.register.step3];
  const canNext = step === 0 ? form.fullName && form.phone : true;

  return (
    <div className="mx-auto mt-14 max-w-2xl">
      {/* progress — luminous path */}
      <div className="mb-10 flex items-center">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`grid h-11 w-11 place-items-center rounded-full border-2 text-sm font-black transition-all duration-500 ${i <= step ? "border-[#c9a84c] bg-[#c9a84c] text-black shadow-[0_0_24px_rgba(201,168,76,0.5)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
                {done || i < step ? "✓" : i + 1}
              </div>
              <div className={`mt-2 text-[10px] ${i <= step ? "text-[#e5c878]" : "text-[var(--muted)]"}`}>{s}</div>
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
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <label className="mb-3 block text-xs text-[var(--muted)]">{dict.register.level}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {dict.register.levels.map((l: string) => (
                        <button key={l} onClick={() => setForm({ ...form, level: l })}
                          className={`rounded-xl border p-3.5 text-sm transition ${form.level === l ? "border-[#c9a84c] bg-[rgba(201,168,76,0.15)] text-[#e5c878]" : "border-[var(--line)] text-[var(--muted)] hover:border-[#c9a84c]/50"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
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
              {step === 2 && (
                <div className="space-y-3">
                  {[[dict.register.fullName, form.fullName], [dict.register.phone, form.phone], [dict.register.email, form.email || "—"], [dict.register.age, form.age || "—"], [dict.register.level, form.level], [dict.register.time, form.time]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between rounded-xl border border-[var(--line)] p-3.5 text-sm">
                      <span className="text-[var(--muted)]">{k}</span>
                      <span className="font-bold text-[#e5c878]">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                  className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm text-[var(--muted)] transition hover:border-[#c9a84c] disabled:opacity-30">
                  ← {dict.register.prev}
                </button>
                {step < 2 ? (
                  <button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext}
                    className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-2.5 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-40">
                    {dict.register.next} →
                  </button>
                ) : (
                  <button onClick={submit}
                    className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-7 py-2.5 text-sm font-black text-black transition hover:brightness-110">
                    {dict.register.submit} ⚡
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Reveal>

      {/* tuition */}
      <Reveal>
        <h3 className="mb-4 mt-14 text-center text-xl font-black text-[#e5c878]">{dict.register.tuition}</h3>
        <div className="card overflow-hidden rounded-2xl">
          {dict.register.tuitionRows.map(([k, v]: [string, string], i: number) => (
            <div key={i} className="flex justify-between border-b border-[var(--line)]/50 p-4 text-sm transition last:border-0 hover:bg-[rgba(201,168,76,0.05)]">
              <span className="text-[var(--muted)]">{k}</span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
