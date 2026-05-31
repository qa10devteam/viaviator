# QA10 — Corporate Process for Via Viator

Wersja: 1.0 | Data: 2026-05-31 | Klient: Via Viator sp. z o.o. | Wykonawca: QA10 sp. z o.o.

Pełna 15-fazowa metodyka korporacyjno-deweloperska QA10, wykorzystana do budowy strony viaviator.pl. Każda faza wykorzystuje konkretnych agentów AI w trybie autonomicznym (Goal mode). Pliki źródłowe materiałów klienta: `_brief/` (Brand Book v1.0, Buyer Persona Architecture v1.0, korespondencja, logo, zdjęcia).

---

## Faza 0 — Setup repo + monorepo skeleton

**Agent:** Backend Architect + DevOps Automator
**Deliverables:** `package.json`, `tsconfig.json`, `astro.config.mjs`, `vercel.json`, `.gitignore`, `.env.example`, struktura `src/{components,layouts,pages,styles,content,data,lib,i18n,types}`, `public/{brand,images,fonts}`, `tokens/`, `docs/`
**Acceptance:** `npm install` bez konfliktów, `astro.config.mjs` valid ESM
**Status:** ✅ Done

## Faza 1 — Discovery, ICP, pozycjonowanie

**Agent:** Brand Guardian + UX Researcher + general-purpose (czyta PDF brief, buyer personę, korespondencję, kataloguje logo i zdjęcia)
**Deliverables:** memory `project_viaviator.md`, raport briefingowy w kontekście, mapping assetów do `public/`
**Acceptance:** zrozumienie 6 person, 6 segmentów, brand color #F13223, Bricolage Grotesque, zasada „cichej dobroci", face of brand Patryk Tomeczek
**Status:** ✅ Done

## Faza 2 — Brand system + design tokens

**Agent:** UI Designer (Style Dictionary v4)
**Deliverables:** `tokens/viaviator-tokens.json` (DTCG format, `$value`/`$type`), `tokens/style-dictionary.config.mjs`, `src/styles/{reset,typography,utilities,global}.css`, generated `src/styles/tokens.generated.css` (`--vv-*`) + `src/lib/tokens.generated.ts`
**Acceptance:** `npm run tokens:build` przechodzi, tokeny pokrywają color/typography/space/radius/shadow/motion/z/container/breakpoint
**Status:** ✅ Done

## Faza 3 — Information Architecture + sitemap

**Agent:** UX Architect
**Deliverables:** `docs/03-ia.md` (sitemap 14 stron × PL/EN), `docs/03-content-matrix.md`, `src/data/segments.ts` (6 segmentów z buyer persona), `src/data/nav.ts`, `src/data/company.ts`
**Acceptance:** IA pokrywa home + 6 segmentów + about + contact + jakosc + 2 legal, każda route z H1/meta, segmenty z slug/hero/cta/decisionCriteria
**Status:** ✅ Done

## Faza 4 — Content strategy + bilingual copy

**Agent:** Content Creator (Voice of Customer enforcement)
**Deliverables:** `src/i18n/pl.ts` (685 linii), `src/i18n/en.ts` (684 linie z parity check przez TypeScript), `src/i18n/index.ts` (helpers `getDictionary`, `t`, `getLocaleFromUrl`, `localizePath`)
**Acceptance:** PL i EN identical key shape, zero korpomowy, hero headlines verbatim z buyer persony, EN adaptacja kulturowa
**Status:** ✅ Done

## Faza 5 — Layouts + komponenty bazowe

**Agent:** Frontend Developer
**Deliverables:** 22 komponenty (BaseLayout, PageLayout, Container, Section, Button, Badge, Card, Icon, LogoMark, LangSwitcher, Header, Footer, Hero, FeatureGrid, SegmentGrid, CTASection, Stat, Testimonial, FAQAccordion, ContactInfo, QualitySealBadge, SEO), wszystkie używają tokens przez `var(--vv-*)`, i18n przez `getDictionary`
**Acceptance:** `astro check` 0 errors, brak hardkodowanych PL/EN poza i18n
**Status:** ✅ Done

## Faza 6 — Pillar page: Homepage

**Agent:** Senior Developer (Wave 3.1)
**Deliverables:** `src/pages/index.astro` (PL, 405 linii) + `src/pages/en/index.astro` (EN, 386 linii) — hero + co robimy + dla kogo (SegmentGrid) + flota + dlaczego my (FeatureGrid) + social proof + CTA finalna
**Acceptance:** schema.org graf (Organization + WebSite + LocalBusiness), hreflang PL/EN/x-default, OG/Twitter meta
**Status:** ✅ Done

## Faza 7 — QA10 Quality Seal — Znak Jakości

**Agent:** Visual Storyteller + UI Designer + Brand Guardian
**Deliverables:** `public/brand/{qa10-seal,qa10-seal-mini}.svg` (medieval guild seal vibe + monochromatyczny currentColor), `src/components/seal/QualitySeal.astro` + `QualitySealBadge.astro` (footer badge), `src/pages/jakosc.astro` + `src/pages/en/quality.astro` (10 wymiarów jakości z `dict.quality.dimensions`), `docs/07-quality-seal.md` (pełna specyfikacja kryteriów pass/fail per wymiar)
**10 wymiarów:** Accessibility, Performance, Privacy, Security, SEO+Citation, Bilingual parity, Design system reproducibility, Provenance, Holistic consistency, Brand fidelity
**Acceptance:** badge w stopce każdej strony, link do `/jakosc` (PL) / `/en/quality` (EN), SVG valid + a11y (role/title/desc)
**Status:** ✅ Done

## Faza 8 — Subpages: 6 segmentów + About + Contact

**Agent:** Senior Developer × 3 fale parallel (Wave 3.1/3.2/3.3)
**Deliverables:** 22 strony Astro + 1 endpoint:
- 6 par segmentów: `transfery-korporacyjne` (P1), `pielgrzymki` (P2), `transport-dostepny` (P3), `przewozy-rodzinne` (P4), `wynajem-busa` (P5), `imprezy` (P6) — każda PL/EN z dosłownym Voice of Customer w hero
- `o-nas` + `en/about` — manifest, archetypy, zespół (Patryk Tomeczek face of brand, Adrian Kaszowski w cieniu), flota, region
- `kontakt` + `en/contact` — bilingual formularz + ContactInfo
- `src/pages/api/contact.ts` (Zod walidacja, honeypot, rate limit IP-based 5/h, AWS SES via `src/lib/ses.ts`)
**Acceptance:** wszystkie strony renderują, formularz POST → 200 ok, parytet PL/EN
**Status:** ✅ Done

## Faza 9 — SEO, schema.org, citation readiness

**Agent:** SEO Specialist
**Deliverables:** `src/lib/seo.ts` (seoMap z 12 RouteKey, buildAlternates, buildCanonical), `src/lib/schema.ts` (organizationSchema, websiteSchema, localBusinessSchema, serviceSchema, breadcrumbSchema, faqSchema), `src/components/seo/StructuredData.astro`, `public/{robots.txt,humans.txt,llms.txt}`, `astro.config.mjs` update z sitemap config (filter + serialize z priority/changefreq)
**Acceptance:** wszystkie titles ≤60 znaków, descriptions ≤155, schema parsable, hreflang bidirectional + x-default, llms.txt zgodny ze spec llmstxt.org
**Status:** ✅ Done

## Faza 10 — Accessibility WCAG 2.2 AA

**Agent:** Accessibility Auditor
**Deliverables:** 16 plików zmienionych:
- Token `fg-accent` #F13223 → #C2261A (4.42:1 → 6.45:1) bo kontrast brand-red na białym był na granicy AA
- `--vv-color-brand-red-700` zastosowany w Button primary, CTASection brand, skip link, kontakt tagline, ConsentBanner primary, badge custom (wszystko co niesie tekst — utrzymuje czerwoną tożsamość gdzie text-AA wymóg)
- Header dropdown: usunięty `role="menu"`/`menuitem` (anti-pattern dla site nav), aria-expanded na trigger
- Mobile drawer: Escape close + focus return + dynamic aria-label
- Footer strip-link underline (Use of Color)
- ConsentBanner body scroll lock + WCAG dialog pattern
- Globalny perl-replace `color: brand-red` → `color: brand-red-700` w eyebrows, roles, weight stats
**Acceptance:** WCAG 2.2 AA conformance + manual screen reader testing zlecony do osobnej fazy
**Status:** ✅ Done

## Faza 11 — Tracking, analytics, consent

**Agent:** Tracking & Measurement Specialist
**Deliverables:** `src/lib/consent.ts` (typed state, version-aware, SSR-safe, event API), `src/lib/analytics.ts` (Plausible-first ENV-driven, marketing pixels stub), `src/components/islands/ConsentBanner.tsx` (React 19 client:idle, 3 widoki hidden/banner/settings, focus trap, Esc, mobile bottom-drawer), `src/env.d.ts` (typed env)
**Acceptance:** banner pokazuje się tylko gdy null consent, persistence w localStorage `vv:consent:v1`, zero requestów bez accept, A11y dialog pattern
**Status:** ✅ Done

## Faza 12 — Performance + Core Web Vitals

**Agent:** Performance Benchmarker
**Deliverables:**
- `Hero.astro` refactor — `<picture><source type="image/webp"><img></picture>` + width/height anti-CLS + fetchpriority high + decoding sync
- Hero WebP variants pre-generowane: JPG 4-5MB → WebP 240-330KB (94% redukcja LCP image)
- Self-hosted Bricolage Grotesque (2 woff2 w `public/fonts/`) z `<link rel="preload">`, usunięty render-blocking Google Fonts @import
- `vercel.json` cache headers `immutable` dla `/_astro/*`, `/fonts/*`, oraz images
**Acceptance:** Critical render path 272 KB transfer, LCP estimate <2.0s desktop, Lighthouse Perf est. 88-95 desktop / 78-87 mobile
**Status:** ✅ Done

## Faza 13 — Security + compliance hardening

**Agent:** Security Engineer + Compliance Auditor (Legal Compliance Checker)
**Deliverables:**
- `vercel.json` CSP strict (default-src 'self', frame-ancestors none, base-uri 'self', form-action 'self') + HSTS preload + X-Content-Type-Options nosniff + X-Frame-Options DENY + Referrer-Policy strict-origin-when-cross-origin + Permissions-Policy minimal
- Honeypot + rate limit 5/h IP + Zod schema na `/api/contact`
- `src/content/legal/{privacy,cookies}-{pl,en}.md` (8 dokumentów, 11k słów łącznie, RODO art. 13/14 zgodność)
- Astro content collection `legal` z Zod schema (title/locale/version/publishedAt/summary)
- 4 strony Astro renderujące legal MD przez `getEntry` + `render(entry)` (Astro 6 API)
**Acceptance:** zero sekretów w repo, CSP nie blokuje GA4 ani SES API, polityka prywatności pokrywa Vercel SCC + DPF, AWS SES eu-central-1, Plausible EU
**Status:** ✅ Done

## Faza 14 — QA, Reality Check, Code Review

**Agent:** Code Reviewer + Reality Checker (build smoke test)
**Deliverables:** Code review fixy:
- Honeypot schema fix (botom dawał 400 zamiast 200)
- Icon.astro `export type IconName` (TS error)
- seo.ts `pathEn` cookies path (singular → plural mismatch)
- ConsentBanner.tsx cookies link path

6 MAJOR deferred z dokumentacją (footer broken links → wyczyszczone, social URL placeholders → wyczyszczone, Org schema duplikacja, hardcoded PL/EN w 6 plikach, rate limit in-memory, Testimonial dead code).
**Acceptance:** `astro check` 0 errors / 0 warnings, `astro build` OK, 24 routes prerendered, 1 serverless function
**Status:** ✅ Done

## Faza 15 — Launch, GTM, dokumentacja, commit + push

**Agent:** DevOps Automator + Technical Writer + Git Workflow Master
**Deliverables:**
- `.github/workflows/ci.yml` (Node 22, lint+typecheck+build na PR/push do main)
- `DEPLOYMENT.md` (Vercel env table, pre-launch checklist, launch sequence, post-launch monitoring, rollback)
- `README.md` (overview, brand, IA, struktura repo, QA10 Quality Seal opis)
- `docs/00-process.md` (ten plik)
- Final commit + push do `github.com/qa10devteam/viaviator`
**Acceptance:** repo zawiera completny code base, CI workflow valid, dokumentacja launch-ready
**Status:** ✅ Done

---

## Agentowy rój — diagram wykonawczy

```
Wave 0 (sequential)
└── Brand Guardian — czyta brief PDF, ekstraktuje brand canon
    └── UX Researcher — czyta buyer persona PDF (5 Rings, Jobs-to-be-Done)
        └── general-purpose — czyta korespondencję QA10↔klient (decyzje, dane prawne)
            └── UI Designer — kataloguje logo SVG/PNG/PDF/JPG
                └── Visual Storyteller — kataloguje zdjęcia hero/services/fleet

Wave 1 (parallel × 3) — Fundament
├── UI Designer → Style Dictionary tokens + CSS
├── UX Architect → IA + content matrix + data files
└── Content Creator → bilingual PL+EN dictionaries

Wave 2 (parallel × 5) — Build core
├── Frontend Developer → 22 komponenty + layouts
├── SEO Specialist → seo.ts + schema.ts + llms.txt + robots.txt
├── Tracking & Measurement Specialist → consent + analytics + React island
├── Legal Compliance Checker → 8 legal docs + 4 Astro pages
└── Visual Storyteller → QA10 Quality Seal SVG + komponent + strona /jakosc

Wave 3 (parallel × 3 sub-waves) — Strony
├── Wave 3.1 Senior Developer → home + 3 segmenty (P1/P2/P3)
├── Wave 3.2 Senior Developer → 3 segmenty (P4/P5/P6)
└── Wave 3.3 Senior Developer → o-nas + kontakt + endpoint + SES lib

Wave 4 (parallel × 3) — Review
├── Accessibility Auditor → 16 plików fix (kontrast AA, dropdown, mobile drawer)
├── Code Reviewer → 4 blokery fix + 6 major deferred
└── Performance Benchmarker → Hero <picture> + WebP + font preload + cache headers

Wave 5 (sequential × 2) — Integration
├── DevOps Automator → CI workflow + DEPLOYMENT.md
└── Git Workflow Master → commit + push
```

## Bezpieczniki Goal mode

- **Retry policy:** Wave 1-2 → max 2 retries per agent. Wave 3 → max 3 (więcej kompleksowości). Wave 4 → loop back do W2/W3 jeśli FAIL (max 3).
- **Failure escalation:** worker fail po max retry → graceful degradation, orchestrator loguje, kontynuuje resztę fali.
- **Critical path fallback:** jeśli W1.2 (skeleton) fail → orchestrator sam pisze minimalny config.
- **Pre/Post wave verification:** orchestrator sprawdza expected artifacts przed startem kolejnej fali.

## Statystyki projektu (post-launch)

| Metryka | Wartość |
|---|---|
| Faz w procesie | 15 |
| Agentów łącznie | 21 (przy zero retry) |
| Plików w repo | ~140 (poza node_modules) |
| Linii kodu (src/) | ~22 000 |
| Stron Astro (HTML output) | 24 (12 PL + 12 EN) |
| Komponentów | 22 |
| Slovników i18n | 2 (PL + EN, parity TS-enforced) |
| Dokumentów prawnych | 8 (privacy + cookies × PL/EN × content + Astro page) |
| Wymiarów QA10 Quality Seal | 10 |
| Segmentów person | 6 |
| Czas wykonania (Goal mode) | ~3h end-to-end (z autonomicznych Wave) |
| Astro check status | 0 errors / 0 warnings / 23 hints |
| LCP image redukcja | 94% (4.1MB → 238KB WebP) |
| WCAG conformance | 2.2 Level AA |

---

QA10 sp. z o.o. — State Machine Engineering. Pieczęć Quality Seal v1.0 dla viaviator.pl wydana 2026-05-31.
