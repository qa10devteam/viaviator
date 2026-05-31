/**
 * Via Viator — single source of truth dla SEO per-route.
 *
 * Jeden plik mapuje wszystkie 12 route keys (12 stron pillar/satellite)
 * na komplet: title PL/EN, description PL/EN, path PL/EN, keywords, og:image.
 *
 * Zasady (Cannibalization Prevention):
 *  - Każdy route ma JEDEN primary keyword w title — nie powtarzamy
 *    keywordów między routes (pillar vs. satellite vs. transactional).
 *  - Title ≤ 60 znaków, description ≤ 155 znaków (Google SERP truncation).
 *  - Keywords PL = lokalne (miasta, województwa, huby lotniskowe) —
 *    EN ich nie potrzebuje (EN traffic = niche, fallback).
 *  - hreflang generowany przez `buildAlternates()` z self-reference + x-default.
 *
 * Źródła:
 *  - /src/data/company.ts (NIP, kontakt, regiony, huby)
 *  - /src/data/segments.ts (slugs PL ↔ EN, persona id)
 *  - /src/i18n/pl.ts + en.ts (meta.* baseline, ten plik je rozszerza
 *    o keywords + path mappings — pojedyncze źródło dla buildAlternates).
 */

import { company } from "@data/company";

// ─────────────────────────────────────────────────────────────────────────────
// Typy
// ─────────────────────────────────────────────────────────────────────────────

export type RouteKey =
  | "home"
  | "korpo"
  | "pielgrzymki"
  | "dostepny"
  | "rodzinne"
  | "wynajem"
  | "eventy"
  | "oNas"
  | "kontakt"
  | "jakosc"
  | "prywatnosc"
  | "cookies";

export interface SeoEntry {
  /** Title PL (≤ 60 znaków, zawiera primary keyword + brand). */
  readonly titlePl: string;
  /** Title EN (≤ 60 znaków). */
  readonly titleEn: string;
  /** Meta description PL (≤ 155 znaków, persona-aligned, CTA-implicit). */
  readonly descriptionPl: string;
  /** Meta description EN (≤ 155 znaków). */
  readonly descriptionEn: string;
  /** Path PL — bez prefiksu language (default locale). */
  readonly pathPl: string;
  /** Path EN — z prefiksem `/en/`. */
  readonly pathEn: string;
  /** Open Graph image — relatywna ścieżka (resolveUrl dopina origin). */
  readonly ogImage?: string;
  /** 4-6 keywordów PL, lokalnych, służy jako sygnał dla content briefu + meta keywords (legacy). */
  readonly keywords?: readonly string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO Map — wszystkie 12 routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapowanie route → SEO entry.
 *
 * UWAGA o cannibalization: primary keyword każdej strony jest UNIKALNY.
 * Strona główna (`home`) targetuje brand + parasolowe „przewóz osób
 * południowa Polska". Segmenty targetują własne nisze (transfer korporacyjny,
 * pielgrzymki, etc.). „O nas" targetuje brand + założyciel. Strony prawne
 * mają noindex-ready descriptions (mniej zasobu krawl-budgetu).
 */
export const seoMap: Record<RouteKey, SeoEntry> = {
  // ── Home (pillar parasolowy) ─────────────────────────────────────────────
  home: {
    titlePl: "Via Viator — przewóz osób południowa Polska",
    titleEn: "Via Viator — passenger transport in southern Poland",
    descriptionPl:
      "Transfery lotniskowe Pyrzowice, Balice, Wrocław. Pielgrzymki, transport dostępny, busy 8-osobowe, wynajem Mastera, sprzęt eventowy. Tel. +48 690 691 886.",
    descriptionEn:
      "Airport transfers Katowice, Kraków, Wrocław. Pilgrimages, accessible transport, 8-seat vans, Master rental, event gear. Phone: +48 690 691 886.",
    pathPl: "/",
    pathEn: "/en/",
    ogImage: "/og/home.jpg",
    keywords: [
      "przewóz osób południowa Polska",
      "transfer lotnisko Pyrzowice",
      "transport osób śląskie",
      "bus 8 osobowy Katowice",
      "wynajem busa Opole",
      "Via Viator",
    ],
  },

  // ── P1 — Transfer korporacyjny ───────────────────────────────────────────
  korpo: {
    titlePl: "Transfer korporacyjny Pyrzowice, Balice | Via Viator",
    titleEn: "Corporate airport transfers Katowice, Kraków | Via Viator",
    descriptionPl:
      "Transfer lotniskowy i delegacyjny dla firm. SLA na piśmie, faktura VAT, 14-dniowy termin. Wycena w 4 godziny. Śląskie, opolskie, małopolskie.",
    descriptionEn:
      "Airport transfers and business travel for companies. Written SLA, VAT invoice, 14-day terms. Quote in 4 hours. Silesia, Opole, Lesser Poland.",
    pathPl: "/transfery-korporacyjne",
    pathEn: "/en/corporate-transfers",
    ogImage: "/og/korpo.jpg",
    keywords: [
      "transfer korporacyjny Katowice",
      "transfer lotnisko Pyrzowice firma",
      "przewóz delegacji Kraków Balice",
      "bus dla firm Wrocław lotnisko",
      "transport pracowników śląskie",
      "transfer biznesowy faktura VAT",
    ],
  },

  // ── P2 — Pielgrzymki ─────────────────────────────────────────────────────
  pielgrzymki: {
    titlePl: "Pielgrzymki Jasna Góra, Łagiewniki, Wadowice | Via Viator",
    titleEn: "Pilgrimages Jasna Góra, Łagiewniki, Wadowice | Via Viator",
    descriptionPl:
      "Transport grupowy na pielgrzymki. Znamy bramę Jasnogórską, parking pod Łagiewnikami, podjazd w Wadowicach. Kierowca poczeka. Cena za całość.",
    descriptionEn:
      "Group transport to Polish sanctuaries. We know the gate at Jasna Góra, parking by Łagiewniki, drop-off at Wadowice. Driver waits. One price for the trip.",
    pathPl: "/pielgrzymki",
    pathEn: "/en/pilgrimages",
    ogImage: "/og/pielgrzymki.jpg",
    keywords: [
      "pielgrzymka autokarem Częstochowa",
      "transport na pielgrzymkę Licheń",
      "wyjazd parafialny Kalwaria Zebrzydowska",
      "bus na pielgrzymkę Łagiewniki",
      "pielgrzymki Wadowice transport",
      "wynajem busa parafia",
    ],
  },

  // ── P3 — Transport dostępny ──────────────────────────────────────────────
  dostepny: {
    titlePl: "Transport osób niepełnosprawnych DPS, fundacje | Via Viator",
    titleEn: "Accessible transport — wheelchair-friendly | Via Viator",
    descriptionPl:
      "Transport dla DPS, fundacji, opieki dziennej. Kierowca PRM pomoże z wózkiem i bagażem. Faktura zgodna z subwencją. Stabilność cen na 12 miesięcy.",
    descriptionEn:
      "Accessible transport for care homes, foundations, day-care. PRM-trained driver helps with wheelchair and bags. Stable pricing for 12-month contracts.",
    pathPl: "/transport-dostepny",
    pathEn: "/en/accessible-transport",
    ogImage: "/og/dostepny.jpg",
    keywords: [
      "transport osób niepełnosprawnych śląskie",
      "przewóz wózków inwalidzkich Katowice",
      "transport DPS umowa roczna",
      "bus z windą dla wózka",
      "transport fundacja opolskie",
      "przewóz PRM południowa Polska",
    ],
  },

  // ── P4 — Przewozy rodzinne ───────────────────────────────────────────────
  rodzinne: {
    titlePl: "Przewóz rodzinny lotnisko, wesele, komunia | Via Viator",
    titleEn: "Family transport — airport, weddings, events | Via Viator",
    descriptionPl:
      "Lecisz całą rodziną? Cztery lub osiem miejsc, jedna trasa, jedna cena. Fotelik dla dziecka. Potwierdzenie na piśmie. Messenger lub telefon.",
    descriptionEn:
      "Travelling as a family? Four or eight seats, one route, one price. Child seat on request. Written confirmation. Messenger or phone.",
    pathPl: "/przewozy-rodzinne",
    pathEn: "/en/family-transport",
    ogImage: "/og/rodzinne.jpg",
    keywords: [
      "transport na wesele bus 8 osobowy",
      "bus na komunię Katowice",
      "przewóz rodziny na lotnisko",
      "wynajem busa z kierowcą okazje",
      "transport gości weselnych Kraków",
      "bus rodzinny weekend",
    ],
  },

  // ── P5 — Wynajem busa (Master) ───────────────────────────────────────────
  wynajem: {
    titlePl: "Wynajem busa Renault Master — cena za dobę | Via Viator",
    titleEn: "Renault Master van rental — per day pricing | Via Viator",
    descriptionPl:
      "Master do wynajęcia bez kierowcy. Cena za dobę, limit kilometrów, kaucja — wszystko na stronie. Odbiór w sobotę. Bez gwiazdek, bez ukrytych kosztów.",
    descriptionEn:
      "Master van for self-drive rental. Daily rate, mileage limit, deposit — all on the site. Saturday pickup. No asterisks, no hidden fees.",
    pathPl: "/wynajem-busa",
    pathEn: "/en/van-rental",
    ogImage: "/og/wynajem.jpg",
    keywords: [
      "wynajem busa Renault Master",
      "wynajem busa bez kierowcy Katowice",
      "wynajem busa cargo doba",
      "wynajem Mastera weekend Śląsk",
      "bus do przeprowadzki wynajem",
      "wypożyczalnia busów Opole",
    ],
  },

  // ── P6 — Imprezy / sprzęt eventowy ───────────────────────────────────────
  eventy: {
    titlePl: "Sprzęt na imprezę — namiot, popcorn, wata | Via Viator",
    titleEn: "Event gear rental — tent, popcorn, cotton candy | Via Viator",
    descriptionPl:
      "Namiot eventowy, maszyna do popcornu, wata cukrowa. Dowieziemy na festyn, urodziny, dożynki. Od jesieni 2026 także stoły i ławki biesiadne.",
    descriptionEn:
      "Event tent, popcorn machine, cotton candy machine. We deliver to festivals, birthdays, harvest fairs. Benches and tables coming autumn 2026.",
    pathPl: "/imprezy",
    pathEn: "/en/events",
    ogImage: "/og/eventy.jpg",
    keywords: [
      "wynajem namiotu na festyn",
      "maszyna do popcornu wynajem",
      "wata cukrowa na imprezę",
      "sprzęt na dożynki gmina",
      "wynajem sprzętu eventowego śląskie",
      "namiot na urodziny dziecka",
    ],
  },

  // ── O nas ─────────────────────────────────────────────────────────────────
  oNas: {
    titlePl: "O nas — Via Viator sp. z o.o. | Patryk Tomeczek",
    titleEn: "About — Via Viator sp. z o.o. | Patryk Tomeczek",
    descriptionPl:
      "Via Viator sp. z o.o. — przewoźnik osobowy z południowej Polski. Bazujemy w śląskim. Renault Trafic i Master. Patryk Tomeczek odbiera telefon.",
    descriptionEn:
      "Via Viator sp. z o.o. — passenger carrier from southern Poland. Based in Silesia. Renault Trafic and Master. Patryk Tomeczek answers the phone.",
    pathPl: "/o-nas",
    pathEn: "/en/about",
    ogImage: "/og/o-nas.jpg",
    keywords: [
      "Via Viator firma przewozowa",
      "Patryk Tomeczek przewoźnik",
      "przewoźnik osobowy śląskie",
      "Via Viator sp. z o.o. NIP",
      "firma transportowa Katowice",
      "licencjonowany przewoźnik",
    ],
  },

  // ── Kontakt ───────────────────────────────────────────────────────────────
  kontakt: {
    titlePl: "Kontakt Via Viator — telefon +48 690 691 886",
    titleEn: "Contact Via Viator — phone +48 690 691 886",
    descriptionPl:
      "Zadzwoń: +48 690 691 886. Napisz: kontakt@viaviator.pl. Albo wyślij krótki brief — odpiszemy najszybciej, jak nasza obietnica pozwala.",
    descriptionEn:
      "Call: +48 690 691 886. Write: kontakt@viaviator.pl. Or send a short brief — we reply as fast as our promise allows.",
    pathPl: "/kontakt",
    pathEn: "/en/contact",
    ogImage: "/og/kontakt.jpg",
    keywords: [
      "Via Viator kontakt telefon",
      "kontakt@viaviator.pl",
      "zamów transfer Pyrzowice",
      "wycena przewóz osób",
      "Via Viator zapytanie",
      "formularz wyceny transportu",
    ],
  },

  // ── Jakość (QA10 seal) ────────────────────────────────────────────────────
  jakosc: {
    titlePl: "Jakość strony — QA10 Quality Seal | Via Viator",
    titleEn: "Site quality — QA10 Quality Seal | Via Viator",
    descriptionPl:
      "Stronę zaprojektowała QA10. Pieczęć poświadcza standard na 10 wymiarach: dostępność, wydajność, prywatność, bezpieczeństwo, SEO, parytet językowy.",
    descriptionEn:
      "Site designed by QA10. The seal verifies a quality standard across 10 dimensions: accessibility, performance, privacy, security, SEO, language parity.",
    pathPl: "/jakosc",
    pathEn: "/en/quality",
    ogImage: "/og/jakosc.jpg",
    keywords: [
      "QA10 Quality Seal",
      "jakość strony internetowej Via Viator",
      "audyt strony WCAG",
      "Core Web Vitals certyfikat",
      "QA10 agency",
      "Quality Seal v1.0",
    ],
  },

  // ── Polityka prywatności ──────────────────────────────────────────────────
  prywatnosc: {
    titlePl: "Polityka prywatności — Via Viator",
    titleEn: "Privacy policy — Via Viator",
    descriptionPl:
      "Jak przetwarzamy Twoje dane. RODO, krótko i po ludzku. Bez ścian tekstu prawniczego.",
    descriptionEn:
      "How we handle your data. GDPR, short and human. No walls of legal text.",
    pathPl: "/polityka-prywatnosci",
    pathEn: "/en/privacy-policy",
    ogImage: "/og/legal.jpg",
    keywords: [
      "Via Viator RODO",
      "polityka prywatności przewoźnik",
      "GDPR Via Viator",
      "ochrona danych pasażerów",
    ],
  },

  // ── Polityka cookies ──────────────────────────────────────────────────────
  cookies: {
    titlePl: "Polityka cookies — Via Viator",
    titleEn: "Cookie policy — Via Viator",
    descriptionPl:
      "Używamy cookies niezbędnych. Resztę — tylko za Twoją zgodą. Bez śledzenia w tle.",
    descriptionEn:
      "We use only necessary cookies. The rest — only with your consent. No background tracking.",
    pathPl: "/polityka-cookies",
    pathEn: "/en/cookies-policy",
    ogImage: "/og/legal.jpg",
    keywords: [
      "Via Viator cookies",
      "polityka cookies przewoźnik",
      "ciasteczka GDPR",
      "consent management",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpery
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Usuwa trailing slash z URL bazowego (jeśli istnieje) — żebyśmy nigdy
 * nie zbudowali URL-a typu `https://viaviator.pl//en/contact`.
 */
function normalizeBase(siteUrl: string): string {
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

/**
 * Buduje listę alternates dla hreflang.
 * Konwencja:
 *  - `pl-PL` → URL PL (default locale)
 *  - `en-US` → URL EN
 *  - `x-default` → URL PL (default locale Polski rynek targetowy)
 *
 * Wynik zwraca tablicę gotową do `<link rel="alternate" hreflang={lang} href={href} />`.
 */
export function buildAlternates(
  routeKey: RouteKey,
  siteUrl: string,
): { lang: string; href: string }[] {
  const base = normalizeBase(siteUrl);
  const entry = seoMap[routeKey];
  const plUrl = `${base}${entry.pathPl}`;
  const enUrl = `${base}${entry.pathEn}`;

  return [
    { lang: "pl-PL", href: plUrl },
    { lang: "en-US", href: enUrl },
    { lang: "x-default", href: plUrl },
  ];
}

/**
 * Buduje canonical URL dla danego route + locale.
 * Self-referencing canonical — strona PL ma canonical do siebie,
 * strona EN ma canonical do siebie. Nigdy cross-canonical (anti-pattern).
 */
export function buildCanonical(
  routeKey: RouteKey,
  locale: "pl" | "en",
  siteUrl: string,
): string {
  const base = normalizeBase(siteUrl);
  const entry = seoMap[routeKey];
  return `${base}${locale === "pl" ? entry.pathPl : entry.pathEn}`;
}

/**
 * Zwraca title dla danego route + locale.
 * Helper dla `Layout.astro` żeby nie powtarzać `seoMap[key][locale === "pl" ? "titlePl" : "titleEn"]`.
 */
export function getTitle(routeKey: RouteKey, locale: "pl" | "en"): string {
  const entry = seoMap[routeKey];
  return locale === "pl" ? entry.titlePl : entry.titleEn;
}

/**
 * Zwraca description dla danego route + locale.
 */
export function getDescription(
  routeKey: RouteKey,
  locale: "pl" | "en",
): string {
  const entry = seoMap[routeKey];
  return locale === "pl" ? entry.descriptionPl : entry.descriptionEn;
}

/**
 * Zwraca OG image URL (absolute) dla danego route.
 * Fallback: `/og/default.jpg` jeśli route nie ma własnego ogImage.
 */
export function getOgImage(routeKey: RouteKey, siteUrl: string): string {
  const base = normalizeBase(siteUrl);
  const entry = seoMap[routeKey];
  return `${base}${entry.ogImage ?? "/og/default.jpg"}`;
}

/**
 * Zwraca strukturę meta gotową do wstrzyknięcia w `<head>`.
 * Konwenience helper — łączy wszystko co potrzebne dla jednej strony.
 */
export function buildPageMeta(
  routeKey: RouteKey,
  locale: "pl" | "en",
  siteUrl: string,
): {
  title: string;
  description: string;
  canonical: string;
  alternates: { lang: string; href: string }[];
  ogImage: string;
  keywords: readonly string[] | undefined;
} {
  return {
    title: getTitle(routeKey, locale),
    description: getDescription(routeKey, locale),
    canonical: buildCanonical(routeKey, locale, siteUrl),
    alternates: buildAlternates(routeKey, siteUrl),
    ogImage: getOgImage(routeKey, siteUrl),
    keywords: seoMap[routeKey].keywords,
  };
}

/**
 * Re-export brand name z company.ts — żeby konsumenci seo.ts nie musieli
 * importować zarówno `@lib/seo` jak i `@data/company` tylko dla brand name.
 */
export const BRAND_NAME = company.brand;
export const BRAND_LEGAL_NAME = company.legalName;
