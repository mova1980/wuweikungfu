import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

export default function Footer({ locale, dict }: { locale: Locale; dict: any }) {
  const links: [string, string][] = [
    [`/${locale}/about`, dict.nav.about],
    [`/${locale}/techniques`, dict.nav.techniques],
    [`/${locale}/blog`, dict.nav.blog],
    [`/${locale}/shop`, dict.nav.shop],
    [`/${locale}/videos`, dict.nav.videos],
    [`/${locale}/events`, dict.nav.events],
    [`/${locale}/corrective`, dict.nav.corrective],
    [`/${locale}/assessment`, dict.nav.assessment],
    [`/${locale}/register`, dict.nav.register],
    [`/${locale}/contact`, dict.nav.contact],
  ];
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--line)] bg-[var(--bg-2)]/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Wu Wei Kung Fu" width={56} height={56} className="logo-glow rounded-full" />
            <div>
              <div className="gold-text text-xl font-black">{dict.brand}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">{dict.brandSub}</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">{dict.footer.desc}</p>
          <p className="slogan-shimmer mt-3 max-w-sm text-sm font-black">« {dict.hero.slogan} »</p>
          <div className="mt-4 flex gap-3">
            <a href="https://instagram.com/sifu_shayanfar_chinese_kung_fu" target="_blank" rel="noreferrer" className="badge hover:border-[#c9a84c]">Instagram</a>
            <a href="https://www.aparat.com/A_136369" target="_blank" rel="noreferrer" className="badge hover:border-[#c9a84c]">Aparat</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="badge hover:border-[#c9a84c]">YouTube</a>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold text-[#e5c878]">{dict.footer.quick}</h4>
          <div className="grid grid-cols-2 gap-2">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-[var(--muted)] transition hover:text-[#e5c878]">{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold text-[#e5c878]">{dict.footer.contact}</h4>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><span>📍</span>{dict.contact.addressVal}</li>
            <li className="flex gap-2"><span>📞</span><a href="tel:09123686344" dir="ltr" className="hover:text-[#e5c878]">0912 368 6344</a></li>
            <li className="flex gap-2"><span>✉️</span>
              <span className="flex flex-col gap-1">
                <a href="mailto:info@wuweikungfu.com" dir="ltr" className="hover:text-[#e5c878]">info@wuweikungfu.com</a>
                <a href="mailto:ehsan_shayanfar@yahoo.com" dir="ltr" className="hover:text-[#e5c878]">ehsan_shayanfar@yahoo.com</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
        {dict.footer.rights} <span className="mx-2 text-[#c9a84c]">無為</span>
        <Link href="/admin" className="opacity-40 transition hover:opacity-100">Admin</Link>
      </div>
    </footer>
  );
}
