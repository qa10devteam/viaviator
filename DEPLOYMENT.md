# Deployment — Via Viator

Wykonawca: **QA10 sp. z o.o.** | Klient: **Via Viator sp. z o.o.** | Wersja: 1.0 | Data: 2026-05-31

---

## Architektura

- **Hosting:** Vercel (Frankfurt edge), adapter `@astrojs/vercel`
- **Build target:** Astro 6 `output: "static"` + jedna serverless function dla `/api/contact`
- **Domena docelowa:** `viaviator.pl` (DNS migracja na końcu launchu — wcześniej domyślny URL Vercel `*.vercel.app`)
- **Repozytorium:** `github.com/qa10devteam/viaviator`
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) → build + typecheck przy każdym PR i pushu do `main`. Auto-deploy Vercel z `main`.

## Zmienne środowiskowe (Vercel → Project Settings → Environment Variables)

Per Adrianna doctrine: **sekrety podpinamy na końcu launchu**. Poniższa lista to docelowe ENV. W repo trzymamy tylko `.env.example`.

| Klucz | Typ | Cel | Status |
|---|---|---|---|
| `PUBLIC_SITE_URL` | Public | `https://viaviator.pl` (lub `*.vercel.app` przed DNS) | ustawia QA10 |
| `PUBLIC_DEFAULT_LOCALE` | Public | `pl` | constant |
| `AWS_REGION` | Server | `eu-central-1` | constant |
| `AWS_ACCESS_KEY_ID` | Server | IAM dedykowany dla SES `ses:SendEmail` | **secret** — Adrianna podpina |
| `AWS_SECRET_ACCESS_KEY` | Server | klucz powyższego IAM | **secret** — Adrianna podpina |
| `SES_FROM_EMAIL` | Server | `kontakt@viaviator.pl` | po weryfikacji domeny w SES |
| `SES_TO_EMAIL` | Server | `kontakt@viaviator.pl` | dst. inbox |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Public | `viaviator.pl` | po decyzji o analytics (opt-in) |
| `PUBLIC_PLAUSIBLE_HOST` | Public | `https://plausible.io` | default |

Brak żadnego z powyższych ≠ awaria — kod jest defensywny:
- bez SES creds: `/api/contact` zwraca 200 ale loguje payload (dev/staging mode)
- bez `PUBLIC_PLAUSIBLE_DOMAIN`: analytics no-op (consent banner i tak nie ładuje skryptu)

## Procedura uruchomienia produkcji (checklist)

### Pre-launch
- [ ] Klient dostarcza KRS, adres siedziby Via Viator sp. z o.o. → uzupełnić w `src/data/company.ts` i `src/content/legal/privacy-{pl,en}.md`
- [ ] Klient dostarcza Facebook Page URL + Messenger handle → uzupełnić w `src/data/nav.ts` (`social: []` → array)
- [ ] Klient potwierdza polish cennik wynajmu Mastera → zaktualizować `wynajem-busa.astro` (TODO oznaczone w pliku)
- [ ] Weryfikacja domeny `viaviator.pl` w AWS SES (DKIM, SPF, DMARC records w DNS)
- [ ] Utworzenie IAM user w AWS z minimalnym scope: `ses:SendEmail` + `ses:SendRawEmail` na ARN tożsamości SES
- [ ] Wygenerowanie OG image 1200×630 z `og-source-lichen.jpg` (placeholder w `public/images/og/`)

### Launch
1. **Vercel:** Import projektu z GitHub `qa10devteam/viaviator`, branch `main`. Framework preset `Astro` (auto-detected).
2. **Vercel env:** wprowadzić wszystkie ENV z tabeli powyżej (Production scope minimum).
3. **Pierwsze prod deploy:** Vercel auto-deploy po podłączeniu repo. URL tymczasowy: `viaviator-*.vercel.app`.
4. **Smoke test prod URL:**
   - `/` — homepage PL renderuje, hero ładuje WebP
   - `/en/` — homepage EN renderuje
   - `/transfery-korporacyjne` — segment renderuje
   - `/kontakt` — formularz submit do `/api/contact` → 200 ok, mail w `kontakt@viaviator.pl` ⩽ 30s
   - `/polityka-prywatnosci` — content collection renderuje
   - `/jakosc` — QA10 Quality Seal page renderuje, badge w stopce wszędzie
   - sitemap-index.xml ładuje się
   - robots.txt ładuje się
   - llms.txt ładuje się
5. **DNS:** Cloudflare → A record `viaviator.pl` → Vercel anycast, CNAME `www.viaviator.pl` → `cname.vercel-dns.com`. TTL 300 na czas migracji.
6. **Vercel domena:** dodanie `viaviator.pl` + `www.viaviator.pl` jako custom domain. Vercel auto-issuuje SSL Let's Encrypt.
7. **Aktualizacja `PUBLIC_SITE_URL`** na `https://viaviator.pl` w Vercel env → wymusza rebuild → sitemap i canonical odzwierciedlają nową domenę.
8. **Post-DNS smoke test** z prod domeny.

### Post-launch
- [ ] PageSpeed Insights audit (target: Performance ≥85 mobile, ≥90 desktop)
- [ ] Schema validator (Google Rich Results Test) — sprawdzić wszystkie typy: Organization, LocalBusiness, Service, Breadcrumb, FAQ
- [ ] axe DevTools / Lighthouse a11y — sanity check (audytor już zrobił statyczny)
- [ ] Test formularza kontakt z prawdziwego IP (rate limit 5/h per IP)
- [ ] Test consent banner: reject → brak Plausible request; accept-all → Plausible ładuje (jeśli env)
- [ ] Submit `viaviator.pl` do Google Search Console + Bing Webmaster Tools + IndexNow
- [ ] Dodać do Plausible (opcjonalnie GA4) — verify domain

## Rollback

Vercel: każdy deploy ma immutable URL i może być promowany jako produkcyjny w 1 klik. Rollback do poprzedniego deploya = 1 klik. Brak innych systemów do rollback.

W razie problemów z SES — `/api/contact` zostanie z 200 OK ale brakuje maila. Monitoring: CloudWatch alarm na `SES SendingFailure` lub po prostu klient zgłosi brak maili.

## Monitoring (zalecane, post-launch)

- **Vercel Analytics** (built-in Web Vitals) — automatyczne, free tier wystarczy
- **AWS CloudWatch** dla SES (bounce/complaint rate, send volume)
- **Plausible Analytics** (opcjonalnie, opt-in cookie consent) — events: `quote_request`, `phone_click`, `email_click`, `segment_view`
- **Uptime monitor** (np. UptimeRobot free, ping `/` co 5 min)

## Kontakt techniczny

QA10 (wykonawca): `ceo@qa10.io`, +48 880 839 850
Pieczęć Quality Seal v1.0: opis kryteriów → `https://viaviator.pl/jakosc`
