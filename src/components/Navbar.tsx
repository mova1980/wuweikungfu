"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const localeNames: Record<string, string> = { fa: "فارسی", en: "English", zh: "中文" };

export default function Navbar({ locale, dict }: { locale: Locale; dict: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("light");
    setLight(html.classList.contains("light"));
  };

  const links: [string, string][] = [
    [`/${locale}`, dict.nav.home],
    [`/${locale}/about`, dict.nav.about],
    [`/${locale}/techniques`, dict.nav.techniques],
    [`/${locale}/blog`, dict.nav.blog],
    [`/${locale}/shop`, dict.nav.shop],
    [`/${locale}/videos`, dict.nav.videos],
    [`/${locale}/events`, dict.nav.events],
    [`/${locale}/corrective`, dict.nav.corrective],
    [`/${locale}/contact`, dict.nav.contact],
  ];

  const pathNoLocale = pathname.replace(/^\/(fa|en|zh)/, "") || "";

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "nav-glass py-2" : "py-4"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4">
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <Image src="/images/logo.png" alt="Wu Wei Kung Fu" width={46} height={46} priority
            className="logo-glow h-[46px] w-[46px] rounded-full transition-transform duration-500 group-hover:rotate-[360deg]" />
          <div className="leading-tight">
            <div className="gold-text text-lg font-black tracking-wide">{dict.brand}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">{dict.brandSub}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-[13px] lg:flex">
          {links.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`stretch-word relative py-1 transition-colors hover:text-[var(--gold-light,#e5c878)] ${active ? "text-[#e5c878]" : "text-[var(--fg)]/80"}`}
                style={active ? { color: "#e5c878" } : undefined}>
                {label}
                {active && <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/search`} aria-label={dict.nav.search}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </Link>
          <button onClick={toggleTheme} aria-label="theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
            {light ? "🌙" : "☀️"}
          </button>
          <div className="group relative">
            <button className="flex h-9 items-center gap-1 rounded-full border border-[var(--line)] px-3 text-xs text-[var(--muted)] transition hover:border-[#c9a84c] hover:text-[#e5c878]">
              {localeNames[locale]} ▾
            </button>
            <div className="invisible absolute top-full z-50 mt-1 min-w-28 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] p-1 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100 ltr:right-0 rtl:left-0">
              {(["fa", "en", "zh"] as const).map((l) => (
                <Link key={l} href={`/${l}${pathNoLocale}`}
                  className={`block rounded-lg px-3 py-1.5 text-xs transition hover:bg-[rgba(201,168,76,0.12)] ${l === locale ? "text-[#e5c878]" : "text-[var(--fg)]/75"}`}>
                  {localeNames[l]}
                </Link>
              ))}
            </div>
          </div>
          <Link href={`/${locale}/assessment`}
            className="btn-energy hidden items-center gap-1.5 rounded-full border border-[#c41e24]/60 bg-[#c41e24]/15 px-3.5 py-2 text-xs font-bold text-[#ff8a85] transition hover:scale-105 hover:bg-[#c41e24]/25 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-[#e04b46] opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-[#e04b46]" />
            </span>
            {dict.nav.assessment}
          </Link>
          <Link href={`/${locale}/register`}
            className="btn-energy hidden rounded-full bg-gradient-to-l from-[#c9a84c] to-[#9a7b2e] px-4 py-2 text-xs font-bold text-black transition hover:brightness-110 md:block">
            {dict.nav.register}
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] lg:hidden">
            <span className="text-[#e5c878]">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="nav-glass mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-3 lg:hidden">
          {[...links, [`/${locale}/assessment`, `🩺 ${dict.nav.assessment}`] as [string, string], [`/${locale}/register`, dict.nav.register] as [string, string]].map(([href, label]) => (
            <Link key={href} href={href}
              className={`rounded-xl px-4 py-2.5 text-sm transition hover:bg-[rgba(201,168,76,0.1)] ${pathname === href ? "text-[#e5c878]" : "text-[var(--fg)]/85"}`}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
