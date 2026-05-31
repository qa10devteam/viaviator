/**
 * Via Viator — Consent Banner (React 19 island)
 * --------------------------------------------------------------------
 * Renderowane przez Astro jako:
 *   <ConsentBanner client:idle locale={locale} />
 *
 * Astro 6 islands NIE wymagają dyrektywy "use client" (to konwencja Next.js).
 * Hydratacja jest zarządzana dyrektywą `client:*` na poziomie Astro.
 *
 * Architektura:
 *   - banner    → bottom-fixed CTA strip (3 akcje + close)
 *   - settings  → modalny dialog z 3 checkboxami per kategoria
 *   - hidden    → user już zdecydował (lub legitymowane storage error)
 *
 * A11y:
 *   - role="dialog" + aria-modal w settings, aria-labelledby do tytułu
 *   - focus trap w settings (Tab / Shift+Tab cyklują)
 *   - Esc zamyka tylko settings (banner pozostaje — decyzja jest wymagana)
 *   - first focusable focusowany po otwarciu, restore focusa po zamknięciu
 *   - prefers-reduced-motion respected (CSS)
 *
 * Decyzja: banner pokazuje się TYLKO gdy getStoredConsent() === null.
 * Po opóźnieniu (initial paint) hydratuje się, czyta storage, decyduje view.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  type ConsentState,
  CONSENT_VERSION,
  defaultConsent,
  emitConsentChange,
  getStoredConsent,
  setStoredConsent,
} from "@lib/consent";
import { initAnalytics } from "@lib/analytics";
import { getDictionary, type Locale } from "@i18n/index";

type View = "hidden" | "banner" | "settings";

interface Props {
  locale: Locale;
}

interface CookiesDict {
  bannerTitle: string;
  bannerBody: string;
  acceptAll: string;
  acceptNecessary: string;
  settings: string;
  save: string;
  categoryNecessary: string;
  categoryNecessaryDesc: string;
  categoryAnalytics: string;
  categoryAnalyticsDesc: string;
  categoryMarketing: string;
  categoryMarketingDesc: string;
  readMore: string;
  closeAriaLabel: string;
  dialogAriaLabel: string;
  settingsTitle: string;
  settingsIntro: string;
}

function buildState(
  origin: ConsentState["origin"],
  analytics: boolean,
  marketing: boolean
): ConsentState {
  return {
    necessary: true,
    analytics,
    marketing,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    origin,
  };
}

export default function ConsentBanner({ locale }: Props): React.JSX.Element | null {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState<boolean>(false);
  const [marketing, setMarketing] = useState<boolean>(false);

  // Refs for focus management
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);

  const titleId = useId();
  const bodyId = useId();
  const settingsTitleId = useId();

  const dict = useMemo(() => {
    const root = getDictionary(locale) as unknown as { cookies: CookiesDict };
    return root.cookies;
  }, [locale]);

  /* ----------------------------------------------------------------- */
  /* Bootstrap: decide initial view + apply existing consent           */
  /* ----------------------------------------------------------------- */
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      // Re-apply analytics on every load (covers cleared cache / new tabs).
      initAnalytics(stored);
      setView("hidden");
      return;
    }
    // Pre-consent: keep all non-necessary off, but show banner.
    initAnalytics(defaultConsent());
    setView("banner");
  }, []);

  /* ----------------------------------------------------------------- */
  /* Persist & broadcast                                                */
  /* ----------------------------------------------------------------- */
  const commit = useCallback((state: ConsentState) => {
    setStoredConsent(state);
    initAnalytics(state);
    emitConsentChange(state);
    setView("hidden");
  }, []);

  const handleAcceptAll = useCallback(() => {
    commit(buildState("accept-all", true, true));
  }, [commit]);

  const handleAcceptNecessary = useCallback(() => {
    commit(buildState("necessary-only", false, false));
  }, [commit]);

  const handleOpenSettings = useCallback(() => {
    previousFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    setView("settings");
  }, []);

  const handleCloseSettings = useCallback(() => {
    // Closing settings without saving falls back to the banner (decision still pending).
    setView("banner");
    // Restore focus to whatever opened the dialog.
    queueMicrotask(() => {
      previousFocusRef.current?.focus();
    });
  }, []);

  const handleSaveCustom = useCallback(() => {
    commit(buildState("custom", analytics, marketing));
  }, [commit, analytics, marketing]);

  // Close (×) on the banner — treats as "necessary only" decision.
  // Rationale: RODO mówi, że odmowa nie może być utrudniona względem akceptacji.
  // Krzyżyk = explicit decision (essentially "decline non-necessary"), więc
  // legitymizujemy ten skrót jako równoważny acceptNecessary.
  const handleBannerClose = useCallback(() => {
    handleAcceptNecessary();
  }, [handleAcceptNecessary]);

  /* ----------------------------------------------------------------- */
  /* Settings: focus management + Esc + focus trap                      */
  /* ----------------------------------------------------------------- */
  useEffect(() => {
    if (view !== "settings") return;

    // Initial focus on the first interactive element of the dialog.
    queueMicrotask(() => firstFocusRef.current?.focus());

    // Body scroll lock — gdy dialog modalny, background scroll musi być zablokowany
    // (WCAG 2.4.3 Focus Order — focus nie ucieka pod modal, też UX best practice).
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleCloseSettings();
        return;
      }
      if (e.key !== "Tab") return;
      const root = settingsRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [view, handleCloseSettings]);

  if (view === "hidden") return null;

  /* ----------------------------------------------------------------- */
  /* Render                                                             */
  /* ----------------------------------------------------------------- */
  return (
    <>
      {view === "banner" && (
        <div
          className="vv-consent-banner"
          role="region"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
        >
          <button
            type="button"
            className="vv-consent-banner__close"
            aria-label={dict.closeAriaLabel}
            onClick={handleBannerClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="vv-consent-banner__inner">
            <h2 id={titleId} className="vv-consent-banner__title">
              {dict.bannerTitle}
            </h2>
            <p id={bodyId} className="vv-consent-banner__body">
              {dict.bannerBody}{" "}
              <a
                href={locale === "pl" ? "/polityka-cookies" : "/en/cookies-policy"}
                className="vv-consent-banner__link"
              >
                {dict.readMore}
              </a>
            </p>
            <div className="vv-consent-banner__actions">
              <button
                type="button"
                className="vv-consent-btn vv-consent-btn--primary"
                onClick={handleAcceptAll}
              >
                {dict.acceptAll}
              </button>
              <button
                type="button"
                className="vv-consent-btn vv-consent-btn--ghost"
                onClick={handleAcceptNecessary}
              >
                {dict.acceptNecessary}
              </button>
              <button
                type="button"
                className="vv-consent-btn vv-consent-btn--link"
                onClick={handleOpenSettings}
              >
                {dict.settings}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "settings" && (
        <div
          className="vv-consent-overlay"
          onClick={(e) => {
            // Click-outside (on backdrop) closes the modal.
            if (e.target === e.currentTarget) handleCloseSettings();
          }}
        >
          <div
            ref={settingsRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={settingsTitleId}
            aria-label={dict.dialogAriaLabel}
            className="vv-consent-settings"
          >
            <header className="vv-consent-settings__header">
              <h2 id={settingsTitleId} className="vv-consent-settings__title">
                {dict.settingsTitle}
              </h2>
              <button
                ref={firstFocusRef}
                type="button"
                className="vv-consent-settings__close"
                aria-label={dict.closeAriaLabel}
                onClick={handleCloseSettings}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </header>

            <p className="vv-consent-settings__intro">{dict.settingsIntro}</p>

            <ul className="vv-consent-settings__list">
              <li className="vv-consent-settings__row">
                <label className="vv-consent-settings__label">
                  <input
                    type="checkbox"
                    className="vv-consent-settings__checkbox"
                    checked
                    disabled
                    aria-checked="true"
                  />
                  <span className="vv-consent-settings__name">
                    {dict.categoryNecessary}
                  </span>
                </label>
                <p className="vv-consent-settings__desc">
                  {dict.categoryNecessaryDesc}
                </p>
              </li>
              <li className="vv-consent-settings__row">
                <label className="vv-consent-settings__label">
                  <input
                    type="checkbox"
                    className="vv-consent-settings__checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className="vv-consent-settings__name">
                    {dict.categoryAnalytics}
                  </span>
                </label>
                <p className="vv-consent-settings__desc">
                  {dict.categoryAnalyticsDesc}
                </p>
              </li>
              <li className="vv-consent-settings__row">
                <label className="vv-consent-settings__label">
                  <input
                    type="checkbox"
                    className="vv-consent-settings__checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className="vv-consent-settings__name">
                    {dict.categoryMarketing}
                  </span>
                </label>
                <p className="vv-consent-settings__desc">
                  {dict.categoryMarketingDesc}
                </p>
              </li>
            </ul>

            <div className="vv-consent-settings__actions">
              <button
                type="button"
                className="vv-consent-btn vv-consent-btn--primary"
                onClick={handleSaveCustom}
              >
                {dict.save}
              </button>
              <button
                type="button"
                className="vv-consent-btn vv-consent-btn--ghost"
                onClick={handleAcceptAll}
              >
                {dict.acceptAll}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vv-consent-banner {
          position: fixed;
          bottom: var(--vv-space-4, 16px);
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - var(--vv-space-8, 32px));
          max-width: 720px;
          background: var(--vv-color-bg-elevated, #fafafa);
          color: var(--vv-color-fg-primary, #0a0a0a);
          border: 1px solid var(--vv-color-border-subtle, #e5e5e5);
          border-radius: var(--vv-radius-xl, 16px);
          box-shadow: var(--vv-shadow-xl, 0 8px 16px -4px rgba(0,0,0,.1));
          z-index: var(--vv-z-toast, 600);
          padding: var(--vv-space-5, 20px) var(--vv-space-6, 24px);
          font-family: var(--vv-typography-font-family-body);
          animation: vv-consent-rise var(--vv-motion-duration-base, 250ms) var(--vv-motion-easing-entrance, ease-out);
        }
        @media (prefers-reduced-motion: reduce) {
          .vv-consent-banner { animation: none; }
        }
        @keyframes vv-consent-rise {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .vv-consent-banner__inner {
          display: flex;
          flex-direction: column;
          gap: var(--vv-space-3, 12px);
        }
        .vv-consent-banner__close {
          position: absolute;
          top: var(--vv-space-2, 8px);
          right: var(--vv-space-2, 8px);
          width: 32px;
          height: 32px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: var(--vv-radius-full, 9999px);
          color: var(--vv-color-fg-muted, #737373);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .vv-consent-banner__close:hover,
        .vv-consent-banner__close:focus-visible {
          background: var(--vv-color-bg-surface, #f5f5f5);
          color: var(--vv-color-fg-primary, #0a0a0a);
          outline: 2px solid var(--vv-color-brand-red, #f13223);
          outline-offset: 2px;
        }
        .vv-consent-banner__title {
          margin: 0;
          font-size: var(--vv-typography-font-size-lg, 18px);
          font-weight: var(--vv-typography-font-weight-semibold, 600);
          line-height: var(--vv-typography-line-height-snug, 1.25);
          letter-spacing: var(--vv-typography-letter-spacing-tight, -0.02em);
          padding-right: var(--vv-space-8, 32px);
        }
        .vv-consent-banner__body {
          margin: 0;
          font-size: var(--vv-typography-font-size-sm, 14px);
          line-height: var(--vv-typography-line-height-relaxed, 1.65);
          color: var(--vv-color-fg-secondary, #525252);
        }
        .vv-consent-banner__link {
          color: var(--vv-color-brand-red, #f13223);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .vv-consent-banner__link:focus-visible {
          outline: 2px solid var(--vv-color-brand-red, #f13223);
          outline-offset: 2px;
        }
        .vv-consent-banner__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vv-space-2, 8px);
          margin-top: var(--vv-space-1, 4px);
        }

        /* Buttons — shared */
        .vv-consent-btn {
          font-family: inherit;
          font-size: var(--vv-typography-font-size-sm, 14px);
          font-weight: var(--vv-typography-font-weight-semibold, 600);
          line-height: 1;
          padding: var(--vv-space-3, 12px) var(--vv-space-5, 20px);
          border-radius: var(--vv-radius-md, 8px);
          cursor: pointer;
          border: 1px solid transparent;
          transition: background var(--vv-motion-duration-fast, 150ms) var(--vv-motion-easing-standard, ease),
                      color var(--vv-motion-duration-fast, 150ms) var(--vv-motion-easing-standard, ease),
                      border-color var(--vv-motion-duration-fast, 150ms) var(--vv-motion-easing-standard, ease);
        }
        .vv-consent-btn:focus-visible {
          outline: 2px solid var(--vv-color-brand-red, #f13223);
          outline-offset: 2px;
        }
        /* WCAG AA: brand-red-700 (#C2261A) vs white = 6.45:1.
           Brand-red (#F13223) vs white = 4.42:1 — fail dla button text. */
        .vv-consent-btn--primary {
          background: var(--vv-color-brand-red-700, #c2261a);
          color: var(--vv-color-brand-white, #fff);
        }
        .vv-consent-btn--primary:hover {
          background: #a92117;
        }
        .vv-consent-btn--ghost {
          background: transparent;
          color: var(--vv-color-fg-primary, #0a0a0a);
          border-color: var(--vv-color-border-strong, #a3a3a3);
        }
        .vv-consent-btn--ghost:hover {
          background: var(--vv-color-bg-surface, #f5f5f5);
        }
        .vv-consent-btn--link {
          background: transparent;
          color: var(--vv-color-fg-secondary, #525252);
          padding-left: var(--vv-space-2, 8px);
          padding-right: var(--vv-space-2, 8px);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .vv-consent-btn--link:hover {
          color: var(--vv-color-fg-primary, #0a0a0a);
        }

        /* Settings modal */
        .vv-consent-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 10, 10, 0.55);
          z-index: var(--vv-z-modal, 400);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--vv-space-4, 16px);
          animation: vv-consent-fade var(--vv-motion-duration-fast, 150ms) var(--vv-motion-easing-entrance, ease-out);
        }
        @keyframes vv-consent-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vv-consent-overlay { animation: none; }
        }
        .vv-consent-settings {
          background: var(--vv-color-bg-page, #fff);
          color: var(--vv-color-fg-primary, #0a0a0a);
          border-radius: var(--vv-radius-xl, 16px);
          box-shadow: var(--vv-shadow-2xl, 0 16px 32px -8px rgba(0,0,0,.12));
          width: 100%;
          max-width: 560px;
          max-height: calc(100vh - var(--vv-space-8, 32px));
          overflow-y: auto;
          padding: var(--vv-space-6, 24px);
          font-family: var(--vv-typography-font-family-body);
        }
        .vv-consent-settings__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--vv-space-4, 16px);
          margin-bottom: var(--vv-space-2, 8px);
        }
        .vv-consent-settings__title {
          margin: 0;
          font-size: var(--vv-typography-font-size-xl, 20px);
          font-weight: var(--vv-typography-font-weight-semibold, 600);
          line-height: var(--vv-typography-line-height-snug, 1.25);
        }
        .vv-consent-settings__close {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          padding: 0;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          color: var(--vv-color-fg-muted, #737373);
          border-radius: var(--vv-radius-full, 9999px);
        }
        .vv-consent-settings__close:hover,
        .vv-consent-settings__close:focus-visible {
          background: var(--vv-color-bg-surface, #f5f5f5);
          color: var(--vv-color-fg-primary, #0a0a0a);
          outline: 2px solid var(--vv-color-brand-red, #f13223);
          outline-offset: 2px;
        }
        .vv-consent-settings__intro {
          margin: 0 0 var(--vv-space-4, 16px);
          font-size: var(--vv-typography-font-size-sm, 14px);
          color: var(--vv-color-fg-secondary, #525252);
          line-height: var(--vv-typography-line-height-relaxed, 1.65);
        }
        .vv-consent-settings__list {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--vv-space-6, 24px);
          display: flex;
          flex-direction: column;
          gap: var(--vv-space-4, 16px);
        }
        .vv-consent-settings__row {
          padding: var(--vv-space-3, 12px) 0;
          border-top: 1px solid var(--vv-color-border-subtle, #e5e5e5);
        }
        .vv-consent-settings__row:first-child {
          border-top: none;
          padding-top: 0;
        }
        .vv-consent-settings__label {
          display: flex;
          align-items: center;
          gap: var(--vv-space-3, 12px);
          cursor: pointer;
          font-size: var(--vv-typography-font-size-base, 16px);
          font-weight: var(--vv-typography-font-weight-semibold, 600);
        }
        .vv-consent-settings__checkbox {
          width: 20px;
          height: 20px;
          accent-color: var(--vv-color-brand-red, #f13223);
          cursor: pointer;
        }
        .vv-consent-settings__checkbox:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .vv-consent-settings__name {
          line-height: 1;
        }
        .vv-consent-settings__desc {
          margin: var(--vv-space-2, 8px) 0 0 calc(20px + var(--vv-space-3, 12px));
          font-size: var(--vv-typography-font-size-sm, 14px);
          font-weight: var(--vv-typography-font-weight-regular, 400);
          color: var(--vv-color-fg-secondary, #525252);
          line-height: var(--vv-typography-line-height-relaxed, 1.65);
        }
        .vv-consent-settings__actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--vv-space-2, 8px);
          justify-content: flex-end;
          border-top: 1px solid var(--vv-color-border-subtle, #e5e5e5);
          padding-top: var(--vv-space-4, 16px);
        }

        /* Mobile: full-width bottom drawer pattern */
        @media (max-width: 640px) {
          .vv-consent-banner {
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: 100%;
            transform: none;
            border-radius: var(--vv-radius-xl, 16px) var(--vv-radius-xl, 16px) 0 0;
            border-bottom: none;
            padding: var(--vv-space-5, 20px) var(--vv-space-4, 16px) calc(var(--vv-space-5, 20px) + env(safe-area-inset-bottom, 0px));
          }
          @keyframes vv-consent-rise {
            from { opacity: 0; transform: translateY(100%); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .vv-consent-banner__actions {
            flex-direction: column;
            align-items: stretch;
          }
          .vv-consent-btn {
            width: 100%;
            text-align: center;
          }
          .vv-consent-settings {
            max-height: calc(100vh - var(--vv-space-4, 16px));
          }
          .vv-consent-settings__actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }
        }
      `}</style>
    </>
  );
}
