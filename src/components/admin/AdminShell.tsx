"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const items: [string, string, string][] = [
  ["/admin", "📊", "داشبورد"],
  ["/admin/orders", "🧾", "سفارش‌ها و پرداخت"],
  ["/admin/posts", "✍️", "مقالات"],
  ["/admin/techniques", "🥋", "تکنیک‌ها"],
  ["/admin/videos", "🎬", "ویدئوها"],
  ["/admin/events", "🏆", "رویدادها"],
  ["/admin/products", "🛍", "محصولات"],
  ["/admin/testimonials", "💬", "نظرات شاگردان"],
  ["/admin/messages", "✉️", "پیام‌ها"],
  ["/admin/registrations", "📝", "ثبت‌نام‌ها"],
  ["/admin/content", "⚙️", "محتوای سایت"],
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  // Session guard: re-validates the auth cookie on every mount AND whenever
  // the page is restored from the browser's back/forward cache (bfcache).
  // After logout, pressing "Back" can show a cached snapshot of the panel —
  // this immediately kicks the visitor to the login page.
  useEffect(() => {
    if (isLogin) return;
    const check = async () => {
      try {
        const res = await fetch("/api/admin/auth", { cache: "no-store" });
        if (!res.ok) window.location.replace("/admin/login");
      } catch {}
    };
    check();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, isLogin]);

  if (isLogin) return <div dir="rtl" className="font-fa">{children}</div>;

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    // hard replace: removes the panel from the current history entry
    window.location.replace("/admin/login");
  };

  return (
    <div dir="rtl" className="font-fa flex min-h-screen bg-[#0c0b0e]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-[var(--line)] bg-[#0a090c] p-4 md:flex">
        <Link href="/fa" className="mb-8 flex items-center gap-2.5 px-2">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="logo-glow rounded-full" />
          <div>
            <div className="gold-text text-sm font-black">وو وی کونگ فو</div>
            <div className="text-[9px] tracking-widest text-[var(--muted)]">ADMIN PANEL</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1">
          {items.map(([href, icon, label]) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${pathname === href ? "bg-[rgba(201,168,76,0.15)] text-[#e5c878]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]"}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 space-y-2">
          <Link href="/fa"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#c9a84c]/40 px-3.5 py-2.5 text-sm text-[#e5c878] transition hover:bg-[rgba(201,168,76,0.1)]">
            🌐 بازگشت به سایت
          </Link>
          <button onClick={logout} className="w-full rounded-xl border border-[#c41e24]/40 px-3.5 py-2.5 text-sm text-[#e04b46] transition hover:bg-[#c41e24]/10">
            🚪 خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
