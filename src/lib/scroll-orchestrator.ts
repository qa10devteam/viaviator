/**
 * Via Viator — Scroll orchestrator (M03)
 * --------------------------------------------------------------------
 * IntersectionObserver fallback dla przeglądarek bez scroll-driven CSS
 * animations (`@supports (animation-timeline: view())` = Chrome/Edge 115+).
 *
 * Robi trzy rzeczy:
 *   1. Indeksuje dzieci `[data-reveal-cascade]` ustawiając `--vv-reveal-i`
 *      jako custom property — kaskadowy delay liczy CSS, nie my.
 *   2. W browserach z native scroll-timeline NIE obserwuje `.vv-reveal`
 *      (CSS animation-timeline robi robotę) — oszczędzamy CPU.
 *   3. W pozostałych obserwuje `.vv-reveal` i ustawia `data-revealed="true"`
 *      przy wejściu w viewport (rootMargin -10% bottom = trigger gdy element
 *      jest mniej więcej na 10% od dołu viewportu, naturalny "reveal feel").
 *
 * Reduced-motion: nie obserwujemy w ogóle, ustawiamy `data-revealed="true"`
 * od razu na wszystkie (defense in depth — CSS guard zeruje animację, ale
 * też trzymamy stan końcowy w DOM dla deterministycznego renderu).
 *
 * Astro 6 ClientRouter: hook na `astro:page-load` re-inicjalizuje system
 * po każdej client-side nawigacji. Bez tego po pierwszej nawigacji
 * nowe `.vv-reveal` elementy zostają opacity:0 forever.
 *
 * Build artifact target: <1KB gzipped JS (no deps, no polyfills).
 */

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("animation-timeline: view()");

/**
 * Iteruje wszystkie `[data-reveal-cascade]` w drzewie i ustawia
 * `--vv-reveal-i` jako CSS custom property na każdym bezpośrednim
 * dziecku `.vv-reveal`. CSS w `scroll-choreography.css` mnoży ten index
 * przez `--vv-motion-stagger-base` żeby uzyskać delay per element.
 *
 * Robione zawsze (modern + fallback) — CSS scroll-timeline również
 * używa custom property dla stagger logic.
 */
function indexCascadeChildren(root: ParentNode): void {
  const cascades = root.querySelectorAll<HTMLElement>("[data-reveal-cascade]");
  cascades.forEach((parent) => {
    const children = parent.querySelectorAll<HTMLElement>(
      ":scope > .vv-reveal",
    );
    children.forEach((child, i) => {
      child.style.setProperty("--vv-reveal-i", String(i));
    });
  });
}

/**
 * Tworzy IntersectionObserver i obserwuje wszystkie `.vv-reveal`
 * które nie są jeszcze revealed. Po wejściu w viewport ustawia
 * `data-revealed="true"` i unobserve'uje element (single-shot).
 *
 * rootMargin: -10% bottom = element musi wjechać ~10% w viewport
 * żeby trigger się odpalił. Bez tego elementy "podskakują" gdy
 * user dotrze do nich i już są revealed.
 *
 * threshold 0.05 = 5% widoczności wystarczy do triggera (większość
 * elementów jest większa niż viewport-bottom-margin, więc 5% to
 * praktycznie pierwsza linia pixeli widoczna na ekranie).
 */
function setupObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") {
    // Bardzo stare browsery (IE11 itp.) — reveal everything immediately.
    document
      .querySelectorAll<HTMLElement>(".vv-reveal:not([data-revealed='true'])")
      .forEach((el) => {
        el.dataset.revealed = "true";
      });
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.05,
    },
  );

  document
    .querySelectorAll<HTMLElement>(".vv-reveal:not([data-revealed='true'])")
    .forEach((el) => {
      observer.observe(el);
    });

  return observer;
}

/**
 * Trzymamy referencję do observer'a między re-initami żeby zwolnić
 * stary przed nawigacją (Astro ClientRouter swap DOM, stary observer
 * trzyma referencje do elementów już-niemających rodzica → leak).
 */
let activeObserver: IntersectionObserver | null = null;

function init(): void {
  // 1. Zawsze indeksujemy cascade children — CSS używa indeksu
  //    również w scenariuszu scroll-timeline (delay computation).
  indexCascadeChildren(document.body);

  // 2. Reduced-motion: end-state instant, no observation.
  //    NIE dodajemy klasy js-reveal → CSS default zostaje opacity:1 = visible.
  const prefersReduce =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduce) {
    return;
  }

  // 3. Modern browser z scroll-timeline — CSS animation-timeline obsługuje
  //    wszystko. Dodajemy klasę żeby reveal CSS się zaaplikowało.
  if (SUPPORTS_SCROLL_TIMELINE) {
    document.documentElement.classList.add("js-reveal");
    return;
  }

  // 4. Fallback — IO required. Sprawdź dostępność before promising visual.
  if (typeof IntersectionObserver === "undefined") {
    return; // klasa NIE dodana → CSS zostaje visible
  }

  // 5. Wszystko OK — dodajemy klasę (CSS aplikuje opacity:0 + transform),
  //    setup IO który będzie ustawiał data-revealed na intersection.
  document.documentElement.classList.add("js-reveal");

  if (activeObserver !== null) {
    activeObserver.disconnect();
  }
  activeObserver = setupObserver();

  // Safety net: po 4s wymuszamy reveal wszystkich, nawet jeśli IO
  // nie odpalił z jakiegoś powodu (np. CSP delay, bug Safari).
  // White flash > permanent white void.
  setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>(".vv-reveal:not([data-revealed='true'])")
      .forEach((el) => {
        el.dataset.revealed = "true";
      });
  }, 4000);
}

/**
 * Browser-only — guard na SSR (Astro buduje statycznie, ten plik
 * landuje w bundle ale execute się tylko po hydration).
 */
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    // Microtask: pozwalamy bieżącemu turn'owi rendererskiemu zakończyć
    // (głównie chodzi o ConsentBanner i inne late-mount islands).
    queueMicrotask(init);
  }

  // Astro 6 ClientRouter — re-init po każdej client-side nawigacji.
  // `astro:page-load` strzela po tym jak nowy dokument jest gotowy
  // w DOM (po view transition swap).
  document.addEventListener("astro:page-load", init);
}

export {};
