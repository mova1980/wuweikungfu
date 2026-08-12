export const locales = ["fa", "en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

export function dirOf(locale: Locale) {
  return locale === "fa" ? "rtl" : "ltr";
}

import fa from "@/dictionaries/fa.json";
import en from "@/dictionaries/en.json";
import zh from "@/dictionaries/zh.json";

const dicts = { fa, en, zh } as const;

export function getDict(locale: Locale) {
  return dicts[locale] ?? dicts.fa;
}

/** Pick a localized field from a multilingual object like {fa, en, zh} */
export function pick(obj: Record<string, string> | undefined, locale: Locale): string {
  if (!obj) return "";
  return obj[locale] || obj["fa"] || obj["en"] || "";
}
