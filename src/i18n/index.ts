import { pl, type Dictionary } from "./pl";
import { en } from "./en";

export type Locale = "pl" | "en";
export const locales: Locale[] = ["pl", "en"];
export const defaultLocale: Locale = "pl";

const dictionaries: Record<Locale, Dictionary> = { pl, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function t(locale: Locale, path: string): string {
  const dict = getDictionary(locale) as unknown as Record<string, unknown>;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return path;
  }, dict) as string;
}

export function getLocaleFromUrl(url: URL): Locale {
  return url.pathname.startsWith("/en/") || url.pathname === "/en" ? "en" : "pl";
}

export function localizePath(path: string, locale: Locale): string {
  if (locale === "pl") return path.startsWith("/en/") ? path.replace("/en", "") || "/" : path;
  if (path === "/") return "/en/";
  return path.startsWith("/en/") ? path : `/en${path}`;
}

export type { Dictionary } from "./pl";
