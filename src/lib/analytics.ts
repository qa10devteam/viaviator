/**
 * Via Viator — analytics loader
 * --------------------------------------------------------------------
 * Privacy-first, consent-gated, ENV-driven. Plausible Analytics (cookieless)
 * is the only first-party loader. Marketing pixels (Meta/Google) are stubs —
 * they no-op unless an ID env is set at build time AND consent is granted.
 *
 * Doctrine (Adrianna): "secrets connect at the end" — żadne ID-ki nie są wbite,
 * empty env → silent no-op, build nie krzyczy, deploy bez sekretów się nie psuje.
 *
 * Public surface:
 *   - initAnalytics(state)   — idempotent. Loads scripts that the state allows
 *                              and tears down scripts whose consent was revoked.
 *   - trackEvent(name, props) — Plausible custom event. No-op without consent.
 *
 * Side-effects are confined to known DOM IDs so cleanup is deterministic.
 */

import type { ConsentState } from "./consent";

/* -------------------------------------------------------------------------- */
/* Env                                                                        */
/* -------------------------------------------------------------------------- */

const PLAUSIBLE_DOMAIN: string =
  (import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN as string | undefined)?.trim() ?? "";
const PLAUSIBLE_HOST: string =
  (import.meta.env.PUBLIC_PLAUSIBLE_HOST as string | undefined)?.trim() ||
  "https://plausible.io";

/** Optional marketing pixel envs — left undeclared by default. */
const META_PIXEL_ID: string =
  (import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined)?.trim() ?? "";
const GOOGLE_ADS_ID: string =
  (import.meta.env.PUBLIC_GOOGLE_ADS_ID as string | undefined)?.trim() ?? "";

/* -------------------------------------------------------------------------- */
/* DOM IDs (deterministic — used for both inject and removal)                 */
/* -------------------------------------------------------------------------- */

const SCRIPT_ID_PLAUSIBLE = "vv-analytics-plausible";
const SCRIPT_ID_META = "vv-marketing-meta";
const SCRIPT_ID_GOOGLE_ADS = "vv-marketing-google-ads";

/* -------------------------------------------------------------------------- */
/* Plausible runtime shim                                                     */
/* -------------------------------------------------------------------------- */

type PlausibleEventOptions = {
  props?: Record<string, string>;
  callback?: () => void;
};
type PlausibleFn = (eventName: string, options?: PlausibleEventOptions) => void;
type PlausibleQueueEntry = [string, PlausibleEventOptions?];

declare global {
  interface Window {
    plausible?: PlausibleFn & { q?: PlausibleQueueEntry[] };
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function removeScriptById(id: string): void {
  if (!isBrowser()) return;
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* -------------------------------------------------------------------------- */
/* Plausible                                                                  */
/* -------------------------------------------------------------------------- */

function injectPlausibleScript(): void {
  if (!isBrowser()) return;
  if (!PLAUSIBLE_DOMAIN) return; // no env → silent no-op (doctrine)
  if (document.getElementById(SCRIPT_ID_PLAUSIBLE)) return; // idempotent

  const script = document.createElement("script");
  script.id = SCRIPT_ID_PLAUSIBLE;
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  // Use the "manual" + "outbound-links" variant if you want SPA pageviews under
  // your control; here we ship the default which auto-tracks pageviews + handles
  // hash-based routing safely on a static site.
  script.src = `${PLAUSIBLE_HOST.replace(/\/$/, "")}/js/script.js`;
  document.head.appendChild(script);

  // Queue events before the script loads.
  if (typeof window.plausible !== "function") {
    const queue: PlausibleQueueEntry[] = [];
    const stub: PlausibleFn & { q?: PlausibleQueueEntry[] } = (name, opts) => {
      queue.push([name, opts]);
    };
    stub.q = queue;
    window.plausible = stub;
  }
}

function removePlausible(): void {
  removeScriptById(SCRIPT_ID_PLAUSIBLE);
  if (isBrowser() && window.plausible) {
    // Drop the runtime so subsequent trackEvent() calls truly no-op even if a
    // stale closure tries to invoke it.
    delete window.plausible;
  }
}

/* -------------------------------------------------------------------------- */
/* Marketing pixels (stubs — wired only if their env is set)                  */
/* -------------------------------------------------------------------------- */

function injectMarketingPixels(): void {
  if (!isBrowser()) return;

  // Meta Pixel — only if PUBLIC_META_PIXEL_ID is set
  if (META_PIXEL_ID && !document.getElementById(SCRIPT_ID_META)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID_META;
    script.async = true;
    script.text = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  // Google Ads (gtag) — only if PUBLIC_GOOGLE_ADS_ID is set
  if (GOOGLE_ADS_ID && !document.getElementById(SCRIPT_ID_GOOGLE_ADS)) {
    const loader = document.createElement("script");
    loader.id = SCRIPT_ID_GOOGLE_ADS;
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
    document.head.appendChild(loader);

    const init = document.createElement("script");
    init.id = `${SCRIPT_ID_GOOGLE_ADS}-init`;
    init.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GOOGLE_ADS_ID}');
    `;
    document.head.appendChild(init);
  }
}

function removeMarketingPixels(): void {
  removeScriptById(SCRIPT_ID_META);
  removeScriptById(SCRIPT_ID_GOOGLE_ADS);
  removeScriptById(`${SCRIPT_ID_GOOGLE_ADS}-init`);
  if (isBrowser()) {
    if (window.fbq) delete window.fbq;
    if (window.gtag) delete window.gtag;
    // We deliberately leave window.dataLayer in place — Partytown forwards
    // dataLayer.push (see astro.config.mjs). Removing it would break that
    // bridge for any non-consent-gated future use.
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Reacts to a consent state change. Idempotent — safe to call repeatedly with
 * the same state (no duplicate script tags, no double-fire).
 *
 *   analytics granted   → inject Plausible (if PUBLIC_PLAUSIBLE_DOMAIN set)
 *   analytics revoked   → remove Plausible
 *   marketing granted   → inject marketing pixels (if their IDs are set)
 *   marketing revoked   → remove marketing pixels
 *
 * Always a no-op on SSR.
 */
export function initAnalytics(state: ConsentState): void {
  if (!isBrowser()) return;

  if (state.analytics) {
    injectPlausibleScript();
  } else {
    removePlausible();
  }

  if (state.marketing) {
    injectMarketingPixels();
  } else {
    removeMarketingPixels();
  }
}

/**
 * Fires a Plausible custom event. Guarded by stored consent — if the user did
 * not grant `analytics`, this is a no-op (no network egress).
 */
export function trackEvent(
  name: string,
  props?: Record<string, string>
): void {
  if (!isBrowser()) return;
  // Lazy import to avoid a hard cycle (analytics.ts ↔ consent.ts at module init).
  // We read storage directly to avoid passing state through every call site.
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem("vv:consent:v1");
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as { analytics?: unknown }).analytics !== true
    ) {
      return;
    }
  } catch {
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
  }
}
