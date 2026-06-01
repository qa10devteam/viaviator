/**
 * Via Viator — JSON-LD factories dla schema.org.
 *
 * Strategia:
 *  - Organization + LocalBusiness/TaxiService injektowane GLOBALNIE w Layout.astro
 *    (graf bazowy na każdej stronie — silne sygnały E-E-A-T + brand entity).
 *  - WebSite injektowany globalnie (raz na origin).
 *  - BreadcrumbList per strona (kontekstowa pozycja w hierarchii).
 *  - Service per segment landing (precyzyjnie opisuje co dana strona oferuje).
 *  - FAQ per strona z sekcją Q&A (rich result eligibility).
 *
 * Zasady:
 *  - Wszystkie factories zwracają czysty obiekt JSON (parsable przez JSON.parse).
 *  - Nigdy nie zmyślamy danych — brak Facebook = brak `sameAs` (nie placeholder).
 *  - Address: jeśli company.address === null, schema NIE zawiera PostalAddress
 *    (Google odrzuci pusty PostalAddress; lepiej brak niż wadliwy).
 *  - Telephone: zawsze E.164 (+48690691886, bez spacji w schema).
 *  - taxID + vatID: dwa różne pola — taxID="6452595911", vatID="PL6452595911".
 *
 * Walidacja: https://search.google.com/test/rich-results + Schema.org Validator.
 */

import { company } from "@data/company";
import { seoMap, type RouteKey } from "@lib/seo";

// ─────────────────────────────────────────────────────────────────────────────
// Stałe — wyciągnięte z company.ts dla deterministycznych schema outputs
// ─────────────────────────────────────────────────────────────────────────────

/** Telefon w formacie E.164 (bez spacji) — wymóg schema.org dla `telephone`. */
const TELEPHONE_E164 = `+${company.phone.replace(/\D/g, "")}`;

/** SameAs — TYLKO realnie istniejące profile. Brak placeholderów. */
function buildSameAs(): string[] {
  const out: string[] = [];
  if (company.social.facebook) out.push(company.social.facebook);
  if (company.social.instagram) out.push(company.social.instagram);
  // QA10 jako twórca — link do strony agencji nie idzie do sameAs (to nie konto Via Viator),
  // ale do creator/sponsor pól w innych schematach jeśli potrzeba.
  return out;
}

/** Lista obszarów obsługiwanych w formacie schema.org AdministrativeArea. */
function buildAreaServed(): { "@type": string; name: string }[] {
  return [
    ...company.region.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    { "@type": "Country", name: "PL" },
  ];
}

/** Available languages dla contactPoint. */
const AVAILABLE_LANGUAGES = ["pl", "en"];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalizacja base URL
// ─────────────────────────────────────────────────────────────────────────────

function normalizeBase(siteUrl: string): string {
  return siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Organization schema — bazowy entity dla całej domeny.
 * Wstrzykiwany globalnie (Layout.astro) — pojawia się na każdej stronie.
 *
 * Uwaga: dla przewoźnika BARDZIEJ wartościowy jest `LocalBusiness` lub
 * `TaxiService`. Organization trzymamy jako equity entity (NIP/VAT/legal),
 * a LocalBusiness osobno dla geograficznych sygnałów. Oba mają wspólny @id
 * — graf je linkuje.
 */
export function organizationSchema(siteUrl: string): Record<string, unknown> {
  const base = normalizeBase(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: company.legalName,
    alternateName: company.brand,
    url: `${base}/`,
    logo: {
      "@type": "ImageObject",
      url: `${base}/brand/logo-primary.svg`,
      caption: company.brand,
    },
    telephone: TELEPHONE_E164,
    email: company.emailContact,
    taxID: company.nip,
    vatID: `PL${company.nip}`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: TELEPHONE_E164,
      email: company.emailContact,
      contactType: "customer service",
      areaServed: "PL",
      availableLanguage: AVAILABLE_LANGUAGES,
    },
    areaServed: buildAreaServed(),
    founder: {
      "@type": "Person",
      name: company.founders.operational,
      jobTitle: "Co-founder, Operations",
    },
    sameAs: buildSameAs(),
    // creator/maker — QA10 jako wykonawca strony (E-E-A-T sygnał Trustworthiness)
    publishingPrinciples: `${base}/jakosc`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WebSite Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WebSite schema — bazowy entity dla domeny.
 * NIE zawiera `potentialAction SearchAction` — strona nie ma site search,
 * więc deklarowanie go byłoby kłamstwem (Google to wychwyci).
 */
export function websiteSchema(siteUrl: string): Record<string, unknown> {
  const base = normalizeBase(siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: company.brand,
    alternateName: company.legalName,
    url: `${base}/`,
    inLanguage: ["pl-PL", "en-US"],
    publisher: { "@id": `${base}/#organization` },
    // copyrightHolder — Via Viator, copyrightYear od rejestracji firmy
    copyrightHolder: { "@id": `${base}/#organization` },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BreadcrumbList Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buduje BreadcrumbList z listy items.
 * Każdy item ma name + url; pozycja jest 1-indexed.
 */
export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Buduje BreadcrumbList automatycznie dla danego route + locale.
 * Hierarchia: Home → [Page]. Dla segmentów: Home → Oferta → [Segment].
 *
 * UWAGA: „Oferta" to virtual parent dla segmentów (P1-P6) — segmenty nie mają
 * własnego URL pod /oferta/, ale w nawigacji są pod „Oferta", więc breadcrumb
 * to odzwierciedla. Dla home zwracamy tylko jeden item (root).
 */
export function breadcrumbForRoute(
  routeKey: RouteKey,
  locale: "pl" | "en",
  siteUrl: string,
): Record<string, unknown> {
  const base = normalizeBase(siteUrl);
  const homeUrl = locale === "pl" ? `${base}/` : `${base}/en/`;
  const homeLabel = locale === "pl" ? "Strona główna" : "Home";

  // Home → tylko root
  if (routeKey === "home") {
    return breadcrumbSchema([{ name: homeLabel, url: homeUrl }]);
  }

  const entry = seoMap[routeKey];
  const pageUrl = `${base}${locale === "pl" ? entry.pathPl : entry.pathEn}`;
  const pageTitle = locale === "pl" ? entry.titlePl : entry.titleEn;
  // Strip "| Via Viator" tail z title żeby breadcrumb był zwięzły
  const cleanTitle = pageTitle.replace(/\s*\|\s*Via Viator.*$/i, "").trim();

  const segmentRoutes: RouteKey[] = [
    "korpo",
    "pielgrzymki",
    "dostepny",
    "rodzinne",
    "wynajem",
    "eventy",
  ];

  // Segment → Home > Oferta > Segment
  if (segmentRoutes.includes(routeKey)) {
    const offerLabel = locale === "pl" ? "Oferta" : "Services";
    // „Oferta" nie ma własnego URL — używamy home#oferta jako anchor target
    const offerUrl = locale === "pl" ? `${base}/#oferta` : `${base}/en/#services`;
    return breadcrumbSchema([
      { name: homeLabel, url: homeUrl },
      { name: offerLabel, url: offerUrl },
      { name: cleanTitle, url: pageUrl },
    ]);
  }

  // Pozostałe strony → Home > Page
  return breadcrumbSchema([
    { name: homeLabel, url: homeUrl },
    { name: cleanTitle, url: pageUrl },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Schema (per segment landing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buduje Service schema dla pojedynczego segmentu (np. „Transfer korporacyjny").
 * Wstrzykiwany na konkretnym landing page segmentu — opisuje OFERTĘ tej strony.
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  areaServed: string[];
  provider: { name: string; url: string };
  serviceType: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: {
      "@type": "Organization",
      name: opts.provider.name,
      url: opts.provider.url,
    },
    areaServed: opts.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    url: opts.url,
    availableLanguage: AVAILABLE_LANGUAGES,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LocalBusiness / TaxiService Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LocalBusiness schema — geograficzny entity dla SERPu lokalnego.
 *
 * Używamy `TaxiService` jako bardziej precyzyjnego subtype niż czysty
 * LocalBusiness — Google ma dedykowany rich result dla TaxiService
 * (mimo że formalnie nie jesteśmy taksówką, semantycznie przewóz osób
 * na zamówienie = TaxiService w schema.org taxonomy).
 *
 * priceRange: "$$" (umiarkowanie) — wymagane pole dla LocalBusiness.
 * openingHours: 24/7 — przewóz osób działa całodobowo (transfery
 * lotniskowe wcześnie rano, eventy wieczorem).
 *
 * UWAGA: nie wstrzykujemy PostalAddress jeśli company.address === null
 * (klient nie zdecydował o publikacji adresu). Google przyjmie schema
 * bez PostalAddress, ale ostrzeże w Rich Results Test — to OK.
 */
export function localBusinessSchema(siteUrl: string): Record<string, unknown> {
  const base = normalizeBase(siteUrl);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TaxiService"],
    "@id": `${base}/#localbusiness`,
    name: company.brand,
    legalName: company.legalName,
    url: `${base}/`,
    logo: `${base}/brand/logo-primary.svg`,
    image: `${base}/og/home.jpg`,
    description:
      "Przewóz osób w południowej Polsce — transfery lotniskowe, pielgrzymki, transport grupowy, wynajem busa, sprzęt eventowy.",
    telephone: TELEPHONE_E164,
    email: company.emailContact,
    taxID: company.nip,
    vatID: `PL${company.nip}`,
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    areaServed: buildAreaServed(),
    availableLanguage: AVAILABLE_LANGUAGES,
    parentOrganization: { "@id": `${base}/#organization` },
    sameAs: buildSameAs(),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressRegion: company.address.region,
      addressCountry: company.address.country,
    },
  };

  return schema;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buduje FAQPage schema z listy Q&A.
 * Każde Q&A → Question entity z acceptedAnswer.
 *
 * UWAGA: Google ograniczył rich result FAQ dla większości witryn w 2023
 * (tylko government/health sites mają pełen rich result). Pozostałe witryny
 * dostają schema do silnika RG (relevance signal), ale bez akordeonu w SERPie.
 * Warto trzymać schema — sygnał semantyczny dalej działa.
 */
export function faqSchema(
  items: { q: string; a: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpery do typowych use-cases (convenience exports)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buduje graf bazowy dla każdej strony (Organization + LocalBusiness + WebSite).
 * Używany w Layout.astro jako single source.
 */
export function baseGraph(siteUrl: string): Record<string, unknown>[] {
  return [
    organizationSchema(siteUrl),
    localBusinessSchema(siteUrl),
    websiteSchema(siteUrl),
  ];
}

/**
 * Buduje Service schema dla danego segmentu (po routeKey).
 * Wykorzystuje seoMap + dane company do auto-generacji.
 */
export function serviceForSegment(
  routeKey: Extract<
    RouteKey,
    "korpo" | "pielgrzymki" | "dostepny" | "rodzinne" | "wynajem" | "eventy"
  >,
  locale: "pl" | "en",
  siteUrl: string,
): Record<string, unknown> {
  const base = normalizeBase(siteUrl);
  const entry = seoMap[routeKey];

  // Mapowanie routeKey → serviceType label (lokalizowany)
  const serviceTypeLabels: Record<typeof routeKey, { pl: string; en: string }> = {
    korpo: { pl: "Transfer korporacyjny", en: "Corporate transfer" },
    pielgrzymki: { pl: "Transport pielgrzymkowy", en: "Pilgrimage transport" },
    dostepny: { pl: "Transport dostępny PRM", en: "Accessible PRM transport" },
    rodzinne: { pl: "Transport rodzinny", en: "Family transport" },
    wynajem: { pl: "Wynajem busa", en: "Van rental" },
    eventy: { pl: "Wynajem sprzętu eventowego", en: "Event gear rental" },
  };

  const name = locale === "pl" ? entry.titlePl : entry.titleEn;
  const description =
    locale === "pl" ? entry.descriptionPl : entry.descriptionEn;
  const pageUrl = `${base}${locale === "pl" ? entry.pathPl : entry.pathEn}`;

  return serviceSchema({
    name: name.replace(/\s*\|\s*Via Viator.*$/i, "").trim(),
    description,
    areaServed: [...company.region, "PL"],
    provider: { name: company.legalName, url: `${base}/` },
    serviceType: serviceTypeLabels[routeKey][locale],
    url: pageUrl,
  });
}
