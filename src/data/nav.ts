/**
 * Via Viator — struktura nawigacji (header + footer).
 *
 * Zasady:
 *  - Wszystkie etykiety przez i18n keys (`labelKey`), nigdy raw text.
 *  - Slugi PL bez polskich znaków (kebab-case), EN czytelne dla użytkownika EN.
 *  - Dropdown „Oferta" generowany z `segments` (single source of truth)
 *    — nie duplikujemy slugów ręcznie. Patrz: `buildOfferDropdown()`.
 *  - Footer ma 4 kolumny + bottom strip — odzwierciedlone w typie `FooterNav`.
 *
 * Źródło spec: `docs/03-ia.md` §3 (Hierarchia nawigacji).
 */

import { segments } from "./segments";
import type { Segment } from "./segments";

// ─────────────────────────────────────────────────────────────────────────────
// Typy
// ─────────────────────────────────────────────────────────────────────────────

export interface NavLink {
  /** Klucz i18n etykiety (np. „nav.home”). */
  readonly labelKey: string;
  /** URL PL — domyślny język bez prefiksu. */
  readonly href: string;
  /** URL EN — z prefiksem `/en/`. */
  readonly hrefEn: string;
  /** Opcjonalny submenu dla dropdownów (np. „Oferta”). */
  readonly children?: readonly NavLink[];
  /** Opcjonalny kolor akcentu (segment color) — używany w dropdown items. */
  readonly accentColor?: string;
  /** Opcjonalny one-liner do dropdown / submenu items. */
  readonly shortDescKey?: string;
  /** Czy link otwiera się w nowej karcie (np. m.me Messenger). */
  readonly external?: boolean;
}

export interface UtilityNavItem {
  /** Klucz i18n etykiety (lub raw string dla wartości takich jak telefon). */
  readonly labelKey: string;
  /** Wartość wyświetlana (np. „+48 690 691 886”). */
  readonly display: string;
  /** Href docelowy (np. `tel:+48...`). */
  readonly href: string;
  /** Identyfikator ikony do renderowania. */
  readonly iconKeyword: "phone" | "language" | "menu";
}

export interface FooterColumn {
  /** Klucz i18n nagłówka kolumny. */
  readonly headingKey: string;
  /** Linki w kolumnie. */
  readonly items: readonly NavLink[];
}

export interface FooterBrandColumn {
  /** Path do logo SVG (mono variant na ciemnym tle). */
  readonly logoSrc: string;
  /** Klucz i18n tagline'u głównego („Zawsze na miejscu”). */
  readonly taglineMainKey: string;
  /** Klucz i18n tagline'u operacyjnego („Będziesz na czas”). */
  readonly taglineOperationalKey: string;
  /** Klucz i18n krótkiego opisu marki (1-2 zdania). */
  readonly brandShortKey: string;
  /** Linki do social media (Facebook, Messenger). */
  readonly social: readonly NavLink[];
}

export interface FooterNav {
  readonly brand: FooterBrandColumn;
  readonly offer: FooterColumn;
  readonly company: FooterColumn;
  readonly legal: FooterColumn;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: buduje submenu „Oferta” z segments (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────

function segmentToNavLink(segment: Segment): NavLink {
  return {
    labelKey: segment.nameKey,
    shortDescKey: segment.shortDescKey,
    href: `/${segment.slug}`,
    hrefEn: `/en/${segment.slugEn}`,
    accentColor: segment.color,
  };
}

// Podział usług na 3 kategorie nawigacyjne (per feedback klienta 2026-06-01):
//   Transport — usługi z kierowcą (4 segmenty: korpo, pielgrzymki, dostępny, rodzinne)
//   Wynajem   — Master bez kierowcy
//   Eventy    — sprzęt eventowy (namiot, popcorn, wata + jesień 2026 stoły/ławki)
//
// SegmentId == personaId; mapowanie ręczne żeby kolejność w dropdown była
// celowo dobrana (B2B najpierw, B2C dalej).
const TRANSPORT_PERSONAS = ["P1", "P2", "P3", "P4"] as const;
const RENTAL_PERSONAS = ["P5"] as const;
const EVENTS_PERSONAS = ["P6"] as const;

function segmentsByPersona(ids: readonly string[]): readonly NavLink[] {
  return ids
    .map((id) => segments.find((s) => s.personaId === id))
    .filter((s): s is Segment => Boolean(s))
    .map(segmentToNavLink);
}

/** Submenu „Transport" — 4 segmenty z kierowcą. */
export const transportDropdown: readonly NavLink[] = segmentsByPersona(TRANSPORT_PERSONAS);

/** Submenu „Wynajem" — Master bez kierowcy. */
export const rentalDropdown: readonly NavLink[] = segmentsByPersona(RENTAL_PERSONAS);

/** Submenu „Eventy" — sprzęt eventowy. */
export const eventsDropdown: readonly NavLink[] = segmentsByPersona(EVENTS_PERSONAS);

/** Legacy — pełna lista 6 segmentów (zachowane dla footer i ewentualnych innych konsumentów). */
export const offerDropdown: readonly NavLink[] = segments.map(segmentToNavLink);

// ─────────────────────────────────────────────────────────────────────────────
// Primary navigation (header desktop ≥1024px)
// ─────────────────────────────────────────────────────────────────────────────

export const primaryNav: readonly NavLink[] = [
  {
    labelKey: "nav.home",
    href: "/",
    hrefEn: "/en/",
  },
  {
    labelKey: "nav.transport",
    // Kontener dropdown — 4 usługi z kierowcą.
    href: "#",
    hrefEn: "#",
    children: transportDropdown,
  },
  {
    // Tylko jeden segment — kliknięcie wiedzie wprost na /wynajem-busa.
    // Mimo to renderujemy jako dropdown (UX spójność), ale child = 1 → bezpośredni link działa.
    labelKey: "nav.rental",
    href: rentalDropdown[0]?.href ?? "/wynajem-busa",
    hrefEn: rentalDropdown[0]?.hrefEn ?? "/en/van-rental",
  },
  {
    labelKey: "nav.events",
    href: eventsDropdown[0]?.href ?? "/imprezy",
    hrefEn: eventsDropdown[0]?.hrefEn ?? "/en/events",
  },
  {
    labelKey: "nav.about",
    href: "/o-nas",
    hrefEn: "/en/about",
  },
  {
    labelKey: "nav.contact",
    href: "/kontakt",
    hrefEn: "/en/contact",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Utility nav (header prawa strona — telefon + język)
// ─────────────────────────────────────────────────────────────────────────────

export const utilityNav: readonly UtilityNavItem[] = [
  {
    labelKey: "nav.phone",
    display: "+48 690 691 886",
    href: "tel:+48690691886",
    iconKeyword: "phone",
  },
  {
    labelKey: "nav.language",
    display: "PL | EN",
    href: "#language-switch", // obsługiwany JS-em islanda LanguageSwitcher
    iconKeyword: "language",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Footer navigation (4 kolumny)
// ─────────────────────────────────────────────────────────────────────────────

export const footerNav: FooterNav = {
  // ── Kolumna 1: Marka ─────────────────────────────────────────────────────
  brand: {
    logoSrc: "/brand/logo-mono.svg",
    taglineMainKey: "brand.taglineMain", // „Zawsze na miejscu.”
    taglineOperationalKey: "brand.taglineOperational", // „Będziesz na czas.”
    brandShortKey: "footer.brand.shortDesc",
    // social: [] — Facebook Page i Messenger handle do uzupełnienia przez klienta
    // (klient nie potwierdził finalnych URLi w korespondencji z 19.05.2026).
    // Footer.astro renderuje listę tylko gdy length > 0 — tu pusta = chowa sekcję.
    social: [],
  },

  // ── Kolumna 2: Oferta (6 segmentów — z segments) ─────────────────────────
  offer: {
    headingKey: "footer.offer.heading",
    items: offerDropdown,
  },

  // ── Kolumna 3: Firma ─────────────────────────────────────────────────────
  company: {
    headingKey: "footer.company.heading",
    items: [
      {
        labelKey: "nav.about",
        href: "/o-nas",
        hrefEn: "/en/about",
      },
      {
        labelKey: "nav.quality",
        href: "/jakosc",
        hrefEn: "/en/quality",
      },
      {
        labelKey: "nav.contact",
        href: "/kontakt",
        hrefEn: "/en/contact",
      },
      {
        labelKey: "nav.phone",
        href: "tel:+48690691886",
        hrefEn: "tel:+48690691886",
      },
      {
        labelKey: "nav.email",
        href: "mailto:kontakt@viaviator.pl",
        hrefEn: "mailto:kontakt@viaviator.pl",
      },
    ],
  },

  // ── Kolumna 4: Legalne ───────────────────────────────────────────────────
  legal: {
    headingKey: "footer.legal.heading",
    items: [
      {
        labelKey: "nav.privacy",
        href: "/polityka-prywatnosci",
        hrefEn: "/en/privacy-policy",
      },
      {
        labelKey: "nav.cookies",
        href: "/polityka-cookies",
        hrefEn: "/en/cookies-policy",
      },
      // Regulamin + Impressum — do dodania po uzupełnieniu KRS i adresu siedziby przez klienta.
      // Polityka prywatności już pokrywa większość obowiązków RODO.
      {
        labelKey: "nav.manageConsents",
        // Anchor obsługiwany JS-em — re-otwiera consent manager
        href: "#consent-manager",
        hrefEn: "#consent-manager",
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Footer bottom strip — content pod 4 kolumnami (statyczny, raw text bo skala
// jest mała i nie warto przepuszczać przez i18n każdej linijki).
// ─────────────────────────────────────────────────────────────────────────────

export interface FooterBottomStrip {
  readonly copyright: string;
  readonly nip: string;
  readonly phone: { readonly display: string; readonly href: string };
  readonly email: { readonly display: string; readonly href: string };
  readonly qa10Seal: {
    readonly badgeTextKey: string;
    readonly href: string;
    readonly externalHref: string;
  };
}

export const footerBottomStrip: FooterBottomStrip = {
  copyright: "© 2026 Via Viator sp. z o.o.",
  nip: "NIP 6452595911",
  phone: {
    display: "+48 690 691 886",
    href: "tel:+48690691886",
  },
  email: {
    display: "kontakt@viaviator.pl",
    href: "mailto:kontakt@viaviator.pl",
  },
  qa10Seal: {
    badgeTextKey: "footer.qa10Seal.badge", // „QA10 Verified · v1.0”
    href: "/jakosc", // wewnętrzny link na podstronę z opisem 10 wymiarów
    externalHref: "https://qa10.io/seal/viaviator", // canonical seal URL u wykonawcy
  },
};
