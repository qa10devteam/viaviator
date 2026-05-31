/**
 * Via Viator — consent state helpers
 * --------------------------------------------------------------------
 * Browser-only (SSR-safe via `typeof window` guards).
 * Storage: localStorage under `vv:consent:v1`.
 * Event API: `window` CustomEvent named `vv:consent:change` (detail = ConsentState).
 *
 * RODO/GDPR posture:
 *   - `necessary` is always granted (legal basis: niezbędność wykonania umowy
 *     i interes prawnie uzasadniony — art. 6(1)(b)/(f) RODO).
 *   - `analytics` and `marketing` require explicit opt-in (art. 6(1)(a) RODO,
 *     PEC art. 173 PT — zgoda na cookies inne niż niezbędne).
 *   - Versioning (`CONSENT_VERSION`) lets us invalidate stored consent if the
 *     scope of processing changes (forces a re-prompt).
 *
 * No external dependencies. No `any`. Idempotent. ENV-free (kept pure).
 */

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentOrigin =
  | "default"
  | "accept-all"
  | "necessary-only"
  | "custom";

export interface ConsentState {
  /** Always true. Modelled as a literal so the contract is enforced at the type level. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** Schema version — bump to force re-prompt when scope of processing changes. */
  version: number;
  /** Unix epoch ms — when the decision was recorded. */
  timestamp: number;
  /** Provenance of the decision (useful for audit + re-prompt heuristics). */
  origin: ConsentOrigin;
}

export const CONSENT_VERSION = 1 as const;
export const CONSENT_STORAGE_KEY = "vv:consent:v1" as const;
export const CONSENT_CHANGE_EVENT = "vv:consent:change" as const;

/* -------------------------------------------------------------------------- */
/* Internals                                                                  */
/* -------------------------------------------------------------------------- */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function safeStorage(): Storage | null {
  if (!isBrowser()) return null;
  try {
    // Safari private mode / iframes with disabled storage throw on access.
    const probe = "__vv_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.necessary === true &&
    typeof v.analytics === "boolean" &&
    typeof v.marketing === "boolean" &&
    typeof v.version === "number" &&
    typeof v.timestamp === "number" &&
    (v.origin === "default" ||
      v.origin === "accept-all" ||
      v.origin === "necessary-only" ||
      v.origin === "custom")
  );
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Default (pre-decision) state. Analytics + marketing OFF. Origin = `default`.
 * Note: this is NOT persisted — it's the runtime fallback before the user decides.
 */
export function defaultConsent(): ConsentState {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    origin: "default",
  };
}

/**
 * Returns the stored consent state, or `null` if:
 *   - no decision recorded yet,
 *   - the stored payload is corrupted / wrong schema,
 *   - the stored `version` is older than `CONSENT_VERSION` (forces re-prompt),
 *   - storage access is unavailable.
 */
export function getStoredConsent(): ConsentState | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isConsentState(parsed)) return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persists the consent decision. Always normalises `necessary` to `true` and
 * stamps the current `version`. Silently no-ops if storage is unavailable.
 */
export function setStoredConsent(state: ConsentState): void {
  const storage = safeStorage();
  if (!storage) return;
  const normalised: ConsentState = {
    necessary: true,
    analytics: !!state.analytics,
    marketing: !!state.marketing,
    version: CONSENT_VERSION,
    timestamp: state.timestamp || Date.now(),
    origin: state.origin,
  };
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalised));
  } catch {
    /* quota / privacy mode — fail soft */
  }
}

/**
 * Wipes stored consent. Use to force a re-prompt (e.g. from a "manage cookies"
 * footer link, or when revoking from settings UI).
 */
export function clearConsent(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* fail soft */
  }
}

/**
 * Predicate: is the given category granted?
 * Falls back to `defaultConsent()` when no state is passed AND nothing stored.
 */
export function isGranted(
  category: ConsentCategory,
  state?: ConsentState
): boolean {
  const s = state ?? getStoredConsent() ?? defaultConsent();
  if (category === "necessary") return true;
  return s[category] === true;
}

/* -------------------------------------------------------------------------- */
/* Event API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Broadcasts a consent change on `window` so other islands / scripts can react
 * (e.g. analytics loader, embed gates). No-op on SSR.
 */
export function emitConsentChange(state: ConsentState): void {
  if (!isBrowser()) return;
  const event = new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, {
    detail: state,
  });
  window.dispatchEvent(event);
}

/**
 * Subscribes to consent changes. Returns an unsubscribe function.
 * Safe to call on SSR (returns no-op cleanup).
 */
export function onConsentChange(
  cb: (state: ConsentState) => void
): () => void {
  if (!isBrowser()) return () => {};
  const handler = (event: Event): void => {
    const ce = event as CustomEvent<ConsentState>;
    if (ce.detail && isConsentState(ce.detail)) cb(ce.detail);
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
}
