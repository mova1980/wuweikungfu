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
    [`/${locale}/gallery`, dict.nav.gallery],
    [`/${locale}/corrective`, dict.nav.corrective],
    [`/${locale}/assessment`, dict.nav.assessment],
    [`/${locale}/register`, dict.nav.register],
    [`/${locale}/contact`, dict.nav.contact],
  ];
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--line)] bg-[var(--bg-2)]/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
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
            <li className="flex gap-2"><span>🗺️</span>
              <a href="https://maps.app.goo.gl/bVbd7pewrNHg8xqy6" target="_blank" rel="noreferrer"
                className="font-bold text-[#e5c878] transition hover:text-[#f0d98c] hover:underline">
                {dict.footer.academy} ↗
              </a>
            </li>
            <li className="flex gap-2"><span>📞</span><a href="tel:09123686344" dir="ltr" className="hover:text-[#e5c878]">0912 368 6344</a></li>
            <li className="flex gap-2"><span>✉️</span>
              <span className="flex flex-col gap-1">
                <a href="mailto:info@wuweikungfu.com" dir="ltr" className="hover:text-[#e5c878]">info@wuweikungfu.com</a>
                <a href="mailto:ehsan_shayanfar@yahoo.com" dir="ltr" className="hover:text-[#e5c878]">ehsan_shayanfar@yahoo.com</a>
              </span>
            </li>
          </ul>
        </div>

        {/* موقعیت روی نقشه */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-[#e5c878]">{dict.footer.mapTitle}</h4>
          <div className="map-card group relative overflow-hidden rounded-2xl border border-[#c9a84c]/40">
            <iframe
              src="https://maps.google.com/maps?q=35.827001,51.002368&z=16&hl=fa&output=embed"
              title={dict.footer.academy}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="map-frame block h-56 w-full"
            />
            <span className="map-veil" aria-hidden />
            <span className="badge pointer-events-none absolute top-2 border-[#c9a84c]/50 bg-black/70 backdrop-blur-sm" style={{ insetInlineStart: "0.5rem" }}>
              📌 {dict.footer.academy}
            </span>
            <a
              href="https://maps.app.goo.gl/bVbd7pewrNHg8xqy6"
              target="_blank"
              rel="noreferrer"
              className="btn-energy absolute bottom-2 rounded-full bg-gradient-to-l from-[#e5c878] to-[#9a7b2e] px-4 py-1.5 text-[10px] font-black text-black shadow-lg transition hover:scale-105"
              style={{ insetInlineEnd: "0.5rem" }}
            >
              {dict.footer.mapCta} ↗
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
        {dict.footer.rights} <span className="mx-2 text-[#c9a84c]">無為</span>
        <Link href="/admin" className="opacity-40 transition hover:opacity-100">Admin</Link>
      </div>
    </footer>
  );
}
