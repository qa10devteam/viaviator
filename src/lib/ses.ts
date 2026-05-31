/**
 * AWS SES — wysyłka briefów z formularza kontaktowego.
 *
 * Zasady QA10 (per Adrianna doctrine — „secrets connect at the end"):
 *  - Brak hardcoded credentials w repo.
 *  - Gdy brak `AWS_ACCESS_KEY_ID` lub `AWS_SECRET_ACCESS_KEY` → funkcja loguje
 *    payload do stdout (z obciętą wiadomością) i RESOLVES bez błędu.
 *    To pozwala uruchomić dev/preview bez sekretów (smoke test
 *    formularza, walidacja w endpoincie) — produkcja podpina env w Vercel.
 *  - Region domyślnie `eu-central-1` (Frankfurt) — najbliżej PL, niska latencja.
 *
 * UWAGA: paczka `@aws-sdk/client-ses` to SES v1 API (nie v2). Używamy więc
 *   - `SESClient` (nie `SESv2Client`)
 *   - `SendEmailCommand` z payloadem `{Source, Destination, Message: {Subject, Body}}`
 *   (nie `Content.Simple.Subject.Data`).
 *
 * Plan migracji do v2 (przyszłość): wymiana paczki na `@aws-sdk/client-sesv2`
 * + przebudowa payloadu. Na 2026-05-31 v1 wystarcza — quota i template-less
 * email są wspierane w obu wersjach.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// ─────────────────────────────────────────────────────────────────────────────
// Typy publiczne (konsumowane przez /api/contact)
// ─────────────────────────────────────────────────────────────────────────────

export interface ContactEmailData {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  /** Segment wybrany w formularzu (`korpo|pielgrzymki|...|inne`). */
  readonly segmentSelect?: string;
  /** Segment z URL `?segment=...` (preselect z linku marketingowego). */
  readonly segment?: string;
  readonly message: string;
  readonly locale: "pl" | "en";
}

// ─────────────────────────────────────────────────────────────────────────────
// Konfiguracja (env-driven, fallback do bezpiecznych defaultów)
// ─────────────────────────────────────────────────────────────────────────────

const REGION = import.meta.env.AWS_REGION ?? "eu-central-1";
const FROM_EMAIL = import.meta.env.SES_FROM_EMAIL ?? "kontakt@viaviator.pl";
const TO_EMAIL = import.meta.env.SES_TO_EMAIL ?? "kontakt@viaviator.pl";

// ─────────────────────────────────────────────────────────────────────────────
// Mapowanie segmentów na ludzkie etykiety (do subject + body)
// ─────────────────────────────────────────────────────────────────────────────

/** PL etykiety segmentów (do mail body — przewoźnik pisze po polsku). */
const SEGMENT_LABELS_PL: Record<string, string> = {
  korpo: "Transfer korporacyjny",
  pielgrzymki: "Pielgrzymka / wycieczka grupowa",
  dostepny: "Transport osób z niepełnosprawnościami",
  rodzinne: "Przewóz rodzinny / okazjonalny",
  wynajem: "Wynajem busa",
  eventy: "Imprezy okolicznościowe",
  inne: "Coś innego",
};

const SEGMENT_LABELS_EN: Record<string, string> = {
  korpo: "Corporate transfer",
  pielgrzymki: "Pilgrimage / group trip",
  dostepny: "Accessible transport",
  rodzinne: "Family / occasional transport",
  wynajem: "Van rental",
  eventy: "Events / event gear",
  inne: "Something else",
};

function resolveSegmentLabel(d: ContactEmailData): string {
  const id = d.segment || d.segmentSelect || "inne";
  const map = d.locale === "en" ? SEGMENT_LABELS_EN : SEGMENT_LABELS_PL;
  return map[id] ?? id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wysyła brief klienta na adres wskazany w env `SES_TO_EMAIL`.
 * Reply-To = klient (właściciel skrzynki może odpowiadać normalnie).
 *
 * Graceful fallback: jeśli brak credentials, loguje do stdout i ZWRACA bez
 * błędu. Pozwala to formularzowi działać end-to-end w dev/preview bez
 * konfiguracji AWS — kluczowe dla iteracji UX, walidacji, A11y testów.
 *
 * @throws SES API error (np. rate-limit, invalid sender) — endpoint
 *   `/api/contact` łapie i zwraca 500 z `error: "server"`.
 */
export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (
    !import.meta.env.AWS_ACCESS_KEY_ID ||
    !import.meta.env.AWS_SECRET_ACCESS_KEY
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      "[ses] AWS credentials missing — logging payload instead of sending.",
    );
    // eslint-disable-next-line no-console
    console.info("[ses] would send:", {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      replyTo: data.email,
      locale: data.locale,
      segment: data.segment ?? data.segmentSelect ?? "inne",
      name: data.name,
      phone: data.phone,
      messagePreview: data.message.slice(0, 200),
    });
    return;
  }

  const client = new SESClient({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const segmentLabel = resolveSegmentLabel(data);
  const subject =
    data.locale === "pl"
      ? `[viaviator.pl] Nowe zapytanie: ${segmentLabel} — ${data.name}`
      : `[viaviator.pl] New inquiry: ${segmentLabel} — ${data.name}`;

  const body = renderEmailBody(data, segmentLabel);

  await client.send(
    new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      ReplyToAddresses: [data.email],
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: body.text, Charset: "UTF-8" },
          Html: { Data: body.html, Charset: "UTF-8" },
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderowanie treści maila (Text + HTML)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generuje obie wersje maila — text/plain (fallback) i text/html (klient).
 * HTML jest minimal-CSS inline — dostępność dla Outlook/Gmail i klientów
 * mobilnych. Czerwony akcent zgodny z Brand Book v1.0 (#F13223).
 */
function renderEmailBody(
  d: ContactEmailData,
  segmentLabel: string,
): { text: string; html: string } {
  const labels =
    d.locale === "pl"
      ? {
          headline: "Nowe zapytanie z viaviator.pl",
          segment: "Segment",
          name: "Imię i nazwisko",
          email: "E-mail",
          phone: "Telefon",
          locale: "Język",
          message: "Wiadomość",
          footer:
            "Wysłane przez formularz na viaviator.pl. Odpowiedz na ten e-mail aby skontaktować się z klientem.",
        }
      : {
          headline: "New inquiry from viaviator.pl",
          segment: "Segment",
          name: "Name",
          email: "E-mail",
          phone: "Phone",
          locale: "Language",
          message: "Message",
          footer:
            "Sent via the form on viaviator.pl. Reply to this e-mail to contact the customer.",
        };

  const text = [
    labels.headline,
    `${labels.segment}: ${segmentLabel}`,
    `${labels.name}: ${d.name}`,
    `${labels.email}: ${d.email}`,
    `${labels.phone}: ${d.phone}`,
    `${labels.locale}: ${d.locale}`,
    "",
    `${labels.message}:`,
    d.message,
    "",
    "—",
    labels.footer,
  ].join("\n");

  const phoneTel = d.phone.replace(/[^\d+]/g, "");

  const html = `<!doctype html>
<html lang="${d.locale}">
<body style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #0a0a0a; background: #ffffff;">
<h2 style="color: #F13223; border-bottom: 2px solid #F13223; padding-bottom: 8px; margin: 0 0 16px 0; font-size: 20px;">${escapeHtml(labels.headline)}</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 14px;">
<tr><td style="vertical-align: top; color: #525252;"><strong>${escapeHtml(labels.segment)}:</strong></td><td style="vertical-align: top;">${escapeHtml(segmentLabel)}</td></tr>
<tr><td style="vertical-align: top; color: #525252;"><strong>${escapeHtml(labels.name)}:</strong></td><td style="vertical-align: top;">${escapeHtml(d.name)}</td></tr>
<tr><td style="vertical-align: top; color: #525252;"><strong>${escapeHtml(labels.email)}:</strong></td><td style="vertical-align: top;"><a href="mailto:${escapeHtml(d.email)}" style="color: #F13223;">${escapeHtml(d.email)}</a></td></tr>
<tr><td style="vertical-align: top; color: #525252;"><strong>${escapeHtml(labels.phone)}:</strong></td><td style="vertical-align: top;"><a href="tel:${escapeHtml(phoneTel)}" style="color: #F13223;">${escapeHtml(d.phone)}</a></td></tr>
<tr><td style="vertical-align: top; color: #525252;"><strong>${escapeHtml(labels.locale)}:</strong></td><td style="vertical-align: top;">${escapeHtml(d.locale)}</td></tr>
</table>
<h3 style="margin: 24px 0 8px 0; font-size: 16px; color: #0a0a0a;">${escapeHtml(labels.message)}</h3>
<p style="white-space: pre-wrap; background: #fafafa; border-left: 3px solid #F13223; padding: 16px; border-radius: 4px; margin: 0; font-size: 14px; line-height: 1.6;">${escapeHtml(d.message)}</p>
<hr style="margin: 32px 0 0 0; border: 0; border-top: 1px solid #e5e5e5;">
<p style="font-size: 12px; color: #737373; margin: 16px 0 0 0;">${escapeHtml(labels.footer)}</p>
</body>
</html>`;

  return { text, html };
}

/**
 * Escape minimalny do HTML — chroni przed XSS w treści wiadomości,
 * imieniu i emailu. Mail trafia do skrzynki operatora — pozornie niegroźne,
 * ale Outlook/Gmail renderuje HTML, więc payload z `<script>` lub `onerror`
 * mógłby wykonać się w preview. Defensywnie escapujemy zawsze.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
