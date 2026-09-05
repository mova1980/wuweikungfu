"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  collection: string;
  title: string;
  /** which key to show as row label (multilingual object or string) */
  labelKey: string;
  /** template used when creating a new item */
  template: any;
  extraCols?: string[];
};

const isMl = (v: any) => v && typeof v === "object" && !Array.isArray(v) && ("fa" in v || "en" in v || "zh" in v);

/* ---- client-side image compression (max 1600px, JPEG 82%) → data URL in DB ---- */
async function fileToDataUrl(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no ctx");
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Image field: preview + URL/path input + upload from computer (stored in DB) */
function ImageField({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (f: File | undefined | null) => {
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      const src = await fileToDataUrl(f);
      if (src.length > 1_600_000) {
        setErr("تصویر بیش از حد بزرگ است — پس از فشرده‌سازی هم حدود ۱.۶ مگابایت شد. تصویر کوچک‌تری انتخاب کنید.");
      } else {
        onChange(src);
      }
    } catch {
      setErr("خواندن فایل ممکن نشد.");
    }
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-[var(--line)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#e5c878]">{k}</span>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
          className="rounded-full border border-[#c9a84c]/60 bg-[#c9a84c]/10 px-3.5 py-1.5 text-[11px] font-bold text-[#e5c878] transition hover:scale-105 disabled:opacity-50">
          {busy ? "…" : "📤 آپلود از سیستم"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
      <input dir="ltr" className="input text-xs" placeholder="/images/… یا https://…" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-2 flex items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-20 w-28 shrink-0 rounded-lg border border-[var(--line)] object-cover" />
        ) : (
          <div className="grid h-20 w-28 shrink-0 place-items-center rounded-lg border border-dashed border-[var(--line)] text-lg text-[var(--muted)]">🖼️</div>
        )}
        <p className="text-[10px] leading-5 text-[var(--muted)]">
          اختیاری — لینک/مسیر تصویر را بنویسید یا از سیستم آپلود کنید.
          {value?.startsWith("data:") && <span className="block text-[#7dd87d]">✓ تصویر آپلودی (ذخیره در دیتابیس)</span>}
          {err && <span className="block text-[#ff8a85]">{err}</span>}
        </p>
      </div>
    </div>
  );
}

function Field({ k, value, onChange }: { k: string; value: any; onChange: (v: any) => void }) {
  /* image-like fields → composite uploader field */
  if (typeof value === "string" && /image|cover|logo|photo|banner|thumb/i.test(k)) {
    return <ImageField k={k} value={value} onChange={onChange} />;
  }
  if (k === "date" && typeof value === "string") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-[#e5c878]">{k}</span>
        <input dir="ltr" type="date" className="input" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between rounded-xl border border-[var(--line)] px-4 py-3">
        <span className="text-xs font-bold text-[#e5c878]">{k}</span>
        <button type="button" onClick={() => onChange(!value)}
          className={`relative h-6 w-11 rounded-full transition ${value ? "bg-[#c9a84c]" : "bg-white/10"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? "left-[1.4rem]" : "left-0.5"}`} />
        </button>
      </label>
    );
  }
  if (isMl(value)) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-3">
        <div className="mb-2 text-xs font-bold text-[#e5c878]">{k}</div>
        <div className="space-y-2">
          {(["fa", "en", "zh"] as const).map((l) => {
            const long = String(value[l] || "").length > 80 || k === "body" || k === "desc" || k === "text";
            return (
              <div key={l} className="flex items-start gap-2">
                <span className="mt-2 w-7 shrink-0 text-[10px] text-[var(--muted)]">{l.toUpperCase()}</span>
                {long ? (
                  <textarea dir={l === "fa" ? "rtl" : "ltr"} rows={k === "body" ? 6 : 2} className="input text-xs"
                    value={value[l] || ""} onChange={(e) => onChange({ ...value, [l]: e.target.value })} />
                ) : (
                  <input dir={l === "fa" ? "rtl" : "ltr"} className="input text-xs"
                    value={value[l] || ""} onChange={(e) => onChange({ ...value, [l]: e.target.value })} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-[#e5c878]">{k}</span>
        <input dir="ltr" type="number" className="input" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </label>
    );
  }
  if (typeof value === "string") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-[#e5c878]">{k}</span>
        <input dir="ltr" className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }
  if (value === null) {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-[#e5c878]">{k} (خالی)</span>
        <input dir="ltr" className="input" placeholder="—" onChange={(e) => onChange(e.target.value || null)} />
      </label>
    );
  }
  // arrays / nested objects → JSON editor
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-[#e5c878]">{k} (JSON)</span>
      <JsonArea value={value} onChange={onChange} />
    </label>
  );
}

function JsonArea({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [bad, setBad] = useState(false);
  return (
    <>
      <textarea dir="ltr" rows={5} className={`input font-mono text-[11px] ${bad ? "border-[#c41e24]" : ""}`} value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setBad(false);
          } catch {
            setBad(true);
          }
        }} />
      {bad && <span className="text-[10px] text-[#e04b46]">JSON نامعتبر</span>}
    </>
  );
}

export default function CollectionAdmin({ collection, title, labelKey, template, extraCols = [] }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/admin/${collection}`);
    if (res.ok) setItems(await res.json());
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const label = (it: any) => {
    const v = it[labelKey];
    return isMl(v) ? v.fa || v.en : String(v ?? it.id);
  };

  const save = async () => {
    setBusy(true);
    const isNew = !editing.id;
    await fetch(`/api/admin/${collection}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setBusy(false);
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/${collection}?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#e5c878]">{title}</h1>
        <button onClick={() => setEditing(structuredClone(template))}
          className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-5 py-2 text-sm font-black text-black">
          + افزودن
        </button>
      </div>

      <div className="card overflow-x-auto rounded-2xl">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>عنوان</th>
              {extraCols.map((c) => <th key={c}>{c}</th>)}
              <th className="w-32">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="transition hover:bg-white/[0.03]">
                <td className="max-w-md truncate">{label(it)}</td>
                {extraCols.map((c) => <td key={c} className="text-[var(--muted)]">{typeof it[c] === "object" ? (isMl(it[c]) ? it[c].fa : "…") : String(it[c] ?? "—")}</td>)}
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(structuredClone(it))} className="badge hover:border-[#c9a84c]">ویرایش</button>
                    <button onClick={() => del(it.id)} className="badge hover:border-[#c41e24] hover:text-[#e04b46]">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={2 + extraCols.length} className="py-10 text-center text-[var(--muted)]">موردی وجود ندارد</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="card max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#0d0c0f] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-black text-[#e5c878]">{editing.id ? "ویرایش" : "افزودن"} — {title}</h2>
            <div className="space-y-4">
              {Object.entries(editing).filter(([k]) => k !== "id").map(([k, v]) => (
                <Field key={k} k={k} value={v} onChange={(nv) => setEditing((cur: any) => ({ ...cur, [k]: nv }))} />
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="rounded-full border border-[var(--line)] px-5 py-2 text-sm text-[var(--muted)]">انصراف</button>
              <button onClick={save} disabled={busy}
                className="btn-energy rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-6 py-2 text-sm font-black text-black disabled:opacity-50">
                {busy ? "..." : "ذخیره ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
