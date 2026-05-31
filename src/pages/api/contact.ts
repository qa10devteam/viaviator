/**
 * POST /api/contact — odbiera brief z formularza kontaktowego, waliduje, wysyła SES.
 *
 * Zasady:
 *  - SSR (per-route opt-in z `prerender = false`) — działa w trybie `output: "static"`,
 *    Vercel adapter pakuje endpoint jako serverless function.
 *  - Walidacja przez Zod — gwarantuje shape przed dotknięciem SES.
 *  - Honeypot (`company_website`) — jeśli wypełnione, udajemy sukces (boty
 *    dostają 200, ale mail nie idzie). Klasyczne anti-spam bez CAPTCHA.
 *  - In-memory rate-limit (5 req / IP / godzinę) — chroni przed scrap-i-spam.
 *    Dla edge runtime to per-instance limit (nie globalny), ale wystarcza:
 *    przy minimalnym ruchu strony korpo realnie nie nadużywa.
 *  - Akceptuje BOTH `application/json` (fetch z client-side enhancement)
 *    i `application/x-www-form-urlencoded`/`multipart/form-data` (no-JS fallback).
 *
 * Status codes:
 *  - 200 — sukces (lub honeypot trip).
 *  - 400 — walidacja (returnujemy `issues` z Zod, useful dla JS UI).
 *  - 405 — GET (Method Not Allowed, `allow: POST` header).
 *  - 429 — rate limit (zwykle bot — generic message).
 *  - 500 — SES failure lub inny błąd serwera.
 */

import type { APIRoute } from "astro";
import { z } from "zod";
import { sendContactEmail, type ContactEmailData } from "@lib/ses";

// ─────────────────────────────────────────────────────────────────────────────
// Per-route SSR opt-in (Astro 6) — endpoint nie jest pre-renderowany,
// Vercel adapter pakuje go jako lambdę.
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

// ─────────────────────────────────────────────────────────────────────────────
// Schemat walidacji — Zod 3.x
// ─────────────────────────────────────────────────────────────────────────────

const SEGMENT_VALUES = [
  "korpo",
  "pielgrzymki",
  "dostepny",
  "rodzinne",
  "wynajem",
  "eventy",
  "inne",
] as const;

/**
 * Telefon — minimum 7, max 20 znaków, dozwolone: cyfry, plus, spacja, łącznik,
 * nawiasy. Zgodne z `pattern` w `<input type="tel">` formularza.
 */
const PHONE_REGEX = /^[+\d\s\-()]{7,20}$/;

const ContactSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(160),
  phone: z.string().min(7).max(20).regex(PHONE_REGEX),
  segmentSelect: z
    .enum(SEGMENT_VALUES)
    .optional()
    .or(z.literal("")),
  segment: z.string().max(40).optional(),
  message: z.string().min(20).max(2000).trim(),
  locale: z.enum(["pl", "en"]).default("pl"),
  /**
   * Honeypot — akceptujemy DOWOLNĄ wartość, decyzja o trip jest podejmowana
   * post-parse (w handlerze). Inaczej zod zwracałby 400 dla wypełnionego
   * honeypota, co dawałoby botom sygnał, że pole jest wykrywane.
   * Max 1000 znaków — sanity cap, żeby nie przyjąć kilobajtów spam payloadu.
   */
  company_website: z.string().max(1000).optional(),
  /** Consent na politykę prywatności — wymagany. Brak = walidacja zwraca 400. */
  consent: z
    .union([z.literal("on"), z.literal("true"), z.literal(true)])
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Rate limit — in-memory, per-instance
// ─────────────────────────────────────────────────────────────────────────────

interface QuotaEntry {
  count: number;
  resetAt: number;
}

const ipQuota = new Map<string, QuotaEntry>();
const QUOTA_PER_HOUR = 5;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipQuota.get(ip);
  if (!entry || entry.resetAt < now) {
    ipQuota.set(ip, { count: 1, resetAt: now + QUOTA_WINDOW_MS });
    return true;
  }
  if (entry.count >= QUOTA_PER_HOUR) {
    return false;
  }
  entry.count++;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpery — IP, parse body, success-page renderer
// ─────────────────────────────────────────────────────────────────────────────

function getClientIp(request: Request, fallback: string | undefined): string {
  return (
    fallback ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }
  // form-encoded (urlencoded lub multipart)
  const form = await request.formData();
  const out: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    out[key] = value;
  }
  return out;
}

/**
 * No-JS sukces page — gdy klient wysyła formularz bez fetcha (np. wyłączony JS),
 * endpoint zwraca prosty HTML z potwierdzeniem i linkiem powrotnym.
 * To respect dla osób z assistive tech / starszymi przeglądarkami.
 */
function renderSuccessHtml(locale: "pl" | "en"): string {
  const t =
    locale === "pl"
      ? {
          title: "Brief wysłany — Via Viator",
          headline: "Mamy.",
          body:
            "Odpiszemy najszybciej, jak nasza obietnica pozwala — zwykle w 4 godziny w godzinach pracy.",
          back: "Wróć na stronę główną",
          backHref: "/",
        }
      : {
          title: "Brief sent — Via Viator",
          headline: "Got it.",
          body:
            "We'll reply as fast as our promise allows — usually within 4 hours in business hours.",
          back: "Back to home",
          backHref: "/en/",
        };

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 80px auto; padding: 24px; color: #0a0a0a; }
  h1 { color: #F13223; font-size: 32px; margin: 0 0 16px 0; }
  p { font-size: 18px; line-height: 1.6; color: #525252; margin: 0 0 24px 0; }
  a { color: #F13223; text-decoration: underline; font-weight: 600; }
</style>
</head>
<body>
<h1>${t.headline}</h1>
<p>${t.body}</p>
<p><a href="${t.backHref}">${t.back}</a></p>
</body>
</html>`;
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = getClientIp(request, clientAddress);

    if (!rateLimit(ip)) {
      return jsonResponse({ ok: false, error: "rate_limit" }, 429);
    }

    const raw = await parseBody(request);
    const parsed = ContactSchema.safeParse(raw);

    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          error: "validation",
          issues: parsed.error.flatten(),
        },
        400,
      );
    }

    const data = parsed.data;

    // Honeypot trip — symulujemy sukces, mail nie idzie, IP-limit już zaliczony.
    if (data.company_website && data.company_website.length > 0) {
      return jsonResponse({ ok: true }, 200);
    }

    // Consent wymagany — defense in depth (formularz też ma `required`).
    if (!data.consent) {
      return jsonResponse(
        { ok: false, error: "consent_required" },
        400,
      );
    }

    const emailPayload: ContactEmailData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      segmentSelect: data.segmentSelect || undefined,
      segment: data.segment || undefined,
      message: data.message,
      locale: data.locale,
    };

    await sendContactEmail(emailPayload);

    // No-JS fallback — jeśli request akceptuje HTML i nie był to fetch z JSON,
    // zwracamy success page (UA bez JS dostaje normalną stronę).
    const accept = request.headers.get("accept") ?? "";
    const contentType = request.headers.get("content-type") ?? "";
    if (
      !contentType.includes("application/json") &&
      accept.includes("text/html")
    ) {
      return new Response(renderSuccessHtml(data.locale), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/contact] error", err);
    return jsonResponse({ ok: false, error: "server" }, 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET handler — Method Not Allowed (RFC 7231)
// ─────────────────────────────────────────────────────────────────────────────

export const GET: APIRoute = () =>
  new Response("Method Not Allowed", {
    status: 405,
    headers: { allow: "POST" },
  });
