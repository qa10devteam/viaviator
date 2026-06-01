/**
 * Atlas Południa — dane geograficzne dla Wow #1 (interaktywna mapa SVG).
 *
 * Coordinaty: ViewBox 0 0 800 600 (uproszczona projekcja południowej PL).
 * Path-y województw to uproszczone kontury (NIE geodezyjna precyzja).
 *
 * Decyzja produktowa: nie używamy QGIS / GeoJSON / real cartography.
 * Powód: editorial tone, brand canon „restraint over excess", waga
 * < 16 KB gzip dla całej sekcji (vs ~120 KB dla real-world export
 * Polski z uproszczoną geometrią Douglas-Peucker). Reader poznaje
 * Pyrzowice / Balice / Wrocław jako huby i Tarnowskie Góry jako
 * bazę — to wystarczy, żeby zrozumieć geografię operacyjną
 * Via Viator. Reszta to ornament.
 *
 * Geometria — układ:
 *   - viewBox 800×600 (4:3)
 *   - oś X: zachód (left) → wschód (right)
 *   - oś Y: północ (top) → południe (bottom)
 *   - Tarnowskie Góry ≈ centrum-zachód (305, 235) — wizualne centrum
 *   - 3 huby rozproszone: Wrocław NW, Pyrzowice N (blisko TG),
 *     Balice SE (Kraków)
 *   - 4 województwa jako uproszczone wielokąty wypełniające większość
 *     obszaru roboczego z lekkimi gapami między sobą (czytelność hover)
 *
 * Source: brand book v1.0 — 4 województwa rdzeń + 3 huby lotniskowe.
 */

export interface Region {
  readonly id: "slaskie" | "opolskie" | "malopolskie" | "swietokrzyskie";
  readonly nameKey: string;
  /** SVG <path d="..."> — uproszczony wielokąt. */
  readonly path: string;
  /** Klucz i18n dla opisu statystyki segmentu. */
  readonly statKey: string;
  /** Wyświetlana etykieta miasta wojewódzkiego (nie i18n — proper noun). */
  readonly capitalCity: string;
  /** Centroid wielokąta — punkt mocowania etykiety tekstowej. */
  readonly labelX: number;
  readonly labelY: number;
}

export interface Hub {
  readonly id: "pyrzowice" | "balice" | "wroclaw";
  readonly displayName: string;
  /** Pozycja markera (środek koła). */
  readonly cx: number;
  readonly cy: number;
  readonly distanceFromBaseMinutes: number;
  /** PL slug segmentu do nawigacji „Zobacz transfery korporacyjne". */
  readonly segmentSlug: "transfery-korporacyjne";
  readonly segmentSlugEn: "corporate-transfers";
  readonly aria: string;
}

export interface BaseLocation {
  /** Środek markera bazy (Tarnowskie Góry). */
  readonly cx: number;
  readonly cy: number;
  readonly label: string;
  readonly aria: string;
}

/* ───────────────────────── Województwa (4) ───────────────────────── */

export const regions: readonly Region[] = [
  {
    id: "opolskie",
    nameKey: "atlas.region.opolskie",
    path: "M 80 200 L 230 195 L 240 270 L 195 305 L 120 295 L 70 240 Z",
    statKey: "atlas.stat.opolskie",
    capitalCity: "Opole",
    labelX: 145,
    labelY: 250,
  },
  {
    id: "slaskie",
    nameKey: "atlas.region.slaskie",
    path: "M 245 195 L 395 190 L 415 230 L 410 320 L 360 345 L 290 335 L 255 290 Z",
    statKey: "atlas.stat.slaskie",
    capitalCity: "Katowice",
    labelX: 325,
    labelY: 270,
  },
  {
    id: "swietokrzyskie",
    nameKey: "atlas.region.swietokrzyskie",
    path: "M 480 200 L 615 195 L 645 260 L 615 320 L 540 320 L 490 290 Z",
    statKey: "atlas.stat.swietokrzyskie",
    capitalCity: "Kielce",
    labelX: 555,
    labelY: 258,
  },
  {
    id: "malopolskie",
    nameKey: "atlas.region.malopolskie",
    path: "M 365 350 L 480 340 L 540 360 L 555 425 L 480 455 L 395 445 L 355 405 Z",
    statKey: "atlas.stat.malopolskie",
    capitalCity: "Kraków",
    labelX: 460,
    labelY: 400,
  },
];

/* ───────────────────────── Huby lotniskowe (3) ───────────────────────── */

export const hubs: readonly Hub[] = [
  {
    id: "pyrzowice",
    displayName: "Pyrzowice",
    cx: 335,
    cy: 220,
    distanceFromBaseMinutes: 25,
    segmentSlug: "transfery-korporacyjne",
    segmentSlugEn: "corporate-transfers",
    aria: "Lotnisko Pyrzowice — 25 minut od bazy Via Viator",
  },
  {
    id: "balice",
    displayName: "Kraków-Balice",
    cx: 445,
    cy: 380,
    distanceFromBaseMinutes: 90,
    segmentSlug: "transfery-korporacyjne",
    segmentSlugEn: "corporate-transfers",
    aria: "Lotnisko Kraków-Balice — 90 minut od bazy Via Viator",
  },
  {
    id: "wroclaw",
    displayName: "Wrocław",
    cx: 105,
    cy: 175,
    distanceFromBaseMinutes: 150,
    segmentSlug: "transfery-korporacyjne",
    segmentSlugEn: "corporate-transfers",
    aria: "Lotnisko Wrocław — 150 minut od bazy Via Viator",
  },
];

/* ───────────────────────── Baza — Tarnowskie Góry ───────────────────────── */

export const baseLocation: BaseLocation = {
  cx: 305,
  cy: 250,
  label: "Tarnowskie Góry",
  aria: "Baza Via Viator: Tarnowskie Góry, ul. Władysława Broniewskiego 25",
};

/* ───────────────────────── Helpers ───────────────────────── */

/**
 * Generuje SVG `<path d>` linii od bazy (TG) do huba — prosta krzywa
 * z lekkim łukiem (control point ~25% bliżej drugiego końca, offset
 * prostopadły 14% długości linii). Łuk daje wizualne „connection ribbon"
 * zamiast prostej linii kawałka.
 */
export function routePathFromBaseToHub(hub: Hub): string {
  const x1 = baseLocation.cx;
  const y1 = baseLocation.cy;
  const x2 = hub.cx;
  const y2 = hub.cy;
  // Midpoint biased ku drugiej połowie krzywej.
  const mx = x1 + (x2 - x1) * 0.6;
  const my = y1 + (y2 - y1) * 0.6;
  // Wektor prostopadły do linii, znormalizowany na ~14% długości.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = len * 0.14;
  // Skręcamy w stronę: dla wrocław (zachód) na północ, dla balice (wschód-pd)
  // na południe — czytelniej.
  const sign = hub.id === "wroclaw" ? -1 : 1;
  const cx = mx + (-dy / len) * offset * sign;
  const cy = my + (dx / len) * offset * sign;
  return `M ${x1} ${y1} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2} ${y2}`;
}
