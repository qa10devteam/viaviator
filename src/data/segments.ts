/**
 * Via Viator — segmenty (6 person z Buyer Persona Architecture v1.0
 * + decyzja klienta 19.05.2026 o dodaniu 6. segmentu „eventy").
 *
 * Źródła:
 *  - _brief/docs-source/BUYER-PERSONA-v1.0.pdf
 *  - _brief/emails/2026-05-19_klient_to_QA10_odpowiedzi.pdf
 *
 * Zasada: „Generyczna komunikacja 'do wszystkich' zakazana”. Każdy obiekt
 * w tym arrayu to kompletna specyfikacja landingu dla jednej persony.
 * Nigdy nie miksować decisionCriteria, socialProof ani CTA między segmentami.
 */

export type PersonaId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type SegmentSlugPl =
  | "transfery-korporacyjne"
  | "pielgrzymki"
  | "transport-dostepny"
  | "przewozy-rodzinne"
  | "wynajem-busa"
  | "imprezy";

export type SegmentSlugEn =
  | "corporate-transfers"
  | "pilgrimages"
  | "accessible-transport"
  | "family-transport"
  | "van-rental"
  | "events";

/** Identyfikator ikony — mapowany w FeatureGrid/SegmentCardsGrid na konkretny SVG. */
export type IconKeyword =
  | "briefcase-airport"
  | "candle-route"
  | "wheelchair-care"
  | "family-suitcase"
  | "key-van"
  | "tent-popcorn";

export interface Segment {
  /** Identyfikator persony z Buyer Persona Architecture v1.0. */
  readonly personaId: PersonaId;
  /** URL slug PL (kebab-case, bez polskich znaków). */
  readonly slug: SegmentSlugPl;
  /** URL slug EN — czytelny dla anglojęzycznego użytkownika. */
  readonly slugEn: SegmentSlugEn;
  /** Klucz i18n dla nazwy segmentu (krótkiej, do nav i kart). */
  readonly nameKey: string;
  /** Klucz i18n dla one-linera (submenu, kafelek na home). */
  readonly shortDescKey: string;
  /** Klucz i18n dla H1 hero — konkretny, persona-specific. */
  readonly heroHeadlineKey: string;
  /** Klucz i18n dla subhead pod H1. */
  readonly heroSubheadKey: string;
  /** Klucz i18n dla tekstu primary CTA. */
  readonly ctaKey: string;
  /** Docelowy href CTA — preset segmentu na formularzu lub deep-link. */
  readonly ctaHref: string;
  /** Deklarowany time-to-quote (do badge i auto-reply). */
  readonly timeToQuote: string;
  /** CSS custom property — akcent koloru segmentu (lewa krawędź karty, badge). */
  readonly color: string;
  /** Hero image — ścieżka w `public/images/services/`. */
  readonly image: string;
  /** Identyfikator ikony do FeatureGrid/SegmentCardsGrid. */
  readonly iconKeyword: IconKeyword;
  /** 5–7 punktów decyzyjnych persony (raw text, nie i18n keys — content per landing). */
  readonly decisionCriteria: readonly string[];
  /** 2–3 typy social proof rezonujące z personą. */
  readonly socialProof: readonly string[];
}

export const segments: readonly Segment[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // P1 — Korpo Koordynator (Anna, office manager 32-42, transfery B2B)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P1",
    slug: "transfery-korporacyjne",
    slugEn: "corporate-transfers",
    nameKey: "segments.korpo.name",
    shortDescKey: "segments.korpo.shortDesc",
    heroHeadlineKey: "segments.korpo.hero.headline",
    heroSubheadKey: "segments.korpo.hero.subhead",
    ctaKey: "segments.korpo.cta",
    ctaHref: "/kontakt?segment=korpo#rfq",
    timeToQuote: "4h",
    color: "var(--vv-color-segment-korpo)",
    image: "/images/services/korpo-hero.jpg",
    iconKeyword: "briefcase-airport",
    decisionCriteria: [
      "Oferta na maila w 4 godziny w godzinach pracy — bez „odezwiemy się”.",
      "Faktura VAT z opisem trasy, godziny i numerem zlecenia — gotowa do podpięcia pod centrum kosztów.",
      "Kierowca anglojęzyczny na żądanie — gość zagraniczny rozumie polecenie do hotelu.",
      "Renault Trafic 8-osobowy, oznakowany, czysty, klimatyzowany — gość ma czas na rozmowę z laptopem.",
      "Tracking lotu — opóźnienie samolotu nie kosztuje dodatkowo, korekta godziny w czasie rzeczywistym.",
      "Operacyjny zasięg trzech hubów: Pyrzowice, Kraków-Balice, Wrocław — bez konieczności szukania osobnych przewoźników.",
      "Po trzech zleceniach proponujemy umowę ramową — przewidywalność dla budżetu kwartalnego.",
    ],
    socialProof: [
      "Cytat office managera (anonimowo: branża + miasto + skala) — „MŚP IT 120 os., Gliwice, 18 transferów miesięcznie”.",
      "Logo strip 4-6 marek partnerskich (za zgodą; placeholder w v1.0).",
      "Liczba zrealizowanych transferów korpo w ostatnim kwartale (counter — aktualizowany manualnie).",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // P2 — Organizator Pielgrzymki (Maria 48-65, parafialne pielgrzymki)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P2",
    slug: "pielgrzymki",
    slugEn: "pilgrimages",
    nameKey: "segments.pielgrzymki.name",
    shortDescKey: "segments.pielgrzymki.shortDesc",
    heroHeadlineKey: "segments.pielgrzymki.hero.headline",
    heroSubheadKey: "segments.pielgrzymki.hero.subhead",
    ctaKey: "segments.pielgrzymki.cta",
    ctaHref: "/kontakt?segment=pielgrzymki#wycena",
    timeToQuote: "1-3 dni",
    color: "var(--vv-color-segment-pielgrzymki)",
    image: "/images/services/pielgrzymki-hero.jpg",
    iconKeyword: "candle-route",
    decisionCriteria: [
      "Znajomość tras religijnych z doświadczenia, nie z GPS — wiemy gdzie zaparkować autokar pod Jasną Górą i którędy do Kaplicy Cudownego Obrazu.",
      "Kierowca cierpliwy wobec osób starszych — tempo wsiadania, pomoc z laską, brak presji.",
      "Postój co 1,5 godziny — toaleta, modlitwa różańcowa, kawa. Plan trasy uwzględnia rytm grupy.",
      "Wnoszenie bagażu jako standard, nie usługa dodatkowa — pomożemy babci z walizką, nie pytamy o dodatkową opłatę.",
      "Czystość pojazdu w kategorii „nie do przeoczenia” — kontrola przed każdą pielgrzymką.",
      "Faktura na parafię, grupę nieformalną, fundację — z dopiskiem trasy.",
      "Trasy które obsługujemy regularnie: Częstochowa, Licheń, Kalwaria Zebrzydowska, Łagiewniki, Wadowice.",
    ],
    socialProof: [
      "Cytat księdza lub organizatorki pielgrzymki (z imienia, za pisemną zgodą) — „Trzecia pielgrzymka z Via Viator. Pani Halina od razu pyta o kierowcę po imieniu”.",
      "Lista parafii/grup współpracujących (za zgodą; v1.0 zaczynamy od 3-5).",
      "Liczba pielgrzymek zrealizowanych w sezonie (maj-październik) — counter manualny.",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // P3 — Koordynator DPS/Fundacji (Tomasz 38-55, PRM, umowy 12-mies.)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P3",
    slug: "transport-dostepny",
    slugEn: "accessible-transport",
    nameKey: "segments.dostepny.name",
    shortDescKey: "segments.dostepny.shortDesc",
    heroHeadlineKey: "segments.dostepny.hero.headline",
    heroSubheadKey: "segments.dostepny.hero.subhead",
    ctaKey: "segments.dostepny.cta",
    ctaHref: "/kontakt?segment=dostepny#koordynator",
    timeToQuote: "8-16 tyg.",
    color: "var(--vv-color-segment-dostepny)",
    image: "/images/services/dostepny-hero.jpg",
    iconKeyword: "wheelchair-care",
    decisionCriteria: [
      "Kierowca przeszkolony w obsłudze osób z niepełnosprawnościami (PRM) — wózki, kule, osoby z ograniczoną mobilnością.",
      "Umowy 12-miesięczne z gwarancją dostępności pojazdu w wyznaczone dni — przewidywalność dla harmonogramu opieki.",
      "Bezpośredni kontakt z koordynatorem operacyjnym — nie call center, tylko Patryk lub wyznaczony dyspozytor.",
      "Wnoszenie wózka i pomoc przy wsiadaniu jako element usługi, nie opcja — pełna asysta na każdym etapie.",
      "Pojazd przystosowany do bagażu medycznego (chodziki, pojemniki na leki) — bez dodatkowych ustaleń.",
      "Faktura zbiorcza miesięczna z rozpisem przejazdów — gotowa do rozliczenia w księgowości DPS/fundacji.",
      "SLA na sytuacje pilne (transfer szpitalny, przewóz na konsultację) — odpowiedź telefoniczna w 30 minut w godzinach pracy.",
    ],
    socialProof: [
      "Referencja od koordynatora DPS lub fundacji (pełne imię + nazwa instytucji, za pisemną zgodą) — kluczowe dla decyzji w sektorze NGO/publicznym.",
      "Wzmianka o szkoleniu PRM kierowcy (kiedy, gdzie ukończone) — dowód kompetencji, nie deklaracja.",
      "Lista typów wsparcia: transfery na rehabilitację, do szpitala, na wycieczki integracyjne.",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // P4 — B2C Jednorazowy (Marek 30-50, wesele/komunia/transfer rodzinny)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P4",
    slug: "przewozy-rodzinne",
    slugEn: "family-transport",
    nameKey: "segments.rodzinne.name",
    shortDescKey: "segments.rodzinne.shortDesc",
    heroHeadlineKey: "segments.rodzinne.hero.headline",
    heroSubheadKey: "segments.rodzinne.hero.subhead",
    ctaKey: "segments.rodzinne.cta",
    // P4 preferuje Messenger — primary CTA prowadzi tam; secondary = telefon; tertiary = formularz.
    // TODO: do uzupełnienia przez klienta — finalny m.me URL po potwierdzeniu Facebook Page handle.
    ctaHref: "https://m.me/viaviator",
    timeToQuote: "2h",
    color: "var(--vv-color-segment-rodzinne)",
    image: "/images/services/rodzinne-hero.jpg",
    iconKeyword: "family-suitcase",
    decisionCriteria: [
      "Cena podana w odpowiedzi konkretną kwotą — nie „od X zł”, tylko realna stawka dla mojej trasy.",
      "Telefon odbiera człowiek, nie automat — w 2 godziny od pierwszego kontaktu.",
      "Kierowca w koszuli/garniturze na wesela i komunie — bus pasuje do okazji, nie wygląda jak dostawczak.",
      "Wybór 4 lub 8 miejsc — jeden bus zamiast trzech aut z różnymi pasażerami.",
      "Bagażnik na walizki przy transferach lotniskowych — bez taszczenia toreb na kolanach.",
      "Messenger jako kanał kontaktu — bez konieczności dzwonienia, można wieczorem po pracy.",
      "Realizacja w weekendy i święta — wesela i komunie nie czekają na dni robocze.",
    ],
    socialProof: [
      "Krótkie testimoniale z Facebook Page (cytat + imię + data realizacji) — format najbardziej znajomy P4.",
      "Galeria zdjęć z realizacji (za zgodą klientów) — wesele, komunia, transfer lotniskowy.",
      "Liczba pozytywnych opinii na Facebook (counter) — dowód społeczny w preferowanym kanale.",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // P5 — Wynajem Mastera (Piotr 25-45, samodzielny wynajem bez kierowcy)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P5",
    slug: "wynajem-busa",
    slugEn: "van-rental",
    nameKey: "segments.wynajem.name",
    shortDescKey: "segments.wynajem.shortDesc",
    heroHeadlineKey: "segments.wynajem.hero.headline",
    heroSubheadKey: "segments.wynajem.hero.subhead",
    ctaKey: "segments.wynajem.cta",
    ctaHref: "/kontakt?segment=wynajem#dostepnosc",
    timeToQuote: "30 min",
    color: "var(--vv-color-segment-wynajem)",
    image: "/images/services/wynajem-hero.jpg",
    iconKeyword: "key-van",
    decisionCriteria: [
      "Cennik na stronie — stawka za dobę, weekend, tydzień. Bez „zapytaj o cenę”.",
      "Limit kilometrów jasno podany — wiem ile mam wliczone i ile kosztuje nadbieg.",
      "Kaucja w konkretnej kwocie i sposób zwrotu — bez gwiazdek i przypisów.",
      "Renault Master — pojazd znany, części dostępne, naprawa szybka jeśli coś się stanie w trasie.",
      "Odbiór tego samego dnia jeśli dostępny — sprawdzenie dostępności w 30 minut.",
      "Bus z bagażnikiem cargo lub osobowy 8-miejscowy — wybór wersji pod konkretną potrzebę.",
      "Regulamin wynajmu dostępny przed podpisaniem umowy — żadnych niespodzianek w punkcie odbioru.",
    ],
    socialProof: [
      "Counter „X dni wynajmu w 2026” — twardy fakt, nie subiektywna opinia.",
      "Opinie Google (link do profilu firmowego) — kanał, któremu P5 ufa przed transakcją.",
      "Sekcja FAQ z prawdziwymi pytaniami („Czy mogę pojechać za granicę?”, „Co jeśli złapię kapcia?”) — kompetencja przewoźnika widoczna w odpowiedzi.",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // P6 — Eventy (wyposażenie eventowe + transport — decyzja klienta 19.05.2026)
  // ─────────────────────────────────────────────────────────────────────────
  {
    personaId: "P6",
    slug: "imprezy",
    slugEn: "events",
    nameKey: "segments.eventy.name",
    shortDescKey: "segments.eventy.shortDesc",
    heroHeadlineKey: "segments.eventy.hero.headline",
    heroSubheadKey: "segments.eventy.hero.subhead",
    ctaKey: "segments.eventy.cta",
    ctaHref: "/kontakt?segment=eventy#oferta",
    timeToQuote: "24h",
    color: "var(--vv-color-segment-eventy)",
    image: "/images/services/eventy-hero.jpg",
    iconKeyword: "tent-popcorn",
    decisionCriteria: [
      "Namiot eventowy + maszyna do popcornu + maszyna do waty cukrowej w jednym pakiecie — nie trzeba szukać trzech dostawców.",
      "Bus dowiezie wyposażenie i je zabierze — jeden numer telefonu na całość logistyki.",
      "Realizacje w całym operacyjnym zasięgu: śląskie, opolskie, małopolskie, świętokrzyskie.",
      "Festyny gminne, urodziny dzieci, imprezy firmowe, dożynki — sprawdzone scenariusze, znamy specyfikę.",
      "Oferta wraca w 24 godziny — nawet dla zapytań weekendowych.",
      "Faktura VAT na firmę/gminę/parafię — pełna dokumentacja.",
      "Od jesieni 2026 dochodzą stoły i ławki biesiadne — możliwość zgłoszenia na rezerwację z wyprzedzeniem.",
    ],
    socialProof: [
      "Zdjęcia z realizacji eventowych (festyny, urodziny) — wizualna konkretność, nie ogólniki.",
      "Cytat organizatora festynu gminnego lub urodzin dziecka (za zgodą).",
      "Lista typów wydarzeń obsługiwanych w sezonie 2026 (maj-wrzesień) — counter manualny.",
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpery (czyste funkcje, brak side-effectów, gotowe do importu w komponentach)
// ─────────────────────────────────────────────────────────────────────────────

/** Zwraca segment po slugu PL. Throw jeśli nieznany — strict mode. */
export function getSegmentBySlugPl(slug: string): Segment {
  const found = segments.find((s) => s.slug === slug);
  if (!found) {
    throw new Error(`[segments] Unknown PL slug: "${slug}"`);
  }
  return found;
}

/** Zwraca segment po slugu EN. Throw jeśli nieznany. */
export function getSegmentBySlugEn(slug: string): Segment {
  const found = segments.find((s) => s.slugEn === slug);
  if (!found) {
    throw new Error(`[segments] Unknown EN slug: "${slug}"`);
  }
  return found;
}

/** Zwraca segment po personaId. Throw jeśli nieznany. */
export function getSegmentByPersonaId(id: PersonaId): Segment {
  const found = segments.find((s) => s.personaId === id);
  if (!found) {
    throw new Error(`[segments] Unknown personaId: "${id}"`);
  }
  return found;
}

/** Lista slugów PL — pomocna dla `getStaticPaths()` w Astro. */
export const segmentSlugsPl: readonly SegmentSlugPl[] = segments.map(
  (s) => s.slug,
);

/** Lista slugów EN — pomocna dla `getStaticPaths()` EN routes. */
export const segmentSlugsEn: readonly SegmentSlugEn[] = segments.map(
  (s) => s.slugEn,
);
