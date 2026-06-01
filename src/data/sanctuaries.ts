/**
 * Sanktuaria pielgrzymkowe — dane dla Wow #3 "Szlak Sanktuariów".
 *
 * Coordinaty w viewBox 0 0 600 800 (orientacja N-S, większa pionowa
 * skala dla widoczności trasy Tarnowskie Góry → Licheń).
 *
 * Czasy dojazdu szacunkowe — z Tarnowskich Gór ul. Władysława Broniewskiego.
 * Postoje typowe na podstawie buyer persony Marii (P2 pielgrzymka).
 *
 * Geometria — układ:
 *   - viewBox 600×800 (3:4, pionowa orientacja PL)
 *   - oś X: zachód (left) → wschód (right)
 *   - oś Y: północ (top) → południe (bottom)
 *   - Tarnowskie Góry ≈ środek-dół (280, 580) — baza
 *   - Licheń, Niepokalanów na północ (powyżej TG)
 *   - Częstochowa nad TG (północny środek)
 *   - Kalwaria, Łagiewniki, Wadowice na południu (poniżej TG)
 *
 * Source: brand book v1.0 — 6 sanktuariów rdzeniowych z segmentu pielgrzymki.
 */

export interface Sanctuary {
  readonly id: string;
  /** Krótka etykieta marker labelki (np. "Częstochowa"). */
  readonly name: string;
  /** Pełna nazwa do tooltipów / aria-label. */
  readonly fullName: string;
  /** Pozycja markera w viewBox 600×800. */
  readonly cx: number;
  readonly cy: number;
  /** Dojazd z Tarnowskich Gór, minuty. */
  readonly travelMinutes: number;
  /** Typowy postój na miejscu, minuty. */
  readonly typicalStopMinutes: number;
  /** Notatka operacyjna (np. "Postój przy bramie Jasnogórskiej"). */
  readonly note?: string;
}

/* ───────────────────────── Baza — Tarnowskie Góry ───────────────────────── */

export const baseTG = {
  cx: 280,
  cy: 580,
  label: "Tarnowskie Góry",
} as const;

/* ───────────────────────── Sanktuaria (6) ───────────────────────── */

export const sanctuaries: readonly Sanctuary[] = [
  {
    id: "czestochowa",
    name: "Częstochowa",
    fullName: "Jasna Góra",
    cx: 330,
    cy: 440,
    travelMinutes: 105,
    typicalStopMinutes: 120,
    note: "Postój przy bramie Jasnogórskiej",
  },
  {
    id: "lichen",
    name: "Licheń",
    fullName: "Sanktuarium Matki Bożej Licheńskiej",
    cx: 360,
    cy: 200,
    travelMinutes: 240,
    typicalStopMinutes: 180,
    note: "Bazylika + Park Maryjny",
  },
  {
    id: "niepokalanow",
    name: "Niepokalanów",
    fullName: "Niepokalanów — klasztor Franciszkanów",
    cx: 480,
    cy: 280,
    travelMinutes: 285,
    typicalStopMinutes: 150,
    note: "Bazylika + Panorama Tysiąclecia",
  },
  {
    id: "kalwaria",
    name: "Kalwaria",
    fullName: "Kalwaria Zebrzydowska",
    cx: 380,
    cy: 690,
    travelMinutes: 80,
    typicalStopMinutes: 180,
    note: "Klasztor + Dróżki Pana Jezusa",
  },
  {
    id: "lagiewniki",
    name: "Łagiewniki",
    fullName: "Sanktuarium Bożego Miłosierdzia, Kraków",
    cx: 430,
    cy: 640,
    travelMinutes: 75,
    typicalStopMinutes: 120,
    note: "Klasztor + bazylika nowa",
  },
  {
    id: "wadowice",
    name: "Wadowice",
    fullName: "Bazylika Ofiarowania NMP, Wadowice",
    cx: 320,
    cy: 700,
    travelMinutes: 70,
    typicalStopMinutes: 90,
    note: "Bazylika + Dom Rodzinny Karola Wojtyły",
  },
];

/* ───────────────────────── Helpers ───────────────────────── */

/**
 * Format czasu z minut: 75 → "1h15", 105 → "1h45", 60 → "1h", 45 → "45 min".
 * Format krótki — używany w markerach i kartach.
 */
export function formatMinutesShort(minutes: number, minutesLabel = "min"): string {
  if (minutes < 60) return `${minutes} ${minutesLabel}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

/**
 * Generuje SVG `<path d>` linii od bazy (TG) do sanktuarium — krzywa Q
 * z lekkim łukiem prostopadłym do prostej. Sign alternowane (per index)
 * żeby pathy się nie nakładały na siebie tam, gdzie cele są blisko siebie
 * (Kalwaria/Wadowice/Łagiewniki — trzy punkty na południu).
 *
 * Dla północnych celów (Licheń/Niepokalanów/Częstochowa) łuk delikatny —
 * trasy są długie i wizualnie czytelne.
 */
export function routePathFromBase(
  sanctuary: Sanctuary,
  index: number,
): string {
  const x1 = baseTG.cx;
  const y1 = baseTG.cy;
  const x2 = sanctuary.cx;
  const y2 = sanctuary.cy;

  // Midpoint biased ku celu (60%) dla naturalnego łuku.
  const mx = x1 + (x2 - x1) * 0.55;
  const my = y1 + (y2 - y1) * 0.55;

  // Wektor prostopadły, znormalizowany na ~12% długości.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = len * 0.12;

  // Alternujemy znak per index — pathy się nie zlewają nawzajem.
  // Dla północnych celów (id zaczynających się od "l"/"n"/"c") jeden kierunek,
  // dla południowych (k/ł/w) — drugi.
  const isNorth =
    sanctuary.id === "czestochowa" ||
    sanctuary.id === "lichen" ||
    sanctuary.id === "niepokalanow";
  const sign = isNorth
    ? index % 2 === 0
      ? -1
      : 1
    : index % 2 === 0
      ? 1
      : -1;

  const cx = mx + (-dy / len) * offset * sign;
  const cy = my + (dx / len) * offset * sign;

  return `M ${x1} ${y1} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2} ${y2}`;
}
