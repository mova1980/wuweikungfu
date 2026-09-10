"use client";
import { useEffect, useRef, useState } from "react";
import { J_MONTHS, formatJalali, isoToJalali, jMonthLen, jMonthStartWeekday, jalaliToISO, todayISO, toFaDigits } from "@/lib/jalali";

/**
 * 📅 Jalali (Shamsi) date picker — dark/gold themed, Saturday-first week.
 * value: ISO "YYYY-MM-DD" | ""  ·  onChange(iso)
 */
export default function JalaliDatePicker({ value, onChange }: { value?: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const j = isoToJalali(value || "") || isoToJalali(todayISO())!;
    return { jy: j.jy, jm: j.jm };
  });
  const boxRef = useRef<HTMLDivElement>(null);

  // sync view when value changes externally
  useEffect(() => {
    const j = isoToJalali(value || "");
    if (j) setView({ jy: j.jy, jm: j.jm });
  }, [value]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const todayJ = isoToJalali(todayISO())!;
  const selJ = isoToJalali(value || "");
  const days = jMonthLen(view.jy, view.jm);
  const startWd = jMonthStartWeekday(view.jy, view.jm);

  const pick = (jd: number) => {
    onChange(jalaliToISO(view.jy, view.jm, jd));
    setOpen(false);
  };
  const moveMonth = (dir: 1 | -1) => {
    setView((v) => {
      let jm = v.jm + dir;
      let jy = v.jy;
      if (jm > 12) { jm = 1; jy += 1; }
      if (jm < 1) { jm = 12; jy -= 1; }
      return { jy, jm };
    });
  };

  return (
    <div ref={boxRef} className="relative" dir="rtl">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${value ? "border-[#c9a84c]/60 bg-[rgba(201,168,76,0.08)] text-[#e5c878]" : "border-[var(--line)] text-[var(--muted)] hover:border-[#c9a84c]/50"}`}>
        <span className="font-bold">{value ? `📅 ${formatJalali(value)}` : "📅 تاریخ (بدون تاریخ)"}</span>
        <span className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="glass-strong absolute z-50 mt-2 w-64 rounded-2xl border border-[#c9a84c]/40 p-3 shadow-[0_24px_60px_-15px_rgba(201,168,76,0.4)]" style={{ background: "#0d0c10" }}>
          {/* month nav */}
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => moveMonth(-1)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] text-[#e5c878] transition hover:border-[#c9a84c]">›</button>
            <div className="text-xs font-black text-[#e5c878]">{J_MONTHS[view.jm - 1]} {toFaDigits(view.jy)}</div>
            <button type="button" onClick={() => moveMonth(1)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] text-[#e5c878] transition hover:border-[#c9a84c]">‹</button>
          </div>
          {/* weekdays */}
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[9px] text-[var(--muted)]">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => <span key={d}>{d}</span>)}
          </div>
          {/* days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWd }).map((_, i) => <span key={`e${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const jd = i + 1;
              const isSel = selJ && selJ.jy === view.jy && selJ.jm === view.jm && selJ.jd === jd;
              const isToday = todayJ.jy === view.jy && todayJ.jm === view.jm && todayJ.jd === jd;
              return (
                <button type="button" key={jd} onClick={() => pick(jd)}
                  className={`grid h-7 place-items-center rounded-lg text-[11px] font-bold transition ${isSel
                    ? "bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] text-black shadow-md"
                    : isToday
                      ? "border border-[#c41e24]/60 text-[#ff8a85] hover:bg-[rgba(196,30,36,0.15)]"
                      : "text-[var(--fg)]/80 hover:bg-[rgba(201,168,76,0.15)] hover:text-[#e5c878]"}`}>
                  {toFaDigits(jd)}
                </button>
              );
            })}
          </div>
          {/* actions */}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-2">
            <button type="button" onClick={() => { onChange(todayISO()); setOpen(false); }}
              className="rounded-full border border-[#c9a84c]/50 px-3 py-1 text-[10px] font-bold text-[#e5c878] transition hover:bg-[rgba(201,168,76,0.12)]">امروز</button>
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="rounded-full border border-[#c41e24]/40 px-3 py-1 text-[10px] text-[#ff8a85] transition hover:bg-[rgba(196,30,36,0.12)]">پاک کردن</button>
          </div>
        </div>
      )}
    </div>
  );
}
