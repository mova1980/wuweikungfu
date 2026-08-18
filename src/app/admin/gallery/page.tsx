"use client";
import { useEffect, useRef, useState } from "react";

type Img = { id: string; src: string; caption?: string; desc?: string; origin?: string };
type Cat = { id: string; title: string; titleEn?: string; titleZh?: string; icon?: string; order?: number; cover?: string; images: Img[] };

const PLACEHOLDER = "/images/gallery/placeholder.svg";
const nid = () => `x-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/* ---- client-side compression: max 1600px, JPEG 82% → keeps Redis small ---- */
async function fileToDataUrl(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  try {
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
  } catch {
    // fallback: raw data URL
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
}

export default function GalleryAdmin() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null); // managed category id
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [nc, setNc] = useState({ icon: "🖼️", title: "", titleEn: "", titleZh: "" });
  const [urlAdd, setUrlAdd] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (s: string) => { setMsg(s); setTimeout(() => setMsg(""), 2600); };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    if (res.ok) {
      const data = await res.json();
      setCats(Array.isArray(data) ? data.sort((a: Cat, b: Cat) => (a.order ?? 99) - (b.order ?? 99)) : []);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const put = async (cat: Cat) => {
    setBusy(true);
    const res = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, cover: (cat.images || []).find((i) => i.src.startsWith("/images/"))?.src || cat.cover || "" }),
    });
    setBusy(false);
    if (res.ok) { flash("✓ ذخیره شد"); setDirty(false); await load(); }
    else flash("⚠ خطا در ذخیره‌سازی");
  };

  const post = async (cat: Cat) => {
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, id: cat.id }),
    });
    return res.ok;
  };

  const del = async (id: string) => {
    if (!confirm("این دسته و همه تصاویرش حذف شود؟")) return;
    await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    if (open === id) setOpen(null);
    load();
  };

  const move = async (i: number, dir: -1 | 1) => {
    const next = [...cats];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    const reordered = next.map((c, k) => ({ ...c, order: k + 1 }));
    setCats(reordered);
    await Promise.all(reordered.map((c) => fetch("/api/admin/gallery", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) })));
    flash("✓ ترتیب ذخیره شد");
    load();
  };

  const addCat = async () => {
    if (!nc.title.trim()) return flash("عنوان فارسی الزامی است");
    const cat: Cat = { id: nid(), title: nc.title.trim(), titleEn: nc.titleEn.trim(), titleZh: nc.titleZh.trim(), icon: nc.icon || "🖼️", order: cats.length + 1, images: [] };
    if (await post(cat)) { setShowNew(false); setNc({ icon: "🖼️", title: "", titleEn: "", titleZh: "" }); flash("✓ دسته ساخته شد"); load(); }
    else flash("⚠ خطا");
  };

  /* ---------------- image ops on the open category ---------------- */
  const cur = cats.find((c) => c.id === open) || null;

  const mutate = (fn: (imgs: Img[]) => Img[]) => {
    if (!cur) return;
    setCats((cs) => cs.map((c) => (c.id === cur.id ? { ...c, images: fn(c.images || []) } : c)));
    setDirty(true);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length || !cur) return;
    setBusy(true);
    const added: Img[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const src = await fileToDataUrl(f);
      if (src.length > 1_600_000) { flash(`⚠ ${f.name}: بیش از حد بزرگ — فشرده نشد، رد شد`); continue; }
      added.push({ id: nid(), src, caption: "" });
    }
    setBusy(false);
    if (added.length) {
      mutate((imgs) => [...imgs, ...added]);
      flash(`${added.length} تصویر آماده شد — برای ثبت نهایی «ذخیره» بزنید`);
    }
  };

  const addByUrl = () => {
    const u = urlAdd.trim();
    if (!u) return;
    mutate((imgs) => [...imgs, { id: nid(), src: u, caption: "" }]);
    setUrlAdd("");
  };

  const moveImg = (i: number, dir: -1 | 1) => {
    mutate((imgs) => {
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      const cp = [...imgs];
      [cp[i], cp[j]] = [cp[j], cp[i]];
      return cp;
    });
  };

  const onErr = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.dataset.fb !== "1") { el.dataset.fb = "1"; el.src = PLACEHOLDER; }
  };

  /* ---------------- views ---------------- */
  if (loading) return <div className="p-10 text-center text-[var(--muted)]">…</div>;

  if (cur) {
    return (
      <div dir="rtl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button onClick={() => { if (!dirty || confirm("تغییرات ذخیره نشده از بین می‌رود؟")) { setOpen(null); setDirty(false); } }}
              className="mb-2 text-xs text-[#e5c878] hover:underline">→ بازگشت به دسته‌ها</button>
            <h1 className="text-2xl font-black">
              <span className="gold-text">{cur.icon} {cur.title}</span>
              <span className="ms-2 text-xs font-normal text-[var(--muted)]">({(cur.images || []).length} تصویر)</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {dirty && <span className="badge">تغییرات ذخیره نشده</span>}
            <button disabled={busy} onClick={() => put(cur)} className="rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-6 py-2.5 text-sm font-black text-black shadow-lg transition hover:scale-105 disabled:opacity-50">
              {busy ? "…" : "ذخیره ✓"}
            </button>
          </div>
        </div>

        {msg && <div className="mb-4 rounded-xl border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-4 py-2 text-sm text-[#e5c878]">{msg}</div>}

        {/* add images */}
        <div className="card mb-6 p-5">
          <div className="mb-3 text-sm font-bold text-[#e5c878]">افزودن تصویر</div>
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} disabled={busy}
              className="rounded-full border border-[#c9a84c]/60 bg-[#c9a84c]/10 px-5 py-2.5 text-sm font-bold text-[#e5c878] transition hover:scale-105">
              📤 آپلود فایل (چندتایی)
            </button>
            <span className="text-[11px] text-[var(--muted)]">خودکار فشرده می‌شود (حداکثر ضلع ۱۶۰۰px)</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input dir="ltr" value={urlAdd} onChange={(e) => setUrlAdd(e.target.value)} placeholder="یا آدرس تصویر: /images/gallery/… یا https://…"
              className="input flex-1 text-xs !rounded-full" style={{ minWidth: 260 }} />
            <button onClick={addByUrl} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-bold text-[#e5c878] transition hover:border-[#c9a84c]">+ افزودن</button>
          </div>
        </div>

        {/* images grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(cur.images || []).map((img, i) => (
            <div key={img.id + i} className="card p-3">
              <div className="relative mb-3 overflow-hidden rounded-lg border border-[var(--line)]">
                <img src={img.src} alt="" onError={onErr} className="h-40 w-full object-cover" />
                <div className="absolute top-1.5 flex gap-1" style={{ insetInlineEnd: "0.4rem" }}>
                  <button onClick={() => moveImg(i, -1)} title="بالا" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-black/70 text-[11px] text-[#e5c878] hover:border-[#c9a84c]">↑</button>
                  <button onClick={() => moveImg(i, 1)} title="پایین" className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-black/70 text-[11px] text-[#e5c878] hover:border-[#c9a84c]">↓</button>
                  <button onClick={() => mutate((imgs) => imgs.filter((x) => x.id !== img.id))} title="حذف"
                    className="grid h-7 w-7 place-items-center rounded-full border border-[#c41e24]/50 bg-black/70 text-[11px] text-[#ff8a85] hover:border-[#c41e24]">✕</button>
                </div>
              </div>
              <input value={img.caption || ""} onChange={(e) => mutate((imgs) => imgs.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))}
                placeholder="عنوان تصویر" className="input mb-2 !py-2 text-xs" />
              <input value={img.desc || ""} onChange={(e) => mutate((imgs) => imgs.map((x, k) => (k === i ? { ...x, desc: e.target.value } : x)))}
                placeholder="توضیح کوتاه (مثلاً تاریخ)" className="input mb-2 !py-2 text-xs" />
              <input dir="ltr" value={img.src.startsWith("data:") ? "📎 فایل آپلودی (داخل دیتابیس)" : img.src}
                onChange={(e) => mutate((imgs) => imgs.map((x, k) => (k === i && !x.src.startsWith("data:") ? { ...x, src: e.target.value } : x)))}
                placeholder="مسیر/آدرس تصویر" className="input !py-2 font-mono text-[10px] !rounded-lg" />
            </div>
          ))}
        </div>
        {(cur.images || []).length === 0 && <div className="card p-12 text-center text-sm text-[var(--muted)]">هنوز تصویری نیست — از بالای صفحه اضافه کنید.</div>}
      </div>
    );
  }

  /* ---------------- categories list ---------------- */
  return (
    <div dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black"><span className="gold-text">🖼️ مدیریت گالری</span></h1>
        <button onClick={() => setShowNew(!showNew)} className="rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-6 py-2.5 text-sm font-black text-black shadow-lg transition hover:scale-105">
          {showNew ? "✕ انصراف" : "+ دسته جدید"}
        </button>
      </div>

      {msg && <div className="mb-4 rounded-xl border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-4 py-2 text-sm text-[#e5c878]">{msg}</div>}

      {showNew && (
        <div className="card mb-6 p-5">
          <div className="mb-3 text-sm font-bold text-[#e5c878]">دسته‌بندی جدید</div>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={nc.icon} onChange={(e) => setNc({ ...nc, icon: e.target.value })} placeholder="آیکون (اموجی)" className="input text-center" />
            <input value={nc.title} onChange={(e) => setNc({ ...nc, title: e.target.value })} placeholder="عنوان فارسی *" className="input" />
            <input dir="ltr" value={nc.titleEn} onChange={(e) => setNc({ ...nc, titleEn: e.target.value })} placeholder="English title" className="input" />
            <input dir="ltr" value={nc.titleZh} onChange={(e) => setNc({ ...nc, titleZh: e.target.value })} placeholder="中文标题" className="input" />
          </div>
          <button onClick={addCat} className="mt-4 rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-6 py-2 text-sm font-black text-black transition hover:scale-105">ساخت دسته</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {cats.map((c, i) => {
          const broken = (c.images || []).filter((x) => !x.src.startsWith("/images/") && !x.src.startsWith("data:")).length;
          return (
            <div key={c.id} className="card flex items-center gap-4 p-4">
              {c.cover ? (
                <img src={c.cover} alt="" onError={onErr} className="h-20 w-20 shrink-0 rounded-xl border border-[var(--line)] object-cover" />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-black/30 text-2xl">{c.icon || "🖼️"}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{c.icon} {c.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--muted)]" dir="ltr">{c.titleEn || "—"} · {c.titleZh || "—"}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="badge">{(c.images || []).length} تصویر</span>
                  {broken > 0 && <span className="badge !border-[#c41e24]/50 !text-[#ff8a85]">⚠ {broken} در انتظار آپلود</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => { setOpen(c.id); setDirty(false); }} className="rounded-full bg-[#c9a84c]/15 px-3.5 py-1.5 text-[11px] font-bold text-[#e5c878] transition hover:bg-[#c9a84c]/30">مدیریت تصاویر</button>
                  <button onClick={() => { const t = prompt("عنوان فارسی:", c.title); if (t === null) return; const e = prompt("English title:", c.titleEn || ""); if (e === null) return; const z = prompt("中文标题:", c.titleZh || ""); if (z === null) return; put({ ...c, title: t, titleEn: e, titleZh: z }); }}
                    className="rounded-full border border-[var(--line)] px-3.5 py-1.5 text-[11px] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">ویرایش عنوان</button>
                  <button onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] text-[11px] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">↑</button>
                  <button onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] text-[11px] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">↓</button>
                  <button onClick={() => del(c.id)} className="rounded-full border border-[#c41e24]/40 px-3 py-1.5 text-[11px] text-[#ff8a85] transition hover:bg-[#c41e24]/20">حذف</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-6 p-4 text-[11px] leading-6 text-[var(--muted)]">
        💡 تصاویر آپلودی داخل دیتابیس سایت (Redis/فایل) ذخیره می‌شوند و روی Vercel هم ماندگارند — هر عکس خودکار تا ضلع ۱۶۰۰ پیکسل فشرده می‌شود.
        برای عکس‌های خیلی زیاد و حجیم، بهتر است فایل را در <span dir="ltr" className="font-mono">public/images/gallery</span> ریپو بگذارید و فقط مسیرش را وارد کنید.
      </div>
    </div>
  );
}
