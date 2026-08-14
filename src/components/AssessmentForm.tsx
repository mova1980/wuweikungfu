"use client";
import { useState } from "react";
import { type Locale } from "@/lib/i18n";

export default function AssessmentForm({ locale, dict }: { locale: Locale; dict: any }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", phone: "", age: "", note: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="card glass-strong grid min-h-72 place-items-center rounded-3xl p-10 text-center">
        <div>
          <div className="mx-auto mb-5 grid h-20 w-20 animate-bounce place-items-center rounded-full bg-green-600/20 text-4xl">✓</div>
          <p className="mx-auto max-w-md leading-8 text-[#e5c878]">{dict.assessment.success}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card glass-strong space-y-5 rounded-3xl p-8">
      <div>
        <h3 className="text-lg font-black text-[#e5c878]">📋 {dict.assessment.formTitle}</h3>
        <p className="mt-1.5 text-xs leading-6 text-[var(--muted)]">{dict.assessment.formSub}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.assessment.name} *</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.assessment.phone} *</label>
          <input required dir="ltr" inputMode="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.assessment.age}</label>
        <input dir="ltr" type="number" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[var(--muted)]">{dict.assessment.note}</label>
        <textarea rows={3} className="input resize-none" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </div>
      <button disabled={state === "sending"}
        className="btn-energy w-full rounded-full bg-gradient-to-l from-[#e5c878] via-[#c9a84c] to-[#9a7b2e] py-3.5 font-black text-black transition hover:brightness-110 disabled:opacity-60">
        {state === "sending" ? "⏳ …" : dict.assessment.submit}
      </button>
    </form>
  );
}
