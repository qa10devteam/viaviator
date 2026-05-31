/**
 * Via Viator — dane firmowe (single source of truth dla schema.org,
 * impressum, footer, formularzy mailowych i auto-replies).
 *
 * Źródła:
 *  - _brief/docs-source/BRAND-BOOK-v1.0.pdf (tagline, paleta, archetypy)
 *  - _brief/emails/2026-05-19_klient_to_QA10_odpowiedzi.pdf (segmenty, eventy, kontakt)
 *  - README.md (slugi, brand, zasięg)
 *
 * Zasada: jeśli brakuje danych — pole `null` lub komentarz `// TODO`.
 * Nigdy nie zmyślamy KRS-u, adresu ani Facebook handle.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Typy
// ─────────────────────────────────────────────────────────────────────────────

export type FleetVehicleType = "osobowy" | "osobowy/cargo" | "cargo";

export interface FleetVehicle {
  readonly model: string;
  readonly type: FleetVehicleType;
  readonly seats: number;
  /** Czy pojazd ma branding Via Viator (logo na karoserii). */
  readonly branded: boolean;
}

export interface Founders {
  /** Wspólnik operacyjny — twarz marki, podpisuje korespondencję, odbiera telefon. */
  readonly operational: string;
  /** Wspólnik cichy — zasada „cichej dobroci", nie eksponowany frontowo. */
  readonly silent: string;
}

export interface QA10Meta {
  readonly sealVersion: string;
  readonly qa10Home: string;
  readonly sealUrl: string;
}

export interface CompanyData {
  // ── Identyfikacja prawna ───────────────────────────────────────────────
  readonly legalName: string;
  readonly brand: string;
  readonly nip: string;
  /** KRS — do uzupełnienia przez klienta przed launchem (potrzebne do impressum + Organization schema). */
  readonly krs: string | null;
  /** Adres siedziby — do uzupełnienia przez klienta (decyzja czy publikujemy w impressum). */
  readonly address: string | null;

  // ── Kontakt ────────────────────────────────────────────────────────────
  readonly phone: string;
  readonly phoneDisplay: string;
  readonly phoneHref: string;
  readonly emailContact: string;
  readonly emailLegacy: string;
  readonly emailBoard: string;
  readonly emailMarketing: string;

  // ── Założyciele ────────────────────────────────────────────────────────
  readonly founders: Founders;

  // ── Brand ──────────────────────────────────────────────────────────────
  readonly taglineMain: string;
  readonly taglineOperational: string;
  readonly taglineMainEn: string;
  readonly taglineOperationalEn: string;

  // ── Zasięg operacyjny ──────────────────────────────────────────────────
  readonly region: readonly string[];
  readonly hubs: readonly string[];

  // ── Flota ──────────────────────────────────────────────────────────────
  readonly fleet: readonly FleetVehicle[];

  // ── Wyposażenie eventowe (segment P6) ──────────────────────────────────
  readonly eventEquipment: readonly string[];
  /** Wyposażenie planowane (dochodzi do oferty jesień 2026). */
  readonly eventEquipmentPlanned: readonly string[];

  // ── Social media ───────────────────────────────────────────────────────
  readonly social: {
    /** TODO: do uzupełnienia przez klienta — finalny URL Facebook Page. */
    readonly facebook: string | null;
    /** TODO: do uzupełnienia przez klienta — finalny m.me handle. */
    readonly messenger: string | null;
    /** TODO: czy Instagram istnieje (decyzja klienta). */
    readonly instagram: string | null;
  };

  // ── Meta QA10 (pieczęć wykonawcy) ──────────────────────────────────────
  readonly qa10: QA10Meta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dane
// ─────────────────────────────────────────────────────────────────────────────

export const company: CompanyData = {
  // ── Identyfikacja prawna ───────────────────────────────────────────────
  legalName: "Via Viator sp. z o.o.",
  brand: "Via Viator",
  nip: "6452595911",
  krs: null, // TODO: do uzupełnienia przez klienta
  address: null, // TODO: do uzupełnienia przez klienta (decyzja: publikacja w impressum tak/nie)

  // ── Kontakt ────────────────────────────────────────────────────────────
  phone: "+48 690 691 886",
  phoneDisplay: "+48 690 691 886",
  phoneHref: "tel:+48690691886",
  emailContact: "kontakt@viaviator.pl",
  emailLegacy: "viaviator.kontakt@gmail.com",
  emailBoard: "zarzad@viaviator.pl",
  emailMarketing: "marketing@viaviator.pl",

  // ── Założyciele ────────────────────────────────────────────────────────
  founders: {
    operational: "Patryk Tomeczek",
    silent: "ks. Adrian Kaszowski", // zasada „cichej dobroci” — NIE eksponowany frontowo
  },

  // ── Brand ──────────────────────────────────────────────────────────────
  taglineMain: "Zawsze na miejscu",
  taglineOperational: "Będziesz na czas",
  taglineMainEn: "Always there",
  taglineOperationalEn: "You'll arrive on time",

  // ── Zasięg operacyjny (4 województwa, 3 huby lotniskowe) ──────────────
  region: ["śląskie", "opolskie", "małopolskie", "świętokrzyskie"],
  hubs: ["Pyrzowice", "Kraków-Balice", "Wrocław"],

  // ── Flota (2 pojazdy: Trafic + Master) ────────────────────────────────
  fleet: [
    {
      model: "Renault Trafic",
      type: "osobowy",
      seats: 8,
      branded: true,
    },
    {
      model: "Renault Master",
      type: "osobowy/cargo",
      seats: 8,
      branded: false,
    },
  ],

  // ── Wyposażenie eventowe (segment P6, decyzja klienta 19.05.2026) ─────
  eventEquipment: [
    "namiot eventowy",
    "maszyna do popcornu",
    "maszyna do waty cukrowej",
  ],
  eventEquipmentPlanned: [
    "stoły biesiadne", // jesień 2026
    "ławki biesiadne", // jesień 2026
  ],

  // ── Social media ──────────────────────────────────────────────────────
  social: {
    facebook: null, // TODO: do uzupełnienia przez klienta
    messenger: null, // TODO: do uzupełnienia przez klienta
    instagram: null, // TODO: do potwierdzenia przez klienta (czy istnieje)
  },

  // ── Meta QA10 (pieczęć wykonawcy) ──────────────────────────────────────
  qa10: {
    sealVersion: "1.0",
    qa10Home: "https://qa10.io",
    sealUrl: "https://qa10.io/seal/viaviator",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpery do schema.org / mailingu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Buduje obiekt `Organization` w formacie JSON-LD dla schema.org.
 * Używany w root layoucie (`Layout.astro`).
 */
export function buildOrganizationSchema(siteUrl: string): Record<string, unknown> {
  const sameAs: string[] = [];
  if (company.social.facebook) sameAs.push(company.social.facebook);
  if (company.social.instagram) sameAs.push(company.social.instagram);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.legalName,
    alternateName: company.brand,
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-primary.svg`,
    telephone: company.phone,
    email: company.emailContact,
    taxID: `PL${company.nip}`,
    vatID: `PL${company.nip}`,
    areaServed: company.region.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    sameAs,
  };
}

/** Wszystkie adresy mailowe firmy (do walidacji w endpointach, do panelu admina itp.). */
export const allEmails = [
  company.emailContact,
  company.emailLegacy,
  company.emailBoard,
  company.emailMarketing,
] as const;
