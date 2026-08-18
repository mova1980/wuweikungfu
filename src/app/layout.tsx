import type { Metadata } from "next";
import { Vazirmatn, Playfair_Display, Montserrat, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const notoSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "700", "900"], variable: "--font-noto-sc", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "وو وی کونگ فو | Wu Wei Kung Fu",
    template: "%s | Wu Wei Kung Fu",
  },
  description:
    "وو وی؛ هنر باستانی کنش بدون تلاش. کونگ فوی اصیل چینی زیر نظر سی فو احسان شایان فر — Wu Wei; The Ancient Art of Effortless Action.",
  keywords: ["Wu Wei", "Kung Fu", "وو وی", "کونگ فو", "وینگ چون", "چی گونگ", "سی فو شایان فر", "无为功夫"],
  openGraph: {
    title: "Wu Wei Kung Fu | وو وی کونگ فو",
    description: "The Ancient Art of Effortless Action — کونگ فوی اصیل چینی",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${vazir.variable} ${playfair.variable} ${montserrat.variable} ${notoSC.variable}`}>
      <body className="font-fa antialiased">{children}</body>
    </html>
  );
}
