/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_DEFAULT_LOCALE?: string;
  readonly PUBLIC_BRAND_PHONE?: string;
  readonly PUBLIC_BRAND_EMAIL_CONTACT?: string;
  readonly PUBLIC_BRAND_EMAIL_BOARD?: string;
  readonly PUBLIC_BRAND_EMAIL_MARKETING?: string;
  readonly PUBLIC_BRAND_EMAIL_LEGACY?: string;
  readonly PUBLIC_BRAND_NIP?: string;
  readonly PUBLIC_BRAND_KRS?: string;
  readonly PUBLIC_BRAND_ADDRESS?: string;
  readonly PUBLIC_QA10_SEAL_VERSION?: string;
  readonly PUBLIC_QA10_SEAL_URL?: string;
  readonly PUBLIC_QA10_HOME?: string;
  /** Analytics — consent-gated. Empty → loader no-ops. */
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_HOST?: string;
  /** Optional marketing pixels — empty → no-op. */
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_ID?: string;
  /** AWS SES — server-only. Empty → endpoint loguje zamiast wysyłać (graceful fallback). */
  readonly AWS_REGION?: string;
  readonly AWS_ACCESS_KEY_ID?: string;
  readonly AWS_SECRET_ACCESS_KEY?: string;
  readonly SES_FROM_EMAIL?: string;
  readonly SES_TO_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
