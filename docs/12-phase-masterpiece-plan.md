# Via Viator — 12-Phase Masterpiece Plan

**Projekt:** viaviator.pl — frontend state-of-art, 12 faz wykonawczych (M01–M12)
**Faza wejściowa:** M01 (Discovery + Plan) = ten dokument
**Autor:** QA10 / Senior UX Architect
**Data:** 2026-06-01
**Status:** kontrakt wykonawczy do akceptacji przez Adriannę Kmieciak (COO QA10) + Patryka Tomeczka (Via Viator)
**Bazuje na:** `docs/hero-v2-design-direction.md` (jakość referencyjna), `src/components/sections/HomeHero.astro` (wzorzec implementacji), `_brief/docs-source/BRAND-BOOK-v1.0.pdf` (canon)

---

## 0. Executive summary

### 0.1. Cel jednym zdaniem

Doprowadzić viaviator.pl do stanu, w którym **każda z 24 prerendered routes** ma charakter masterpiece — bez sacrifice'u na perf (Lighthouse mobile ≥95 we wszystkich czterech metrykach), a11y (WCAG 2.2 AA + reduced-motion + keyboard-only) i brand canon (czerwień ≤10% palety, brak gradientów ekstremalnych, brak 3D dramatycznego, brak poświat).

### 0.2. Filozofia — „restraint over excess"

Masterpiece w 2026 nie jest sumą trików. Jest **świadomym wyborem**: które efekty wnoszą znaczenie, które są ozdobnym hałasem. W tonacji Via Viator („dorośle, spokojnie, telefon odbieramy") agresywne efekty — auto-playing video, cinematic 3D, particle systems, parallax na całą wysokość strony — **psują pozycjonowanie marki**. Każdy z 6 wow efektów w tym planie ma uzasadnienie semantyczne ([Atlas Południa](#23-atlas-poludnia--wow1) wyjaśnia geografię operacyjną, [Floating Telefon](#25-floating-telefon--wow4) konkretyzuje brand-promise „telefon odbieramy"). Żaden nie jest „bo ładnie".

To samo dotyczy mikrointerakcji. Jeden underline-on-hover offset 8px z transition 150ms wycieli więcej niż 12 różnych „on-scroll reveal" w `tsParticles`.

### 0.3. Sukces — kryteria mierzalne

**Subiektywne (klient + reviewerzy zewnętrzni):**

- Patryk Tomeczek: „to wygląda tak, jak chciałem — masterpiece".
- Test 5 osobom z target audience (1× office manager B2B, 1× organizator pielgrzymki, 1× koordynator DPS, 1× rodzic, 1× wynajmujący Master). Wszyscy: „chcę zadzwonić" w ≤30s. Nikt: „nie wiem co to za firma".

**Obiektywne (Lighthouse, Web Vitals, axe-core, manual):**

| Metryka | Mobile target | Desktop target | Pomiar |
|---------|--------------|----------------|--------|
| LCP (75th pct) | <2.0s | <1.5s | Lighthouse simulated 4G + WebPageTest |
| INP (75th pct) | <200ms | <100ms | Field via Vercel Analytics + CrUX |
| CLS | <0.05 | <0.02 | Lighthouse + manual scroll review |
| TBT | <200ms | <100ms | Lighthouse |
| Total transfer | <500 KB | <650 KB | Network panel inkognito |
| JS payload (gzip) | <60 KB | <80 KB | `dist/_astro/*.js` audit |
| Lighthouse Performance | ≥95 | ≥98 | Lighthouse CI per route |
| Lighthouse A11y | =100 | =100 | axe-core + Lighthouse |
| Lighthouse SEO | =100 | =100 | meta + sitemap + structured data |
| WCAG 2.2 AA | 0 violations | 0 violations | axe-core + manual NVDA/VoiceOver |

### 0.4. Co odrzucamy explicite

1. **GSAP** — komercyjne, motion v12 wystarczy, dodatkowy bundle (35 KB+).
2. **Three.js / WebGL** — perf cost + maintenance + nie pasuje do restraint.
3. **Lottie / RIVE** — overkill, SVG + CSS wystarczy.
4. **Custom cursor** — sprawdzone niżej (sekcja 2.7), odrzucamy: psuje keyboard a11y i utility tone.
5. **Sound on hover/load** — psuje utility/operacyjny ton, zakazane.
6. **Hero video** (autoplay loop) — bandwidth + Safari mobile autoplay gotchas, odrzucamy.
7. **Splash / loader screen** — pretensjonalne, brand stoi na „bez fanfar".
8. **Mouse trail / particle background** — visual debt bez ROI.
9. **Cookie banner z animacją** — minimum legalne, bez fajerwerków.
10. **Theme toggle** — site jest mono-themed (dark hero, jasna reszta). Dark mode całej strony nie pasuje do brand book v1.0 (paleta jest fixed). **Odrzucamy świadomie** — to świadome złamanie domyślnej rekomendacji ArchitectUX.

---

## 1. State-of-art research — bierzemy / odrzucamy

### 1.1. Inspiracje referencyjne (mapa estetyk)

| Studio / firma | Co bierzemy | Czego nie bierzemy |
|----------------|-------------|--------------------|
| **Apple (apple.com)** | sticky section choreography, video → image fallback, INP discipline | hero auto-play 60-second cinematic |
| **Linear (linear.app)** | typografia variable-weight, scroll-driven progress, mikro-easing | gradient meshes (zakazane brand) |
| **Stripe (stripe.com)** | view transitions across docs, magnetic links subtelne | infinite gradient backgrounds |
| **Vercel (vercel.com)** | dotted grid backgrounds, mono accent typography | dark/light toggle (mamy mono-theme) |
| **Awwwards SOTD 2026** | scroll-driven CSS animations, anchor positioning | overcooked WebGL, custom cursor wszędzie |
| **Klim Type Foundry** | editorial typography, drop caps, opsz axis | Eksperymentalne fonty obok mono Bricolage |
| **Pentagram** | grid as masterpiece (Sagmeister & Walsh school) | brutalist over-the-top compositions |
| **Studio Frith** | numerowane sekcje N°01/N°02/N°03 jako redakcyjny index | over-typographic spreads |
| **The Browser Company (arc.net)** | choreographed page transitions | full-screen interactive intros |

### 1.2. CSS features 2026 — co używamy

#### 1.2.1. Scroll-driven animations (`animation-timeline: scroll() | view()`)

**Status:** Chrome 115+, Edge 115+, Safari 16.4+ (z `view-timeline` flag), Firefox 117+ (z flag, default off). **Wsparcie netto:** ~75% global, ~88% PL/EU traffic (CrUX).

**Use case dla Via Viator:**
- Numerowane indexy sekcji (`N°02`, `N°03`...) z reveal po wejściu w viewport — CSS-only, zero JS.
- Progress bar głównego nagłówka segmentu w nav, jeśli klient zatwierdzi.
- Subtle parallax na hero image *prawej kolumny* HomeHero (translateY 0 → -40px on scroll, 0 → 100vh).

**Fallback:** elementy są od razu w stanie końcowym dla browser bez wsparcia (Intersection Observer fallback dla Firefox stable bez flag = jeśli klient flaguje że >5% traffic to Firefox).

#### 1.2.2. View Transitions API (`<ClientRouter>` w Astro 6)

**Status:** same-document = Chrome 111+, Edge 111+, Safari 18+. Cross-document = Chrome 126+ flag, Edge 126+. **Wsparcie netto:** same-document ~85%, cross-document ~40% (rośnie).

**Use case:**
- Cross-page choreography przy klikach w SegmentGrid → strona segmentowa. Shared element: card image + nazwa segmentu morph do hero.
- Lang switcher PL ↔ EN — fade transition zamiast hard reload.
- Wewnątrz `/jakosc` accordion expand z view transition.

**Fallback:** instant navigation (jak dziś), bez animacji. Brak degradacji UX.

#### 1.2.3. Anchor Positioning API (`anchor-name`, `position-anchor`, `position-area`)

**Status:** Chrome 125+, Edge 125+ (stable), Safari TP, Firefox za flag. **Wsparcie netto:** ~55%.

**Use case:**
- [Floating Telefon](#25-floating-telefon--wow4) totem — phone CTA przyklejony do dolnej krawędzi viewportu, ale anchored do scroll position powyżej. Reveal po opuszczeniu hero (gdy phone totem w hero opuszcza viewport).
- Submenu hover w header nav — anchored dropdown.

**Fallback:** `position: fixed` + JS Intersection Observer dla browser bez wsparcia. Wykryć przez `@supports (anchor-name: --foo)`.

#### 1.2.4. Container queries (`@container`)

**Status:** uniwersalne wsparcie (Chrome 105+, Safari 16+, Firefox 110+). ~95%+ globalnie.

**Use case:**
- Karty floty (Trafic / Master) zmieniają layout pionowy ↔ poziomy zależnie od kontenera, nie viewportu.
- SegmentGrid card adaptuje typografię gdy karta jest wąska (2-kol grid) vs szeroka (1-kol on tablet portrait).
- Footer columns reflow per container width.

**Fallback:** nie potrzeba — uniwersalne wsparcie.

#### 1.2.5. `text-wrap: balance` + `pretty`

**Status:** `balance` uniwersalne, `pretty` Chrome 117+, Safari 17.5+.

**Use case:**
- Każdy display headline (`balance`).
- Każdy paragraf body (`pretty`) — zapobiega orphan wordom.

**Fallback:** `auto` (browser native), brak degradacji.

#### 1.2.6. Variable font axes (Bricolage `opsz`/`wdth`/`wght`)

**Status:** uniwersalne dla variable fonts (Chrome 88+, Safari 11+, Firefox 62+).

**Use case:**
- Fluid opsz per font-size: `font-optical-sizing: auto` (już mamy w HomeHero).
- Fluid wdth per breakpoint dla display: `font-variation-settings: "wdth" clamp(85, 95, 100)`.
- Animowane wght na hover dla głównych CTA (200 → 800 w 200ms, subtelne).

**Fallback:** statyczna waga, brak degradacji.

#### 1.2.7. CSS subgrid

**Status:** uniwersalne (Chrome 117+, Safari 16+, Firefox 71+).

**Use case:**
- SegmentGrid — 6 kart w 3-kol grid z subgrid dla wyrównania badge, tytuł, opis, CTA w tych samych baseline.
- Card composition w fleet section (specs lista w karcie wyrównana między kartami).

**Fallback:** nested grid + manual gap math.

#### 1.2.8. `color-mix()` + relative color syntax

**Status:** `color-mix()` uniwersalne; relative color (`rgb(from var(--x) r g b / 0.5)`) Chrome 119+, Safari 16.4+.

**Use case:**
- Segment hover overlays (12% accent na 100% bg). Już używamy.
- Focus ring jaśniejszy niż brand-red bez deklarowania osobnego tokena.

#### 1.2.9. `:has()` (parent selector)

**Status:** uniwersalne (Chrome 105+, Safari 15.4+, Firefox 121+).

**Use case:**
- `.vv-segments__card:has(.vv-badge--featured)` — różne style dla wyróżnionego segmentu (np. eventy = brand-red, otrzymuje większą wagę wizualną).
- Form: `.vv-form-group:has(input:focus)` — globalna podświetlana grupa pól.

### 1.3. CSS features 2026 — co odrzucamy

| Feature | Powód odrzucenia |
|---------|------------------|
| `mix-blend-mode: difference` (mouse cursor effects) | psuje brand canon (deterministyczne kolory) |
| `backdrop-filter: blur(40px)` na całych sekcjach | perf cost + glassmorphism passé i niezgodne z editorial tone |
| `mask-image` z gradient | overkill, clip-path wystarczy |
| `text-stroke` outline typo | brand book zakazuje |
| `filter: drop-shadow()` dramatyczne | brand book zakazuje cieni dramatycznych |
| `aspect-ratio: 21/9` cinematic | nie pasuje do format Trafic (horizontal van) |
| Houdini paint worklets | maintenance overhead, kompatybilność |

### 1.4. JS libraries — co używamy / odrzucamy

| Lib | Decyzja | Powód |
|-----|---------|-------|
| **motion v12** (mamy) | TAK — selective | Już w deps, ~10 KB gzip per chunk, używamy do orchestracji M02/M04/M09 |
| `@motionone/dom` | NIE | motion v12 zawiera |
| **GSAP / ScrollTrigger** | NIE | komercyjne, +35 KB, scroll-driven CSS wystarczy |
| **Three.js / r3f** | NIE | overkill, brand tone, +500 KB |
| **Lottie web** | NIE | overkill, SVG anim wystarczy |
| **Lenis** (smooth scroll) | NIE | native + reduced-motion wystarczy, INP regresion risk |
| **Splitting.js** | NIE | manualnie `<span>` per word w Astro |
| **GSAP Flip** | NIE | view-transitions API natywnie |
| **Embla Carousel** | TAK (jeśli faza M09 wymaga) | gdy fleet section dostanie carousel/coverflow |
| **Astro `<ClientRouter>`** | TAK | natywne view transitions M02 |

---

## 2. Mapa 6 wow efektów thematycznych

Sześć efektów. Każdy ma własną semantykę, własny budget perf, własny fallback. Nazywam je per kodowe nazwy (mnemonika dla zespołu — łatwiej niż „efekt 1, efekt 2").

### 2.1. Atlas Południa — wow#1

**Lokalizacja:** Home page (`/`, `/en/`), sekcja 4 (po SegmentGrid, przed FeatureGrid). Nowa sekcja, ID `#atlas`. Również jako embedded element w `/o-nas` (sekcja „Zasięg").

**Co użytkownik czuje:** Mam konkretną geografię. To nie agregator z Bukaresztu — to firma z Tarnowskich Gór, której obszar widzę palcem na mapie.

**Co użytkownik widzi:** Czarne tło (`#0A0A0A`). Centralnie SVG południowej Polski — 4 województwa (śląskie, opolskie, małopolskie, świętokrzyskie) jako stylizowane bloki kolorystyczne (subtle inner shadows, brak ozdobników). 3 huby lotniskowe jako czerwone okręgi 12px z pulse animacją (Pyrzowice, Kraków-Balice, Wrocław). Tarnowskie Góry jako biała kropka 8px z etykietą „TARNOWSKIE GÓRY" mono 12px tracking 0.15em. Czerwone linie 1px łączące Tarnowskie Góry → 3 huby (dasharray draw-on po wejściu w viewport). Klik/hover na hub → reveal panel boczny z czasem dojazdu + segmentem („Pyrzowice — 45 min z TG, transfer korpo i rodzinny").

**Tech stack:**
- **SVG inline** (40-60 KB raw, ~12 KB gzip), generowane raz przez QGIS export uproszczonej geometrii województw (precision: tolerance 0.01°, ~150 punktów per wojew.). Storage: `/src/assets/maps/poludniowa-pl.svg`.
- **CSS scroll-driven** dla draw-on linii: `animation-timeline: view()`, `stroke-dashoffset: 1 → 0`.
- **Vanilla JS** (8 KB) dla hover/click reveal — żadnego frameworka. Touch event fallback dla mobile.
- **Container query** dla mapa responsywności — w wąskim kontenerze (mobile <640px) mapa staje się portrait, huby układają się kolumnowo poniżej.

**Perf budget:**
- SVG: 12 KB gzip
- JS interakcja: 4 KB gzip (custom event handler, brak frameworka)
- Paint: <50ms initial, <16ms hover reveal
- Pierwszy LCP candidate? **NIE** — sekcja jest poniżej fold, nie wpływa na LCP. Lazy SVG via `loading="lazy"` na inline placeholder nie działa, więc deferred render via Intersection Observer po pierwszej interakcji scrolla.

**A11y plan:**
- SVG ma `role="img"`, `aria-labelledby="vv-atlas-title"` + `<title>` jako pierwszy child.
- Każdy hub-marker = `<button>` z `aria-label="Pyrzowice — Katowice Airport — 45 minut z Tarnowskich Gór"`. Focus visible 2px outline brand-red, offset 4px.
- Klawiatura: Tab przechodzi przez 3 huby + Tarnowskie Góry, Enter/Space aktywuje reveal panel.
- Screen reader: panel reveal aktualizuje `aria-live="polite"` region poniżej mapy z czasem dojazdu i segmentem.
- `prefers-reduced-motion`: linie draw-on instant, pulse na hubach wyłączony.

**Fallback (browser bez scroll-driven animations):**
- Linie od razu w stanie końcowym, bez animacji draw-on. Treść identyczna, brak degradacji.

**Dependency na M03** (global scroll choreography system).

### 2.2. Magnetic Segments — wow#2

**Lokalizacja:** Home page (`/`, `/en/`), sekcja 3 (SegmentGrid).

**Co użytkownik czuje:** Karty mają wagę. Reagują na mnie. To nie jest button farm — to wybór między 6 distinct dróg.

**Co użytkownik widzi:** 6 kart segmentów (P1-P6) w 3-kol grid (desktop), 2-kol (tablet), 1-kol (mobile). Na desktop: gdy kursor jest blisko karty (<120px od centroidu), karta lekko przyciąga się w stronę kursora (max translate 8px) z spring damping. Hover na kartę: subtelny 3D tilt (`rotateX` + `rotateY` ±4deg z `perspective: 1000px`) + accent color flood overlay (12% segment-color z color-mix). Wyjście kursora: karta wraca do baseline 250ms ease-out.

**Tech stack:**
- **motion v12** dla spring animation magnetic pull (`useMotionValue` + `useSpring` jeśli React, lub bezpośrednie `animate()` API dla Astro vanilla).
- **CSS `:has()`** dla card flood overlay przy hover.
- **CSS transform-style: preserve-3d** + `perspective`.
- **Pointer events** (nie mousemove) — pointer:fine media query, tylko desktop z myszą.

**Perf budget:**
- JS: 6 KB gzip (motion v12 spring + event throttle requestAnimationFrame).
- INP: <100ms (transform updates są composited, GPU).
- Disabled na touch devices (`@media (pointer: coarse)`) — magnetic pull bez sensu palcem.
- Disabled przy `prefers-reduced-motion: reduce` (instant flood overlay zamiast tilt).

**A11y plan:**
- Magnetic pull = **wyłącznie wizualny ornament**, nie wpływa na hit target. Karty mają full clickable area niezależnie od translation.
- Focus state = jasny outline brand-red 3px, offset 4px. **Nie używamy** wizualnego tilt dla focus (klawiatura nie ma fizycznej pozycji kursora).
- `prefers-reduced-motion`: tylko color flood, brak tilt, brak magnetic pull.

**Fallback:**
- Mobile/touch: standardowy hover state (color flood only). Bez magnetic.
- IE-mode browser (jeśli ktoś by) — fallback do plain hover. Akceptowalne.

**Dependency na M03**.

### 2.3. Szlak Sanktuariów — wow#3

**Lokalizacja:** Wyłącznie strona `/pielgrzymki` (PL) + `/en/pilgrimages` (EN). Sekcja po hero, przed FeatureGrid.

**Co użytkownik czuje:** Ta firma faktycznie zna trasy religijne. To nie marketingowa lista — to mapa którą można palcem prześledzić.

**Co użytkownik widzi:** Stylizowana mapa-trajektoria (SVG path), nie geograficzna — schematyczna pielgrzymka. Tarnowskie Góry jako początek (kotwica), 5 sanktuariów jako węzły: Częstochowa, Licheń, Kalwaria Zebrzydowska, Łagiewniki, Wadowice. Każdy węzeł = mała ikona (krzyż 16px) + nazwa mono uppercase + czas dojazdu („Częstochowa — 1h 20min"). Linia łącząca = SVG path z `stroke-dasharray` draw-on przy wejściu w viewport. Po draw-on, kropki znacznika animują się sekwencyjnie (każde sanktuarium reveal +200ms cascade).

**Tech stack:**
- **SVG inline** (~6 KB gzip).
- **CSS scroll-driven** dla draw-on (`animation-timeline: view()`).
- **CSS stagger** via custom property `--vv-i` na każdym węźle.

**Perf budget:**
- SVG: 6 KB gzip
- JS: 0 KB (pure CSS)
- Paint: <30ms

**A11y plan:**
- SVG `role="img"` z `aria-labelledby`.
- Każde sanktuarium ma `<title>` lub `aria-label` z pełnym opisem („Sanktuarium Matki Bożej w Częstochowie — 145 km, około 1 godzina 20 minut z Tarnowskich Gór").
- Screen reader version: pod SVG `<ol class="vv-szlak__list-fallback sr-only">` z listą sanktuariów.
- `prefers-reduced-motion`: linia od razu narysowana, kropki widoczne natychmiast.

**Fallback:**
- Bez scroll-driven = linia od razu narysowana. Bez degradacji.

**Dependency na M03**.

### 2.4. ~~zastąpiona~~ — patrz [Karty Floty](#26-karty-floty--wow6)

### 2.5. Floating Telefon — wow#4

**Lokalizacja:** Wszystkie strony (`/`, segmentowe, `/o-nas`, `/jakosc`, `/kontakt`). Reveal po opuszczeniu hero section.

**Co użytkownik czuje:** Telefon jest zawsze pod ręką. Ta firma chce żebym zadzwonił.

**Co użytkownik widzi:** Mały, dyskretny totem z numerem telefonu + ikoną słuchawki, zakotwiczony do bottom-right viewportu. Reveal animation: gdy hero section opuszcza viewport (Intersection Observer threshold 0.2), totem fade-in + slide-up z translateY 16px → 0 w 300ms. Tło: czarne `#0A0A0A`, 16px radius, 12px padding x 16px padding-y. Tekst „+48 690 691 886" mono 16px, biały. Ikona słuchawki 16px, czerwona brand. Hover: scale 1.04 + brand-red outline 2px. Klik: `tel:` link działa. Close button (×) 12px w prawym górnym rogu, semi-transparent — użytkownik może zamknąć (state persistowany w localStorage, expiry 24h).

**Tech stack:**
- **Anchor Positioning API**: `position-anchor: --vv-viewport-anchor; position-area: bottom right;` (z anchor element = body lub specjalny invisible anchor 0×0px w viewport corner).
- **Intersection Observer**: obserwuje `.vv-home-hero` (lub hero z każdej strony) i toggluje `data-floating-phone-state="visible"` na `<body>`.
- **localStorage** dla persistence stanu „zamknięte przez user".
- **motion v12** dla reveal/dismiss animation.

**Perf budget:**
- JS: 5 KB gzip
- Reveal trigger: throttled IntersectionObserver, brak per-frame computation
- Brak wpływu na LCP/CLS (poza viewport initially)

**A11y plan:**
- `role="complementary"` lub `aria-label="Skrót do telefonu"`.
- Focus management: Tab cyklem po elementach głównych dochodzi do floating phone PO sticky header.
- Close button: `aria-label="Schowaj skrót do telefonu na 24 godziny"`.
- `prefers-reduced-motion`: reveal bez slide, instant opacity.
- Screen reader: anonsowany przez `aria-live="polite"` przy reveal? **NIE** — to byłoby uciążliwe, zostaje cichy reveal.

**Fallback (browser bez anchor positioning):**
- `position: fixed; bottom: 24px; right: 24px;` z manual JS calculations. Identyczna funkcjonalność.
- Wykryć via `@supports (position-anchor: --x)`.

**Decision point dla klienta:** czy floating telefon ma być na **wszystkich stronach** czy tylko home + segmentowe. Default: wszystkie. Adrianna do potwierdzenia.

### 2.6. Manuskrypt Patryka — wow#5

**Lokalizacja:** Wyłącznie `/o-nas` (PL) + `/en/about` (EN). Sekcja na końcu listy „Jak jeździmy" (po 6 punktach), przed CTASection.

**Co użytkownik czuje:** Tu jest osoba. To podpis ręką, nie marketing-strona.

**Co użytkownik widzi:** Po lewej stronie sekcji: animowana SVG signature „Patryk Tomeczek" (hand-drawn vector, 280px szerokości, `stroke-dasharray` draw-on przy wejściu w viewport, 1800ms easing standard). Po prawej: pieczęć QA10 Quality Seal v1.0 (już mamy `/public/brand/qa10-seal.svg`) z mikrowahanie hover (rotate ±2deg + scale 1.02). Pod podpisem: jedno zdanie mono 14px „Telefon odbiera Patryk — nie infolinia. Pn-Pt 7:00–20:00".

**Tech stack:**
- **SVG signature** generowany raz (vectoriser online: hand-drawn → SVG path lub manual w Figma/Illustrator z rzeczywistego podpisu Patryka — wymaga assetu od klienta).
- **CSS scroll-driven** dla draw-on (`animation-timeline: view()`, `view-timeline-name: --signature-view`).
- **CSS transform** dla pieczęci hover.

**Perf budget:**
- SVG signature: ~4 KB gzip
- JS: 0 KB (pure CSS)
- Paint: <20ms

**A11y plan:**
- SVG `role="img"` `aria-label="Podpis Patryk Tomeczek"`.
- Pieczęć QA10: `<a href="https://qa10.io/seal/viaviator">` z `aria-label="QA10 Quality Seal v1.0 — link do certyfikatu"`.
- `prefers-reduced-motion`: podpis od razu narysowany, pieczęć bez hover wobble.

**Fallback:**
- Bez scroll-driven = signature instant. Bez degradacji.

**Decision point dla klienta:** czy klient ma scan'a/zdjęcie swojego prawdziwego podpisu (do vectorisation), czy generujemy stylizowaną wersję typo-handwriting. Default: poprosić Patryka o zdjęcie podpisu w wysokiej rozdzielczości.

### 2.7. Karty Floty — wow#6

**Lokalizacja:** Home page (`/`, `/en/`) — nowa sekcja po Atlas Południa, przed CTASection. Również `/wynajem-busa` i `/transfery-korporacyjne` (kontekstualne).

**Co użytkownik czuje:** Te dwa pojazdy są realne. To nie stock photo — to nasza flota.

**Co użytkownik widzi:** Dwie karty floty side-by-side (desktop), stacked (mobile). Karta Trafica: czarne tło, full-bleed zdjęcie Trafic (`/public/images/fleet/trafic-front.webp` lub eq.), accent stripe lewa 4px brand-red, specs lista (8 miejsc, klima, branded, paliwo). Karta Mastera: analogicznie, bez branded. **Wow efekt:** hover desktop = subtelny 3D tilt `rotateY ±3deg` z perspektywą + paralaks zdjęcia (background-position shift 0 → -8px translateY) + specs lista expand z `text-wrap: pretty` i drop cap na pierwszym specs item. Mobile: brak 3D, ale specs reveal po tap (toggle expand).

**Tech stack:**
- **CSS transform-style: preserve-3d** + `perspective`.
- **CSS subgrid** dla wyrównania specs między kartami.
- **CSS scroll-driven** dla initial reveal (cascade entrance).
- **motion v12** dla spring tilt (vanilla, ~3 KB gzip).
- **Container queries** dla responsive layout w narrow column.

**Perf budget:**
- Zdjęcia: 2× ~45 KB WebP per karta (768w) = 90 KB total
- JS: 4 KB gzip
- Paint hover: <16ms (composited transforms)

**A11y plan:**
- Karty są **NIEinteraktywne jako linki** (to nie CTA — to display). Jedyne hover effects są dekoracyjne.
- Specs lista: `<dl>` semantyczne (definition list).
- `prefers-reduced-motion`: brak tilt, brak parallax. Statyczne karty.
- Zdjęcia: `alt="Renault Trafic Via Viator — wnętrze z ośmioma siedzeniami"` itd.

**Fallback:**
- Mobile/touch: brak tilt (pointer: coarse media query).
- Browser bez `transform-style: preserve-3d`: bez tilt, plain hover. Akceptowalne.

**Dependency na M03**.

### 2.8. Mapa efektów per route

| Route | Wow#1 Atlas | Wow#2 Magnetic | Wow#3 Szlak | Wow#4 Phone | Wow#5 Manuskrypt | Wow#6 Flota |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| `/` (home) | TAK | TAK | – | TAK | – | TAK |
| `/transfery-korporacyjne` | – | – | – | TAK | – | TAK |
| `/pielgrzymki` | – | – | TAK | TAK | – | – |
| `/transport-dostepny` | – | – | – | TAK | – | – |
| `/przewozy-rodzinne` | – | – | – | TAK | – | – |
| `/wynajem-busa` | – | – | – | TAK | – | TAK |
| `/imprezy` | – | – | – | TAK | – | – |
| `/o-nas` | TAK (embedded) | – | – | TAK | TAK | – |
| `/jakosc` | – | – | – | TAK | – | – |
| `/kontakt` | – | – | – | TAK | – | – |
| `/polityka-prywatnosci` | – | – | – | TAK | – | – |
| `/polityka-cookies` | – | – | – | TAK | – | – |

Wow#4 (Floating Telefon) — wszędzie (omnipresent). Pozostałe selective per kontekst semantyczny.

---

## 3. 12 faz wykonawczych (M01–M12)

Każda faza ma: ID, sub-agent type, input, output, acceptance criteria, effort, critical path.

### M01 — Discovery + Plan (TEN DOKUMENT)

- **Agent:** Senior UX Architect (ja)
- **Input:** brief klienta („12-fazowy plan masterpiece"), `docs/hero-v2-design-direction.md`, brand book, codebase state
- **Output:** `docs/12-phase-masterpiece-plan.md` (ten plik)
- **Acceptance criteria:**
  - Min 800 linii, senior-to-senior, dense
  - 6 wow efektów ze specs (tech, perf, a11y, fallback)
  - 11 kolejnych faz z konkretnymi plikami output
  - Risk register + decision points
  - Akceptacja Adrianny (COO) + Patryka (klient)
- **Effort:** Medium (1 dzień)
- **Critical path:** TAK — blokuje wszystko poniżej

### M02 — View Transitions + Cross-Page Choreography

- **Agent:** Frontend Developer + Reality Checker
- **Input:** M01 (ten dokument), `src/layouts/BaseLayout.astro`, Astro 6 docs dla `<ClientRouter>`
- **Output:**
  - **Edytować** `src/layouts/BaseLayout.astro` — dodać `<ClientRouter />` z konfiguracją per-route, `transition:name` registry
  - **Stworzyć** `src/styles/view-transitions.css` — `::view-transition-old/-new` keyframes, `view-transition-name` registry
  - **Stworzyć** `src/lib/route-transitions.ts` — strategy per-route (home → segment = shared element morph, segment → kontakt = fade, lang switch = crossfade)
  - **Edytować** każdy `Hero.astro` i `HomeHero.astro` — dodać `transition:name="vv-hero-image"` i `transition:name="vv-hero-headline"` na shared elementach
  - **Edytować** `SegmentGrid.astro` — `transition:name="vv-seg-{personaId}"` na każdej karcie (image + title)
- **Acceptance criteria:**
  - Klik z home `/` w kartę „Pielgrzymki" → smooth morph card image do hero `/pielgrzymki` (<500ms)
  - Lang switch PL ↔ EN = crossfade 200ms, brak flash białego ekranu
  - `prefers-reduced-motion: reduce` = instant nav, bez animacji
  - Browser bez wsparcia (Firefox stable) = instant nav, brak błędu
  - Lighthouse Performance niezmienione (±2 pkt)
- **Effort:** Large (2-3 dni)
- **Critical path:** TAK — bez tego M04-M11 nie mają orchestration framework

### M03 — Global Scroll Choreography System

- **Agent:** Frontend Developer + UI Designer
- **Input:** M01, M02 done, brand canon
- **Output:**
  - **Stworzyć** `src/styles/scroll-choreography.css`:
    - `@keyframes vv-reveal-fade-up`
    - `@keyframes vv-reveal-stagger-{1..6}` (cascade delays)
    - `@keyframes vv-draw-on` (stroke-dashoffset 1→0)
    - Klasy utility `.vv-reveal`, `.vv-reveal--stagger`, `.vv-draw-on`
    - Scroll-driven via `animation-timeline: view()` z fallbackiem na Intersection Observer
  - **Stworzyć** `src/lib/scroll-orchestrator.ts` — minimal IO helper (~2 KB gzip), per-element class toggle, throttle, RAF batching
  - **Edytować** `tokens/viaviator-tokens.json` — dodać tokeny motion:
    - `motion-distance-sm: 8px`, `motion-distance-md: 16px`, `motion-distance-lg: 32px`
    - `motion-stagger-fast: 60ms`, `motion-stagger-base: 100ms`, `motion-stagger-slow: 160ms`
    - `motion-easing-anticipate: cubic-bezier(0.34, 1.56, 0.64, 1)`
    - `motion-easing-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55)`
  - **Edytować** `src/styles/global.css` — import scroll-choreography.css, ensure reduced-motion guard global
  - **Stworzyć** `docs/motion-system.md` — dokumentacja tokenów + użycia (krótka, 150 linii)
- **Acceptance criteria:**
  - Każda sekcja `<section data-reveal="true">` dostaje cascade entrance bez per-section JS
  - `prefers-reduced-motion: reduce` = wszystko bez animacji, stan końcowy instant
  - Firefox fallback działa (IO based)
  - Lighthouse niezmienione
- **Effort:** Medium (1.5 dnia)
- **Critical path:** TAK — M04, M06, M07, M09, M11 zależą

### M04 — Wow#1: Atlas Południa

- **Agent:** UI Designer + Frontend Developer + Reality Checker (a11y)
- **Input:** M01, M02, M03 done
- **Output:**
  - **Stworzyć** `src/assets/maps/poludniowa-pl.svg` — uproszczona geometria 4 województw (export z QGIS, manual cleanup)
  - **Stworzyć** `src/components/sections/AtlasPoludnia.astro` — komponent sekcji, props: `locale`, `variant: "home" | "embedded"`
  - **Stworzyć** `src/lib/atlas-interactions.ts` — hover/click reveal, keyboard nav, touch fallback
  - **Edytować** `src/pages/index.astro` + `src/pages/en/index.astro` — dodać `<AtlasPoludnia locale={locale} variant="home" />`
  - **Edytować** `src/pages/o-nas.astro` + `src/pages/en/about.astro` — dodać `<AtlasPoludnia locale={locale} variant="embedded" />`
  - **Edytować** `src/i18n/pl.ts` i `en.ts` — sekcja `atlas` (title, hub labels, segments)
  - **Edytować** `src/data/company.ts` — dodać helper `getHubMetadata()` (czas dojazdu z TG, lista segmentów per hub)
- **Acceptance criteria:**
  - Mapa renderuje się na home + o-nas, responsive
  - Klik na hub → reveal panel z czasem dojazdu + segmentem
  - Klawiatura: Tab przechodzi 3 huby + TG; Enter aktywuje
  - Screen reader: live region anonsuje wybór huba
  - `prefers-reduced-motion`: linie static, pulse off
  - Lighthouse Performance ≥95 mobile (LCP nie regresion)
  - Bundle: <16 KB gzip (SVG + JS)
- **Effort:** Large (3 dni)
- **Critical path:** NIE — może iść równolegle z M05

### M05 — Wow#2: Magnetic Segments

- **Agent:** Frontend Developer + UI Designer
- **Input:** M01, M02, M03 done
- **Output:**
  - **Edytować** `src/components/sections/SegmentGrid.astro` — dodać magnetic pull layer + flood overlay + 3D tilt
  - **Stworzyć** `src/lib/magnetic-card.ts` — pointer event handler, motion v12 spring config, pointer:fine gating
  - **Edytować** `src/components/ui/Card.astro` — dodać prop `magnetic?: boolean` (default false), z domyślnym false
- **Acceptance criteria:**
  - Desktop mouse: kursor <120px od karty → karta lekko pull, hover = flood overlay + 3D tilt
  - Touch: brak magnetic, brak tilt, jedynie flood overlay przy tap
  - Klawiatura focus: brak tilt, jedynie focus outline brand-red 3px
  - `prefers-reduced-motion`: tylko flood overlay
  - INP <100ms na mid-range Android
  - Lighthouse Performance niezmienione
- **Effort:** Medium (1.5 dnia)
- **Critical path:** NIE

### M06 — Wow#3: Szlak Sanktuariów (/pielgrzymki)

- **Agent:** UI Designer + Frontend Developer
- **Input:** M01, M02, M03 done
- **Output:**
  - **Stworzyć** `src/assets/maps/szlak-sanktuariow.svg` — stylizowana mapa-trajektoria, 5 sanktuariów + TG
  - **Stworzyć** `src/components/sections/SzlakSanktuariow.astro` — komponent sekcji
  - **Edytować** `src/pages/pielgrzymki.astro` + `src/pages/en/pilgrimages.astro` — wstawić `<SzlakSanktuariow locale={locale} />` po hero
  - **Edytować** `src/i18n/pl.ts` i `en.ts` — sekcja `szlak` (sanctuaryNames, durations, intro)
  - **Edytować** `src/data/sanctuaries.ts` (NOWY) — lista 5 sanktuariów z duration, distance, opis
- **Acceptance criteria:**
  - Mapa renderuje się na /pielgrzymki, responsive
  - Linia draw-on przy wejściu w viewport
  - Kropki sanktuariów reveal cascade +200ms
  - Każdy węzeł ma title/aria-label z pełną informacją
  - `prefers-reduced-motion`: linia instant, kropki instant
  - Bundle: <8 KB gzip
- **Effort:** Medium (1.5 dnia)
- **Critical path:** NIE

### M07 — Wow#4: Floating Telefon (Anchor Positioning)

- **Agent:** Frontend Developer + Reality Checker (a11y)
- **Input:** M01, M02, M03 done
- **Output:**
  - **Stworzyć** `src/components/ui/FloatingPhone.astro` — komponent omnipresent, prop: `locale`
  - **Stworzyć** `src/lib/floating-phone.ts` — IntersectionObserver dla hero exit detection, localStorage dismiss state, anchor positioning + JS fallback
  - **Edytować** `src/layouts/BaseLayout.astro` — wstawić `<FloatingPhone locale={locale} />` w stałym miejscu (po `<main>`)
  - **Edytować** `src/i18n/pl.ts` i `en.ts` — sekcja `floatingPhone` (label, dismissLabel)
  - **Edytować** `src/styles/global.css` — anchor positioning declarations + fallback fixed positioning, z `@supports` gates
- **Acceptance criteria:**
  - Hero out-of-view → totem reveal w 300ms
  - Klik na ×: totem znika, localStorage flag set 24h
  - Touch target ≥44×44px
  - `tel:` link działa Android Chrome + iOS Safari (real device test)
  - Klawiatura: Tab dochodzi po sticky header items
  - `prefers-reduced-motion`: bez slide, instant opacity
  - Anchor positioning na Chrome 125+, fallback fixed na innych
  - Bundle: <6 KB gzip
- **Effort:** Medium (1.5 dnia)
- **Critical path:** NIE (ale dotyka layoutu wszystkich stron — testować szeroko)

### M08 — Editorial Typography Polish

- **Agent:** UI Designer + Frontend Developer
- **Input:** M01, M02, M03 done
- **Output:**
  - **Edytować** `src/styles/typography.css`:
    - Dodać `.vv-text-balance` (text-wrap: balance) — dla wszystkich h1/h2/h3
    - Dodać `.vv-text-pretty` (text-wrap: pretty) — dla wszystkich p
    - Dodać `.vv-dropcap` — drop cap utility (3 linie, brand-red opcjonalnie)
    - Fluid `wdth` per breakpoint dla display: `font-variation-settings: "wdth" clamp(85, 95, 100)`
    - Numerowane indexy sekcji `.vv-section-index` (N°02, N°03...) mono uppercase 14px brand-red tracking 0.18em
  - **Edytować** sekcje na home (`index.astro`):
    - Każda sekcja dostaje `data-index="N°02"`, `N°03`, `N°04`, ..., `N°07`
    - Hero ma `N°01` (już jest)
  - **Edytować** wszystkie segmentowe `Hero.astro` (a właściwie wszystkie `<h1>` w segment pages) — dodać `class="vv-text-balance"`
  - **Stworzyć** `src/components/ui/SectionIndex.astro` — komponent `<SectionIndex n="02" label="Co robimy" />`
- **Acceptance criteria:**
  - Każda sekcja na home ma widoczny `N°XX` numbered index
  - h1/h2/h3 wszędzie z text-wrap: balance
  - Drop cap dostępny do użycia (testowany w `/o-nas` first paragraph)
  - Brak regresji Lighthouse
- **Effort:** Small (1 dzień)
- **Critical path:** NIE

### M09 — Wow#6: Karty Floty

- **Agent:** UI Designer + Frontend Developer
- **Input:** M01, M02, M03, M05 (magnetic-card.ts pattern może być reused) done
- **Output:**
  - **Stworzyć** `src/components/sections/FleetCards.astro` — komponent sekcji, 2 karty Trafic + Master
  - **Edytować** `src/data/company.ts` — rozszerzyć `fleet` o pola: `image: string`, `equipmentList: string[]`, `specsList: { label: string; value: string }[]`
  - **Stworzyć** `src/lib/card-tilt.ts` (lub reuse z M05) — vanilla pointer tilt
  - **Edytować** `src/pages/index.astro` + `src/pages/en/index.astro` — wstawić `<FleetCards locale={locale} />`
  - **Edytować** `src/pages/wynajem-busa.astro` + `src/pages/en/van-rental.astro` — analogicznie
  - **Edytować** `src/pages/transfery-korporacyjne.astro` + EN — analogicznie
  - **Stworzyć** brakujące zdjęcia floty jeśli nie ma: `/public/images/fleet/trafic-{front,interior,branded}-{480,768,1200}.webp`
- **Acceptance criteria:**
  - Dwie karty side-by-side desktop, stacked mobile
  - Desktop hover: 3D tilt subtle (≤±3deg) + parallax shift 8px
  - Mobile tap: expand specs reveal toggle
  - Specs lista jako `<dl>` semantyczne
  - `prefers-reduced-motion`: bez tilt, bez parallax
  - Container query: w wąskiej kolumnie (np. embedded w grid) karty re-flow pionowo
  - Bundle: <8 KB gzip (incl. images <100 KB total)
- **Effort:** Medium (2 dni)
- **Critical path:** NIE

### M10 — Microinteractions Polish

- **Agent:** UI Designer + Frontend Developer
- **Input:** M01 done; może iść równolegle z M04-M09
- **Output:**
  - **Edytować** `src/components/ui/Button.astro`:
    - Hover: dla primary (brand-red) — subtle wght axis morph 600 → 700 w 200ms, plus brightness 1.05
    - Active: scale(0.98) 75ms
    - Focus: outline 3px brand-red, offset 4px
  - **Edytować** `src/components/ui/Form*.astro` (FormInput, FormTextarea, FormSelect):
    - Floating label pattern (label transitions on focus/value)
    - Real-time validation feedback (`aria-invalid`, color shift `--vv-color-state-danger`)
    - Focus ring brand-red 2px offset 2px
  - **Edytować** `src/components/sections/Header.astro`:
    - Nav link hover: underline reveal left-to-right 200ms (background-size 0 → 100% trick)
    - Active route: persistent underline 2px brand-red
    - Mobile menu: slide-in z right 300ms easing-standard
  - **Edytować** `src/components/sections/Footer.astro`:
    - Email/phone hover: identyczny pattern jak HomeHero phone totem
    - Social links (jeśli już są): hover icon shift translateY -2px
  - **Stworzyć** `src/styles/microinteractions.css` — wspólne klasy `.vv-mi-underline-reveal`, `.vv-mi-lift`, `.vv-mi-press`
- **Acceptance criteria:**
  - Wszystkie interaktywne elementy mają focus state ≥3px brand-red outline
  - Hover transitions 150-250ms (token: `duration-fast` / `duration-base`)
  - Brak transition na property kosztownych (`box-shadow`, `filter`) — tylko opacity/transform
  - `prefers-reduced-motion`: wszystkie transitions = 0ms
  - INP <200ms mobile
  - Lighthouse A11y =100
- **Effort:** Medium (2 dni)
- **Critical path:** NIE

### M11 — Wow#5: Manuskrypt Patryka (/o-nas)

- **Agent:** UI Designer + Frontend Developer
- **Input:** M01, M02, M03 done; **klient asset** (scan podpisu Patryka, opcjonalnie)
- **Output:**
  - **Stworzyć** `src/assets/signature/patryk-tomeczek.svg` — vectoryzowany podpis (hand-traced w Illustrator/Figma z dostarczonego zdjęcia)
  - **Stworzyć** `src/components/sections/Manuskrypt.astro` — komponent sekcji
  - **Edytować** `src/pages/o-nas.astro` + `src/pages/en/about.astro` — wstawić `<Manuskrypt locale={locale} />` po liście „Jak jeździmy"
  - **Edytować** `src/i18n/pl.ts` i `en.ts` — sekcja `manuskrypt` (caption, hoursOperational)
  - **Edytować** `src/styles/global.css` lub dedykowany — keyframes draw-on signature, hover wobble pieczęci
- **Acceptance criteria:**
  - Signature SVG draws-on po wejściu w viewport (1800ms)
  - Pieczęć QA10 — hover wobble subtle (±2deg)
  - `prefers-reduced-motion`: signature instant drawn
  - Bundle: <6 KB gzip (signature SVG)
  - Klient (Patryk) akceptuje rendering podpisu
- **Effort:** Small-Medium (1.5 dnia)
- **Critical path:** NIE; **dependency na klient asset** (jeśli klient nie dostarczy podpisu, fallback: pomijamy signature, zostaje tylko pieczęć QA10 + caption)

### M12 — Final Polish + Perf + A11y + Commit + Deploy

- **Agent:** Performance Benchmarker + Reality Checker + Frontend Developer
- **Input:** M01-M11 done
- **Output:**
  - **Lighthouse run** dla wszystkich 24 routes (Chrome Lighthouse CI + axe-core devtool extension)
  - **Bundle analysis** — `astro build` + `du -sh dist/_astro/*` + size budget check
  - **Manual a11y test** — keyboard-only traverse każdej strony, NVDA screen reader test (Windows), VoiceOver test (macOS Safari)
  - **Cross-browser test** — Chrome stable, Firefox stable, Safari TP, Edge stable
  - **Real device test** — iPhone (Safari), Android mid-range (Chrome) — touch interactions, INP measure
  - **Edytować** wszystkie pliki z znalezionymi regresjami
  - **Stworzyć** `docs/12-phase-completion-report.md` — co zrobione, metryki finalne, decision log
  - **Git commit** wszystkich zmian po fazach (Adrianna decyzja: faza-by-faza czy big-bang merge)
  - **Deploy** do Vercel (production)
- **Acceptance criteria:**
  - Lighthouse Performance ≥95 mobile na wszystkich 24 routes
  - Lighthouse A11y =100 na wszystkich 24 routes
  - Lighthouse SEO =100 na wszystkich 24 routes
  - 0 axe-core violations
  - 0 WCAG 2.2 AA violations manual
  - Real device INP <200ms 75th pct (3 sesje testowe)
  - Klient akceptacja (Patryk) — „masterpiece"
  - Production deploy zielony
- **Effort:** Large (2-3 dni)
- **Critical path:** TAK — bez M12 nic nie idzie produkcyjnie

### 3.1. Sekwencja vs parallel

```
M01 ────► M02 ────► M03 ──┬──► M04 ──┐
                          ├──► M05 ──┤
                          ├──► M06 ──┤
                          ├──► M07 ──┼──► M12
                          ├──► M08 ──┤
                          ├──► M09 ──┤
                          ├──► M10 ──┤
                          └──► M11 ──┘
```

M02 i M03 są bramami. M04-M11 mogą iść równolegle (jeśli zasoby pozwalają), ale przy 1 dev'ie sekwencyjnie. Total estimated effort: **20-25 dni roboczych** dla pojedynczego senior developera. Z parallelizacją (2 devs po M03): ~14 dni.

---

## 4. Perf budget — twardy kontrakt

### 4.1. Targety per route

**Mobile (Slow 4G simulated, Lighthouse):**

| Metryka | Target | Hard limit (regresion fails QA) |
|---------|--------|-------------------------------|
| LCP | <2.0s | <2.5s |
| INP | <200ms | <300ms |
| CLS | <0.05 | <0.1 |
| TBT | <200ms | <350ms |
| FCP | <1.5s | <2.0s |
| Speed Index | <3.0s | <4.0s |

**Desktop:**

| Metryka | Target | Hard limit |
|---------|--------|-----------|
| LCP | <1.5s | <2.0s |
| INP | <100ms | <200ms |
| CLS | <0.02 | <0.05 |
| TBT | <100ms | <200ms |

### 4.2. Transfer budget per route

| Asset class | Per route target | Hard limit |
|-------------|------------------|------------|
| HTML (gzipped) | <15 KB | <25 KB |
| CSS (gzipped, route critical) | <30 KB | <50 KB |
| JS (gzipped, route critical) | <60 KB | <100 KB |
| Images (above fold) | <120 KB | <200 KB |
| Fonts (preloaded subset) | <90 KB | <120 KB |
| **Total above-fold** | **<315 KB** | **<495 KB** |

Below-fold assets (lazy): nielimitowane, ale per-resource max 500 KB.

### 4.3. Egzekucja

**Po każdej fazie M04-M11:**

```bash
npm run build
du -sh dist/_astro/*.{js,css}  # widoczność rozmiarów
npx http-server dist -p 8080 &
npx lighthouse http://localhost:8080/ --output=json --output-path=./lighthouse-{phase}.json --form-factor=mobile --throttling.cpuSlowdownMultiplier=4
```

Tabela tracking w `docs/perf-budget-log.md` — kolumny: route, phase, LCP, INP, CLS, TBT, total transfer, status (PASS/FAIL).

**Jeśli faza wprowadza regresion:** rollback feature lub optymalizacja (lazy load, code-split). Nie merge bez zielonego budżetu.

### 4.4. Specyficzne fazy — perf risk

| Faza | Perf risk | Mitygacja |
|------|-----------|-----------|
| M02 View Transitions | duplicated DOM podczas transition, +CLS risk | użyć `transition-property: opacity, transform` only (composited) |
| M04 Atlas SVG | 40-60 KB raw SVG | gzip → 12 KB; lazy render via IO po pierwszej interakcji scroll |
| M05 Magnetic | pointer move @ 60fps → INP risk | RAF throttle + transform-only (composited) |
| M07 Floating Phone | persistent DOM element → CLS risk jeśli reveal nie ma reserved space | absolute positioning, brak layout impact |
| M09 Karty Floty | 2× hero image-grade WebP | sizes attribute + 768w max dla above-fold |

---

## 5. A11y standard — twardy kontrakt

### 5.1. WCAG 2.2 AA — zakres

Wszystkie 50 success criteria z WCAG 2.2 AA. Pełna mapowanie w `docs/wcag-audit.md` (faza M12). Krytyczne dla tego projektu:

- **1.1.1 Non-text Content** — wszystkie SVG mają `role="img"` + `aria-label` lub `<title>`
- **1.4.3 Contrast (Minimum)** — 4.5:1 dla normal text, 3:1 dla large text + non-text
- **1.4.11 Non-text Contrast** — 3:1 dla UI components (focus rings, borders interactive)
- **2.1.1 Keyboard** — wszystkie interaktywne dostępne klawiaturą
- **2.4.7 Focus Visible** — focus indicator widoczny, ≥3px outline brand-red
- **2.5.8 Target Size (Minimum)** — touch targets ≥24×24 CSS px (24px = ~6mm); my dążymy do ≥44×44 (Apple HIG)
- **3.3.7 Redundant Entry** — formularze nie pytają o te same dane drugi raz
- **3.3.8 Accessible Authentication (Minimum)** — n/d, brak auth

### 5.2. `prefers-reduced-motion: reduce` — bezwarunkowo honorujemy

Każda animacja w tym planie ma reduced-motion guard. Pattern:

```css
@media (prefers-reduced-motion: reduce) {
  .vv-anything {
    animation: none !important;
    transition: none !important;
    /* stan końcowy jako baseline */
    opacity: 1;
    transform: none;
  }
}
```

JS: `const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` przed każdym `animate()`.

### 5.3. Focus management dla View Transitions

Problem: po View Transition focus może zostać zgubiony lub w niewłaściwym miejscu.

Rozwiązanie:
- Po nav: focus na `<main>` (programmatic `main.focus()` z `tabindex="-1"`).
- Skip-link na początku każdej strony: „Przejdź do treści głównej" (`tabindex="0"`, visible on focus).
- Sticky header focus zachowany jeśli był na elemencie z tym samym `transition:name`.

### 5.4. Screen reader testing checkpoints

| Tool | Platform | Kiedy testujemy |
|------|----------|-----------------|
| **NVDA** | Windows + Firefox + Chrome | Po M12 (full pass), spot checks po M04, M06, M07 |
| **VoiceOver** | macOS Safari + iOS Safari | Po M12 (full pass), spot checks po M07 (floating phone), M10 (forms) |
| **TalkBack** | Android Chrome | Po M12 (real device test) |

Test scenarios per route:
- Czy wszystkie nagłówki h1-h6 są w logicznej kolejności?
- Czy linki mają konkretne label (nie „kliknij tutaj")?
- Czy formularze mają explicit labels (`<label for="">`)?
- Czy interactive SVG (Atlas, Szlak) są dostępne klawiaturą?
- Czy `aria-live` regions anonsują tylko istotne updates?

### 5.5. Keyboard-only navigation

Test scenario:
1. Tab → przechodzi przez wszystkie interaktywne elementy w logicznej kolejności (skip-link → header nav → main → floating phone → footer)
2. Shift+Tab → odwrotnie
3. Enter / Space → aktywuje
4. Escape → zamyka mobile menu, floating phone, modal (jeśli)
5. Arrow keys → wewnątrz radio groups, listbox (forms)

Brak myszy. Brak skrótów modyfikowanych typu Ctrl+/. Wszystko Tab.

### 5.6. Color contrast — audit table

Wszystkie pary z planu (powtórzenie z hero-v2 doc):

| Para | Hex | Ratio | WCAG AA normal | WCAG AA large | OK? |
|------|-----|-------|----------------|---------------|-----|
| Display white na czarnym | `#FAFAFA` / `#0A0A0A` | 18.5:1 | PASS | PASS | ✓ |
| Body text na białym | `#0A0A0A` / `#FFFFFF` | 19.1:1 | PASS | PASS | ✓ |
| Muted gray na białym | `#525252` / `#FFFFFF` | 7.67:1 | PASS | PASS | ✓ |
| Muted gray na czarnym | `#737373` / `#0A0A0A` | 4.83:1 | PASS | PASS | ✓ |
| Brand red na czarnym | `#F13223` / `#0A0A0A` | 4.61:1 | PASS (borderline) | PASS | ✓ |
| Brand red na białym (text) | `#F13223` / `#FFFFFF` | 4.16:1 | **FAIL** | PASS | tylko large |
| Brand red 700 na białym | `#C2261A` / `#FFFFFF` | 6.45:1 | PASS | PASS | ✓ — `--vv-color-fg-accent` |

Reguła: **nigdy nie używamy `#F13223` jako text color na białym tle** (CTA, linki). Token `--vv-color-fg-accent` = `#C2261A` jest do tego. `#F13223` zostaje dla: text na ciemnym tle, ikony (non-text 3:1), dekoracji.

---

## 6. Design system extensions

### 6.1. Nowe tokeny do dodania w `tokens/viaviator-tokens.json`

```json
{
  "motion": {
    "distance": {
      "sm": { "value": "8px", "type": "dimension" },
      "md": { "value": "16px", "type": "dimension" },
      "lg": { "value": "32px", "type": "dimension" }
    },
    "stagger": {
      "fast": { "value": "60ms", "type": "duration" },
      "base": { "value": "100ms", "type": "duration" },
      "slow": { "value": "160ms", "type": "duration" }
    },
    "easing": {
      "anticipate": {
        "value": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "type": "cubicBezier",
        "comment": "subtle overshoot — dla pop akcentów (kropka, badge)"
      },
      "elastic": {
        "value": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "type": "cubicBezier",
        "comment": "elastic snap — dla magnetic pull return"
      }
    },
    "duration": {
      "instant": { "value": "75ms" },
      "fast": { "value": "150ms" },
      "base": { "value": "250ms" },
      "slow": { "value": "400ms" },
      "slower": { "value": "600ms" },
      "epic": {
        "value": "1800ms",
        "comment": "manuskrypt signature draw-on"
      }
    }
  }
}
```

Generuje `--vv-motion-distance-sm` itd. Style Dictionary auto-rebuild via `npm run tokens:build`.

### 6.2. `view-transition-name` registry

Plik `src/lib/transitions-registry.ts`:

```typescript
export const transitionNames = {
  // Cross-page shared elements
  heroHeadline: 'vv-hero-headline',
  heroImage: 'vv-hero-image',
  heroPhone: 'vv-hero-phone',

  // Segment cards
  segP1: 'vv-seg-p1',
  segP2: 'vv-seg-p2',
  segP3: 'vv-seg-p3',
  segP4: 'vv-seg-p4',
  segP5: 'vv-seg-p5',
  segP6: 'vv-seg-p6',

  // Persistent omnipresent
  floatingPhone: 'vv-floating-phone',
  header: 'vv-header',
  footer: 'vv-footer',
} as const;
```

Reguła: tylko unique names per session. Jeśli dwa elementy mają ten sam `transition:name` w tej samej DOMie, View Transitions API throw'a warning.

### 6.3. `anchor-name` registry

Plik `src/styles/anchor-registry.css`:

```css
:root {
  /* zarezerwowane anchor names */
}

body {
  anchor-name: --vv-viewport-anchor;
}

.vv-header {
  anchor-name: --vv-header-anchor;
}

.vv-home-hero {
  anchor-name: --vv-hero-anchor;
}
```

Use cases:
- `.vv-floating-phone { position-anchor: --vv-viewport-anchor; position-area: bottom right; }`
- Hover dropdown w header: `position-anchor: --vv-header-anchor; position-area: bottom start;`

### 6.4. Composable utility classes

Plik `src/styles/utilities.css` — dodać:

```css
/* Text wrapping */
.vv-text-balance { text-wrap: balance; }
.vv-text-pretty { text-wrap: pretty; }

/* Reveal patterns */
.vv-reveal {
  opacity: 0;
  transform: translateY(var(--vv-motion-distance-md));
  animation: vv-reveal-fade-up var(--vv-motion-duration-slow) var(--vv-motion-easing-entrance) both;
  animation-timeline: view();
  animation-range: entry 0% entry 80%;
}

.vv-reveal--stagger > * {
  --vv-i: 0;
  animation-delay: calc(var(--vv-i) * var(--vv-motion-stagger-base));
}

/* Draw-on for SVG paths */
.vv-draw-on {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: vv-draw-on var(--vv-motion-duration-slower) var(--vv-motion-easing-standard) both;
  animation-timeline: view();
  animation-range: entry 10% entry 60%;
}

/* Microinteractions */
.vv-mi-underline-reveal {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-size: 0% 2px;
  transition: background-size var(--vv-motion-duration-base) var(--vv-motion-easing-standard);
}
.vv-mi-underline-reveal:hover,
.vv-mi-underline-reveal:focus-visible {
  background-size: 100% 2px;
}

.vv-mi-lift {
  transition: transform var(--vv-motion-duration-fast) var(--vv-motion-easing-standard);
}
.vv-mi-lift:hover,
.vv-mi-lift:focus-visible {
  transform: translateY(-2px);
}

.vv-mi-press:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .vv-reveal,
  .vv-draw-on {
    opacity: 1 !important;
    transform: none !important;
    stroke-dashoffset: 0 !important;
    animation: none !important;
  }
  .vv-mi-underline-reveal,
  .vv-mi-lift,
  .vv-mi-press {
    transition: none !important;
  }
}
```

### 6.5. Komponenty UI do dodania / rozszerzenia

| Komponent | Status | Zmiana |
|-----------|--------|--------|
| `Card.astro` | istnieje | dodać prop `magnetic?: boolean` (M05), prop `tilt?: boolean` (M09) |
| `Button.astro` | istnieje | rozszerzyć o variant `tone="floating"` (M07), microinteractions (M10) |
| `SectionIndex.astro` | **NOWY** | M08 — `<SectionIndex n="02" />` renderuje „N°02" mono uppercase |
| `FloatingPhone.astro` | **NOWY** | M07 |
| `AtlasPoludnia.astro` | **NOWY** | M04 |
| `SzlakSanktuariow.astro` | **NOWY** | M06 |
| `FleetCards.astro` | **NOWY** | M09 |
| `Manuskrypt.astro` | **NOWY** | M11 |
| `ViewTransitionProvider.astro` | **NOWY** | M02 — wrapper z konfiguracją per-route |

---

## 7. Risk register

### 7.1. Browser kompatybilność

| Risk | Affected feature | Mitygacja |
|------|------------------|-----------|
| Firefox stable bez scroll-driven animations | M03 reveal cascade, M04 Atlas draw-on, M06 Szlak draw-on | Intersection Observer fallback w `scroll-orchestrator.ts`. Detection: `@supports (animation-timeline: view())`. |
| Firefox / Safari starszy bez Anchor Positioning | M07 Floating Phone | `position: fixed` JS-controlled fallback. Detection: `@supports (anchor-name: --x)`. |
| Cross-document View Transitions Chrome-only | M02 cross-page choreography | Astro `<ClientRouter>` natywnie obsługuje fallback do instant nav. |
| Safari iOS 15- bez `:has()` | M10 niektóre form interactions | `:has()` jest progressive enhancement, brak `:has()` = brak feature, nie błąd. |
| Mobile Safari z `100vh` issue | HomeHero min-height | `100svh` już w użyciu (HomeHero linia 232). Kontynuować pattern. |

### 7.2. Motion lib bundle

Risk: motion v12 może mieć większy bundle niż 10 KB przy aktywnym użyciu (chained animations, spring + tween + stagger).

Audit po M05 + M07 + M09: `npx vite-bundle-visualizer` w build mode. Jeśli motion-related chunk >20 KB gzip — refactor do CSS-only gdzie da się.

### 7.3. View Transitions debug

Risk: View Transitions API jest nowy, debugowanie błędów `duplicated view-transition-name` lub flicker jest non-trivial.

Mitygacja:
- Strict registry (`transitionNames` const).
- DevTools Animations panel — sprawdzić timeline.
- `console.warn` w dev mode dla missing `transition:name` na shared elements.
- Per-route smoke test po M02.

### 7.4. Reduced motion edge cases

Risk: zapomnienie reduced-motion guard w jednej fazie psuje doświadczenie użytkownikowi vestibular disorder.

Mitygacja:
- Code review checklist: każda animacja CSS + każdy `animate()` JS ma guard.
- E2E test z `Emulation.setEmulatedMedia({ name: 'prefers-reduced-motion', value: 'reduce' })` w DevTools Protocol.
- Manual test każdej fazy z systemowym reduced-motion ON.

### 7.5. INP regression mobile

Risk: M05 magnetic + M09 fleet tilt na mid-range Android może mieć INP >200ms.

Mitygacja:
- `pointer: coarse` media query disable'uje tilt na mobile. Bezpieczne.
- Real device test (Pixel 6a, Samsung A54) z DevTools Performance > Throttle CPU 4× + Network Slow 4G.
- Jeśli INP regression: replace motion v12 spring z CSS-only `cubic-bezier` transitions.

### 7.6. Asset dependencies na klienta

| Asset | Faza | Risk |
|-------|------|------|
| Podpis Patryka (zdjęcie wysokiej rozdz.) | M11 | Klient może nie dostarczyć — fallback: typo-handwriting placeholder lub usuń podpis |
| Zdjęcia floty Master (jeśli brak) | M09 | Renault Master nie ma brandingu, ale zdjęcia muszą istnieć — fallback: użyj stockowych Renault Master EU PR images (po licencji) lub odłóż M09 do dostarczenia |
| Zdjęcia eventowe (P6 segment) | M04 (Atlas pokazuje segment eventy → klik → segment page) | mniej krytyczne; segment page już ma placeholder |

### 7.7. Top 3 najwyższe ranked risks

1. **INP regression na mobile dla magnetic + tilt** (M05, M09). Real device test obowiązkowy. Mitygacja: pointer:coarse disable.
2. **View Transitions cross-document Chrome-only** (M02). Klient widzi efekt tylko w Chrome 126+; Firefox/Safari = instant nav. Mitygacja: opisać klientowi jako progressive enhancement, nie błąd.
3. **Klient nie dostarczy podpisu** (M11). Pełna mitygacja: M11 z założeniem zdjęcia podpisu, fallback bez signature. Wymaga decyzji klienta przed M11.

---

## 8. Dependencies do dodania

### 8.1. Audit obecnego `package.json`

| Lib | Wersja | Status | Akcja |
|-----|--------|--------|-------|
| `astro` | ^6.2.1 | OK | brak — Astro 6 ma `<ClientRouter>` natywnie |
| `motion` | ^12.38.0 | OK | używamy dla M05, M07, M09 selectively |
| `react` | ^19.0.0 | OK | nie używamy w hot path; tylko w `@astrojs/react` integration |
| `@fontsource-variable/bricolage-grotesque` | ^5.2.8 | OK | brak |
| `@fontsource-variable/inter` | ^5.2.8 | **niewykorzystany?** | sprawdzić: jeśli niewykorzystany — usunąć (smaller font payload) |

### 8.2. Nowe deps potrzebne

| Lib | Wersja | Faza | Powód |
|-----|--------|------|-------|
| `@fontsource-variable/jetbrains-mono` | ^5.2.8 | M02 | mono font dla N°XX indexy, hub strip, phone totem — już zadeklarowany w tokens, ale brak npm dep |
| `sharp` | ^0.33.5 | M09 (dev only) | image optimization dla fleet images (jeśli `@astrojs/image` nie wystarczy) |

Brak innych deps. Zero komercyjnych libów, zero jQuery, zero "framework du jour".

### 8.3. Devops

Brak nowych narzędzi. Vercel deploy (mamy), Lighthouse CI (mamy lokalnie via npx).

---

## 9. Decision points dla klienta (Adrianna → Patryk)

Przed M02 wymaga akceptacji **5 decyzji**:

### D1. Custom cursor — TAK czy NIE?

**Default rekomendacja: NIE.**

Powody:
- Custom cursor wymaga JS, dodaje INP overhead.
- Psuje keyboard a11y (cursor nie pokazuje focus).
- Brand canon „dorośle, spokojnie" — custom cursor jest playful/eksperymentalny.
- Może być fajny, ale każdy custom cursor to risk że user dostanie cursor zamiast tekstu w polu formularza.

**Jeśli klient chce:** ograniczamy do single-page (np. tylko `/`), z fallback do native cursor na keyboard interaction.

### D2. Hero sound (cinematic intro) — TAK czy NIE?

**Default rekomendacja: NIE.**

Powody: utility tone, brand canon zakazuje. Sound jest no-go.

**Klient potwierdza NIE** — confirm only.

### D3. Atlas Południa interactive (klik na hub reveal panel) — TAK czy NIE?

**Default rekomendacja: TAK.**

Powody:
- Atlas bez interakcji = ozdobny obrazek. Z interakcją = funkcjonalny tool.
- Kosztuje ~8 KB JS gzip — w budget.
- A11y plan jest jasny (klawiatura + screen reader).

**Jeśli klient nie chce:** Atlas zostaje statyczny, oszczędzamy 8 KB JS. Ale wow effect spada ~50%.

### D4. Floating Telefon — na wszystkich stronach, czy tylko home + segmentowe?

**Default rekomendacja: na wszystkich.**

Powody:
- Brand promise „telefon odbieramy" — egzekwujemy spójnie.
- Nie psuje stron prawnych (`/polityka-prywatnosci` etc.) — totem mały, bottom-right.
- User w polityce cookies też może chcieć zadzwonić.

**Jeśli klient nie chce wszędzie:** ograniczamy do home + segmentowe. Kontakt nie ma sensu (już sam jest pełen kontaktów).

### D5. Hero v2 zostaje vs Hero v3 — sprawdzić zgodność z planem

**Default rekomendacja: Hero v2 zostaje bez zmian, plan nie narusza.**

Powody:
- Hero v2 jest dobry, klient zaakceptował.
- M02 dodaje `transition:name` na shared elementach hero (image, headline, phone) — non-breaking.
- M07 Floating Phone reveal po opuszczeniu HomeHero — dodatkowy element, ale phone totem w hero zostaje.

**Klient potwierdza** że Hero v2 nie zmieniamy. Plan respektuje.

### D6 (bonus). Czy zlecamy zdjęcia studyjne floty (Master)?

**Default rekomendacja: TAK, ale niski priorytet.**

Master nie ma brandingu Via Viator, więc jego zdjęcie nie sprzedaje marki tak mocno jak Trafic. Możemy użyć obecnych zdjęć floty (jeśli są), albo Renault Master PR shots z licencją CC.

**Klient decyduje** — jeśli ma budżet na zdjęcia studyjne (~2-3k zł), zlecamy. Jeśli nie — używamy istniejących.

---

## 10. Appendix — kod-snippety referencyjne

### 10.1. View Transitions cross-page (M02)

`src/layouts/BaseLayout.astro`:

```astro
---
import { ClientRouter } from "astro:transitions";
import { transitionNames } from "@lib/transitions-registry";
---

<!doctype html>
<html lang={locale} data-theme="mono">
  <head>
    <ClientRouter />
    <!-- ... -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/components/sections/SegmentGrid.astro` — dodać `transition:name`:

```astro
{
  items.map((seg) => (
    <li>
      <Card
        href={href}
        transition:name={`vv-seg-${seg.personaId.toLowerCase()}-card`}
      >
        <img
          src={seg.image}
          alt=""
          transition:name={`vv-seg-${seg.personaId.toLowerCase()}-image`}
        />
        <h3 transition:name={`vv-seg-${seg.personaId.toLowerCase()}-title`}>
          {name}
        </h3>
      </Card>
    </li>
  ))
}
```

`src/styles/view-transitions.css`:

```css
@view-transition {
  navigation: auto;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

::view-transition-old(vv-seg-p1-image) {
  animation: vv-vt-fade-out 200ms ease-out both;
}

::view-transition-new(vv-seg-p1-image) {
  animation: vv-vt-fade-in 300ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### 10.2. Scroll-driven CSS animation (M03)

`src/styles/scroll-choreography.css`:

```css
/* Reveal fade-up triggered by viewport entry */
.vv-reveal {
  opacity: 0;
  transform: translateY(var(--vv-motion-distance-md));
  animation: vv-reveal-fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 80%;
}

@keyframes vv-reveal-fade-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger cascade — children indexed via --vv-i */
.vv-reveal--stagger > * {
  --vv-i: 0;
  animation-delay: calc(var(--vv-i) * var(--vv-motion-stagger-base));
}

/* SVG draw-on */
.vv-draw-on {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: vv-draw-on linear both;
  animation-timeline: view();
  animation-range: entry 10% entry 60%;
}

@keyframes vv-draw-on {
  to {
    stroke-dashoffset: 0;
  }
}

/* Fallback for browsers without animation-timeline */
@supports not (animation-timeline: view()) {
  .vv-reveal {
    animation: none;
    /* will be controlled by JS Intersection Observer */
  }
  .vv-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--vv-motion-duration-slow) var(--vv-motion-easing-entrance),
      transform var(--vv-motion-duration-slow) var(--vv-motion-easing-entrance);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vv-reveal,
  .vv-draw-on {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    stroke-dashoffset: 0 !important;
  }
}
```

`src/lib/scroll-orchestrator.ts`:

```typescript
/**
 * Fallback Intersection Observer dla browser bez `animation-timeline: view()`.
 * Toggluje `.is-visible` na elementach z `.vv-reveal`.
 */
export function initScrollOrchestrator(): void {
  if (typeof window === "undefined") return;
  if (CSS.supports("animation-timeline: view()")) return; // native scroll-driven

  const targets = document.querySelectorAll<HTMLElement>(".vv-reveal");
  if (targets.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    {
      rootMargin: "0px 0px -20% 0px",
      threshold: 0.1,
    },
  );

  targets.forEach((el) => io.observe(el));
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollOrchestrator);
  } else {
    initScrollOrchestrator();
  }
}
```

### 10.3. Anchor positioning floating element (M07)

`src/components/ui/FloatingPhone.astro`:

```astro
---
import { getDictionary, type Locale } from "@i18n/index";
import { company } from "@data/company";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const dict = getDictionary(locale);
---

<aside
  class="vv-floating-phone"
  aria-label={dict.floatingPhone.label}
  data-vv-floating-phone
  hidden
>
  <a
    href={company.phoneHref}
    class="vv-floating-phone__link"
    aria-label={dict.floatingPhone.callLabel}
  >
    <svg class="vv-floating-phone__icon" aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" fill="currentColor"/>
    </svg>
    <span class="vv-floating-phone__number">{company.phoneDisplay}</span>
  </a>
  <button
    type="button"
    class="vv-floating-phone__dismiss"
    aria-label={dict.floatingPhone.dismissLabel}
    data-vv-floating-phone-dismiss
  >
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
</aside>

<style>
  .vv-floating-phone {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: var(--vv-z-sticky);
    display: inline-flex;
    align-items: center;
    gap: var(--vv-space-3);
    padding: var(--vv-space-3) var(--vv-space-4);
    background-color: var(--vv-color-bg-inverse);
    color: var(--vv-color-fg-inverse);
    border-radius: var(--vv-radius-lg);
    box-shadow: var(--vv-shadow-xl);
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity var(--vv-motion-duration-base) var(--vv-motion-easing-entrance),
      transform var(--vv-motion-duration-base) var(--vv-motion-easing-entrance);
    pointer-events: none;
  }

  /* Progressive enhancement — Anchor positioning */
  @supports (position-anchor: --x) {
    .vv-floating-phone {
      position: absolute;
      position-anchor: --vv-viewport-anchor;
      position-area: bottom right;
      bottom: 24px;
      right: 24px;
    }
  }

  .vv-floating-phone[data-state="visible"] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .vv-floating-phone[hidden] {
    display: none !important;
  }

  .vv-floating-phone__link {
    display: inline-flex;
    align-items: center;
    gap: var(--vv-space-2);
    color: inherit;
    text-decoration: none;
    font-family: var(--vv-typography-font-family-mono);
    font-size: var(--vv-typography-font-size-base);
    font-weight: var(--vv-typography-font-weight-semibold);
    min-height: 44px;
  }

  .vv-floating-phone__icon {
    width: 16px;
    height: 16px;
    color: var(--vv-color-brand-red);
  }

  .vv-floating-phone__dismiss {
    background: transparent;
    border: 0;
    color: var(--vv-color-fg-muted);
    padding: var(--vv-space-2);
    cursor: pointer;
    min-width: 32px;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .vv-floating-phone__dismiss svg {
    width: 16px;
    height: 16px;
  }

  .vv-floating-phone__dismiss:hover,
  .vv-floating-phone__dismiss:focus-visible {
    color: var(--vv-color-fg-inverse);
  }

  @media (prefers-reduced-motion: reduce) {
    .vv-floating-phone {
      transition: opacity var(--vv-motion-duration-instant) linear !important;
      transform: none !important;
    }
  }
</style>

<script>
  import { initFloatingPhone } from "@lib/floating-phone";
  initFloatingPhone();
</script>
```

`src/lib/floating-phone.ts`:

```typescript
const DISMISS_KEY = "vv-floating-phone-dismissed-until";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

export function initFloatingPhone(): void {
  if (typeof window === "undefined") return;

  const el = document.querySelector<HTMLElement>("[data-vv-floating-phone]");
  if (!el) return;

  // Check dismiss persistence
  const dismissUntil = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  if (Date.now() < dismissUntil) {
    return; // user dismissed recently
  }

  // Find the hero element (any page)
  const hero = document.querySelector<HTMLElement>(
    ".vv-home-hero, .vv-hero, [data-vv-hero]",
  );

  if (!hero) {
    // No hero on this page — show immediately
    el.hidden = false;
    el.dataset.state = "visible";
    return;
  }

  // Show after hero exits
  el.hidden = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio < 0.2) {
          el.dataset.state = "visible";
        } else {
          el.dataset.state = "hidden";
        }
      }
    },
    { threshold: [0, 0.2, 0.5, 1] },
  );
  io.observe(hero);

  // Dismiss handler
  const dismissBtn = el.querySelector<HTMLButtonElement>(
    "[data-vv-floating-phone-dismiss]",
  );
  dismissBtn?.addEventListener("click", () => {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + DISMISS_DURATION_MS),
    );
    el.dataset.state = "hidden";
    setTimeout(() => {
      el.hidden = true;
    }, 300);
  });
}
```

### 10.4. Magnetic hover effect (M05)

`src/lib/magnetic-card.ts`:

```typescript
import { animate } from "motion";

const MAGNETIC_STRENGTH = 0.15; // 15% of distance
const MAGNETIC_RANGE_PX = 120;
const TILT_MAX_DEG = 4;

interface MagneticCardState {
  el: HTMLElement;
  rect: DOMRect;
  rafId: number | null;
}

const states = new WeakMap<HTMLElement, MagneticCardState>();

export function initMagneticCard(el: HTMLElement): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(pointer: coarse)").matches) return; // touch — skip
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const state: MagneticCardState = {
    el,
    rect: el.getBoundingClientRect(),
    rafId: null,
  };
  states.set(el, state);

  // Update rect on resize
  const ro = new ResizeObserver(() => {
    state.rect = el.getBoundingClientRect();
  });
  ro.observe(el);

  // Re-cache rect on scroll (passive)
  let scrollRaf: number | null = null;
  const onScroll = () => {
    if (scrollRaf !== null) return;
    scrollRaf = requestAnimationFrame(() => {
      state.rect = el.getBoundingClientRect();
      scrollRaf = null;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  const onPointerMove = (e: PointerEvent) => {
    if (state.rafId !== null) return;
    state.rafId = requestAnimationFrame(() => {
      const cx = state.rect.left + state.rect.width / 2;
      const cy = state.rect.top + state.rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > MAGNETIC_RANGE_PX) {
        animate(el, { x: 0, y: 0, rotateX: 0, rotateY: 0 }, { duration: 0.25 });
      } else {
        const pullX = dx * MAGNETIC_STRENGTH;
        const pullY = dy * MAGNETIC_STRENGTH;
        const tiltY = (dx / state.rect.width) * TILT_MAX_DEG;
        const tiltX = -(dy / state.rect.height) * TILT_MAX_DEG;
        animate(
          el,
          { x: pullX, y: pullY, rotateX: tiltX, rotateY: tiltY },
          { duration: 0.15, easing: "ease-out" },
        );
      }
      state.rafId = null;
    });
  };

  const onPointerLeave = () => {
    animate(
      el,
      { x: 0, y: 0, rotateX: 0, rotateY: 0 },
      { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] }, // anticipate easing
    );
  };

  window.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerleave", onPointerLeave);
}

// Auto-init for elements with data attribute
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll<HTMLElement>("[data-vv-magnetic]")
      .forEach(initMagneticCard);
  });
}
```

W `SegmentGrid.astro` dodać `data-vv-magnetic` + perspective parent:

```astro
<ul class="vv-segments" style="perspective: 1000px;">
  {items.map((seg) => (
    <li>
      <Card data-vv-magnetic style="transform-style: preserve-3d;">
        <!-- ... -->
      </Card>
    </li>
  ))}
</ul>
```

### 10.5. Variable font opsz fluid (M08)

`src/styles/typography.css` — dodać:

```css
/* Fluid optical size + width per font-size */
.vv-display {
  font-family: var(--vv-typography-font-family-display);
  font-size: clamp(40px, 9vw, 128px);
  font-weight: var(--vv-typography-font-weight-extrabold);
  line-height: 0.95;
  letter-spacing: -0.04em;
  /* Browser auto-applies opsz axis based on font-size */
  font-optical-sizing: auto;
  /* Width axis: condense lekko dla większych sizes */
  font-variation-settings: "wdth" 90;
  text-wrap: balance;
}

@media (min-width: 1280px) {
  .vv-display {
    /* Wider screens → bardziej kondensowany dla typo magazine feel */
    font-variation-settings: "wdth" 85;
  }
}

/* Numerowane indexy sekcji */
.vv-section-index {
  font-family: var(--vv-typography-font-family-mono);
  font-size: var(--vv-typography-font-size-sm);
  font-weight: var(--vv-typography-font-weight-medium);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vv-color-brand-red);
  display: inline-block;
  margin-bottom: var(--vv-space-3);
}

/* Drop cap (used selectively) */
.vv-dropcap::first-letter {
  float: left;
  font-family: var(--vv-typography-font-family-display);
  font-size: 4.5em;
  font-weight: var(--vv-typography-font-weight-extrabold);
  line-height: 0.85;
  margin-right: 0.08em;
  margin-top: 0.05em;
  color: var(--vv-color-brand-red);
}
```

---

## 11. Appendix B — Mapowanie sekcji home po M12

Po wszystkich fazach, sekwencja sekcji na `/` (home PL):

| # | Sekcja | Komponent | Wow effect |
|---|--------|-----------|------------|
| N°01 | Hero | `HomeHero.astro` (Hero v2, zostaje) | – (już ma własne entrance animacje) |
| N°02 | Co robimy (intro paragraf + 3 pillarów) | `WhatWeDo.astro` (nowy) | reveal cascade (M03) |
| N°03 | Dla kogo (SegmentGrid) | `SegmentGrid.astro` rozszerzony | **Wow#2 Magnetic** |
| N°04 | Atlas Południa | `AtlasPoludnia.astro` | **Wow#1 Atlas** |
| N°05 | Flota | `FleetCards.astro` | **Wow#6 Karty Floty** |
| N°06 | Pieczęć jakości + testimonial | `QualitySealBadge.astro` + `Testimonial.astro` | reveal cascade (M03) |
| N°07 | CTA finalny | `CTASection.astro` | reveal cascade (M03) |
| – | Footer | `Footer.astro` | microinteractions (M10) |
| – | Floating Phone | `FloatingPhone.astro` (omnipresent) | **Wow#4 Floating Telefon** |

---

## 12. Appendix C — Schema commit fazy-by-fazie

Adrianna decyzja: commit per faza (atomic, łatwiej rollbackować) vs big-bang merge na końcu.

**Rekomendacja:** commit per faza. Commit message convention:

```
M{NN}: {nazwa fazy} — {jedno zdanie scope}

Changes:
- Plik 1 (added)
- Plik 2 (edited)
- ...

Perf: LCP {x}s, INP {y}ms, CLS {z}, bundle {n} KB gzip
A11y: 0 axe violations, manual NVDA/VoiceOver: OK
Browser tested: Chrome stable, Firefox stable, Safari TP
```

Branches: `feat/m{NN}-{slug}` → PR → review przez Adriannę → squash merge do main → Vercel preview deploy → klient review → produkcja.

---

## 13. KONIEC dokumentu — sygnatura

| Kto | Status | Data |
|-----|--------|------|
| **Senior UX Architect (QA10)** | ✓ plan zatwierdzony do review | 2026-06-01 |
| **COO (QA10) Adrianna Kmieciak** | pending review | TBD |
| **Klient — Patryk Tomeczek (Via Viator)** | pending review po akceptacji COO | TBD |
| **Frontend Developer (M02 start)** | czeka na zatwierdzenie planu | TBD |
| **Performance Benchmarker (M12)** | n/d | TBD |
| **Reality Checker (M02, M04, M07, M12)** | n/d | TBD |

**Blockers przed M02:**
- Decyzje D1-D5 (sekcja 9) zaakceptowane przez Adriannę
- Decyzja D6 (zdjęcia studyjne floty) opcjonalna do M09
- Klient (Patryk) asset dla M11 (zdjęcie podpisu) — można odłożyć do M11 launch

**Łączny estimated effort:** 20-25 dni roboczych (single senior dev), 14 dni z parallelizacją M04-M11.

**Wersja:** 1.0 | Faza: M01 / 12 | Następny krok: review przez COO (Adrianna), potem akceptacja klienta, potem start M02
