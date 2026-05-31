# QA10 Quality Seal v1.0 — pełna specyfikacja

> Pieczęć jakości QA10 osadzana w stopce stron klientów. Wersja **1.0**,
> wydana **2026-05-31**, wykonawca: **QA10 sp. z o.o.** (qa10.io).

## Po co istnieje pieczęć

QA10 Quality Seal to **publicznie weryfikowalny podpis** pod stroną klienta.
Nie jest grafiką — jest deklaracją, że strona spełnia mierzalne kryteria
na 10 wymiarach. Każdy wymiar ma:

- **Definicję** — jednoznaczny opis co poświadcza.
- **Kryterium pomiaru** — liczbowy próg pass/fail lub binarny test.
- **Tooling** — narzędzie używane do weryfikacji.
- **Częstotliwość audytu** — kiedy wymiar jest mierzony.

Pieczęć jest **wycofywana** (rewoke) jeśli którykolwiek z wymiarów zacznie
fall'ować — patrz sekcja „Procedura wycofania" na końcu dokumentu.

## Logika wizualna pieczęci

- **Kompozycja:** koło zewnętrzne z tekstem `QA10 QUALITY SEAL · VERIFIED · v1.0`
  obiegającym (text on path), 10 mikrosegmentów co 36° na obwodzie reprezentuje
  10 wymiarów.
- **Środek:** stylizowane „QA" nad „10", podzielone cienką linią. Pod spodem
  podpis `SEAL v1.0`.
- **Kolor:** wszystkie kreski i tekst używają `currentColor` — pieczęć
  dziedziczy kolor brandu klienta (Via Viator: red `#f13223`).
- **Format:** SVG, `viewBox="0 0 240 240"` (full), `viewBox="0 0 40 40"` (mini).

## 10 wymiarów — szczegóły

### 01 · Dostępność (Accessibility)

- **Definicja:** Strona spełnia wymagania WCAG 2.2 na poziomie AA.
- **Kryterium pomiaru:**
  - 0 błędów `axe-core` w kategoriach `wcag22aa` na każdej stronie szablonu.
  - Manualny test z czytnikiem ekranu (NVDA lub VoiceOver) — każda strona
    nawigowalna w pełni klawiaturą, fokus widoczny, landmarki obecne.
  - Kontrast tekstu vs tło ≥ 4.5:1 (normal) / 3:1 (large).
- **Tooling:** `axe-core` (CLI + Pa11y), `Lighthouse a11y`, manualny test
  NVDA + VoiceOver.
- **Częstotliwość:** każda zmiana strukturalna + tygodniowy regression run.

### 02 · Wydajność (Performance)

- **Definicja:** Strona dostarcza Core Web Vitals w „dobrym" zakresie na
  realnym ruchu (CrUX p75).
- **Kryterium pomiaru:**
  - **LCP** (Largest Contentful Paint) < **2.0 s** (cel; 2.5 s = pass min).
  - **INP** (Interaction to Next Paint) < **200 ms**.
  - **CLS** (Cumulative Layout Shift) < **0.05** (cel; 0.1 = pass min).
- **Tooling:** PageSpeed Insights (CrUX), Lighthouse, Vercel Web Vitals (jeśli
  enabled), real-user RUM przez Plausible/własną sondę.
- **Częstotliwość:** każdy deploy + 7-dniowy CrUX rolling.

### 03 · Prywatność (Privacy)

- **Definicja:** Strona jest zgodna z RODO/GDPR i działa w trybie
  **consent-first** — żadne tracker'y nie ładują się przed wyrażeniem zgody.
- **Kryterium pomiaru:**
  - Network audit potwierdza: przed kliknięciem „akceptuję" w bannerze
    cookies, requesty są tylko do `same-origin` + niezbędnych third-party
    (np. fonts.googleapis.com, jeśli używane).
  - Polityka prywatności dostępna z każdej strony, link w stopce.
  - Implementacja Consent Mode v2 (Google) lub równoważnik.
  - Brak fingerprintingu, brak server-side tracking pre-consent.
- **Tooling:** DevTools Network tab, `consent-o-matic`, manualny audit.
- **Częstotliwość:** każdy deploy + audit przy każdej zmianie zewnętrznego
  skryptu.

### 04 · Bezpieczeństwo (Security)

- **Definicja:** Strona ma utwardzone nagłówki bezpieczeństwa, brak danych
  klienta w kodzie, sekrety poza repo.
- **Kryterium pomiaru:**
  - **Strict CSP** — `default-src 'self'`, lista dozwolonych źródeł
    eksplicytna, brak `'unsafe-inline'` w produkcji (poza nonce'd).
  - **HSTS** — `max-age=31536000; includeSubDomains; preload`.
  - **Pozostałe nagłówki:** `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`,
    `Permissions-Policy` ograniczająca niepotrzebne API.
  - **Higiena sekretów:** `gitleaks` zero findings w historii, `.env.example`
    w repo, prawdziwe sekrety tylko w Vercel/CI.
  - **Brak danych klienta** w kodzie (rzeczywiste e-maile, telefony klientów,
    dane osobowe — tylko w runtime z env lub formularzy).
- **Tooling:** `securityheaders.com`, `mozilla observatory`, `gitleaks`,
  `trufflehog`, ręczna inspekcja CSP.
- **Częstotliwość:** każdy deploy + miesięczny full security scan.

### 05 · SEO + Citation Readiness

- **Definicja:** Strona jest czytelna dla wyszukiwarek **i** modeli AI
  (ChatGPT, Claude, Gemini) — schema.org, hreflang, llms.txt.
- **Kryterium pomiaru:**
  - **Schema.org JSON-LD** na każdej stronie: `Organization`, `LocalBusiness`
    (jeśli applicable), `WebPage` z `breadcrumb`.
  - **hreflang** kompletny: każda strona w PL ma swój odpowiednik w EN
    z `x-default` jako PL (lub primary market).
  - **Sitemap.xml** generowany automatycznie, podzielony per-locale.
  - **llms.txt** w root — krótki, AI-readable opis serwisu z linkami do
    kluczowych zasobów.
  - **Canonical URL** ustawiony explicite (absolute).
  - **OG + Twitter meta** kompletne dla każdej strony.
- **Tooling:** Google Search Console, schema.org validator, hreflang checker
  (Merkle), manualny audit llms.txt.
- **Częstotliwość:** każdy deploy zmieniający content + tygodniowy GSC audit.

### 06 · Parytet językowy (Bilingual Parity)

- **Definicja:** Wersje PL i EN są renderowane z **jednego źródła** (słownik
  i18n), nie ma rozjazdu treści lub linków.
- **Kryterium pomiaru:**
  - Każdy klucz w dict `pl` ma odpowiednik w dict `en` (typowane przez
    TypeScript `Dictionary`).
  - Pages PL i EN mają tą samą strukturę H1-H6.
  - Linki w stopce/headerze prowadzą do pary `pl ↔ en` (LangSwitcher).
  - Brak hard-codowanych stringów w pages — wszystko przez `getDictionary(locale)`.
- **Tooling:** TypeScript compiler (statyczne sprawdzanie typów dict),
  custom script `scripts/check-i18n-parity.ts` (key-diff + struct-diff).
- **Częstotliwość:** każdy commit (CI gate).

### 07 · Reprodukowalność design systemu

- **Definicja:** Zmiana koloru/typu/spacing w jednym miejscu (tokens)
  propaguje się do wszystkich miejsc użycia.
- **Kryterium pomiaru:**
  - **Style Dictionary** generuje `tokens.generated.css` z
    `tokens/viaviator-tokens.json`.
  - **0 hard-codowanych wartości** kolorów/typografii/spacingu w `.astro`
    i `.css` (egzemplifikacja: `#f13223` w stylu = fail, użyć
    `var(--vv-color-brand-red)`).
  - Każdy komponent UI używa wyłącznie zmiennych CSS z tokens.
- **Tooling:** `stylelint` z regułą `declaration-property-value-disallowed-list`,
  `grep -E '#[0-9a-fA-F]{3,8}' src/` musi być pusty (poza tokens source).
- **Częstotliwość:** każdy commit (lint gate).

### 08 · Provenance — pełna ścieżka decyzji

- **Definicja:** Każda kluczowa decyzja produktowa/designowa ma ślad w repo:
  brief, brand book, korespondencja, commit history.
- **Kryterium pomiaru:**
  - Folder `_brief/` z briefingami wave'ów.
  - Folder `docs/` z dokumentacją decyzji (IA, content matrix, tokens, seal).
  - Folder `decisions/` lub `_brief/decisions/` z ADR (Architecture
    Decision Records).
  - Commit history zawiera referencje do briefu/decyzji w body commitu.
  - Brand book i wave handoffs zapisane jako pliki, nie w head'ie agencji.
- **Tooling:** ręczny audit struktury repo, `git log --grep` na referencje
  do decyzji.
- **Częstotliwość:** miesięczny review.

### 09 · Holistyczność zmian

- **Definicja:** Każda atomowa edycja (np. zmiana liczby w copy) jest
  sprawdzona **downstream**: czy nie powstaje rozjazd między PL/EN, między
  pages a danymi (np. listą segmentów), między copy a JSON-LD.
- **Kryterium pomiaru:**
  - PR template wymaga checklist: „sprawdziłem downstream impacts".
  - Custom script `scripts/check-consistency.ts` weryfikuje:
    - liczby telefonów w copy === w `data/company.ts` === w schema.org.
    - liczba segmentów w nav === w `data/segments.ts` === w content.
    - tytuły stron === H1 (lub uzasadniona rozbieżność).
  - Brak „punktowych" zmian akceptowanych w PR — review wymaga downstream check.
- **Tooling:** CI check + manualny review.
- **Częstotliwość:** każdy PR.

### 10 · Wierność marki (Brand Fidelity)

- **Definicja:** Strona w 100% zgodna z **Brand Book v1.0** zatwierdzonym
  przez klienta.
- **Kryterium pomiaru:**
  - Kolory: tylko z palety z Brand Book.
  - Typografia: tylko zatwierdzone fonty (Bricolage Grotesque dla Via Viator).
  - Logo: tylko z `public/brand/`, w wariantach z Brand Book.
  - Tone of voice: zgodny z guideline'ami (Via Viator: konkret, bez korporatyzmu,
    plain Polish/English).
- **Tooling:** Brand Book v1.0 jako PDF + JSON w repo, manualny audit,
  ESLint custom rule (jeśli applicable).
- **Częstotliwość:** każda zmiana wizualna + miesięczny audit.

## Procedura wycofania pieczęci

Pieczęć jest **wycofywana** (revoke) jeśli:

1. Którykolwiek z 10 wymiarów spadnie poniżej progu pass.
2. Klient zmieni stronę bez audytu QA10 i zmiana naruszy któreś kryterium.
3. Brand book zostanie podmieniony bez aktualizacji pieczęci.

Procedura:

1. QA10 powiadamia klienta pisemnie (e-mail) o wycofaniu pieczęci.
2. Pieczęć w stopce jest oznaczana jako `v1.0 — REVOKED` (status w
   `qa10.io/seal/[client]`).
3. Klient ma 30 dni na podjęcie działań naprawczych.
4. Po naprawieniu — nowy audyt, jeśli pass → przywrócenie pieczęci.

## Wersjonowanie pieczęci

- **v1.0** — bieżąca wersja, 10 wymiarów, wydana 2026-05-31.
- Kolejne wersje (v1.1, v2.0) dodają wymiary lub zaostrzają kryteria.
- Strona klienta zawsze pokazuje wersję pieczęci, którą faktycznie zaliczyła
  (nie najnowszą).

## Publiczna weryfikacja

Status pieczęci jest publicznie weryfikowalny pod:

`https://qa10.io/seal/[client-slug]`

Dla Via Viator: `https://qa10.io/seal/viaviator`.

Strona zawiera:

- Datę ostatniego audytu.
- Status każdego z 10 wymiarów (pass/fail/warning).
- Link do raportu audytu (PDF).
- Historię wersji pieczęci dla tego klienta.

---

**Wersja dokumentu:** 1.0
**Data:** 2026-05-31
**Autor:** QA10 sp. z o.o.
**Powiązane pliki:**
- `public/brand/qa10-seal.svg` — pełna pieczęć
- `public/brand/qa10-seal-mini.svg` — wersja mini do stopki
- `src/components/seal/QualitySeal.astro` — komponent Astro
- `src/pages/jakosc.astro` — strona PL
- `src/pages/en/quality.astro` — strona EN
