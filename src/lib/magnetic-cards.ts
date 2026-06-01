/**
 * Via Viator — Magnetic cards (M05)
 * --------------------------------------------------------------------
 * Cursor-following translate + 3D tilt + flood-position update na każdym
 * elemencie `[data-magnetic="true"]`. Aktywny tylko na pointer:fine
 * (desktop z myszą/trackpadem) — touch dostaje plain hover flood przez CSS.
 *
 * Zachowanie:
 *   - pointerenter   → `data-magnetic-active="true"` (CSS skraca transition)
 *   - pointermove    → rAF-throttled update CSS custom properties:
 *                      --vv-card-tx/ty (translate px, max 4px po skali 0.4)
 *                      --vv-card-rx/ry (rotate deg, max 4deg)
 *                      --vv-card-mx/my (flood gradient center w %)
 *   - pointerleave   → reset wszystkich custom properties do baseline,
 *                      delete `data-magnetic-active`
 *
 * Reduced-motion + pointer:coarse: early return, brak event listenerów,
 * CSS robi resztę (subtle hover flood).
 *
 * Astro 6 ClientRouter: hook na `astro:page-load` re-inicjalizuje system
 * po każdej client-side nawigacji. Cleanup function disconnect'uje stare
 * listeners zanim bind nowych — bez tego post-navigate elementy mają
 * podwójne event listenery na dawnych referencjach.
 *
 * Build artifact target: <2KB gzipped JS (no deps, no polyfills).
 */

const SUPPORTS_FINE_POINTER =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: fine)").matches;

const PREFERS_REDUCED =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Tuning parameters — match z CSS w `SegmentGrid.astro`.
 *   MAX_TRANSLATE * TRANSLATE_SCALE = max ~4px shift przy najbliższym
 *   rogu (subtelny "magnetic pull", nie dramatyczny).
 *   MAX_ROTATE = ±4deg na każdej osi (delikatny parallax tilt).
 */
const MAX_TRANSLATE = 10;
const TRANSLATE_SCALE = 0.4;
const MAX_ROTATE = 4;

/** Clamp to [-1, 1] — normalize wartość względną do połowy karty. */
function clamp1(v: number): number {
  return v < -1 ? -1 : v > 1 ? 1 : v;
}

/**
 * Bind pointer handlers do pojedynczej karty. Zwraca cleanup function
 * do odpięcia event listenerów + anulowania pending rAF callback.
 *
 * pointermove jest rAF-throttled (jeden update na frame, max ~60Hz).
 * To kluczowe dla INP — bez throttle przeglądarka wystawia 100+ events/s
 * i każdy uruchamia style recalc → INP spike powyżej 100ms.
 */
function bindCard(card: HTMLElement): () => void {
  let rafId: number | null = null;

  const onPointerMove = (e: PointerEvent): void => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const rect = card.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      // dx/dy: -1 (left/top edge) → 0 (center) → +1 (right/bottom edge)
      const dx = (e.clientX - rect.left - halfW) / halfW;
      const dy = (e.clientY - rect.top - halfH) / halfH;

      const ndx = clamp1(dx);
      const ndy = clamp1(dy);

      const tx = ndx * MAX_TRANSLATE * TRANSLATE_SCALE;
      const ty = ndy * MAX_TRANSLATE * TRANSLATE_SCALE;
      const ry = ndx * MAX_ROTATE;
      // rotateX: cursor near top → karta tilts back (positive X axis points
      // out of screen), więc dy<0 → rx>0. Inwersja przez minus.
      const rx = -ndy * MAX_ROTATE;

      card.style.setProperty("--vv-card-tx", `${tx.toFixed(2)}px`);
      card.style.setProperty("--vv-card-ty", `${ty.toFixed(2)}px`);
      card.style.setProperty("--vv-card-rx", `${rx.toFixed(2)}deg`);
      card.style.setProperty("--vv-card-ry", `${ry.toFixed(2)}deg`);

      // Flood gradient center: cursor position w % wewnątrz karty.
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--vv-card-mx", `${mx.toFixed(1)}%`);
      card.style.setProperty("--vv-card-my", `${my.toFixed(1)}%`);
    });
  };

  const onPointerEnter = (): void => {
    card.dataset.magneticActive = "true";
  };

  const onPointerLeave = (): void => {
    delete card.dataset.magneticActive;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Reset transforms do baseline (CSS `transform` używa fallbacków,
    // ale explicit reset gwarantuje czyste przejście return-to-rest).
    card.style.setProperty("--vv-card-tx", "0px");
    card.style.setProperty("--vv-card-ty", "0px");
    card.style.setProperty("--vv-card-rx", "0deg");
    card.style.setProperty("--vv-card-ry", "0deg");
  };

  card.addEventListener("pointerenter", onPointerEnter);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerleave", onPointerLeave);
  card.addEventListener("pointercancel", onPointerLeave);

  return () => {
    card.removeEventListener("pointerenter", onPointerEnter);
    card.removeEventListener("pointermove", onPointerMove);
    card.removeEventListener("pointerleave", onPointerLeave);
    card.removeEventListener("pointercancel", onPointerLeave);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

/**
 * Trzymamy listę cleanup callbacks między re-initami (Astro nav swap
 * DOM, stare elementy znikają — ale ich event listenery żyją w GC,
 * bo trzymamy referencje przez closure). Disconnect przed re-bindem.
 */
let cleanups: Array<() => void> = [];

function init(): void {
  // Touch + reduced-motion: CSS robi flood, JS nie musi nic robić.
  if (PREFERS_REDUCED || !SUPPORTS_FINE_POINTER) return;

  // Disconnect stare listenery (Astro re-init guard).
  cleanups.forEach((fn) => fn());
  cleanups = [];

  document
    .querySelectorAll<HTMLElement>("[data-magnetic='true']")
    .forEach((card) => {
      cleanups.push(bindCard(card));
    });
}

/**
 * Browser-only — guard na SSR (Astro buduje statycznie, ten plik
 * landuje w bundle ale execute się tylko po hydration).
 */
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    queueMicrotask(init);
  }

  // Astro 6 ClientRouter — re-init po każdej client-side nawigacji.
  document.addEventListener("astro:page-load", init);
}

export {};
