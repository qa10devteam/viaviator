# Via Viator

> **Zawsze na miejscu.** | _Będziesz na czas._
>
> Przewóz osób w południowej Polsce — transfery, pielgrzymki, transport grupowy, wynajem busa, eventy.
>
> Strona zaprojektowana i wdrożona przez [QA10](https://qa10.io) — pieczęć **QA10 Quality Seal v1.0**.

---

## Kontekst projektu

- **Klient:** Via Viator sp. z o.o. (NIP 6452595911)
- **Wykonawca:** QA10 sp. z o.o. (`qa10.io`, NIP 9542906279)
- **Domena docelowa:** `viaviator.pl`
- **Repo:** `github.com/qa10devteam/viaviator`
- **Stack:** Astro 6 + React 19 + Style Dictionary + AWS SES + Vercel
- **Języki:** polski (default, bez prefiksu) + angielski (`/en/`)
- **Brand:** Bricolage Grotesque, paleta `#F13223` / `#000` / `#FFF`, archetypy Mędrzec 60% + Opiekun 30% + Odkrywca 10%
- **Materiały źródłowe:** `_brief/` (Brand Book v1.0, Buyer Persona Architecture v1.0, korespondencja, logo, zdjęcia)

## Szybki start

```bash
nvm use 22
npm install
cp .env.example .env        # sekrety podpinamy na końcu launchu
npm run dev                 # http://localhost:4321
npm run build               # tokens → astro check → astro build
```

## Architektura informacji

Strona główna + **6 landingów segmentowych** (per Buyer Persona Architecture v1.0 + decyzja klienta 19.05.2026):

| Segment | Persona | URL PL | URL EN |
|---|---|---|---|
| Transfer korporacyjny / lotnisko | P1 Korpo Koordynator | `/transfery-korporacyjne` | `/en/corporate-transfers` |
| Pielgrzymki i wyjazdy grupowe | P2 Organizator | `/pielgrzymki` | `/en/pilgrimages` |
| Transport osób z niepełnosprawnościami | P3 DPS/Fundacje | `/transport-dostepny` | `/en/accessible-transport` |
| Transport rodzinny / okazjonalny | P4 B2C | `/przewozy-rodzinne` | `/en/family-transport` |
| Wynajem busa Master bez kierowcy | P5 Wynajem | `/wynajem-busa` | `/en/van-rental` |
| Imprezy okolicznościowe | P6 Eventy | `/imprezy` | `/en/events` |

Plus: `/`, `/o-nas`, `/kontakt`, `/jakosc`, `/polityka-prywatnosci`, `/polityka-cookies` (+ EN).

## Operacyjny zasięg

Cztery województwa: **śląskie, opolskie, małopolskie, świętokrzyskie**. Huby lotniskowe: Pyrzowice (Katowice), Kraków-Balice, Wrocław.

## Brand

- **Tagline główny (hero):** „Zawsze na miejscu"
- **Tagline operacyjny (oferty, podpisy, CTA):** „Będziesz na czas"
- **Typografia:** Bricolage Grotesque (Google Fonts) — zatwierdzona przez klienta
- **Kolory tokens:**
  - `--vv-red: #F13223`
  - `--vv-black: #000000`
  - `--vv-white: #FFFFFF`
- **Logo primary (web header desktop):** `public/brand/logo-primary.svg` (viator.logo4 bez tła, cleaned)
- **Logo mono (footer/favicon/mobile):** `public/brand/logo-mono.svg` (viator.logo5 — sam mark V)
- **Logo pionowe (OG image, hero):** `public/brand/logo-vertical.svg`
- **Face of brand:** Patryk Tomeczek (wspólnik operacyjny). Ks. Adrian Kaszowski pozostaje w cieniu — zasada „cichej dobroci".

## QA10 Quality Seal

Wykonawca poświadcza jakość wdrożenia w 10 wymiarach (stąd **QA10**):

1. Accessibility — WCAG 2.2 AA
2. Performance — Core Web Vitals (LCP < 2.0s, INP < 200ms, CLS < 0.05)
3. Privacy — RODO + consent-first analytics
4. Security — strict CSP + secret hygiene + HSTS
5. SEO — schema.org + hreflang + llms.txt
6. Bilingual parity — PL ↔ EN
7. Tokens & design system reproducibility
8. Provenance — pełna ścieżka decyzji w `_brief/` + commit history
9. Holistic consistency — zmiany propagowane przez cały system
10. Brand fidelity — zgodność z Brand Book v1.0 klienta

Pełen opis kryteriów: [`/jakosc`](https://viaviator.pl/jakosc) (PL) / [`/en/quality`](https://viaviator.pl/en/quality) (EN).
Footer każdej strony renderuje badge **QA10 Verified** linkujący do `/jakosc`.

## Struktura repo

```
viaviator/
├── _brief/                      # materiały od klienta (NIE w produkcji, nie commitowane jako .gitignore opcjonalnie)
│   ├── BRAND-BOOK.pdf
│   ├── BUYER-PERSONA.pdf
│   ├── emails/
│   ├── logo-source/             # 5 wariantów logotypu (PNG/SVG/PDF/JPG)
│   └── images-source/           # master + traffic zdjęcia + DNG raws
├── docs/                        # proces 15-fazowy + per-faza deliverables
├── tokens/                      # Style Dictionary źródła
├── public/
│   ├── brand/                   # gotowe logo SVG do web
│   ├── fonts/                   # Bricolage Grotesque (opt.)
│   └── images/                  # hero / services / fleet / brand / og / archive
├── src/
│   ├── components/{ui,sections,seal,islands}
│   ├── content/{features,cases,legal}/
│   ├── data/                    # personas, segments, fleet, faq
│   ├── i18n/{pl.ts,en.ts,index.ts}
│   ├── layouts/
│   ├── lib/                     # ses, seo, schema, consent, analytics
│   ├── pages/                   # PL routes + /en/* mirror
│   └── styles/                  # tokens + reset + global + utilities
├── astro.config.mjs
├── vercel.json
├── tsconfig.json
└── package.json
```

## Deployment

Vercel project: `viaviator` (do utworzenia). Branch produkcyjny: `main`. Sekrety w Vercel env (NIE w repo). DNS migracja domeny `viaviator.pl` zaplanowana na finalną fazę launchu.

## Status (2026-06-01)

Build status: **READY TO SHIP** — 24 routes prerendered, 0 errors, 0 warnings, 515/515 i18n parity.
Masterpiece plan M01–M12 (`docs/12-phase-masterpiece-plan.md`) — done.

### Wow effects (M04–M11)

| # | Komponent | Faza | Strony |
|---|---|---|---|
| 1 | **Atlas Południa** — interaktywna mapa SVG 4 województw + 3 huby | M04 | `/`, `/o-nas` (+EN) |
| 2 | **Magnetic Segments** — 3D tilt + accent flood (pointer:fine only) | M05 | `/` (+EN) |
| 3 | **Szlak Sanktuariów** — animowana trajektoria SVG draw-on | M06 | `/pielgrzymki` (+EN) |
| 4 | **Floating Telefon** — anchor positioning + IntersectionObserver | M07 | wszystkie strony |
| 5 | **Manuskrypt Patryka** — signature draw-on + QA10 seal | M11 | `/o-nas` (+EN) |
| 6 | **Karty Floty** — 3D tilt subtle + parallax | M09 | `/`, `/wynajem-busa`, `/transfery-korporacyjne` |

Plus system-wide: View Transitions API (M02), Scroll Choreography (M03 — `vv-reveal`), Editorial Typography (M08), Microinteractions polish (M10), Final polish + a11y + perf budget (M12).

Wszystkie wow effects mają `prefers-reduced-motion` guard. Komponenty React (ConsentBanner) — opt-in client hydration. Aria coverage: H1 = 1 na każdej z 12 stron PL + 11 EN, skip link wszędzie, focus management w dropdownach + drawer.

## Licencja

Proprietary — © Via Viator sp. z o.o. + QA10 sp. z o.o. 2026.
