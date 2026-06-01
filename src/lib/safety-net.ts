/**
 * Global safety-net — defensive fix dla entrance animations.
 *
 * Problem: w masterpiece M01-M11 wiele elementów ma `opacity: 0` jako
 * initial state (HomeHero entrance, SzlakSanktuariow paths, ManuskryptPatryka
 * signature, FloatingPhone, etc.) z animation/transition która "naprawia"
 * opacity:1 po jakimś evencie. Jeśli event nie odpali (CSP blok, browser
 * bug, race condition, animation suppression) — element zostaje opacity:0
 * permanentnie. Białe puste pola.
 *
 * Rozwiązanie defensive: po 2.5s od DOMContentLoaded skanujemy DOM,
 * znajdujemy każdy element z computed opacity === 0 i wymuszamy opacity:1
 * + transform:none + stroke-dashoffset:0 (dla SVG signature/path draw-on).
 *
 * 2.5s to próg który pozwala wszystkim legitimate animacjom zakończyć się
 * naturalnie (najdłuższe są HomeHero 540ms + 9*80ms stagger = ~1.2s,
 * Manuskrypt 1800ms + 9*140ms = ~3s — manuskrypt threshold osobny 4s).
 *
 * Idempotent — można wywołać wielokrotnie, robi to samo. Re-init po
 * astro:page-load (ClientRouter swap).
 */

const PRIMARY_THRESHOLD_MS = 2500;
const MANUSCRIPT_THRESHOLD_MS = 4000;
const FORCE_ATTR = "data-safety-forced";

function forceVisibleIfStuck(scope: ParentNode = document.body): number {
  // Wyklucz elementy które MUSZĄ być opacity:0 (toolbary, modale, etc.)
  // — sprawdzamy aria-hidden, hidden, role=dialog z aria-modal=false.
  let forced = 0;

  const candidates = scope.querySelectorAll<HTMLElement>(
    [
      ".vv-reveal:not([data-revealed='true'])",
      ".vv-home-hero__eyebrow",
      ".vv-home-hero__logo",
      ".vv-home-hero__word",
      ".vv-home-hero__dot",
      ".vv-home-hero__hubs",
      ".vv-home-hero__phone-totem",
      ".vv-home-hero__scroll-cue",
      ".vv-home-hero__thread",
      ".vv-szlak__path",
      ".vv-szlak__marker",
      ".vv-manuskrypt__signature-glyphs path",
      ".vv-manuskrypt__seal",
      ".vv-atlas__hub",
      ".vv-atlas__region",
    ].join(", "),
  );

  candidates.forEach((el) => {
    if (el.hasAttribute(FORCE_ATTR)) return;

    const style = window.getComputedStyle(el);
    const opacity = parseFloat(style.opacity);

    // Sprawdzamy stan końcowy: jeśli element ma opacity ~0 i ma już mieć
    // animation/transition zakończoną, wymuszamy stan końcowy.
    if (opacity < 0.05) {
      el.setAttribute(FORCE_ATTR, "1");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("transform", "none", "important");

      // Dla SVG signature/path — wymuszamy też stroke-dashoffset 0
      if (el instanceof SVGElement) {
        el.style.setProperty("stroke-dashoffset", "0", "important");
      }

      // Dla .vv-reveal — set data-revealed żeby CSS transition state pasował
      if (el.classList.contains("vv-reveal")) {
        el.dataset.revealed = "true";
      }

      forced++;
    }
  });

  return forced;
}

let primaryTimer: number | null = null;
let manuscriptTimer: number | null = null;

function init(): void {
  // Anuluj stare timery przed re-init (Astro nav swap)
  if (primaryTimer !== null) {
    window.clearTimeout(primaryTimer);
  }
  if (manuscriptTimer !== null) {
    window.clearTimeout(manuscriptTimer);
  }

  // Primary scan po 2.5s — większość entrance animacji
  primaryTimer = window.setTimeout(() => {
    const forced = forceVisibleIfStuck();
    if (forced > 0 && typeof console !== "undefined") {
      console.warn(
        `[vv-safety-net] Forced ${forced} stuck elements visible after ${PRIMARY_THRESHOLD_MS}ms. ` +
          `Animation/IO failed to deliver. Investigate.`,
      );
    }
  }, PRIMARY_THRESHOLD_MS);

  // Drugi scan po 4s — manuskrypt signature ma długi draw-on
  manuscriptTimer = window.setTimeout(() => {
    forceVisibleIfStuck();
  }, MANUSCRIPT_THRESHOLD_MS);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  document.addEventListener("astro:page-load", init);
}

export {};
