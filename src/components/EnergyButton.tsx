"use client";
import Link from "next/link";

/** CTA button with pointer-tracked energy wave */
export default function EnergyButton({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost";
}) {
  return (
    <Link
      href={href}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      className={
        variant === "gold"
          ? "btn-energy inline-block rounded-full bg-gradient-to-l from-[#e5c878] via-[#c9a84c] to-[#9a7b2e] px-8 py-3.5 text-sm font-black text-black shadow-[0_10px_40px_-8px_rgba(201,168,76,0.6)] transition hover:scale-105"
          : "btn-energy inline-block rounded-full border border-[#c9a84c]/60 px-8 py-3.5 text-sm font-bold text-[#e5c878] transition hover:scale-105 hover:bg-[rgba(201,168,76,0.1)]"
      }
    >
      {children}
    </Link>
  );
}
