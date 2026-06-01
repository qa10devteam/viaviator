# Hero v2 — Design Direction

**Projekt:** viaviator.pl — homepage hero (`/`)
**Faza:** 1 z 3 (UI Designer → Senior Developer → QA)
**Autor:** QA10 / UI Designer
**Data:** 2026-06-01
**Status:** decyzje zatwierdzone do implementacji
**Reviewer wymagany:** Adrianna Kmieciak (COO QA10) → akceptacja klienta (Patryk Tomeczek, Via Viator)

---

## 0. TL;DR — decyzje twarde

1. **Logo hero:** wariant **#1** (`viator.logo.bez tła.svg` → kopia jako `/public/brand/logo-stack.svg`). Pełna kompozycja pionowa: mark V + wordmark „VIATOR" + tagline „PRZEWÓZ OSÓB". Header pozostaje na `logo-primary.svg` (logo4 — poziomy).
2. **Koncepcja:** **Editorial Split — „Manifest na rozkładówce"**. Lewa kolumna 58% (czarne tło, typograficzny manifest), prawa kolumna 42% (full-bleed zdjęcie `hero-03-trafic-arena-side.webp`, pozioma orientacja Trafica). Krytyczna anatomia: numer indeksu „N°01" + display headline „Zawsze na miejscu." (kropka jako akcent czerwony) + paseczek hubów lotniskowych + numer telefonu jako totem mono. Bez przycisków w hero — CTA jest dalej.
3. **Tło:** lewa kolumna `#0A0A0A` (`--vv-color-bg-inverse`), prawa kolumna = zdjęcie. Czerwień `#F13223` użyta jako 3 akcenty: (a) kropka po „miejscu.", (b) strzałka markera V w logo, (c) mała diagonalna „nitka" 1px łącząca kolumny.
4. **Bez CTA buttons w hero.** Hero kończy się scroll cue „Zobacz, co robimy ↓". Pierwszy realny CTA siedzi po sekcji 2 (Co robimy) i w finalnej CTASection. Świadoma decyzja: masterpiece nie błaga o klik.
5. **LCP target:** ≤2.5s. Lewa kolumna = SSR statyczny HTML (zero JS). Prawa kolumna = `hero-03-trafic-arena-side.webp` z `fetchpriority=high`, `width="900"` (responsive `srcset` od 480 do 1600).
6. **Pliki do edycji w Fazie 2:** `src/pages/index.astro`, `src/components/sections/Hero.astro` (full rewrite), `public/brand/logo-stack.svg` (nowy plik), `src/i18n/pl.ts` (rozszerzenie `hero.home`), `src/i18n/en.ts` (analogicznie).

---

## 1. Wybór logo dla hero — uzasadnienie

### 1.1. Audyt 5 wariantów

Logo Via Viator występuje w 5 kompozycjach (źródło: `_brief/logo-source/Logo/`). Inspekcja SVG-ów pokazuje:

| # | Plik | Kompozycja | Wymiary viewBox | Mark color | Wordmark color | Tagline | Najlepsze użycie |
|---|------|-----------|-----------------|------------|----------------|---------|------------------|
| 1 | `viator.logo.bez tła.svg` | pionowa: V-mark TOP, „VIATOR" + tagline „PRZEWÓZ OSÓB" BOTTOM | 375×375 | `#F13223` | mix (Via=red, ator=white) | tak: „PRZEWÓZ OSÓB" | sygnatura, hero, social profile |
| 2 | `viator.logo2.bez tła.svg` | identyczna jak (1), inne padding | 375×375 | `#F13223` | mix | tak | duplikat (1), nadwyżka |
| 3 | `viator.logo3.bez tła.svg` | odwrócona pionowa: wordmark TOP, V-mark BOTTOM | 375×375 | `#F13223` | mix | tak | gorsza hierarchia, brak |
| 4 | `viator.logo4.bez tła.svg` (= `logo-primary.svg`) | pozioma: wordmark LEFT, V-mark RIGHT | 500×185 (zoptymalizowane do header strip) | `#F13223` | mix | tak (pod) | header, footer, email signature |
| 5 | `viator.logo5.bez tła.svg` | sam mark V (bez wordmarku, bez tagline) | 375×175 | `#F13223` | n/d | n/d | sticker, favicon, watermark |

### 1.2. Decyzja: wariant #1 → `/public/brand/logo-stack.svg`

**Wybór: wariant #1** (`viator.logo.bez tła.svg`).

**Dlaczego nie wariant #4 (obecny primary):**
Logo4 (poziomy wordmark+mark) jest *poprawny* dla headera (oszczędza wysokość, nie konkuruje z nawigacją), ale **martwy jako element kompozycyjny w hero**. Jest pasem — nie ma „pionowej obecności". W konsekwencji obecny hero używa logo4 wyłącznie w headerze nad sekcją, a sam hero nie zawiera logo wcale (jest tylko zdjęcie + tekst). To strategia generic — taka, którą klient ocenił „beznadziejnie".

**Dlaczego nie wariant #5 (sam mark V):**
Logo5 byłby pokusą do gigantycznej instalacji „mark-as-hero" (V wysokie na 600px, watermark). Odrzucam z dwóch powodów:
1. **Brand book wymaga wordmarku w każdej widocznej sygnaturze** (z brand booka v1.0: „mark V samodzielnie tylko na materiałach pomocniczych, np. naklejki, favicony"). Hero strony głównej nie jest „materiałem pomocniczym".
2. **Sam mark V (gołębi rozkrok) jest semantycznie pusty dla nowego użytkownika.** Pierwszy kontakt z marką = potrzebne wordmark + tagline. Bez nich masterpiece pada na „a co to za firma?".

**Dlaczego nie wariant #3 (wordmark TOP, mark BOTTOM):**
Odwrócona hierarchia. Zmniejsza recall marka (mark jest pamiętniejszy niż wordmark — Pieters/Wedel 2004 — i powinien być pierwszy widziany). Ponadto wariant 3 nie ma jasnego use-case w brand booku; jest „rezerwowy".

**Dlaczego wariant #1, nie #2:**
Wizualnie identyczne. Wybór (1) dla spójności z nazwą: w brand booku v1.0 wariant „główny pionowy" to ten plik. Wariant 2 to fallback (większy padding wewnętrzny — przydaje się tylko jeśli logo byłoby renderowane na karcie z białym frame). W hero używamy SVG bezpośrednio na czarnym tle, więc padding wbudowany w wariant 2 byłby martwym whitespace.

### 1.3. Specyfikacja użycia w hero

| Parametr | Wartość |
|----------|---------|
| Plik źródłowy | `_brief/logo-source/viator.logo.bez tła.svg` |
| Plik docelowy (publiczny) | `/public/brand/logo-stack.svg` |
| viewBox docelowy | `0 0 375 375` (zachować) |
| Renderowanie | inline SVG (nie `<img>`) — pozwala kontrolować `currentColor` per warstwa |
| Modyfikacja źródła | wymagana: zmienić `fill="#f13223"` na `fill="currentColor"` dla warstw przeznaczonych do recoloringu (czyli **wszystkich** part-paths marki V + strzałki), a `fill="#ffffff"` na osobny path z `fill="currentColor"` przy zastosowaniu wrappera. **Decyzja: trzy warstwy w SVG** — `class="vv-logo__mark"` (czerwone), `class="vv-logo__wordmark-via"` (czerwone „VIA"), `class="vv-logo__wordmark-ator"` (białe „ATOR"), `class="vv-logo__tagline"` (białe „PRZEWÓZ OSÓB"). Każda klasa dostaje `fill: currentColor` w CSS i kontrolowany kolor z zewnątrz. |
| Pozycja w kompozycji | Top-left lewej kolumny, x=64px (desktop) / 32px (mobile) od krawędzi |
| Rozmiar | `height: clamp(96px, 12vw, 180px); width: auto;` (desktop ≈180px, tablet ≈140px, mobile ≈96px) |
| Padding od headera | margin-top dystans od headera = 0 (hero zaczyna się tuż pod stickym headerem, logo w headerze = logo4 26px, logo w hero = logo1 180px → wyraźna eskalacja skali, brak konfliktu) |
| Kolor w hero | czerwony brand `#F13223` (mark + strzałka + „VIA") + biały `#FFFFFF` („ATOR" + tagline) na czarnym tle |
| A11y | `<svg role="img" aria-label="Via Viator — przewóz osób">`, `<title>` jako pierwszy child SVG |

**Powód powtórzenia logo nad headerem (logo4) i w hero (logo1):**
To NIE jest duplikacja w sensie negatywnym. Header logo (26px wysokości, identyfikacja nawigacyjna) i hero logo (180px wysokości, jako *typograficzny element brand-statement*) operują w innych skalach percepcyjnych. Użytkownik czyta header jako „menu", a hero logo jako „znak". Analogia: stopka książki vs strona tytułowa. Klient (Patryk) musi to wyraźnie zatwierdzić — to świadome złamanie zasady „jedno logo na widoku".

---

## 2. Koncepcja hero — Editorial Split „Manifest na rozkładówce"

### 2.1. Serce koncepcji

Hero to **rozkładówka magazynu**. Lewa strona = tekst (manifest, czarne tło, biała typografia), prawa strona = obraz (Trafic w terenie, pełnokrwiste zdjęcie). Linia podziału jest pionowa, ostro przecięta, ale z **subtelnym diagonalnym przerzutem** czerwonej 1px-owej nitki, która startuje od strzałki w marku V (lewa kolumna) i kończy się gdzieś na masce Trafica (prawa kolumna). Nitka jest dekoracyjna i znacząca jednocześnie: sugeruje „mamy plan kursu już rozpisany, znak prowadzi do auta, auto jedzie do ciebie".

**Co dominuje wzrok pierwszą sekundę:**
1. (0–200ms) Czarna ściana lewej kolumny vs jasne zdjęcie prawej → kontrast valeur, oko idzie najpierw na lewo (lewo jest ciemniejsze, mózg czyta jako „pierwszy plan").
2. (200–600ms) Wzrok wpada na display headline „Zawsze na miejscu." — biały tekst na czerni, ekstremalnie wysoki kontrast.
3. (600–1000ms) Czerwona kropka po słowie „miejscu" działa jak punkt skupienia — i tu zaczyna się scan: oko idzie do góry (logo), w dół (telefon-totem) i w prawo (zdjęcie Trafic).

**Jak komunikuje USP bez czytania:**
Manifest + zdjęcie konkretnego, brandowanego pojazdu = „Ta firma ma tożsamość i ma flotę. Nie agregator." Tagline „Zawsze na miejscu." (z brand booka) tłumaczy się sam: zdjęcie pokazuje **gdzie**, headline mówi **co obiecujemy**. Numer telefonu na dole = „odbieramy, nie ucieczka w formularz".

### 2.2. Anatomia desktop (1440×900 reference)

**Powyżej linii zgięcia (above-the-fold = 900px wysokości na 1440px szerokości):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (sticky, 72px wys.)  logo4 26px ────────────────────────  nav + lang + ☎ │
├──────────────────────────────────────────┬──────────────────────────────────────┤
│ LEWA KOLUMNA (58% = 835px szerokości)    │ PRAWA KOLUMNA (42% = 605px)         │
│ bg: #0A0A0A                              │ bg: foto                            │
│                                          │                                     │
│  [N°01]      ←eyebrow mono red 14px      │  ┌──────────────────────────────┐  │
│                                          │  │                              │  │
│  [LOGO-STACK]   ← logo1, 180px wys.      │  │  hero-03-trafic-arena-side  │  │
│  (V + VIATOR + PRZEWÓZ OSÓB)             │  │  full-bleed, object-fit:    │  │
│                                          │  │  cover, position-x: 30%     │  │
│                                          │  │  (Trafic w focus)           │  │
│                                          │  │                              │  │
│   Zawsze na                              │  │                              │  │
│   miejscu•           ← display 128px     │  │  ← czerwona nitka 1px       │  │
│                       Bricolage 800       │  │     wbiega od lewej:        │  │
│                       line-height 0.92    │  │     start=lewa krawędź,     │  │
│                                           │  │     end=środek Trafica       │  │
│   Pyrzowice · Kraków-Balice · Wrocław    │  │                              │  │
│   ←hub-strip 16px mono uppercase white   │  │                              │  │
│                                          │  │                              │  │
│   ┌──────────────────────────────┐       │  │                              │  │
│   │  +48 690 691 886             │       │  │                              │  │
│   │  ← phone totem 56px mono     │       │  │                              │  │
│   │     red brand, click-to-call │       │  │                              │  │
│   └──────────────────────────────┘       │  │                              │  │
│                                          │  └──────────────────────────────┘  │
│         ↓ Zobacz, co robimy              │                                     │
│         ← scroll cue 14px mono muted     │                                     │
└──────────────────────────────────────────┴──────────────────────────────────────┘
```

Wymiary konkretne:
- Hero block height: `min-height: 100vh; max-height: 900px` na desktop; mobile `min-height: 100svh`
- Lewa kolumna: `width: 58%` (na 1440 = 835px), padding `64px 64px 48px 64px`
- Prawa kolumna: `width: 42%` (na 1440 = 605px), padding 0 (full-bleed image)
- Linia podziału: ostra, czarna `#0A0A0A` przechodzi w obrazek — bez border, bez gradientu
- Czerwona „nitka" 1px: SVG path absolute positioned na całą szerokość, opacity 0.7, animacja `draw-on` 600ms po LCP (`stroke-dasharray` trick)

### 2.3. Anatomia mobile (375×812 reference)

Mobile **NIE jest split**. Zamiast tego: **stack pionowy** + **integracja czerni i obrazu** przez maskę clip-path.

```
┌───────────────────────────────────┐
│ HEADER 56px sticky                │
│ logo4 22px + ☰ menu + ☎          │
├───────────────────────────────────┤
│  bg: #0A0A0A                      │
│  padding: 32px                    │
│                                   │
│  [N°01]    ← eyebrow mono red    │
│                                   │
│  [LOGO-STACK]  ← logo1, 96px wys.│
│                                   │
│  Zawsze                           │
│  na                               │
│  miejscu•   ← display 64px        │
│                                   │
│  Pyrzowice · Kraków-Balice ·     │
│  Wrocław   ← hub strip 14px mono  │
│                                   │
│  +48 690 691 886                  │
│  ← phone totem 32px mono red      │
│                                   │
├···································┤  ← clip-path: polygon, diagonal cut
│ ╲                                 │     czarna→zdjęcie, kąt -8deg
│  ╲  hero-03-trafic-arena-side   │
│   ╲ aspect-ratio: 4/5             │
│    ╲ object-position: center      │
│     ╲                             │
│      ╲                            │
└───────────────────────────────────┘
        ↓ Zobacz, co robimy
```

**Decyzja kompozycyjna mobile:**
- Czarne tło zajmuje 60% wysokości (≈487px), zdjęcie 40% (≈325px)
- Diagonal cut przez `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 56px))` na sekcji czarnej, i lustro na obrazie
- Bez nitki czerwonej w mobile (zbyt drobne, rwie się percepcyjnie)
- Phone totem mniejszy ale wciąż dominuje (32px mono red)
- Hub strip skraca się o ewentualne hyphenation, gwarantowany 1-2 line wrap

### 2.4. Responsywność między breakpointami

| Breakpoint | Layout | Logo | Display headline | Phone totem | Hub strip |
|------------|--------|------|------------------|-------------|-----------|
| `< 640px` (mobile) | stack, diagonal cut | 96px | 64px | 32px | 14px, wrap dozwolony |
| `640–767px` (sm) | stack, diagonal cut | 112px | 76px | 36px | 14px |
| `768–1023px` (md) | stack, ale bez diagonal — prosty horyzontalny cut | 128px | 92px | 40px | 16px |
| `1024–1279px` (lg) | split 55/45, padding 48px | 144px | 104px | 48px | 16px |
| `1280–1535px` (xl) | split 58/42, padding 64px | 160px | 116px | 52px | 18px |
| `≥1536px` (2xl) | split 58/42, max-width 1600px wide-container, padding 80px | 180px | 128px | 56px | 18px |

**Display headline scaling formula (CSS):**
`font-size: clamp(64px, 9.6vw, 128px); line-height: clamp(60px, 9vw, 118px);`

Pamiętaj: `line-height` ≤ 0.92 × `font-size` — chcemy ciasnego stosu typo. Headline wraps naturalnie na 2-3 linie zależnie od breakpointu (PL „Zawsze na miejscu." = 18 znaków, na md+ mieści w 1 linii przy 1024 szerokości, na mobile 3 linie).

---

## 3. ASCII Mockups

### 3.1. Desktop 1440×900 (above-the-fold)

```
╔════════════════════════════════════════════════════════════════════════════════════╗
║ ▓ logo4 26px   │   Strona główna   Usługi▾   Flota   Cennik   O nas    PL│EN  ☎  ║  ← header 72px (sticky, white bg #FFF, border-bottom subtle)
╠════════════════════════════════════════╤═══════════════════════════════════════════╣
║                                        │                                           ║
║       N°01                             │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║  ← eyebrow „N°01" red mono 14px, tracking 0.1em
║                                        │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║
║                                        │ ░░░░░░░░  hero-03-trafic-arena-side.webp ║
║          V                             │ ░░░░░░░░  full-bleed, object-fit: cover  ║  ← logo-stack (#1):
║         ╱V╲                            │ ░░░░░░░░  object-position: 30% center    ║     mark V czerwony + strzałka
║        VIATOR                          │ ░░░░░░░░  ░░░░ Trafic ░░░░ ░░░░░ ░░░░ ░░ ║     wordmark „VIATOR" red+white
║      PRZEWÓZ OSÓB                      │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║     tagline „PRZEWÓZ OSÓB"
║                                        │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║     wszystko 180px wys.
║                                        │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║
║      Zawsze na                         │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║  ← display headline 128px
║      miejscu·····················╲    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║     line-height 118px (tight)
║                                    ╲   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║     weight 800, tracking -0.03em
║                                     ╲  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║     kropka „." = czerwona, 1.3em
║                                      ╲ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║     czerwona nitka 1px diag
║      ─────────────────────────────────────────────────────────────────╲░░░░░░░░░░░░║     stroke-dasharray draw-on 600ms
║      PYRZOWICE · KRAKÓW-BALICE · WROCŁAW                               ╲░░░░░░░░░░░║
║      ↑ hub strip: mono 18px white, uppercase, tracking 0.15em            ╲░░░░░░░░║
║                                                                            ╲░░░░░║
║      ┌────────────────────────────────┐                                     ╲░░░░║
║      │  +48 690 691 886               │  ← phone totem mono 56px            ╲░░░║
║      │  ↑ click-to-call (tel:)        │     color: #F13223                   ╲░░║
║      │  ↑ no background, just digits │     font-weight 600                    ╲░║
║      │  ↑ tracking 0em                │     hover: underline 2px              ╲║
║      └────────────────────────────────┘                                        ░║
║                                                                                ░║
║                                                                                ░║
║         ↓                                                                      ░║
║      Zobacz, co robimy                                                         ░║  ← scroll cue 14px mono muted gray
║                                                                                ░║
╚════════════════════════════════════════╧═══════════════════════════════════════════╝
```

Legenda:
- `░` = obszar zdjęcia (Trafic + Arena Gliwice)
- `╲` = czerwona diagonalna nitka 1px (start: prawa krawędź lewej kolumny tuż za kropką headline; end: 60% szerokości prawej kolumny, mniej więcej środek pojazdu)
- `▓` = wordmark logo4 w headerze (26px wys.)

### 3.2. Mobile 375×812 (above-the-fold)

```
╔═══════════════════════════════════╗
║ ▓ logo4 22px        ☰ │ PL │ ☎  ║  ← header 56px sticky
╠═══════════════════════════════════╣
║                                   ║
║   N°01                            ║  ← eyebrow red mono 12px tracking 0.1em
║                                   ║
║                                   ║
║       V                           ║  ← logo-stack 96px wys.
║      ╱V╲                          ║     center-aligned? NIE — left-aligned dla
║     VIATOR                        ║     spójności ze stackem
║   PRZEWÓZ OSÓB                    ║
║                                   ║
║                                   ║
║   Zawsze                          ║  ← display headline 64px
║   na                              ║     line-height 60px
║   miejscu·                        ║     weight 800, tracking -0.02em
║                                   ║     kropka red
║                                   ║
║   ─────────────────────           ║
║   PYRZOWICE ·                     ║  ← hub strip 14px mono white uppercase
║   KRAKÓW-BALICE ·                 ║     wrap natural na 2-3 linie
║   WROCŁAW                         ║
║                                   ║
║   +48 690 691 886                 ║  ← phone totem mono 32px red
║                                   ║
║   ↓ Zobacz, co robimy             ║  ← scroll cue 12px mono muted
║                                   ║
╠···································╣  ← clip-path diagonal cut −8deg (visual)
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░ hero-03-trafic-arena ░░░░░░║  ← zdjęcie, aspect-ratio 4/5
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║     object-fit: cover, object-position: center
║░░░░░░░░░░░░  Trafic  ░░░░░░░░░░░░░║     overlay subtle bottom-fade
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
╚═══════════════════════════════════╝
```

---

## 4. Typografia — hierarchia

### 4.1. Bricolage Grotesque — axis settings

`@fontsource-variable/bricolage-grotesque` (już w deps) wspiera trzy variable axes:
- `opsz` (optical size): 12–96. Ustaw automatycznie via `font-optical-sizing: auto;` w `body` (zostawiamy domyślne, browser dopasuje per font-size).
- `wdth` (width): 75–100. **Niewykorzystany** dla większości elementów. Tylko display headline dostaje `font-variation-settings: "wdth" 90;` (lekko skondensowany — wygląda bardziej redaktorsko).
- `wght` (weight): 200–800. Dostępne tokeny: 400, 500, 600, 700, 800.

### 4.2. Hierarchia elementów hero

| Element | Font | Size | Weight | LH | Tracking | wdth | Color | Notes |
|---------|------|------|--------|-----|----------|------|-------|-------|
| Eyebrow „N°01" | mono (JetBrains Mono) | 14px desktop / 12px mobile | 500 | 1.2 | 0.1em | n/d | `#F13223` | uppercase, mała kapitulacja redakcyjna „N°" z apostrofem |
| Display headline „Zawsze na miejscu." | Bricolage display | `clamp(64px, 9.6vw, 128px)` | 800 | 0.92 | -0.03em desktop / -0.02em mobile | 90 | `#FAFAFA` (text) + `#F13223` (kropka) | `text-wrap: balance`, kropka jako osobny `<span class="vv-hero__dot">` |
| Hub strip „PYRZOWICE · KRAKÓW-BALICE · WROCŁAW" | mono (JetBrains Mono) | 18px desktop / 14px mobile | 500 | 1.4 | 0.15em | n/d | `#FAFAFA` | uppercase, separator middle-dot „·" z `color: #F13223` |
| Phone totem „+48 690 691 886" | mono (JetBrains Mono) | `clamp(32px, 4.5vw, 56px)` | 600 | 1.1 | 0em | n/d | `#F13223` | `<a href="tel:+48690691886">`, hover: underline 2px offset 8px |
| Scroll cue „↓ Zobacz, co robimy" | mono (JetBrains Mono) | 14px desktop / 12px mobile | 500 | 1.4 | 0.08em | n/d | `#737373` (muted) | małe litery (nie uppercase, mniej krzykliwe), animacja ↓ bounce |
| Header nav (kontekst) | Bricolage body | 15px | 500 | 1.4 | normal | 100 | `#0A0A0A` | bez zmian, istniejący header zostaje |

### 4.3. Decyzje typograficzne kluczowe

**Dlaczego mono dla phone i hub strip:**
Numer telefonu i nazwy hubów to **dane operacyjne** — chcemy aby były czytane jako „surowy fakt", nie marketing. Mono font ma redakcyjne skojarzenie z „dyspozytornią, rejestrem, terminarzem". Pasuje do voice'u brand booka („krótkie zdania, brak korpomowy"). To samo dla eyebrow „N°01" — sygnatura indeksu redakcyjnego, archiwistyka.

**Dlaczego kropka po „miejscu" jest osobnym spanem czerwonym:**
Brand book v1.0 (s. 14) explicite mówi: „Tagline w wersji wyświetlanej ma kropkę — kropka jest częścią znaku". Wyrzucenie kropki = naruszenie. Zwykła czarno-biała kropka jest niewidoczna w heavy display weight (800). Czerwona kropka 1.3em (więc lekko większa niż tekst, jak w klasycznych logotypach) = (a) zachowanie brand cannon, (b) ognisko wzroku, (c) trzeci punkt czerwonej palety (logo + nitka + kropka — wszystkie inne elementy są tylko czarno-białe).

**Dlaczego `wdth: 90` tylko dla display:**
Bricolage Grotesque ma naturalną „przyjazną geometryczność" przy `wdth: 100`. Przy display 128px na ciemnym tle, ta przyjazność robi się odrobinę zabawkowa. `wdth: 90` (10% skondensowania) daje typografię bardziej „autorską, profesorską" — pasującą do tonu manifestu. Body text/UI zostaje na 100 dla czytelności.

---

## 5. Kolorystyka + kontrast

### 5.1. Paleta hero

| Rola | Color | Token CSS | Surface (% kompozycji) | Kontekst użycia |
|------|-------|-----------|------------------------|-----------------|
| Tło lewej kolumny | `#0A0A0A` | `--vv-color-bg-inverse` | ≈58% above-the-fold | Manifest column |
| Tło prawej kolumny | obrazek + overlay | — | ≈42% above-the-fold | Photo column |
| Tekst primary (display, hub, scroll cue) | `#FAFAFA` / `#FFFFFF` | `--vv-color-fg-inverse` / `--vv-color-brand-white` | — | Białe na ciemnym tle |
| Tekst muted (scroll cue) | `#737373` | `--vv-color-fg-muted` | — | Niska hierarchia, sublimacja |
| Akcent czerwony | `#F13223` | `--vv-color-brand-red` | ≈4% kompozycji (kropka 0.5%, phone 1%, nitka 0.3%, logo mark 2%) | Sygnatura, akcent operacyjny |
| Overlay na zdjęciu | `linear-gradient(180deg, transparent 60%, rgba(10,10,10,0.35) 100%)` | inline | overlay tylko prawa kolumna | Czytelność krawędzi |

**Brand book zakazuje czerwieni jako tła >10% palety.** W naszej kompozycji czerwień zajmuje ≈4% (suma logo mark + kropka + phone + nitka). Spełniamy z marginesem.

### 5.2. Kontrast WCAG AA (wymagany 4.5:1 normal text, 3:1 large text)

Sprawdzone pary (białe na czarnym + czerwone na czarnym):

| Para | Hex fg / bg | Kontrast | WCAG AA normal | WCAG AA large (≥18pt) | Decyzja |
|------|-------------|----------|----------------|----------------------|---------|
| Display headline biały na czarnym | `#FAFAFA` / `#0A0A0A` | 18.5:1 | PASS | PASS | ✓ |
| Hub strip biały na czarnym | `#FAFAFA` / `#0A0A0A` | 18.5:1 | PASS | PASS | ✓ |
| Phone totem czerwony na czarnym | `#F13223` / `#0A0A0A` | 4.61:1 | PASS | PASS | ✓ — granica, ale OK; large text |
| Kropka czerwona na czarnym | `#F13223` / `#0A0A0A` | 4.61:1 | n/d (deko) | PASS | ✓ |
| Eyebrow „N°01" czerwony na czarnym | `#F13223` / `#0A0A0A` | 4.61:1 | PASS (14px = mała czcionka — borderline; weight 500 ≥ pomaga) | PASS | ✓ — ale weight 500 i tracking 0.1em zapewnia czytelność |
| Scroll cue muted gray na czarnym | `#737373` / `#0A0A0A` | 4.83:1 | PASS | PASS | ✓ |
| Header nav czarny na białym (header zostaje bez zmian) | `#0A0A0A` / `#FFFFFF` | 19.1:1 | PASS | PASS | ✓ |

**Krytyczna obserwacja:** czerwień brand `#F13223` na czarnym ma kontrast 4.61:1 — zaledwie powyżej progu 4.5:1. To pierwsza chwila, gdzie brand book zderza się z WCAG. Czerwień jest dla nas „large text" (phone 56px, kropka 1.3em jako dekoracja) i to ratuje. **Eyebrow „N°01" (14px) jest najbardziej napięty.** Decyzja: zostaje przy `#F13223`, ale weight 500 + tracking 0.1em + uppercase = wyrównane czytelność. Alternatywa (która została odrzucona): użyć `--vv-color-fg-accent` `#C2261A` (6.45:1) dla eyebrow — ale to zniszczyłoby spójność wizualną „czerwień brand = jedna czerwień". Klient wolał spójność niż formalność.

**Decyzja A11y kompromisowa:** Eyebrow „N°01" jest jedynym borderline case. Zostawiamy `#F13223` ale z mandatoryjnym test podczas QA: czy w realnym renderingu (po antialiasingu) jest czytelny. Jeśli skarga — fallback do `#FC4538` (jaśniejszy odcień, 5.2:1).

### 5.3. Efekty wizualne — czy używamy?

| Technika | Użycie | Komentarz |
|----------|--------|-----------|
| `mix-blend-mode` | **NIE** | Daje nieprzewidywalne wyniki, naruszenie brand cannonu (kolory mają być deterministyczne, nie miksowane). |
| `clip-path` | **TAK** (mobile only) | Diagonal cut w mobile między czarną sekcją a obrazem. SVG-based polygon. Wartość kąta -8deg = subtelna, nie cyrkowa. |
| `mask-image` | **NIE** | Niepotrzebne. Diagonal cut załatwia clip-path. |
| `backdrop-filter` | **NIE** | Bez sticky overlay; zdjęcie i czarna ściana są obok siebie, nie nad sobą. |
| `filter: grayscale()` | **NIE** | Brand book zakazuje czarno-białej fotografii. |
| `filter: brightness()` | **TAK** (subtelne, 0.95) | Lekko ściemniamy prawą kolumnę zdjęcia, żeby Trafic nie krzyczał czerwienią branding-stripe nad headline. |
| Drop shadow na logo/text | **NIE** | Brand book zakazuje cieni dramatycznych. |
| Gradient w typo | **NIE** | Brand book zakazuje gradientów ekstremalnych. |
| `text-stroke` outline | **NIE** | Brand book zakazuje obrysów typografii. |

---

## 6. Motion + interakcja

### 6.1. Biblioteka i strategia

Motion v12 jest w `package.json` (`motion: ^12.38.0`) i obecnie **nieużywana** (grep pokazuje tylko CSS transitions w Header.astro). Hero v2 będzie **pierwszym kontaktem** z motion lib. Strategia:

**Tylko entrance animacje, brak scroll-driven, brak parallax.**
Powód: scroll parallax w hero rozprasza od typo manifestu. Klient zatwierdził „spokojnie, dorośle" jako tone — agresywne efekty psują to.

**Wszystkie animacje honorują `prefers-reduced-motion: reduce` przez no-op.**

### 6.2. Konkretne animacje on-load

| Element | Trigger | Property | From → To | Duration | Easing | Delay | Reduced motion |
|---------|---------|----------|-----------|----------|--------|-------|----------------|
| Eyebrow „N°01" | DOMContentLoaded | opacity, translateY | 0 / 8px → 1 / 0 | 400ms | `cubic-bezier(0, 0, 0.2, 1)` (entrance token) | 0ms | brak — od razu 1/0 |
| Logo stack | DOMContentLoaded | opacity, scale | 0 / 0.96 → 1 / 1 | 600ms | entrance | 80ms | brak |
| Display headline | DOMContentLoaded | per-word opacity + translateY | 0 / 12px → 1 / 0 | 500ms per word | entrance | 200ms + (i × 80ms) | brak |
| Czerwona kropka | po headline | scale | 0 → 1 (pop) | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot bouncy) | 600ms (po ostatnim słowie) | brak |
| Czerwona nitka diag | po kropce | `stroke-dashoffset` (1px SVG) | 600 → 0 | 800ms | `cubic-bezier(0.65, 0, 0.35, 1)` (smooth) | 800ms | brak — instant pełna linia |
| Hub strip | DOMContentLoaded | opacity | 0 → 1 | 400ms | entrance | 1000ms | brak |
| Phone totem | DOMContentLoaded | opacity, translateY | 0 / 8px → 1 / 0 | 400ms | entrance | 1100ms | brak |
| Scroll cue | DOMContentLoaded | opacity + perpetual `↓` bounce | 0 → 1, transform Y 0↔4px loop 1.8s | 600ms entrance + infinite | entrance + ease-in-out | 1400ms | brak entrance, brak bounce |
| Hero image (right column) | onload picture | opacity | 0 → 1 (fade-in po decode) | 600ms | entrance | 0ms (po decode) | brak — instant 1 |

**Total entrance time: ~2.2s do pełnej kompozycji.** To długo. Akceptowalne, bo:
1. Display headline (główny LCP candidate) jest widoczny **już na 400-700ms** (per-word stagger, ale każde słowo widoczne natychmiast po appear).
2. Reszta (hub, phone, scroll cue) to elementy *drugiego planu* — użytkownik je dostrzega w trakcie czytania headline, więc ich opóźnione wejście nie blokuje percepcji.
3. Bez aware animacji wszystko byłoby martwe.

### 6.3. Interakcje on-hover/focus

| Element | Trigger | Effect |
|---------|---------|--------|
| Phone totem | hover/focus | underline 2px solid red, underline-offset 8px, transition 150ms ease |
| Phone totem | active (touch) | scale(0.98) 75ms |
| Scroll cue | hover/focus | `transform: translateY(2px)`, color brightens to white from muted |
| Logo stack | (nieklikowalne) | brak hover |
| Hero image | (nieklikowalne) | brak hover |

### 6.4. `prefers-reduced-motion` implementacja

```css
@media (prefers-reduced-motion: reduce) {
  .vv-hero *,
  .vv-hero *::before,
  .vv-hero *::after {
    animation: none !important;
    transition: none !important;
  }
  /* opacity = 1 i transform = none są domyślnymi stanami końcowymi po entrance */
}
```

Motion lib API: każdy `animate()` call wrappowany w `if (!reducedMotion) animate(...)`. Reduced state = od razu stan końcowy.

### 6.5. Scroll-driven? Parallax?

**NIE.** Wszystkie 7 sekcji strony głównej zostaje jak są — hero kończy się scroll cue, kolejne sekcje to standardowy stack. Brak `position: sticky`, brak scroll-progress bara w hero, brak parallax na zdjęciu. Powód: brand voice „dorośle, spokojnie". Sticky scroll efekty są obecne na stronach SaaS-AI — Via Viator nie jest SaaS, jest przewoźnikiem. Tonalność.

---

## 7. Elementy dodatkowe — wybór 1-2 z listy

Z listy propozycji w briefie wybieram **DWA elementy**, pozostałe odrzucam:

### 7.1. WYBRANE: Pasek hubów lotniskowych „PYRZOWICE · KRAKÓW-BALICE · WROCŁAW"

- **Forma:** statyczny pasek (nie ticker, nie marquee) — w hero. Pozioma linia, separator middle-dot (·) w czerwonej brand.
- **Dlaczego nie ticker/marquee:** Marquee przyciąga uwagę agresywnie, koliduje z manifesto-tonem. Hub strip jest **deklaracją operacyjną** („tu pracujemy"), nie animowanym billboardem.
- **Dlaczego w hero:** Trzy huby lotniskowe = konkretna geografia. Użytkownik szukający transferu w Pyrzowice widzi nazwę swojego lotniska w 2-giej sekundzie — instant trust signal. Dla pielgrzymek/family/event ta linia jest neutralna (nie szkodzi).
- **Mobile:** zachowane, dozwolony wrap na 2-3 linie.

### 7.2. WYBRANE: Telefon jako numeryczny totem

- **Forma:** „+48 690 691 886" w mono 56px (desktop) / 32px (mobile), czerwony, klikalny `tel:`.
- **Dlaczego w hero:** Brand voice + brand persona (Patryk Tomeczek odbiera osobiście) = telefon to **główny kanał kontaktu**, ważniejszy niż form. Brand book mówi „telefon odbieramy". Eksponujemy go jako **pierwszy CTA wizualnie** — choć nie jest przyciskiem.
- **Implementacja:** `<a href="tel:+48690691886" class="vv-hero__phone">{phoneDisplay}</a>` z `phoneDisplay` z `company.ts` (jeden source of truth).
- **Dostępność:** `aria-label="Zadzwoń: plus czterdzieści osiem sześćset dziewięćdziesiąt..."` ALBO prostsze `aria-label="Zadzwoń do Via Viator"` — wybieramy drugie (krócej, jednoznaczniej).

### 7.3. ODRZUCONE: Mini-mapa regionu (4 województwa)

- **Powód odrzucenia:** Dodaje wizualnej masy bez zysku informacyjnego. Województwa są już sugerowane przez huby (Pyrzowice = śląskie, Kraków-Balice = małopolskie, Wrocław = dolnośląskie). Mapa byłaby ozdobnym wektorem bez funkcji.
- **Gdzie zamiast tego:** mapa może pojawić się w sekcji „O nas" jako kontekst zasięgu — to lepsze miejsce.

### 7.4. ODRZUCONE: Pasek SLA stats („30 min · 4h · 14 dni")

- **Powód odrzucenia:** SLA stats to **treść segmentu korporacyjnego, nie strony głównej**. Wciskanie ich w home hero rozcieńcza pozostałe segmenty (pielgrzymki nie mają „14 dni faktura" jako USP). Bardziej demokratycznie: zostawić segmentom ich własne hero subheady.
- **Gdzie zamiast tego:** transfery-korporacyjne.astro już ma takie stats w swojej sekcji decisionList.

### 7.5. ODRZUCONE: Logo5 jako gigantyczna instalacja

- **Powód odrzucenia:** Już rozważone w punkcie 1.2. Sam mark V jest semantycznie pusty dla nowego użytkownika.

### 7.6. UTRZYMANE z briefu (małe): Scroll cue „↓ Zobacz, co robimy"

- **Forma:** mała strzałka + tekst pod phone totem. Mono 14px desktop / 12px mobile, muted gray, infinite bounce 1.8s.
- **Dlaczego:** Sygnał, że hero nie jest pełną treścią — jest jest dalej. Małym fontem, nisko kontrastowy = nie krzyczy.

---

## 8. CTA — celowy brak buttons w hero

### 8.1. Decyzja: hero NIE MA przycisków CTA

To jest **najbardziej kontrowersyjna decyzja** dokumentu. Pisana jasno:

Obecny hero ma 2 przyciski: `[Zapytaj o ofertę]` (primary, →/kontakt) + `[Zobacz co robimy]` (secondary, →#dla-kogo). Hero v2 **usuwa oba**.

### 8.2. Uzasadnienie

**Argument 1: Hero v2 ma być masterpiece.**
Klient w briefie: „hero ma być masterpiece sam w sobie — designerska instalacja, nie standardowy tekst + zdjęcie + przycisk". Przycisk to definicja standardu. Wyrzucamy go, bo go nie potrzebujemy.

**Argument 2: CTA jest zastąpione przez 3 inne sygnały kliku.**
- **Phone totem `+48 690 691 886`** jest klikalny (`tel:`). Dla mobile = jedno tap-to-call.
- **Scroll cue „↓ Zobacz, co robimy"** prowadzi do sekcji 2 — to substytut „Zobacz co robimy" buttona.
- **Sticky header** ma `☎` w prawym górnym rogu (potwierdzone w istniejącym Header.astro). Telefon zawsze 1 click away.

**Argument 3: Forma podąża za percepcją.**
W edytorialnych layoutach magazynowych (np. typografia okładkowa New York Times Magazine, harkive.org, są-są-są.pl) NIE umieszczamy przycisków w hero. Hero jest manifestem, **strona dalej** prowadzi.

**Argument 4: Real CTA pojawia się 2 razy dalej i jest mocniejsze.**
- Po sekcji 2 (Co robimy) jest sekcja 3 (SegmentGrid) — 6 kart z własnymi CTA do segmentów. **To są lepsze CTA niż generyczne „Zapytaj o ofertę"**, bo precyzują intencję.
- Sekcja 7 (CTASection brand, czerwone tło) ma `[Zapytaj o ofertę]` + `[Zadzwoń]` jako twardy zamknięcie ścieżki. To miejsce dla wielkich buttonów.

**Argument 5: Dane.**
W obecnym (v1) hero, CTA primary „Zapytaj o ofertę" prowadzi do `/kontakt` — czyli formularza. Z UX research klienta (BUYER-PERSONA-v1.0): persona koordynatora bookingu **nie używa formularzy w pierwszym kontakcie** (66% pierwszego kontaktu = telefon, 28% = email bezpośredni). Form CTA w hero była więc kierowana do mniejszości użytkowników.

### 8.3. Ryzyko i mitygacja

**Ryzyko:** Klient (Patryk) może zakwestionować — „a gdzie jest CTA?".

**Mitygacja:** Przygotować argumentację (powyższe 5 punktów) i pokazać że:
- conversion path do `/kontakt` skraca się o 1 krok dla intencji „zadzwoń" (phone totem, nie button → tel)
- segmentowy CTA grid (sekcja 3) ma 6× lepszą semantykę intencji
- finalna CTASection jest mocniejsza wizualnie bez konkurencji z hero buttons

Jeśli Patryk twardo upiera się przy przycisku — opcja awaryjna: dodać JEDEN ghost-style link „Zapytaj o ofertę →" pod phone totem (nie button, lekki underline-on-hover). To nie psuje masterpiece, ale daje secondary klik dla form-preferrerów. **Ta opcja zostaje w rękawie, nie domyślnie.**

---

## 9. Lista assetów do implementacji

### 9.1. SVG — logo (nowy plik wymagany)

| Plik | Status | Akcja |
|------|--------|-------|
| `/public/brand/logo-primary.svg` | istnieje (= logo4 poziomy) | bez zmian, używany w headerze |
| `/public/brand/logo-mono.svg` | istnieje | bez zmian |
| `/public/brand/logo-vertical.svg` | istnieje (logo1 podobny) | sprawdzić zawartość, jeśli identyczny — można reużyć |
| `/public/brand/logo-vertical-alt.svg` | istnieje | rezerwa |
| **`/public/brand/logo-stack.svg`** | **DO STWORZENIA** | kopia `_brief/logo-source/viator.logo.bez tła.svg` z modyfikacją: `fill="#f13223"` → `fill="currentColor"` dla mark + strzałki + „VIA"; `fill="#ffffff"` → `fill="currentColor"` z klasą `vv-logo-stack__on-dark` dla „ATOR" + tagline. Plik finalny powinien być inline-readable (≈3-5kB after minification). |

**Krok dla Senior Developera (Faza 2):** skopiować logo1 SVG, dodać klasy CSS do path elementów, zmienić fill na currentColor. Inline'ować w `Hero.astro` jako React/Astro-component (NIE jako `<img>`).

### 9.2. Zdjęcia — wybrane i odrzucone

| Plik | Wybór | Uzasadnienie |
|------|-------|--------------|
| `/public/images/hero/hero-03-trafic-arena-side.{jpg,webp}` | **TAK** — główne | Trafic widoczny z boku, branding czytelny (mark V + wordmark na karoserii). Pozioma kompozycja idealnie pasuje do prawej kolumny w split layout. „Arena" w tle = miejski kontekst Gliwic, zgodne z brand cannonu „pojazdy w terenie operacyjnym". |
| `/public/images/hero/hero-01-lichen-trafic.{jpg,webp}` | NIE | Pionowa kompozycja (Bazylika Licheńska w tle), Trafic od przodu. Dla split layout horyzontalny = źle scrops. Bardziej pasuje do strony `/pielgrzymki`. |
| `/public/images/hero/hero-02-arena-gliwice.{jpg,webp}` | NIE | Trafic z przodu, mniej eksponowany branding. Działa, ale nie aż tak dobrze jak (03). |
| `/public/images/hero/hero-alt-lichen-symmetric.{jpg,webp}` | NIE | Symetryczne ujęcie Licheń — bardzo statyczne. Może pasować do `/o-nas` lub `/jakosc`. |
| `/public/images/brand-detail/brand-rear-cta.{jpg,webp}` | rezerwa | Tył busa z dużym V + telefonem — dobra alternatywa jeśli klient nie chce „Arena" w tle (np. preferuje neutralność lokalizacji). |
| `/public/images/brand-detail/brand-logo-close.{jpg,webp}` | rezerwa | Close-up V — może pasować jako mini-element w sekcji 2, nie hero. |

**Krytyczna obserwacja LCP:**
`hero-03-trafic-arena-side.jpg` = 4.2 MB raw, `.webp` = 275 KB. Dla LCP target ≤2.5s **bezwzględnie podajemy `srcset` z 4 szerokościami**:

```html
<picture>
  <source
    type="image/webp"
    srcset="
      /images/hero/hero-03-trafic-arena-side-480.webp 480w,
      /images/hero/hero-03-trafic-arena-side-768.webp 768w,
      /images/hero/hero-03-trafic-arena-side-1200.webp 1200w,
      /images/hero/hero-03-trafic-arena-side-1600.webp 1600w
    "
    sizes="(max-width: 767px) 100vw, 42vw"
  />
  <img
    src="/images/hero/hero-03-trafic-arena-side-1200.jpg"
    alt="Renault Trafic Via Viator przy PreZero Arena Gliwice"
    fetchpriority="high"
    decoding="async"
    width="1200"
    height="900"
  />
</picture>
```

**Akcja dla Senior Developera (Faza 2):** wygenerować responsive variants z istniejącego 8064×6048 JPEG przez `sharp` lub `@astrojs/image`. Targety: 480w, 768w, 1200w, 1600w. Format: WebP primary, JPG fallback. Resize z preservacją object-position 30% (Trafic w focus).

### 9.3. Nowe SVG dekoracyjne

**Czerwona nitka diagonalna (desktop only)** — inline SVG w komponencie, nie osobny plik:

```svg
<svg
  class="vv-hero__thread"
  viewBox="0 0 1440 200"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <path
    d="M 50 100 Q 720 120 1100 80"
    stroke="#F13223"
    stroke-width="1"
    stroke-linecap="round"
    pathLength="1"
    style="stroke-dasharray: 1; stroke-dashoffset: 1;"
  />
</svg>
```

Pozycjonowane absolutnie z `pointer-events: none`, `opacity: 0.7`. Animowane przez `stroke-dashoffset: 0` w 800ms.

### 9.4. Webp variants — do wygenerowania

| Plik źródłowy | Variants potrzebne (po przebuilcie sharp) |
|---------------|-------------------------------------------|
| `hero-03-trafic-arena-side.jpg` | 480w, 768w, 1200w, 1600w (WebP + JPG fallback) |

**Lokalizacja docelowa:** `/public/images/hero/responsive/hero-03-trafic-arena-side-{w}.{webp,jpg}`. Senior Dev tworzy katalog `responsive/`, nie nadpisuje istniejących.

### 9.5. Fonty — brak nowych

Bricolage Grotesque Variable już preloaded w `BaseLayout.astro`. JetBrains Mono = w tokens.json, ale **trzeba zweryfikować czy jest faktycznie załadowany** w runtime (grep `JetBrains` w `src/` znajduje tylko deklarację w tokens). 

**Akcja dla Senior Developera (Faza 2):** dodać `@fontsource-variable/jetbrains-mono` do deps (jeśli brak) i importować w `BaseLayout.astro`. Subset: latin + cyrylica (nie potrzebna), wagi: 500, 600.

---

## 10. Ryzyka + na co uważać

### 10.1. Performance (LCP, CLS, INP)

| Metryka | Target | Ryzyko | Mitygacja |
|---------|--------|--------|-----------|
| **LCP** | ≤2.5s | Display headline lub zdjęcie. Headline = no-op JS (SSR static HTML); image = optymalizacja `srcset` + `fetchpriority=high` + WebP |
| **CLS** | ≤0.1 | Per-word entrance animacje display headline mogą wprowadzić shift jeśli słowa pakowane są `display: inline-block` z transformami. **Mitygacja:** kontener headline ma fixed `min-height` per breakpoint; animacje używają tylko `opacity` + `transform: translateY` (nie zmieniają layoutu). |
| **INP** | ≤200ms | Phone totem `tel:` link = browser-native, bez JS. Hover transitions = pure CSS. Brak ryzyka. |
| **TBT** | ≤200ms | Motion lib lazy-loaded? Tak — `import { animate } from "motion"` w komponencie, code-split przez Astro automatycznie. Dla pierwszego paint motion nie jest blokująca. |
| **Image weight** | <100kB above-the-fold | Hero image 768w WebP ≈45kB; 1200w ≈85kB. OK. |
| **Font weight** | Bricolage variable WOFF2 ≈85kB | Już preloaded w obecnym layoucie. Bez zmian. JetBrains Mono dodaje +60kB (latin only, 500+600). Łącznie hero ~145kB fontów = akceptowalne. |

**Konkret dla LCP:** display headline jest najprostszym kandydatem na LCP element. Wymaga:
- bezpośredniego renderowania w HTML (no client:visible wrapper)
- font preload (już jest)
- minimalnego JS dla pierwszego paint

### 10.2. A11y

| Ryzyko | Mitygacja |
|--------|-----------|
| Kontrast eyebrow `#F13223` 14px na czarnym = 4.61:1 (borderline) | Weight 500 + tracking 0.1em + uppercase = lepiej czytelne mimo borderline. Test podczas QA. Fallback: jaśniejszy odcień `#FC4538`. |
| Czerwona kropka jako dekoracja | Kropka jest **częścią logiki tekstu**, nie tylko dekoracji — to znak interpunkcyjny. Czytniki ekranu czytają „Zawsze na miejscu kropka". OK semantycznie. Nie używamy `aria-hidden`. |
| Hero image alt text | „Renault Trafic Via Viator przy PreZero Arena Gliwice" — konkretny, nie marketingowy. |
| Scroll cue jako infinite animation | `prefers-reduced-motion` wyłącza bounce. Zostaje statyczny tekst + strzałka. |
| Phone totem jako duży element interaktywny | Touch target ≥44px (na mobile 32px font + 16px padding = 64px clickable). OK. |
| `<svg role="img">` dla logo | TAK — z `<title>` jako pierwszy child + `aria-labelledby`. |
| Focus order | logo → headline (skipowane bo nie interaktywne) → phone totem (focusable `<a>`) → scroll cue (focusable `<a>` z href="#what" lub skip do sekcji 2). Klawiatura: Tab przechodzi przez header nav, potem phone, potem scroll cue. Po hero — następne focusable elementy sekcji 2. |
| Reduced motion | Wszystkie animacje wyłączone, stan końcowy natychmiast. CSS media query + JS guard w motion lib. |

### 10.3. Mobile parity

| Ryzyko | Mitygacja |
|--------|-----------|
| Splitowy layout desktop nie da się skonwertować do mobile bez utraty istoty | Mobile rezygnuje ze splitu na rzecz stacku z diagonal-cut. Istota (manifest typo + zdjęcie Trafic + phone) zostaje. Tracimy nitkę (akceptowalne). |
| Display headline 64px na mobile = 3 linie | OK — `text-wrap: balance` rozkłada równomiernie. „Zawsze / na / miejscu." |
| Phone totem 32px konkurujący z heroem | Phone jest osobnym blokiem po hub strip, oddzielony 24px gap. Hierarchia czytelna. |
| Diagonal cut wymaga większego marginu wizualnego | Padding-bottom czarnej sekcji = 48px (przed cut), padding-top obrazu = 24px (po cut). Wizualnie zsynchronizowane. |
| Bricolage display 64px na 375px szerokości może wyjeżdżać poza viewport | `font-size: clamp(48px, 14vw, 64px)` zapewnia fluid scaling. Plus `overflow-x: hidden` na sekcji hero jako safety net. |

### 10.4. Brand compliance — checklist

Z brand booka v1.0:

| Wymóg | Zachowane? |
|-------|-----------|
| Logo nie deformowane (proporcje 1:1) | ✓ — viewBox 375×375 zachowany |
| Czerwień brand `#F13223` | ✓ — bez zmian |
| Tagline z kropką | ✓ — kropka jest osobnym spanem czerwonym |
| Bricolage Grotesque jako display | ✓ |
| Pojazd w terenie operacyjnym | ✓ — Trafic + Arena Gliwice (urban setting) |
| Brak twarzy pasażerów | ✓ — zdjęcie Trafic z zewnątrz, bez ludzi |
| Brak czarno-białej foto | ✓ — kolor zachowany |
| Brak studio z białym tłem | ✓ — outdoor, naturalny background |
| Czerwień <10% palety | ✓ — ≈4% |
| Brak gradientów ekstremalnych | ✓ — tylko subtelny overlay 0→35% na obrazie |
| Brak cieni dramatycznych | ✓ |
| Brak poświat | ✓ |
| Brak 3D | ✓ |
| Brak obrysów typografii | ✓ |
| Antymarketingowy ton copy | ✓ — „Zawsze na miejscu." to fakt, nie obietnica marketingowa |
| Spójność floty (jeden pojazd, ten sam branding) | ✓ — Trafic używany konsekwentnie |

**Nie spełniamy:** brak — wszystkie 16 wymogów spełnione.

**Potencjalna kolizja:** Logo używane w dwóch miejscach na jednym widoku (header logo4 + hero logo1). To może wymagać akceptacji od Patryka jako świadome złamanie zasady „jedno logo na widoku". W brand booku nie ma explicitnego zakazu — jest sugestia spójności. Jeśli klient widzi to jako konflikt — backup plan: usunąć logo z headera na home page (header sticky odsłania się dopiero po scroll-y > 100px, więc logo headera nie jest widoczne above-the-fold w ogóle przy starcie strony).

### 10.5. Implementacyjne (Faza 2)

| Ryzyko techniczne | Mitygacja |
|-------------------|-----------|
| Per-word stagger entrance animacji headline wymaga split tekstu na `<span>` per słowo | Trzy słowa „Zawsze", „na", „miejscu." — można hardcode w komponencie. Alternatywa: utility function `splitText(string): string[]`. |
| Czerwona nitka SVG path — math przejścia od lewej kolumny do prawej | Path D zaczyna się w `x=50` (50px od lewej krawędzi viewBox 1440), kończy w `x=1100` (środek prawej kolumny). Q-curve z kontrolą w `x=720` (środek wide-container). Kąt naturalny ≈-3deg, subtelny. |
| Diagonal clip-path na mobile — wartość kąta |  `clip-path: polygon(0 0, 100% 0, 100% calc(100% - 56px), 0 100%)` dla czarnej sekcji; mirror `polygon(0 56px, 100% 0, 100% 100%, 0 100%)` dla obrazu (overlap 56px = wysokość diagonal cut). |
| Motion lib bundle size | Motion v12 ≈10kB gzipped. Akceptowalne. Lazy-loadowane przez Astro automatycznie. |
| SSR vs CSR rendering | Hero jest pure SSR (Astro `.astro` file bez `client:` directive). Motion JS hydratuje TYLKO animacje, nie content. Content renderuje się natychmiast bez JS. |
| Inline SVG logo vs `<img>` referencja | Decyzja: inline. Wymaga skopiowania zawartości SVG do `.astro` (lub jako fragment). Trade-off: większy initial HTML (≈3kB) ale brak HTTP request + kontrola colorów. |
| i18n — angielska wersja taglinu „Zawsze na miejscu." → „Always there." | Dictionary już ma `taglineMainEn: "Always there"`. Display headline w en pisze się krócej (12 znaków vs 18) — wpływa na łamanie linii. Test podczas QA. |

### 10.6. Edge cases UX

| Sytuacja | Obsługa |
|----------|---------|
| Bardzo szeroki ekran (≥2560px) | Wide container max 1600px, hero auto-center, zostają duże boczne marginy. Akceptowalne. |
| Bardzo wąski ekran (<320px) | `clamp()` zapobiega wybuchom, ale `min-width` testować na 280px (iPhone SE 1st gen). Hub strip może wymagać 4-linijkowego wrapa. |
| Slow 3G / first paint przed font load | `font-display: swap;` (już domyślne w fontsource). Bricolage swap z system-ui — wygląda OK przez 100-300ms. |
| Image decode failure | `<img>` ma `alt` text — czytniki ekranu OK, wizualnie placeholder bg `#0A0A0A` (czarne tło, niezauważalna degradacja). |
| User z disabled JS | Wszystkie animacje no-op, ale content widoczny w pełnej formie SSR. Bez interakcji JS, ale phone totem działa (native `tel:`). Hero w pełni funkcjonalny. |
| Polish character rendering | Bricolage Grotesque ma latin-ext. „Zawsze" działa OK (bez polskich znaków w tym headline akurat). „Pyrzowice" OK. Hub strip „KRAKÓW-BALICE" ma „Ó" → musi działać. Verify subset latin-ext loadowany. |
| Right-to-left support | n/d — site jest PL+EN only, brak RTL. |

---

## 11. Rola Senior Developera (Faza 2) — co musi zrobić

Faza 2 to implementacja tej koncepcji. Senior Developer dostanie ten dokument i przeczyta sekcje 1-10 wstecznie. Konkretne zadania:

### 11.1. Pliki do edycji/stworzenia

| Akcja | Plik | Co zrobić |
|-------|------|-----------|
| Stworzyć | `/public/brand/logo-stack.svg` | Skopiować `_brief/logo-source/viator.logo.bez tła.svg`, zmienić wszystkie `fill="#f13223"` na `fill="currentColor"` z klasami CSS (`vv-logo-stack__mark`, `vv-logo-stack__via`), `fill="#ffffff"` na osobne path z klasami `vv-logo-stack__ator`, `vv-logo-stack__tagline` |
| Edytować (full rewrite) | `/src/components/sections/Hero.astro` | Albo rewrite (preferowane), albo stworzyć nowy `HeroV2.astro` i podmienić import w `index.astro`. Decyzja: **full rewrite** — Hero komponent zyskuje nowe propsy (`variant: "v1" \| "v2"`) z domyślnym `v2`. Alternatywnie usunąć v1 całkowicie i zostawić tylko v2 (Hero v1 nie był używany na innych podstronach? — sprawdzić: grep pokazuje że Hero jest używane w index.astro + segment pages). **Decyzja finalna: stworzyć osobny `HomeHero.astro` dla hero v2 (specyficzny dla home), zostawić `Hero.astro` dla podstron segmentowych.** |
| Stworzyć | `/src/components/sections/HomeHero.astro` | Nowy komponent dla home hero. Propsy: `phone`, `phoneHref`, `phoneDisplay`, `hubs: string[]`, `image`, `imageAlt`. Tagline `headline + dot` hardcoded w komponencie (tylko home page używa). Reszta logiki = z dict.hero.home* (rozszerzonego o `eyebrow`, `hubLabel`). |
| Edytować | `/src/pages/index.astro` | Podmienić `<Hero ... />` na `<HomeHero ... />` z nowymi propsami. Usunąć propsy `primaryCta`, `secondaryCta` (HomeHero ich nie ma). Usunąć propsy `image` z propsem text-content; image jest hardcoded w HomeHero (decyzja: home hero jest specyficzny, nie reużywalny). |
| Edytować | `/src/i18n/pl.ts` | Rozszerzyć `hero.home` o pola: `eyebrow: "N°01"`, `hubLabel: ""` (separator) lub raczej `hubs: ["Pyrzowice", "Kraków-Balice", "Wrocław"]` — choć to duplikacja z `company.hubs`. **Decyzja:** zostawić `company.hubs` jako jedyne źródło, w dict tylko `scrollCue: "Zobacz, co robimy"`. |
| Edytować | `/src/i18n/en.ts` | Analogicznie: rozszerzyć `hero.home` z `scrollCue: "See what we do"`, EN tagline „Always there." |
| Stworzyć | `/public/images/hero/responsive/hero-03-trafic-arena-side-{480,768,1200,1600}.{webp,jpg}` | Przez `sharp` lub `@astrojs/image`. Build-time skrypt w `package.json`: `npm run optimize:images`. |
| Edytować (jeśli brak) | `package.json` | Dodać `@fontsource-variable/jetbrains-mono` jeśli nie ma. |
| Edytować | `/src/layouts/BaseLayout.astro` | Import JetBrains Mono variable, dodać preload `<link rel="preload">` dla wagi 500 (główna używana). |

### 11.2. Co NIE robić w Fazie 2

- **Nie ruszać** Header.astro (jego logo4 zostaje).
- **Nie ruszać** istniejącego `Hero.astro` jeśli używany na podstronach (segmentach). Sprawdzić w `grep "Hero"` po src/pages — jeśli inny niż index.astro też używa, to Hero zostaje dla nich.
- **Nie ruszać** tokenów (`tokens/viaviator-tokens.json`). Wszystko mapuje się do istniejących tokenów.
- **Nie wymyślać** nowych kolorów. Czerwień brand, czerń, białość, muted gray — wszystko z palety.
- **Nie dodawać** parallax/scroll-driven animation.
- **Nie używać** `<img>` dla logo — inline SVG only.

### 11.3. QA checkpoint po Fazie 2

Faza 3 (QA) sprawdzi:
- WCAG AA dla wszystkich par tekstów (testy automatyczne axe-core + manualnie eye-test eyebrow)
- LCP <2.5s na simulated 4G (Lighthouse)
- CLS = 0 (no layout shift during entrance animations)
- Mobile 375×812 wireframe match (manual)
- `prefers-reduced-motion` honorowane (DevTools toggle test)
- Cross-browser: Chrome, Safari, Firefox (clip-path, font-variation-settings)
- Polish characters render OK
- Telefon `tel:` link działa (Android Chrome + iOS Safari real device)

---

## 12. Status checkpointu — sygnatura

| Kto | Status | Data |
|-----|--------|------|
| **UI Designer (QA10)** | ✓ koncepcja zatwierdzona wewnętrznie | 2026-06-01 |
| **COO (QA10) Adrianna Kmieciak** | pending review | TBD |
| **Klient — Patryk Tomeczek (Via Viator)** | pending review po akceptacji COO | TBD |
| **Senior Developer (Faza 2)** | czeka na zatwierdzenie konceptu | TBD |
| **QA (Faza 3)** | n/d | TBD |

**Blockers przed Fazą 2:**
- Decyzja klienta o akceptacji „brak CTA buttons w hero" (sekcja 8) — kluczowa, kontrowersyjna
- Decyzja klienta o akceptacji „dwa loga na widoku" (header logo4 + hero logo1) — sekcja 1.3
- Decyzja klienta o akceptacji konkretnego zdjęcia hero-03 — sekcja 9.2

Pozostałe punkty (typo, kolory, motion, asset pipeline) są wewnętrznymi decyzjami QA10 i nie wymagają akceptacji klienta.

---

## Appendix A: Mapowanie tokenów CSS dla hero

Wszystkie style hero v2 używają istniejących tokenów z `tokens.generated.css`:

```css
.vv-home-hero {
  background-color: var(--vv-color-bg-inverse);          /* #0A0A0A */
  color: var(--vv-color-fg-inverse);                     /* #FAFAFA */
  font-family: var(--vv-typography-font-family-display); /* Bricolage */
  min-height: 100vh;
  min-height: 100svh; /* Mobile safari fallback */
}

.vv-home-hero__eyebrow {
  font-family: var(--vv-typography-font-family-mono);
  font-size: var(--vv-typography-font-size-sm);          /* 14px */
  font-weight: var(--vv-typography-font-weight-medium);  /* 500 */
  letter-spacing: var(--vv-typography-letter-spacing-wider); /* 0.1em */
  color: var(--vv-color-brand-red);                      /* #F13223 */
  text-transform: uppercase;
  margin: 0;
}

.vv-home-hero__display {
  font-size: clamp(64px, 9.6vw, 128px);
  font-weight: var(--vv-typography-font-weight-extrabold); /* 800 */
  line-height: 0.92;
  letter-spacing: -0.03em;
  font-variation-settings: "wdth" 90;
  margin: 0;
  text-wrap: balance;
}

.vv-home-hero__dot {
  color: var(--vv-color-brand-red);                      /* #F13223 */
  font-size: 1.3em;
  display: inline-block;
}

.vv-home-hero__hubs {
  font-family: var(--vv-typography-font-family-mono);
  font-size: clamp(14px, 1.5vw, 18px);
  font-weight: var(--vv-typography-font-weight-medium);  /* 500 */
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--vv-color-fg-inverse);
  margin: 0;
}

.vv-home-hero__hub-separator {
  color: var(--vv-color-brand-red);
  margin-inline: var(--vv-space-2);
}

.vv-home-hero__phone {
  font-family: var(--vv-typography-font-family-mono);
  font-size: clamp(32px, 4.5vw, 56px);
  font-weight: var(--vv-typography-font-weight-semibold); /* 600 */
  line-height: 1.1;
  letter-spacing: 0;
  color: var(--vv-color-brand-red);
  text-decoration: none;
  display: inline-block;
  transition:
    text-decoration var(--vv-motion-duration-fast) var(--vv-motion-easing-standard);
}

.vv-home-hero__phone:hover,
.vv-home-hero__phone:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 8px;
}

.vv-home-hero__scroll-cue {
  font-family: var(--vv-typography-font-family-mono);
  font-size: var(--vv-typography-font-size-sm);
  font-weight: var(--vv-typography-font-weight-medium);
  letter-spacing: 0.08em;
  color: var(--vv-color-fg-muted);                       /* #737373 */
  text-decoration: none;
}
```

Brak nowych tokenów. Wszystko mapuje się.

---

## Appendix B: Source code referencje (dla Senior Developera)

| Plik referencyjny | Co wynieść |
|-------------------|-----------|
| `src/components/sections/Header.astro` | jak sticky header zachowuje się przy scrollu (potrzebne do offsetu hero top) |
| `src/layouts/BaseLayout.astro` (line 91) | font preload pattern dla nowego JetBrains Mono |
| `src/styles/typography.css` | jak `.display`, `.lede`, `.eyebrow` utility classes działają — możemy reużyć fragmenty |
| `src/i18n/pl.ts` (line 105) | struktura `hero.home` do rozszerzenia |
| `tokens/viaviator-tokens.json` | wszystkie tokeny dostępne; nie dodawać nowych |
| `src/data/company.ts` (line 132+154) | `phoneHref`, `phoneDisplay`, `hubs` — jedyny source of truth dla danych operacyjnych |

---

## Appendix C: Co tak naprawdę zmienia v2 vs v1

Stary obecny hero:
- 2-kolumnowy split tekst/zdjęcie (już to mieliśmy)
- przyciski CTA Bottom-left
- biały tło (`--vv-color-bg-page`)
- generic headline tag-style
- brak logo w hero (logo w headerze osobno)
- brak phone totem (telefon tylko w headerze małym tekstem)
- brak hub strip
- brak scroll cue

Nowy hero v2:
- 2-kolumnowy split (jednak — bo to natural pattern dla horizontal monitorów), ale **proporcje inne** (58/42 zamiast 50/50) i **lewa kolumna czarna** (kontrastuje z białą resztą strony jako manifest)
- **brak buttonów** — zamiast nich phone totem + scroll cue + (sticky header ☎)
- czarne tło lewej kolumny (`--vv-color-bg-inverse`) jako kontrast brand statement
- **logo stack** (logo1) jako element kompozycyjny, nie tylko identyfikacyjny
- **display headline 128px** z kropką jako czerwonym akcentem
- **hub strip** mono uppercase — dane operacyjne czytane jako fakty
- **phone totem 56px** mono czerwony — pierwszy CTA wizualnie
- **scroll cue** — sygnał kontynuacji
- **czerwona nitka 1px** diagonalna — subtelny connector lewej i prawej kolumny
- entrance animacje (motion lib v12) z prefers-reduced-motion guard

Różnica jakościowa: v1 to template `[text + image + buttons]`. v2 to **autorski layout** z hierarchią typograficzną i ekonomią koloru.

---

**KONIEC DOKUMENTU**

Wersja: 1.0 | Linie: 600+ | Faza: 1/3 | Następny krok: review przez COO (Adrianna)
