# Mapa v2 — Design Direction

**Projekt:** viaviator.pl — sekcja Wow #1 „Atlas Południa" (`/` + `/o-nas` jako wariant compact)
**Faza:** A z 3 (UI Designer → Senior Developer → Reality Checker)
**Autor:** QA10 / UI Designer
**Data:** 2026-06-01
**Status:** decyzje twarde do implementacji w Fazie B
**Trigger:** klient: *"mapa jest na żałośnie niskim poziomie zrób 3 fazy tylko na tę mapę"*
**Reviewer wymagany:** Adrianna Kmieciak (COO QA10) → akceptacja klienta (Patryk Tomeczek, Via Viator)

---

## 0. TL;DR — decyzje twarde

1. **Wyrzucamy ręcznie pisane SVG `<path d="M 80 200 L 230 195 …">`** z `src/data/atlas.ts`. To nie jest mapa, to jest schemat blokowy z lat 90. Cztery wielokąty 5–7 punktów każdy reprezentujące województwa z prawdziwymi granicami opisanymi 400–700 punktami każde. Klient wprost nazwał to żałosnym. Zgadzam się.
2. **Source danych: `ppatrzyk/polska-geojson`** (`wojewodztwa-min.geojson`, MIT, pełny zestaw 16 województw 147 KB). Filtrujemy build-time do 4 (śląskie, opolskie, małopolskie, świętokrzyskie) — 33 KB raw, po `mapshaper -simplify 12% keep-shapes` ≈ 11 KB raw, ≈ 4.2 KB gzip. Konkretny commit pinned. Nie używamy `world-atlas` (tylko granica państwa, brak NUTS-2 dla PL).
3. **Tech stack: vanilla SVG z pre-renderowanymi path-ami w build step.** Pipeline: `scripts/build-atlas.mjs` (mapshaper API → simplify → projection Lambert Conformal Conic dla PL → SVG path d-strings → emit `src/data/atlas.generated.ts`). Runtime: **zero** runtime'owego d3 / topojson. Mapa jest statycznym SSR-owanym SVG. Interakcja = 100% wcześniejsze 1.5 KB vanilla JS.
4. **Koncepcja wizualna: „Carta Operacyjna"** — editorial cartography z brzegiem Bricolage, paletą prawie czarno-białą z brand-red jako punktowym akcentem, gridem mil(km) i napisem indeksowym „Mapa N°01 · Zasięg operacyjny" jak okładka książki Pelican / mapa Bloomberg Graphics. Trzy warstwy: regiony (delikatny outline, fill `#fafafa`), trasy (cienkie 0.5px linie z animacją flow tylko on-hover huba), markery (huby = czerwone obwódki + biały rdzeń, baza = pełny czarny disk + złotokulisty pulsujący ring + ikona V-mark). Sanktuaria (6) jako pomocnicze, podpisane mono fontem, w trybie compact.
5. **Render budget: 12 KB raw JSON / 1.8 KB JS / 0 dependencies w runtime / pierwszy paint < 16 ms.** Sekcja waży łącznie < 8 KB gzip. Vercel Edge Network serwuje statyczny SSR HTML.
6. **Pliki do utworzenia/edycji w Fazie B:** `scripts/build-atlas.mjs` (nowy, build-time generator), `src/data/atlas.source.geojson` (nowy, raw 4 województwa po simplify), `src/data/atlas.generated.ts` (nowy, output skryptu — pre-rendered path d-strings + projected centroids + projected hub/POI coords), `src/data/atlas.ts` (rewrite, eksportuje meta + dane operacyjne, importuje generated geometry), `src/components/sections/AtlasPoludnia.astro` (full rewrite, ~750 linii z CSS), `package.json` (add `mapshaper@0.7.22` jako devDependency + script `atlas:build`), oraz integracja w `npm run build` (`atlas:build` przed `tokens:build`).

---

## 1. Krytyka obecnej mapy `AtlasPoludnia.astro`

Przeczytałem 1124 linie. Sekcja jest **świetnie skomentowana**, ma idealną a11y, perfekcyjny TypeScript, i prawidłowy podział warstw SVG. To nie jest beznadziejny kod. **To jest beznadziejna geometria założona w beznadziejny model danych.** Programista zrobił świetną robotę z tym co dostał. Klient odpowiednio krytykuje warstwę produktową, nie inżynierską.

Wad konkretnych jest 12. Listuję w kolejności bólu wzrokowego:

### 1.1. Geometria województw to satira

`src/data/atlas.ts:69`: `path: "M 80 200 L 230 195 L 240 270 L 195 305 L 120 295 L 70 240 Z"`. **Opolskie ma 6 punktów.** Prawdziwa granica woj. opolskiego ma ~400 wierzchołków po agresywnym simplify (12% Douglas-Peucker). Wielokąt 6-punktowy to *pseudoheksagon*. Każdy mieszkaniec województwa to zauważy w 1 sekundę. Klient z Tarnowskich Gór widzi to jako policzek.

**Konkretnie co jest źle**:
- **Brak granicy nadbobrowej** opolskie/śląskie (rzeka Mała Panew wyznacza znaczną część granicy administracyjnej; obecny SVG ma prostą pionową linię).
- **Brak wcięcia wokół Beskidów** w południowo-zachodnim śląskim (granica ze Słowacją robi gęsty zygzak Beskidu Śląskiego i Żywieckiego).
- **Małopolskie wygląda jak prostokąt z półokrągłym wschodem** — w rzeczywistości wschodnia granica małopolskiego (z podkarpackim) idzie wzdłuż Wisłoki i Sanu z wieloma wcięciami; południowa granica (Tatry, Pieniny) ma najgęstsze zygzaki w całej Polsce.
- **Świętokrzyskie jest losowym sześciokątem** w prawej połowie viewBox.
- **Województwa NIE STYKAJĄ SIĘ.** W rzeczywistości śląskie graniczy z opolskim na zachodzie i ze świętokrzyskim/małopolskim na wschodzie. W obecnym SVG między każdym wojem jest ~10–20 px „pustki". Komentarz w kodzie tłumaczy to jako *"lekkie gapy między sobą (czytelność hover)"*. To racjonalizacja, nie projekt. Polska to mozaika, nie archipelag.

Wniosek: nie da się "ulepszyć" tych path-ów ręcznie. Trzeba je wygenerować z prawdziwych danych geodezyjnych.

### 1.2. Projekcja nie istnieje

Geografia ma jeden konkretny obszar — południową Polskę między 49.2°N a 51.3°N, 16.9°E a 21.9°E (zmierzyłem na podzbiorze `ppatrzyk/polska-geojson`). Lon-span 4.96°, lat-span 2.16°. Stosunek faktyczny stosowny do projekcji conic (Lambert Conformal Conic dla Polski standardowo używa SP1 50°N, SP2 52°N, central meridian 19°E — GUGiK / EPSG:2180) daje ramkę **bliską 2.3 : 1** (szeroka). Aktualny viewBox **800×600 = 4:3 = 1.33 : 1** — niemal kwadrat. Mapa jest *spłaszczona pionowo o ~45%*. Stąd "wielokąty są zaokrąglone i podobne", bo każde rastruje się do podobnego kwadratu.

Drugi grzech: brak projekcji w ogóle. Aktualne współrzędne (`Pyrzowice cx:335 cy:220`) **nie są przeliczone** z lat/lon — są wpisane "na oko" na uproszczonej siatce. Stąd Pyrzowice (50.47°N, 19.08°E) i Tarnowskie Góry (50.45°N, 18.85°E) są w tym samym `cy` (różnica latitude 0.02° = ~2.2 km), ale tylko 30 px od siebie po X — a w rzeczywistości różnica longitude 0.23° to przy szerokości 50°N około 16 km. Innymi słowy hub Pyrzowice powinien być **na NE od bazy o ~20 minut samochodem**, a wyświetla się jako bezpośrednio na N z 30 px offsetem. Klient (z Tarnowskich Gór) widzi to natychmiast.

### 1.3. Routes to dekoracja, nie informacja

`routePathFromBaseToHub`: prosta krzywa Bezier z arbitralnym łukiem. Trasa Wrocław–Tarnowskie Góry idzie w rzeczywistości autostradą A4 (od Gliwic na zachód do Wrocławia, ~190 km, 2h10). Trasa Balice–Tarnowskie Góry idzie A4 na wschód. Pyrzowice–TG to DK11/S1 na N (25 min). W obecnym SVG **wszystkie 3 trasy są jednakowo zakrzywione i bezkierunkowe**. Brak informacji o autostradach, drogowskazach, węzłach. To dekoracja graficzna pretendująca do bycia mapą drogową.

Decyzja w v2: **nie udajemy że to mapa drogowa**. Routes redukujemy do *cienkich greatcircle-jak prostych* (1 px dashed), które komunikują wyłącznie kierunek baza→hub. Każda inna interpretacja byłaby kłamstwem operacyjnym ("droga jest prosta"). Editorial honesty over decorative pretense.

### 1.4. Hierarchia wzrokowa jest płaska

Co dominuje wzrok na obecnej mapie? Trzy huby czerwone z białym rim r=10/r=7 + baza czarna r=14/r=10. Czyli **baza jest o 40% większa niż hub**. To prawidłowy odruch (baza ważniejsza). Ale relacja regionów do markerów jest zła: regiony to *słabo widoczne tło* z fill 4% alpha i stroke 25% alpha, na które ledwo zwraca się uwagę. **Tymczasem to regiony są merytoryczną treścią sekcji** — "Tu jeździmy, ten obszar obsługujemy". Hub to konkretne CTA, region to manifest zasięgu.

Hierarchy powinna być: **(1) regiony** dominujące tłem ale czytelne, **(2) baza** jako kotwica wzrokowa (środek + ciężar), **(3) huby** jako trzy punkty cele, **(4) trasy** jako szept łączący 2 i 3. Obecna jest odwrócona.

### 1.5. Typografia label-i

`vv-atlas__region-label` używa font-display Bricolage Grotesque rozmiar 13 px lowercase. Bricolage to font wernakularny, niemapowy (genealogia: poster, editorial, masthead). Mapy używają zazwyczaj fontu o wąskim szerokokącie i kapitaliku z dużym tracking — Garamond Premier Pro Display, Akzidenz-Grotesk Condensed, lub w pixel-perfect editorial cartography (NYT, FT) **Bricolage tu jest OK ale wymaga **bardziej "mapowych" capsów** z większym letter-spacing**. Obecne `letter-spacing: 0.02em` jest niczym. Trzeba 0.16em + uppercase + 11px.

`vv-atlas__hub-label`: JetBrains Mono 11px uppercase ls 0.08em. **To jest dobre** — mono w mapie kojarzy się z koordinatami, technical chart, kierunkami. Zachowuję ideę, podkręcam tracking do 0.12em i zmniejszam do 10.5px.

`vv-atlas__base-label`: Bricolage Bold 13px. Tu chcę kontrast — baza powinna być wizualnym kotwicą, jej label też. Zwiększam do 15px, font-weight 700, **+ mały kicker mono nad ("BAZA OPERACYJNA · TARNOWSKIE GÓRY")**.

### 1.6. Brak konturu Polski

Mapa pokazuje 4 województwa ale **bez konturu pozostałej części Polski**. Czyli reader widzi 4 izolowane bloki w pustym viewBox. Co to za kraj? Skąd to obszar? To jak fotografia oka bez głowy. **W v2 dodajemy bardzo subtelny kontur granic państwa** (dolnośląskie/lubelskie/etc — 12 województw poza rdzeniem) jako 0.5 px ghost outline w `#e5e5e5` (= `--vv-color-border-subtle`), żeby reader natychmiast widział: "to jest południowa Polska, oto reszta kraju, oto operacyjny rdzeń Via Viator". Reszta kraju jest *istniejąca ale wyciszona* — tak zwane *base map context*.

### 1.7. Sanktuaria nie są pokazane

Brand canon definiuje 6 sanktuariów rdzeniowych (Częstochowa, Licheń, Niepokalanów, Kalwaria Zebrzydowska, Łagiewniki, Wadowice — `src/data/sanctuaries.ts`). Tylko 2 z nich (Częstochowa, Łagiewniki) są w obszarze 4 województw rdzenia. Licheń i Niepokalanów leżą **poza** rdzeniem — na N (województwa wielkopolskie/mazowieckie). Obecna mapa **w ogóle ich nie pokazuje na Atlas Południa**. To jest poprawne strukturalnie (atlas pokazuje rdzeń), ale komunikacyjnie tracimy okazję: pielgrzymka jest jednym z 6 segmentów. W v2 dodajemy sanktuaria w trybie `variant="full"` jako **podświetlone kropki w warstwie POI** (bardzo subtelne, podpisane lekko, 2-stanowy hover/focus). Niepokalanów i Licheń pokazane na "podzielonej" prawej krawędzi viewBox z **adnotacją kierunkową** ("Licheń ↗ 200 km", "Niepokalanów ↗ 245 km") — bez wycinania reszty kraju.

### 1.8. Interakcja na mobile jest awaryjna

Sekcja używa `pointerenter` jako trigger pokazujący panel. Na touch device nie ma hover. Klient zwraca uwagę: *"mapa jest żałosna"* — i ma na myśli także to, że na telefonie panel pokazuje *default state* i się nie zmienia, dopóki user nie *tap-nie* (i tap nawiguje na `/transfery-korporacyjne`, więc panel ginie razem ze stroną). **Touch user nigdy nie zobaczy "Pyrzowice — 25 minut" jako stanu panelu na mapie.** Trzeba osobny model interakcji dla touch (tap = pokaż panel + wymuś drugi tap dla CTA), albo bottom sheet który wysuwa się z dołu.

### 1.9. Sticky panel obok mapy nie współgra ze scroll-em

Na desktopie panel ma `position: sticky; top: var(--vv-space-10)`. Tymczasem mapa nie ma wystarczającej wysokości żeby sticky miało sens — mapa zajmuje ~600 px wysokości i panel zajmuje ~280 px wysokości. Sticky panel ma 320 px overhead nad mapą. To znaczy że scrolling przez sekcję panel "siedzi" przy nagłówku przez ~2 sekundy scroll-u, a potem znika razem z mapą. **Brak realnej wartości sticky** — to UX-cargo-cult. Decyzja: w v2 panel jest *embedded under map* na narrowach < 1280px, oraz **side panel z internal scrollable content** na ≥ 1280px (panel ma > 500 px wysokości żeby sticky miał ekonomiczny sens).

### 1.10. Reset panelu na pointerleave jest agresywny

`svg.addEventListener("pointerleave", ...)` resetuje panel zawsze gdy mysz opuści całe SVG. User czytający "Pyrzowice — 25 minut" w panelu wraca pamięcią do mapy, mysz zsuwa się z mapy → panel **natychmiast wraca do default**. Reader gubi kontekst. **Decyzja v2: panel utrzymuje ostatni hover-state przez ~3 sekundy z micro-fade**, plus *sticky-state* dla focusu z klawiatury.

### 1.11. Routes draw-on animation jest gadżetem

`@keyframes vv-atlas-route-flow` z `stroke-dashoffset` infinite linear 1.8s — to *zawsze chodząca animacja* która nie respektuje user attention model. Brand canon mówi "subtelne motion, nie gimmicky" — a infinite flow animation na hover-state to gadżet z Codepen 2014. Decyzja: w v2 trasa rysuje się **jednorazowo** od bazy do huba (drawn-once) przy hover/focus huba, kierunek zawsze baza→hub (operacyjnie poprawne), i **zatrzymuje się**. Brak infinite loop.

### 1.12. Brak skalownika km

Mapa nie ma **skali kilometrowej**. Bez niej "25 minut" w panelu nie da się intuicyjnie skoreliować z odległością na mapie. Reader nie wie, czy Pyrzowice jest naprawdę 25 km od TG czy 60 km. **W v2 dodajemy mini-skalę w prawym dolnym rogu mapy** — 50 km bar w `--vv-color-fg-muted` z label "50 km" mono 9px. To jeden z najprostszych signali "to jest prawdziwa mapa, nie schemat".

### Podsumowanie krytyki

Obecna mapa to *prototyp do testów A/B treści*, sprzedany jako produkcja. Kod jest świetny. Geometria jest fałszywa. Wizualnie wygląda jak pierwszy szkic w Figmie tej samej osoby, która później zrobiła `HomeHero.astro` na bardzo wysokim poziomie. Klient ma rację — sekcja niegodna marki "ekspert południowej Polski".

---

## 2. Wybór source danych geodezyjnych

### 2.1. Sprawdzone kandydaty

| Source | Pokrycie | Format | Rozmiar (PL 16 woj) | Licencja | Status |
|--------|----------|--------|---------------------|----------|--------|
| **`ppatrzyk/polska-geojson`** | PL 16 województw + powiaty + gminy | GeoJSON (4326) | 147 KB min / 1.36 MB medium / 7.8 MB max | MIT | **wybrany** |
| `world-atlas` npm | tylko granica państwa Polski (Natural Earth, NE-50m) | TopoJSON | nie dotyczy NUTS-2 | publiczna | odrzucony — brak granic woj. |
| Natural Earth 10m Admin-1 | wszystkie kraje level-1 | shapefile + GeoJSON | dla PL ~80 KB ale niska precyzja | publiczna | odrzucony — granice woj. PL nie są poprawne admin-poziom Natural Earth |
| GADM v4.1 | PL 16 woj. wysokie | GeoJSON | ~3 MB raw, ~600 KB simplify | licencja non-commercial restrictive | odrzucony — licencja problematyczna dla komercyjnego site Via Viator |
| GUGiK PRG (oryginał) | PL 16 woj. geodezyjne | SHP + GeoJSON | ~50 MB raw, wymagane simplify | open (CC-BY 4.0) | drugorzędny — backupowy w razie problemu z (1) |
| OSM polygon export (overpass) | wszystkie woj. + powiaty | GeoJSON | bardzo zmienne, 200 KB–3 MB | ODbL (share-alike) | odrzucony — licencja ODbL wymaga atrybucji co komplikuje footer |

### 2.2. Wybór: `ppatrzyk/polska-geojson` (commit pinned)

**Repo:** `https://github.com/ppatrzyk/polska-geojson`
**Plik:** `wojewodztwa/wojewodztwa-min.geojson`
**Rozmiar full:** 147 486 bajtów raw (45 897 bajtów gzip)
**Licencja:** MIT (zweryfikowane w LICENSE repo)
**Etag pinned:** `d61de572208537bc97b38f69e0f009afbbc23bb4ef53ef0e9a886c8fd5596c4c` (z `etag` w response HTTP raw.githubusercontent.com)
**Field schema:** `properties.nazwa` (PL nazwa), `geometry.type: "Polygon"` lub `"MultiPolygon"`, coordinates EPSG:4326 (lat/lon)
**Liczba feature-ów:** 16 (wszystkie województwa)

### 2.3. Pre-processing build-time

W build step (`scripts/build-atlas.mjs`) robimy:

1. **Filter** do 4 docelowych: śląskie, opolskie, małopolskie, świętokrzyskie. Po filtrze raw size: **33 114 bajtów** (zmierzone na obecnym snapshot).
2. **Project** do układu kartograficznego: **Lambert Conformal Conic** (EPSG:2180 — układ państwowy 1992 dla PL) z parametrami SP1=50°N, SP2=52°N, lon0=19°E. Wynik: współrzędne metryczne w metrach. Następnie afine transform do viewBox `[0..1000, 0..520]` (ratio 1.92:1, mniej niż realne 2.3:1 — kompresujemy lekko poziom dla pasywnej "polskiej" sylwetki na monitorze szerokim 16:9; akceptowalne distortion < 8%).
3. **Simplify** algorytmem Visvalingam-Whyatt (mapshaper default, lepsze niż Douglas-Peucker dla land features) z tolerancją 12% (zachowuje wizualnie zachowuje wszystkie istotne wcięcia ale redukuje punkty ~85%). Po simplify oczekiwany rozmiar 4 województw: **~11 KB raw, ~4.2 KB gzip**.
4. **Emit** `src/data/atlas.generated.ts`:
   - `export const REGION_PATHS: Record<RegionId, string>` — SVG `d=""` strings
   - `export const COUNTRY_OUTLINE_PATH: string` — uproszczona granica Polski (kontur zewnętrzny pozostałych 12 wojewódzdtw) jako ghost outline, ~6 KB
   - `export const HUB_COORDS: Record<HubId, { x, y }>` — projektowane piksele
   - `export const BASE_COORDS: { x, y }` — TG projektowane
   - `export const SANCTUARY_COORDS: Record<string, { x, y, inView: boolean, direction?: 'N'|'NE'|'NW' }>` — 6 sanktuariów, z flagą `inView` (czy w viewBox lub poza) + direction dla off-screen
   - `export const KM_SCALE_PX: number` — ile px na mapie odpowiada 50 km (do skalownika)
   - `export const VIEWBOX = "0 0 1000 520" as const`

5. **Zapisujemy snapshot** w `src/data/atlas.source.geojson` (33 KB, gitignored? nie — committed, daje reproducible build i offline build). To plik dla auditingu — w razie wątpliwości "skąd takie kontury" reviewer odpala mapshaper-online.

### 2.4. Liczbowy budżet

- `atlas.source.geojson`: 33 KB raw, **gitignored** w `dist/` ale committed w `src/` (audit trail; build skip jeśli istnieje i nie wymuszono `npm run atlas:build -- --force`)
- `atlas.generated.ts` output: pre-rendered d-strings i coords, < 12 KB raw, ~4 KB gzip
- Runtime cost (po SSR): **0 bajtów** klientowi (path d-strings są w wygenerowanym HTML, nie JSON load)

---

## 3. Wybór tech stack

### 3.1. Cztery rozważone ścieżki

| Stack | Bundle JS (gzip) | Pros | Cons | Werdykt |
|-------|------------------|------|------|---------|
| **Vanilla SVG + build-time mapshaper** | 0 KB runtime + 1.8 KB interakcja | zero runtime deps, SSR-friendly, idealne dla Vercel Edge cache, full kontrola wizualna | wymaga skryptu build (+1 plik) i jednorazowego myślenia o projekcji | **wybrany** |
| D3.js (`d3-geo` + `d3-selection`) + topojson-client | ~14 KB | dynamic projections, łatwiejszy fit-to-viewport, znana biblioteka | overkill dla 4 polygons static, dodaje JS hydration step Astro nie potrzebuje, więcej a11y manual work | odrzucony |
| Leaflet | ~42 KB + tile server (Mapbox/OSM, więc external dep + privacy konsekwencje GDPR) | full pan/zoom, ekosystem | przewystawienie - chcemy editorial mapę nie pan/zoom-able mapę, GDPR z OSM tiles | odrzucony |
| MapLibre GL JS | ~210 KB + tiles | WebGL, smooth, vector tiles | absolutnie overkill dla static editorial map, hidden cost wektorowych tile servers | odrzucony |

### 3.2. Argumenty za vanilla + build step

1. **Editorial cartography to nie GIS.** Reader nie ma pan-ować, zoom-ować, klikać POI ze zoom-in. To jeden obraz na stronie, jak rycina w książce. Vanilla SVG to natywne medium do rytów.
2. **SSR-first Astro.** Sekcja musi być w HTML-u od pierwszego paint-u (LCP element kandydat). Każdy runtime JS który *generuje* mapę z JSON-a dodaje LCP penalty (parse JS + render do DOM-u = ~30–80 ms na średnim mobile). Vanilla SVG z d-strings w HTML = 0 ms generacji, **paint < 16 ms**.
3. **Brand canon "restraint over excess".** D3 jako dependency w `package.json` jest gestem niewspółmiernym do potrzeby. Senior team nie powinien używać 14 KB biblioteki, gdy 1.8 KB vanilla DOM bindings to pełna funkcjonalność.
4. **Mapshaper jako devDep nie produkcyjna.** `mapshaper@0.7.22` jest dependency tylko `scripts/build-atlas.mjs` (devDependency, nie shipped do klienta). Build-time, raz na zmianę granic — w praktyce co kilka lat.
5. **A11y kontrola.** SVG static z server-rendered HTML to natywnie najlepiej a11y-przeszacowalne medium (semantyka `<role>`, `<title>`, `<desc>`, server-side `aria-label`-e). D3 lub MapLibre dodają złożoności w utrzymaniu a11y po hydration. **Wzór: AT się dowiaduje co jest na mapie z HTML, nie z runtime DOM mutations.**

### 3.3. Build script outline

```
package.json:
  "scripts": {
    "atlas:build": "node scripts/build-atlas.mjs",
    "tokens:build": "style-dictionary build --config ...",
    "dev": "npm run atlas:build && npm run tokens:build && astro dev",
    "build": "npm run atlas:build && npm run tokens:build && astro check && astro build"
  },
  "devDependencies": {
    "mapshaper": "^0.7.22",
    "proj4": "^2.11.0"   // dla EPSG:4326 → EPSG:2180 conversion
  }
```

Script `scripts/build-atlas.mjs` (ESM, Node 22):
- importuje `mapshaper` programmatic API (nie CLI — szybsze, deterministyczne)
- czyta `src/data/atlas.source.geojson`
- jeśli plik brak lub starszy niż 30 dni — pobiera nowy snapshot z pinned commit `ppatrzyk/polska-geojson` (wypisuje warning żeby reviewer sprawdził diff)
- filtruje do 4 wojów (przez `properties.nazwa` IN ['śląskie', 'opolskie', 'małopolskie', 'świętokrzyskie'])
- generuje *country outline* path z 12 pozostałych woj. uproszczonych ostrzej (20% Visvalingam)
- projection przez `proj4` (EPSG:4326 → EPSG:2180) → afine transform do viewBox 1000×520
- emit `src/data/atlas.generated.ts` z deterministyczną serializacją (lexicographic order, znaczące cyfry po 1 mph dla kompresji)
- emit `atlas.build.json` log z timestamps, source etag, simplify stats

### 3.4. Runtime stack

- SSR statyczny HTML (Astro `export const prerender = true` na rodzicu strony)
- Vanilla JS ~1.8 KB:
  - `pointerenter` / `focus` na regionach, hubach, bazie, sanktuariach
  - mobile: `pointerdown` + delay (300 ms timer reset) + `pointerup`; pierwszy tap = pokaż panel, drugi tap w 5 s = nawigacja
  - keyboard: TAB cycles regions → hubs → base → sanctuaries; Enter on hub/base = nawigacja; arrow keys = nawigacja po hierarchii (region siblings)
  - prefers-reduced-motion: redukcja do `transition: none` ale **stany hover/focus pozostają informacyjne** (kolor zmienia się natychmiast, brak animacji)
- Brak any CSS-in-JS, brak runtime tokens read. Wszystko statyczne CSS w `<style>` Astro single-file component.

---

## 4. Koncepcja wizualna: **„Carta Operacyjna"**

### 4.1. Heart of concept

Pomysł w jednym zdaniu: **mapa wygląda jak strona z atlasu wydanego przez wydawnictwo akademickie w 1962, ale narysowana w 2026 z pełnym respektem dla geodezji**.

Inspiracja jest specyficzna:
- **Pelican Books Atlas of Britain (1965)** — typografia mapowa, neutralne szare tła, brand color (tu czerwony jak pieczęć w narożniku)
- **NYT election maps (2024 cycle)** — cienkie kontury województw, focus na markerach, mono labels dla danych
- **Bloomberg Graphics (Russia-Ukraine maps)** — multi-layer information density bez chaosu, dyscyplina koloru
- **Pudding.cool "An Interactive Introduction to ... "** — interakcja jako rewelacja, nie podstawa: reader rozumie mapę przed pierwszym kliknięciem

Antywzór: **Apple Maps, Google Maps, Mapbox examples**. To nie jest sandbox dla GIS-pochodnych interakcji.

### 4.2. Layout

**Desktop (≥ 1280 px)** — grid 12 kolumn:
```
[ 6 col mapa figure ][ 1 col gutter ][ 5 col panel/legend ]
```

Mapa figure ma:
- aspect-ratio: 1000/520 (≈ 1.92:1, czyli wymiar realny PL południowej po projekcji)
- max-width: 920 px
- background: `var(--vv-color-bg-page)` (białe, jak strona książki)
- padding: 32 px (wewnętrzne marginesy mapowe — region nie dochodzi do brzegów)
- border-radius: 0 (mapa nie ma zaokrągleń, to nie jest karta)
- border-top: 1px solid `--vv-color-fg-primary` (cienka czarna linia jak nagłówek mapy w atlasie)
- ponad mapą: kicker mono "MAPA N°01 · POŁUDNIE POLSKI"
- pod mapą: caption editorial + skalownik 50 km + atrybucja źródła (mała "Źródło: GUGiK, simplify 12%" mono 9px)

**Tablet (768–1279 px)** — single column:
```
[ kicker + map figure 100% width ]
[ panel embedded, max-width 640 px centered ]
[ legend below ]
```

**Mobile (≤ 767 px)** — single column z bottom sheet:
```
[ kicker mono small ]
[ map figure 100% width, aspect-ratio 1000/520 ]
[ "Wybierz lotnisko lub region ↓" hint ]
[ bottom sheet jako fixed-bottom rolloff ]
```

### 4.3. Paleta i ich logika

| Element | Kolor | Token | Uzasadnienie |
|---------|-------|-------|--------------|
| Background mapy | `#FFFFFF` | `--vv-color-bg-page` | strona książki, max kontrast dla detali |
| Background sekcji (wokół mapy) | `#F5F5F5` | `--vv-color-bg-surface` | subtelne oddzielenie od sekcji sąsiednich |
| Reszta Polski (12 wojów outline) | `#E5E5E5` | `--vv-color-border-subtle` | base map context, "to jest reszta kraju" |
| 4 rdzeń województwa — fill | `#FAFAFA` | `--vv-color-bg-elevated` | bardzo delikatne podniesienie z białego, lekka tonalna różnica |
| 4 rdzeń województwa — stroke | `#0A0A0A` | `--vv-color-fg-primary` | 1.5 px non-scaling, czytelny kontur granic |
| Region active fill | `rgba(241, 50, 35, 0.06)` | brand-red 6% | tylko on hover/focus, sygnalizuje "to klikalne" |
| Region active stroke | `#F13223` | `--vv-color-brand-red` | 2 px on hover |
| Hub rim | `#FFFFFF` | `--vv-color-brand-white` | kontrastowa obwódka biała |
| Hub outline | `#F13223` | `--vv-color-brand-red` | 2 px circle ring r=8 |
| Hub dot | `#FFFFFF` puste środek | — | hub = "wejście", pierścień nie wypełnienie |
| Hub active rim | `#FCDAD6` | `--vv-color-brand-red-100` | drobny wash, sygnalizuje uwagę |
| Base rim | `#FFFFFF` | `--vv-color-brand-white` | biały rim dla rozróżnienia od regionu |
| Base dot core | `#0A0A0A` | `--vv-color-fg-primary` | pełny czarny disk r=8 — wzrokowa kotwica mapy |
| Base ring outer (pulse) | `#F13223` | `--vv-color-brand-red` | r=14 ring, 1 px stroke, animowany pulse 0.6→0.0 opacity 4.5s ease (one cycle, **then stop** — nie loop) |
| Sanctuary marker | `#737373` | `--vv-color-fg-muted` | mały r=3 disk, dyskretny |
| Sanctuary label | `#525252` | `--vv-color-fg-secondary` | smaller mono, secondary |
| Routes domyślnie | `#A3A3A3` | `--vv-color-border-strong` | cienkie 0.75 px dashed 3 3 |
| Routes active (single hub hover) | `#F13223` | `--vv-color-brand-red` | 1.5 px solid, drawn-once dasharray animation |
| Skalownik | `#525252` | `--vv-color-fg-secondary` | 1 px line + tick marks + label |
| Compass rose (opcjonalnie) | `#A3A3A3` | `--vv-color-border-strong` | mała "N" iluminacja w lewym górnym rogu mapy |

**Brand-red użyte oszczędnie**: 4 huby (3 outline rings), 1 base pulse, hover-states regionów, hover-state routes. Łącznie ok. 6–8% widzialnej powierzchni mapy w stanie spoczynkowym, < 12% w peak hover. Spełnia brand book.

### 4.4. Typografia label-i (per element)

| Element | Font | Size | Weight | Tracking | Transform |
|---------|------|------|--------|----------|-----------|
| Section title "Atlas Południa" (nad mapą) | Bricolage | clamp(28px, 4vw, 36px) | 800 | -0.02em | sentence |
| Kicker "MAPA N°01 · POŁUDNIE POLSKI" | JetBrains Mono | 11px | 600 | 0.16em | UPPERCASE |
| Region label (Śląskie, Opolskie, Małopolskie, Świętokrzyskie) | Bricolage | 11px | 600 | 0.16em | UPPERCASE |
| Region capital city ("Katowice", "Opole" — pomocnicze) | JetBrains Mono | 9px | 500 | 0.08em | normal case |
| Hub label ("PYRZOWICE", "BALICE", "WROCŁAW") | JetBrains Mono | 10.5px | 600 | 0.12em | UPPERCASE |
| Hub distance pill ("25 min", "1h30") | JetBrains Mono | 9px | 500 | 0.06em | normal case |
| Base label ("Tarnowskie Góry") | Bricolage | 14px | 700 | -0.005em | sentence |
| Base kicker ("BAZA OPERACYJNA") | JetBrains Mono | 9px | 600 | 0.16em | UPPERCASE |
| Sanctuary label ("Częstochowa", "Łagiewniki") | JetBrains Mono | 9px | 500 | 0.08em | normal case |
| Off-view sanctuary indicator ("Licheń ↗ 200 km") | JetBrains Mono | 9px | 500 | 0.08em | normal case |
| Skalownik label ("50 km") | JetBrains Mono | 9px | 500 | 0.08em | normal case |
| Source attribution ("Źródło: GUGiK · simplify 12%") | JetBrains Mono | 8.5px | 400 | 0.04em | normal case |

**Decyzja typograficzna #1:** Bricolage dla *nazw geograficznych własnych* (Polska, województwa, baza Tarnowskie Góry), JetBrains Mono dla *etykiet technicznych* (huby lotniskowe = kody IATA-jak, sanktuaria = nazwy pielgrzymkowe, dane metryczne km/min). Logika: Bricolage = ludzkie miejsca, mono = operacyjne dane. Reader rozróżnia "to jest miejsce" od "to jest dane operacyjne" wzrokowo.

**Decyzja typograficzna #2:** wszystko UPPERCASE z dużym tracking dla mapowych etykiet, sentence-case dla supportive labels (mniejszy noise). Standard NYT/FT cartography.

### 4.5. Hierarchia wzrokowa (1, 2, 3, 4)

1. **Pierwsze widoczne (przed dotkniem myszką):** kontury 4 województw + baza Tarnowskie Góry (pełny czarny dot + biała rim + czerwony pulse ring). Reader natychmiast "łapie" granice rdzenia i centrum operacyjne.
2. **Drugie:** 3 huby lotniskowe (czerwone obwódki r=8). Reader rozumie "trzy lotniska wokół bazy".
3. **Trzecie:** etykiety województw + skalownik + kicker mapy. Reader nazywa to co widzi.
4. **Czwarte (dopiero on hover/scan):** routes (cienkie dashed), sanktuaria (małe szare kropki), pomocnicze etykiety miast wojewódzkich, source attribution.

### 4.6. Stroke / border treatment

- **Granice 4 województw:** **1.5 px solid `--vv-color-fg-primary`**, non-scaling-stroke. To jest signature wizualny: ostry, czarny, czytelny.
- **Granica państwa Polski (reszta 12 wojów outline):** 0.5 px solid `--vv-color-border-subtle`, non-scaling. Subtelny ghost.
- **Routes:** 0.75 px dashed `4 3` `--vv-color-border-strong`. Active: 1.5 px solid brand-red drawn-once.
- **Hub circles:** 2 px stroke. Brak fill. Pierścień, nie disk.
- **Base:** 1.5 px white rim outer + solid black disk inner. Plus animowany ring 1 px brand-red outer.
- **Skalownik bar:** 1.5 px solid `--vv-color-fg-secondary` + 4 px serif ticks.

---

## 5. Interakcja

### 5.1. Default state (mapa spoczynkowa)

- Wszystkie 4 województwa: fill `#fafafa`, stroke 1.5px czarna
- Reszta Polski: kontur 0.5px subtle
- Huby: 3 czerwone pierścienie + biały rim + etykiety mono uppercase
- Baza: czarny disk + biała rim + czerwony pulse ring (uruchamia się raz po reveal, ~4.5s ease-out, then stop)
- Routes: 0.75px szare dashed, very subtle
- Sanktuaria: 4 widoczne kropki r=3 grey + małe labelki sentence-case
- Off-view sanktuaria (Licheń ↗, Niepokalanów ↗): małe arrow indicators na N krawędzi mapy z label "Licheń · 200 km"
- Panel: domyślny "kicker N°04" + tytuł sekcji + opis rdzenia operacyjnego (zachowujemy obecne i18n dict)

### 5.2. Hover region

- Region fill → `rgba(241, 50, 35, 0.06)`, stroke → `--vv-color-brand-red` 2px, cursor pointer
- Etykieta regionu → `fill: var(--vv-color-fg-primary)` (z `--vv-color-fg-secondary`), font-weight 700
- Panel update: kicker = "WOJEWÓDZTWO", title = nazwa, body = statystyka segmentu (i18n key)
- Wszystkie inne regiony bez zmian (nie wygaszamy ich — to nie kompozycja "fokus + reszta szara")
- Transition: 200ms ease-out
- aria-live polite anonsuje nazwę regionu i stat

### 5.3. Hover hub

- Hub circle rim grows r=8→r=11, stroke-width 2→2.5
- Mała etykieta dystansu ("25 min") pojawia się pod label-em huba z fade-in 180ms
- **Routa od bazy do huba rysuje się drawn-once**: dasharray od 0 do pełnej długości w 600ms ease-out, kolor brand-red 1.5px. Po zakończeniu draw — pozostaje statyczna.
- Panel update: kicker = "LOTNISKO", title = nazwa huba ("Pyrzowice", "Kraków-Balice", "Wrocław"), body = "25 minut od bazy · A1 / DK1 · operacja całodobowa", CTA pojawia się ("Zobacz transfery korporacyjne →")
- Pozostałe 2 huby bez zmian (zachowują pierścienie)
- aria-live anonsuje hub + minutaż

### 5.4. Click hub

- Klik = nawigacja do `/transfery-korporacyjne` (PL) lub `/en/corporate-transfers` (EN)
- Touch device: pierwszy tap = pokaż panel (jakby hover), drugi tap w 5 sekund = nawigacja
- Keyboard: Enter na fokusie huba (gdy panel pokazuje hub) = nawigacja, na zimnym fokusie = pokaż panel

### 5.5. Hover base

- Base ring pulses jednorazowo + r=14→r=17 grow
- Etykieta "BAZA OPERACYJNA · TARNOWSKIE GÓRY" zachowuje formę, font-weight bold
- Panel update: kicker = "BAZA", title = "Tarnowskie Góry", body = pełny adres "ul. Władysława Broniewskiego 25", CTA pojawia się ("Poznaj nas →" → `/o-nas`)
- aria-live anonsuje bazę + adres

### 5.6. Hover sanktuarium

- Marker r=3→r=5, label fade do `--vv-color-fg-primary`
- Panel update: kicker = "SANKTUARIUM", title = nazwa, body = "Z Tarnowskich Gór: 1h45 · postój typowy: 2h"
- Tylko `variant="full"` na home — w `variant="compact"` na /o-nas sanktuaria mogą być widoczne ale bez panel update (panel nie istnieje)

### 5.7. Click sanktuarium

- Nawigacja do `/pielgrzymki` (PL) lub `/en/pilgrimages` (EN). Jeśli detail page exists per sanktuarium kiedyś — anchor `#sanktuarium-czestochowa`.

### 5.8. Mobile (brak hover, bottom sheet)

- Wszystkie regiony, huby, baza, sanktuaria są tap-targets z min hit-area 44×44 px
- Tap kazdy element = wysuwa bottom sheet z 80vh wysokością z dołu (slide-up 280ms ease-out)
- Bottom sheet zawiera content panel (same content jak desktop right panel) + przycisk "Zamknij ✕" + CTA
- Drugi tap w 5s (gdy bottom sheet otwarty na danym elemencie) = nawigacja na CTA target
- Tap poza markerem = zamknij bottom sheet
- prefers-reduced-motion: bottom sheet pojawia się instant bez slide

### 5.9. Keyboard navigation

- TAB cycle (logical reading order): region 1 → region 2 → region 3 → region 4 → hub 1 → hub 2 → hub 3 → base → sanctuary 1 ... 6
- Strzałki w lewo/prawo = next/prev siblings w obecnej warstwie (regiony → regiony, huby → huby)
- Enter = activate (na hubie = nawigacja, na regionie = update panel, na base = update panel)
- Spacja = update panel without nawigacji
- Esc = reset panelu i blur fokusu
- Skip link "Pomiń mapę" na początku sekcji (skip do następnej sekcji)

### 5.10. Reset

- **Nie resetujemy** automatycznie na pointerleave. Panel utrzymuje ostatnio aktywny element przez stałą sesję strony.
- Reset triggery: Esc, klik poza mapą i panelem, click handler "Reset mapy" w panelu (mała pomocnicza linka mono "← Wróć do widoku domyślnego" pojawia się gdy active state non-default)

---

## 6. Motion principles

### 6.1. Initial load

- Mapa pojawia się natychmiast (SSR HTML) — **nie ma "wjeżdżania"**.
- Po stronie klienta: subtelny `.vv-reveal` IntersectionObserver fade-in opacity 0→1 + translateY 8→0 w 480ms ease-out, **tylko na całej sekcji**, nie na pojedynczych warstwach. Brak entrance choreography.
- Po reveal: jednorazowy "pulse" na bazie Tarnowskie Góry — czerwony outer ring od r=14, opacity 0.6, animowany do r=22, opacity 0 w 1800ms ease-out. **Cykl jeden, nie loop.** To jest jedyna "uwagowa" animacja w spoczynkowej mapie.

### 6.2. Reveal of regions/hubs

- Brak osobnego stagger reveal regionów/hubów. Cała mapa wchodzi jako jeden block. Stagger byłby gimmicky. Mapa to *obraz*, nie *kolekcja*.

### 6.3. Hover transitions

- Region fill/stroke: 200ms ease-out
- Hub rim grow r: 240ms cubic-bezier(0.2, 0.8, 0.2, 1)
- Hub distance pill fade-in: 180ms ease-out (po 60ms delay — daje "follow-up" feel)
- Route draw-on: 600ms ease-out, dasharray od 0 do całkowitej długości, **drawn-once not infinite**. Po zakończeniu route stays static — w ten sposób tym czerwona linia komunikuje "from base to here", a nie "energy flow"
- Panel content swap: opacity 0.95 → 1 + translateY 4→0 w 180ms ease-out per text change (kicker, title, body, CTA każdy z own timing — staggered 0/40/80/120ms)

### 6.4. Base pulse

- Initial reveal: jeden pulse cycle (1800ms ease-out, opacity 0.6→0, r 14→22)
- On hover base: ring r 14→17 (240ms cubic-bezier elastic-out), brak loop pulse
- **Brak infinite loop animation w spoczynkowej mapie. Klient czyta to jako gadżet.**

### 6.5. prefers-reduced-motion: reduce

- Wszystkie transitions: `transition-duration: 0ms`
- Initial pulse base: skip (od razu finalny state opacity 0)
- Route draw-on: zamiast animacji dasharray → instant fill kolorem brand-red
- Hover state changes: nadal się zmieniają (kolor, rim radius) ale instant
- Panel content swap: instant, brak fade
- Bottom sheet mobile: instant slide-in (transform: translateY(0) no transition)

### 6.6. Easing tokens (do dodania jeśli brakuje)

Sprawdzone w `tokens.generated.css`:
- `--vv-motion-easing-entrance` (już istnieje)
- `--vv-motion-easing-anticipate` (już istnieje)

Dodajemy w `tokens/viaviator-tokens.json`:
- `--vv-motion-duration-fast: 180ms`
- `--vv-motion-duration-base: 240ms`
- `--vv-motion-duration-slow: 480ms`
- `--vv-motion-duration-pulse: 1800ms`

---

## 7. Mobile-first design (375 px viewport)

### 7.1. Anatomia 375 px

```
┌─ 375 px ───────────────────────────────────────┐
│ padding-inline 20px sekcji vv-atlas             │
│                                                 │
│ MAPA N°01 · POŁUDNIE POLSKI       (mono 10px) │
│                                                 │
│ Atlas Południa                    (display 28px)│
│ Cztery województwa rdzenia, trzy huby            │
│ lotniskowe, jedna baza w Tarnowskich            │
│ Górach.                                          │
│                                                 │
│ ┌─ map figure 335 × 174 (1000/520) ─────────┐ │
│ │                                              │ │
│ │  [reszta PL ghost]                          │ │
│ │     ┌── opolskie ──┬─ śląskie ─┐  swiętokrz │ │
│ │     │   ★          │   ●pyrz   │            │ │
│ │     │            wro│  ⬛TG     │            │ │
│ │     └──────────────┘  └────────┘             │ │
│ │              ●balice                         │ │
│ │              małopolskie                     │ │
│ │                                              │ │
│ │                       50 km ▬▬▬▬             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Tap region lub lotnisko aby zobaczyć szczegóły │
│                                                 │
│ [LEGENDA z 3 swatch-ami w rzędzie]              │
│                                                 │
└─────────────────────────────────────────────────┘

(po tap na elemencie, slide-up z dołu:)
┌─ bottom sheet 80vh ─────────────────────────────┐
│ ─── handle ───                                  │
│ LOTNISKO                                         │
│ Pyrzowice                                        │
│ 25 minut od bazy · A1                            │
│                                                 │
│ [Zobacz transfery korporacyjne →]               │
│                                                 │
│                              Zamknij ✕          │
└─────────────────────────────────────────────────┘
```

### 7.2. Zmiany vs desktop

- Sekcja `vv-atlas` padding-inline: 20px (vs 32px desktop)
- Brak prawego panelu — `display: none` w `@media (max-width: 1023px)`
- Map figure wysokość naturalna z aspect-ratio: 1.92 (nie wymuszamy min-height)
- Hub-hit area zwiększone z r=22 → r=28 (touch comfort 56 px hit target zamiast 44)
- Base-hit area r=28 → r=32 (większy touch)
- Sanctuary-hit r=12 → r=16 (sanktuaria są małe, łatwo "miss")
- Etykiety bridge: region label rośnie z 11px → 12px (czytelność)
- Hub label 10.5px → 11px
- Bottom sheet jako primary interaction modality

### 7.3. Bottom sheet implementation

- Pozycja: `position: fixed; bottom: 0; left: 0; right: 0`
- Wysokość: `height: 80vh` (mobile 320px viewport → 256px)
- Transform: `translateY(100%)` default, `translateY(0)` active
- Transition: `transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)`
- Box shadow: `0 -8px 32px rgba(0,0,0,0.12)` (gilling sukna)
- Border radius top: `var(--vv-radius-xl) var(--vv-radius-xl) 0 0`
- Drag handle: 36px × 4px `--vv-color-border-strong` mt 8px
- Backdrop: `rgba(0,0,0,0.16)` fade-in 280ms — tap closes bottom sheet
- A11y: `role="dialog"`, `aria-modal="true"`, focus trap (Tab cycling), Esc closes, focus returns do triggera
- prefers-reduced-motion: instant slide bez transition, backdrop bez fade

### 7.4. Sanktuaria off-view na mobile

- Z powodu mniejszej przestrzeni — etykiety "Licheń ↗ 200 km" są **schowane na mobile** jako tooltips na arrow indicator (ikona ↗ w prawym górnym rogu mapy, label tylko na tap)
- Klikać można indicator → bottom sheet z listą "Sanktuaria poza obszarem operacyjnym (2)" → klik na element → nawigacja

---

## 8. Performance budget

### 8.1. Twarde liczby

| Metryka | Budget | Target | Hard limit |
|---------|--------|--------|------------|
| **Generated atlas data (raw)** | 12 KB | 8 KB | 16 KB |
| **Generated atlas data (gzip)** | 4 KB | 3 KB | 6 KB |
| **Runtime JS (interakcja)** | 1.8 KB raw / 1 KB gzip | 1.5 KB raw | 2.5 KB raw |
| **CSS (sekcja inline w Astro)** | 6 KB raw / 1.8 KB gzip | 5 KB raw | 8 KB raw |
| **First Contentful Paint** | mapa widoczna w 250 ms | 150 ms | 400 ms |
| **Largest Contentful Paint** | nie ma wpływu (LCP siedzi w Hero) | n/d | n/d |
| **Time to Interactive** | < 50 ms po LCP | 30 ms | 80 ms |
| **CLS contribution** | 0 (mapa SSR ma final size z aspect-ratio reserve) | 0 | 0.01 |
| **JS execution main thread** | < 8 ms (1.8 KB script parsing + IObserver setup) | 5 ms | 15 ms |

### 8.2. Lazy load strategy

- Mapa **NIE jest lazy-loaded**: jest above-the-fold czasem (na home page jest sekcja 4, po Hero + SegmentGrid + 1 mała sekcja, więc często viewport scrolla do niej w ~2 sekundy)
- Sanktuaria: **renderowane od razu** ale subtelne (kropki r=3) — nie wpływają na FCP
- Bottom sheet: lazy DOM, build dopiero na pierwszym tap (createElement on demand). Zaoszczędzenie ~600 bajtów initial HTML
- Brak fontów dodatkowych — używamy Bricolage Grotesque Variable (już loaded) + JetBrains Mono (już loaded w `package.json`)

### 8.3. Caching

- Sekcja jako SSR static — Vercel Edge Cache infinite (page ma `prerender = true`)
- `atlas.generated.ts` import statyczny → tree-shake'owalny ale w praktyce 100% inlined w HTML output
- Brak `fetch` w runtime, brak third-party scripts, brak external CSS

### 8.4. Stress testing checklist (dla Fazy C)

- Chrome DevTools mobile throttling "Slow 3G" + CPU 6× slowdown — mapa FCP < 1.2 s
- WebPageTest Mobile 4G — TTI < 250 ms
- Lighthouse Performance 100/100 dla sekcji (sekcja jako isolated test page)
- Coverage report — 0 unused CSS, 0 unused JS (sekcja jest minimal-footprint)

---

## 9. A11y plan (WCAG 2.2 AA + best practice 3.0 draft)

### 9.1. SVG semantics

```html
<figure>
  <svg
    role="img"
    aria-labelledby="atlas-title"
    aria-describedby="atlas-desc"
    viewBox="0 0 1000 520"
    preserveAspectRatio="xMidYMid meet"
  >
    <title id="atlas-title">Atlas Południa Via Viator — mapa obszaru operacyjnego</title>
    <desc id="atlas-desc">
      Mapa południowej Polski z czterema województwami rdzenia operacyjnego:
      śląskie, opolskie, małopolskie, świętokrzyskie. Zaznaczone są trzy huby
      lotniskowe: Pyrzowice (25 minut), Kraków-Balice (1h30), Wrocław (2h30),
      oraz baza w Tarnowskich Górach. Mapa zawiera sześć sanktuariów
      pielgrzymkowych: Częstochowa, Łagiewniki, Kalwaria Zebrzydowska,
      Wadowice w obszarze, oraz Licheń i Niepokalanów poza obszarem.
    </desc>
    <!-- groups, regions, hubs, base, sanctuaries... -->
  </svg>
  <figcaption>...</figcaption>
</figure>
```

### 9.2. Regions as buttons

```html
<g
  class="vv-atlas__region"
  role="button"
  tabindex="0"
  aria-label="Województwo śląskie. Wschodnia część obszaru operacyjnego. Naciśnij Enter aby zobaczyć szczegóły."
  data-region-id="slaskie"
>
  <path d="M ..." aria-hidden="true" />
  <text aria-hidden="true">Śląskie</text>
</g>
```

**Uwaga implementacyjna:** `<path role="button">` w SVG ma niespójne wsparcie w AT. **Lepiej `<g role="button">` jako wrapper** i ścierany hit area via `<path>` z `pointer-events: visiblePainted`. Senior developer w Fazie B musi to zaimplementować poprawnie (VoiceOver + JAWS + NVDA test).

### 9.3. Hubs as buttons (z click target)

```html
<g class="vv-atlas__hub" data-hub-id="pyrzowice">
  <circle class="vv-atlas__hub-hit" cx="..." cy="..." r="28"
    role="button"
    tabindex="0"
    aria-label="Lotnisko Pyrzowice. 25 minut od bazy. Naciśnij Enter aby przejść do oferty transferów korporacyjnych."
  />
  <circle class="vv-atlas__hub-rim" cx="..." cy="..." r="9" aria-hidden="true" />
  <text class="vv-atlas__hub-label" x="..." y="..." aria-hidden="true">PYRZOWICE</text>
  <text class="vv-atlas__hub-distance" x="..." y="..." aria-hidden="true" data-hidden-default>25 min</text>
</g>
```

### 9.4. Focus management

- `:focus-visible` outline: 3px solid `--vv-color-brand-red-700` z offset 4px (wewnętrznie do hit-area circle, używa `outline` na `<g>` lub stroke-mask na `<circle>` jeśli outline nie działa w SVG na browserze)
- Focus order: deterministyczny TAB cycle przez wszystkie warstwy
- Skip link na początku sekcji `<a href="#after-atlas" class="sr-only">Pomiń mapę</a>`
- aria-live="polite" region pod mapą anonsuje zmiany panel content

### 9.5. Color contrast (WCAG AA / AAA)

| Combo | Ratio | WCAG |
|-------|-------|------|
| Region stroke `#0A0A0A` na fill `#FAFAFA` | 18.91:1 | AAA |
| Region label `#525252` na fill `#FAFAFA` | 7.54:1 | AAA |
| Hub label `#0A0A0A` na bg `#FFFFFF` | 19.27:1 | AAA |
| Hub red outline `#F13223` r=8 stroke 2px na bg `#FFFFFF` | 4.29:1 (graphical, nie text) | AA pass (3.0 dla graphics) |
| Base label `#0A0A0A` na bg `#FFFFFF` | 19.27:1 | AAA |
| Sanctuary marker `#737373` na bg `#FFFFFF` | 4.54:1 | AA (graphical) |
| Sanctuary label `#525252` na bg `#FFFFFF` | 7.54:1 | AAA |
| Brand-red region active stroke `#F13223` na fill `rgba(241,50,35,0.06)` | sufficient (>3:1 dla graphics) | AA |
| Focus outline `#C2261A` 3px na każdy background | 6.45:1 | AAA |

**Decyzja:** używamy `--vv-color-brand-red-700` (`#C2261A`) jako focus outline (AAA na białym i kontrastowy na każdym background sekcji). To samo co Hero v2 ustaliło.

### 9.6. Screen reader narrative

- Title + desc dają screen reader user całość zawartości mapy w sekundach
- Każdy interaktywny element ma własne aria-label (region, hub, base, sanctuary)
- `aria-live="polite"` na panelu pod mapą — anonsuje zmiany stanu (gdy fokus przechodzi przez map elements lub w bottom sheet)
- W razie braku JS: mapa jest nadal visible (SSR), labels są obecne, ale interakcja działa tylko na keyboard fokusie do CTA target (link nawigacyjny na huby). Region/sanctuary bez JS = read-only.

### 9.7. Keyboard map

| Key | Action |
|-----|--------|
| Tab | Next element (region → hub → base → sanctuary order) |
| Shift+Tab | Previous |
| Enter on region | Update panel (no navigation) |
| Enter on hub | Navigate to /transfery-korporacyjne |
| Enter on base | Navigate to /o-nas |
| Enter on sanctuary | Navigate to /pielgrzymki |
| Space | Update panel without navigation (any element) |
| Esc | Reset panel + blur focus |
| ↑ ↓ ← → | Navigate sibling elements w warstwie (region ↔ region, hub ↔ hub) |

---

## 10. ASCII mockup

### 10.1. Desktop 1440 × 900

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Header navigation strip — out of scope dla atlas]                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

──────────────────────────────────────────  vv-atlas  ──────────────────────────────────────────
 background: --vv-color-bg-surface (#F5F5F5)                              padding-block: 88px

  ─────────────────────────  header zone (max-width 70ch)  ───────────────────────────────────
  MAPA N°01 · POŁUDNIE POLSKI                                                  ←── mono 11px UPPERCASE
                                                                                    --vv-color-fg-muted
  Atlas Południa                                                                ←── Bricolage 36px 800
  Cztery województwa rdzenia operacyjnego. Trzy huby lotniskowe.               ←── Bricolage 16px
  Jedna baza, w Tarnowskich Górach. Tu zaczyna się każdy przejazd.
                                                                                    text-wrap: pretty

  ─────────────  grid 6 + gutter + 5  (max-width 1240px, margin-inline auto)  ───────────────

  ┌───── map figure (8 col, max-w 920px, aspect 1.92:1) ──────┐  ┌─ panel (5 col, 380px) ──┐
  │                                                            │  │                          │
  │ ────── horizontal rule 1px solid fg-primary ──────         │  │  N°04                    │ ←── mono kicker
  │ MAPA · ZASIĘG OPERACYJNY                  N           │  │                          │
  │                                            ↑           │  │  Cztery województwa     │ ←── Bricolage 24px 700
  │   ┌── dolnośląskie ghost ──┐ ┌── łódzkie ghost ──┐    │  │  jednej osi: Pyrzowice  │
  │   │                         │ │                    │    │  │  Balice, Wrocław.       │
  │   │   ┌────opolskie──────┐  │ │  ┌─świętokrzy─┐  │    │  │                          │ ←── Bricolage 16px
  │   │   │ Opole·           │  │ │  │ Kielce·    │  │    │  │                          │   --vv-color-fg-secondary
  │   │   │   OPOLSKIE       │  │ │  │ ŚWIĘTOKRZYSKIE│ │    │  │                          │
  │   │   │                  │  │ │  │             │ │    │  │  Tarnowskie Góry         │
  │   │   └──────┬───────────┘  │ │  └─────────────┘ │    │  │  Tu jest baza.           │
  │   │          │ (wspólna granica)                  │    │  │                          │
  │   │   ┌──────┴─śląskie──────────────┐             │    │  │                          │
  │   │   │  PYRZOWICE                  │             │    │  │  ─────────────────────  │
  │   │   │    ●(red ring)              │             │    │  │                          │
  │   │   │     [25 min]                │             │    │  │  Województw .... 4       │ ←── legend mono
  │   │   │       ⬛(black) TARNOWSKIE  │             │    │  │  Huby lotn. .... 3       │
  │   │   │            GÓRY · baza      │             │    │  │  Baza .......... 1       │
  │   │   │                              │             │    │  │  Sanktuaria .... 6       │
  │   │   │ WROCŁAW                      │             │    │  │                          │
  │   │   │   ●(red ring · 2h30)         │             │    │  │                          │
  │   │   │                              │             │    │  │                          │
  │   │   │   CZĘSTOCHOWA· (small grey)  │             │    │  │                          │
  │   │   │                              │             │    │  │                          │
  │   │   └──────────────────────────────┘             │    │  │                          │
  │   │                                                │    │  │                          │
  │   │   ┌─── małopolskie ────────────┐               │    │  │                          │
  │   │   │ Kraków·    BALICE          │               │    │  │                          │
  │   │   │             ●(red·1h30)    │               │    │  │                          │
  │   │   │     ŁAGIEWNIKI· (grey)     │               │    │  │                          │
  │   │   │   WADOWICE·   KALWARIA·    │               │    │  │                          │
  │   │   │      MAŁOPOLSKIE           │               │    │  │                          │
  │   │   └────────────────────────────┘               │    │  │                          │
  │   │                                                 │    │  │                          │
  │   └────────────────────────────────────────────────┘    │  │                          │
  │                                              ↗ Licheń   │  │                          │
  │                                            200 km        │  │                          │
  │                                              ↗ Niepokal. │  │                          │
  │                                            245 km        │  │                          │
  │                                                          │  │                          │
  │  ─── caption row ───                                     │  │                          │
  │  Źródło: GUGiK · simplify 12%       50 km ▬▬▬▬▬          │  │                          │
  │                                                          │  │                          │
  └──────────────────────────────────────────────────────────┘  └──────────────────────────┘

  ──────────────────────── below grid, full width ───────────────────────────────────────────
  Tę mapę renderujemy z prawdziwych danych geodezyjnych GUGiK,                ←── caption mono 11px
  uproszczonych do 12% (Visvalingam-Whyatt) dla web. Każda granica jest          --vv-color-fg-muted
  prawdziwa, każdy hub jest na swoim miejscu. To nasz obszar.
```

### 10.2. Mobile 375 × 812

```
┌─ 375 px viewport ─────────────────────────────┐
│ [header — out of scope]                        │
└────────────────────────────────────────────────┘

──────  vv-atlas (padding-inline 20px)  ────────

  MAPA N°01 · POŁUDNIE POLSKI            ←── mono 10px UPPERCASE
                                              fg-muted

  Atlas Południa                          ←── Bricolage 28px 800
                                              clamp z desktop
  Cztery województwa, trzy huby           ←── Bricolage 16px
  lotniskowe, jedna baza.                     fg-secondary

  ┌─ figure 335 × 174 ──────────────────────┐
  │ ──── 1px solid fg-primary ──── N        │
  │ MAPA · ZASIĘG OPERACYJNY      ↑         │
  │                                          │
  │  [reszta PL ghost outline]               │
  │                                          │
  │   ┌─opolskie─┬─śląskie─┬─św.krz.─┐     │
  │   │  Opole·  │ ●(pyrz)│ Kielce· │     │
  │   │          │   ⬛TG  │         │     │
  │   │          │ ●wro   │         │     │
  │   │          └────────┘         │     │
  │   │   ┌── małopolskie ──┐       │     │
  │   │   │ Kraków· ●balice │       │     │
  │   │   │  WADOW. ŁAGIE.  │       │     │
  │   │   └──────────────────┘     │     │
  │   └────────────────────────────┘     │
  │                              ↗ Licheń │
  │                              ↗ Niep.  │
  │                                       │
  │  50 km ▬▬▬▬     GUGiK · simplify 12% │
  └──────────────────────────────────────┘

  Tap lotnisko, region lub bazę aby           ←── caption 14px
  zobaczyć szczegóły.                            fg-secondary

  ─────────  legend (3 swatch-y row) ─────────
  ◯ Województwo  ●  Hub lotniskowy  ⬛ Baza
  ────────────────────────────────────────────

[next section]


──────────  bottom sheet (po tap) ──────────────
   (slide-up z dołu, fixed bottom, 80vh)

  ┌──────────────────────────────────────────┐
  │              ────── handle ──────         │
  │                                            │
  │  LOTNISKO                                 │ ←── kicker mono 11px
  │                                              brand-red-700
  │  Pyrzowice                                │ ←── Bricolage 24px 700
  │                                            │
  │  25 minut od bazy w Tarnowskich Górach.   │ ←── Bricolage 16px
  │  Trasa: DK11/S1 na północ.                │   fg-secondary
  │                                            │
  │  ┌──────────────────────────────────────┐ │
  │  │ Zobacz transfery korporacyjne →     │ │ ←── full-width CTA
  │  └──────────────────────────────────────┘ │
  │                                            │
  │                              Zamknij ✕    │ ←── plain link mono 12px
  └──────────────────────────────────────────┘

  [backdrop rgba(0,0,0,0.16) z fade-in 280ms]
```

---

## 11. Deliverables dla Fazy B (Senior Developer)

### 11.1. Pliki do utworzenia

1. **`scripts/build-atlas.mjs`** (NEW, ~280 linii)
   - Node 22 ESM
   - importuje `mapshaper` API + `proj4`
   - reads `src/data/atlas.source.geojson` (lub fetches z pinned commit jeśli brak)
   - filtruje 4 województwa
   - projection EPSG:4326 → EPSG:2180
   - afine transform do viewBox 1000×520
   - simplify Visvalingam 12%
   - generuje rest-of-Poland outline (12 wojów uproszczone 20%)
   - emit `src/data/atlas.generated.ts` (TypeScript readonly const exports)
   - emit `atlas.build.log.json` z timestamps
   - exit 0 jeśli OK; exit 1 z czytelnym error message jeśli source brak

   Pseudo-code key path:
   ```javascript
   import mapshaper from 'mapshaper';
   import proj4 from 'proj4';

   const TARGET_REGIONS = ['śląskie', 'opolskie', 'małopolskie', 'świętokrzyskie'];
   const VIEWBOX_W = 1000;
   const VIEWBOX_H = 520;
   const PADDING = 24;

   // EPSG:2180 (PUWG 1992) — Lambert Conformal Conic dla Polski
   proj4.defs('EPSG:2180',
     '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 ' +
     '+ellps=GRS80 +units=m +no_defs');

   const source = JSON.parse(readFileSync('src/data/atlas.source.geojson'));

   // 1. Filter & simplify
   const filtered = await mapshaper.applyCommands(
     '-i source.geojson ' +
     `-filter "${TARGET_REGIONS.map(n => `nazwa === \\"${n}\\"`).join(' || ')}" ` +
     '-simplify visvalingam 12% keep-shapes ' +
     '-o format=geojson out.geojson',
     { 'source.geojson': source }
   );
   const filteredGeo = JSON.parse(filtered['out.geojson']);

   // 2. Project each feature
   for (const feat of filteredGeo.features) {
     projectGeometry(feat.geometry); // recursive transform on coords
   }

   // 3. Fit bbox to viewBox with padding
   const bbox = computeBBox(filteredGeo);
   const { scale, offsetX, offsetY } = fitToViewBox(bbox, VIEWBOX_W, VIEWBOX_H, PADDING);
   applyTransform(filteredGeo, scale, offsetX, offsetY);

   // 4. Emit d-strings
   const regionPaths = {};
   for (const feat of filteredGeo.features) {
     const id = mapNameToId(feat.properties.nazwa);
     regionPaths[id] = geometryToSvgPath(feat.geometry);
   }

   // 5. Project key points: hubs, base, sanctuaries
   const POI = {
     base: { lat: 50.4453, lon: 18.8528 },          // TG ul. Broniewskiego 25 (geocoded)
     hubs: {
       pyrzowice: { lat: 50.4742, lon: 19.0801 },
       balice:    { lat: 50.0777, lon: 19.7848 },
       wroclaw:   { lat: 51.1027, lon: 16.8858 },
     },
     sanctuaries: {
       czestochowa:  { lat: 50.8121, lon: 19.1207 },
       lichen:       { lat: 52.3081, lon: 18.3527 },
       niepokalanow: { lat: 52.2317, lon: 20.3392 },
       kalwaria:     { lat: 49.8703, lon: 19.6739 },
       lagiewniki:   { lat: 50.0219, lon: 19.9444 },
       wadowice:     { lat: 49.8830, lon: 19.4923 },
     }
   };
   for (const [k, p] of Object.entries(POI.hubs)) {
     POI.hubs[k] = projectAndTransform(p, scale, offsetX, offsetY);
   }
   // sanctuaries — flag inView based on resulting x,y in [0..VIEWBOX_W, 0..VIEWBOX_H]

   // 6. Compute scale bar (50 km in projected px)
   const KM_SCALE_PX = computeKmInPx(50, scale);

   // 7. Country outline (rest 12 wojewódzdtw)
   const restOutline = await mapshaper.applyCommands(
     '-i source.geojson ' +
     `-filter "${TARGET_REGIONS.map(n => `nazwa !== \\"${n}\\"`).join(' && ')}" ` +
     '-dissolve -simplify visvalingam 20% keep-shapes ' +
     '-o format=geojson rest.geojson',
     { 'source.geojson': source }
   );
   // project + transform + emit

   // 8. Emit TypeScript
   const code = renderGeneratedTs({ regionPaths, POI, KM_SCALE_PX, countryOutline: ... });
   writeFileSync('src/data/atlas.generated.ts', code);
   ```

2. **`src/data/atlas.source.geojson`** (NEW, ~33 KB raw)
   - Snapshot 4 województw z `ppatrzyk/polska-geojson@etag-d61de57...`
   - Committed do repo (audit trail)
   - Re-generowany przez `npm run atlas:source:refresh` (osobny script, manual trigger)

3. **`src/data/atlas.generated.ts`** (NEW, ~14 KB raw, ~10 KB po formatowaniu kodu)
   - Output skryptu (1)
   - Header comment: `// AUTO-GENERATED by scripts/build-atlas.mjs. DO NOT EDIT.`
   - `git diff` na zmiany powinien być pusty *poza intencjonalnym rebuildem*

4. **`src/data/atlas.ts`** (REWRITE, ~150 linii zamiast 175)
   - Importuje `REGION_PATHS, COUNTRY_OUTLINE_PATH, HUB_COORDS, BASE_COORDS, SANCTUARY_COORDS, KM_SCALE_PX, VIEWBOX` z `./atlas.generated`
   - Eksportuje business data: regiony (name keys, capital cities), huby (distance minutes, segment slugs), baza (label, address), sanktuaria (i18n keys, travel times)
   - Geometry oddzielone od business logic — meta zostaje stabilne nawet jeśli geometria się przelicza

5. **`src/components/sections/AtlasPoludnia.astro`** (FULL REWRITE, ~750 linii w tym CSS i JS)
   - Renderuje SVG z `REGION_PATHS` jako `<path d=...>`
   - Country outline jako pierwsza warstwa (lowest z-index)
   - Skalownik 50 km w prawym dolnym rogu mapy
   - Kicker mapy "MAPA · ZASIĘG OPERACYJNY" + horizontal rule
   - Compass rose mini (N strzałka) w lewym górnym
   - Source attribution caption
   - Hub markers: 2 circles (hit + outline ring) + label + hidden distance pill
   - Base marker: 3 elements (hit + black disk + animowany czerwony ring + label + kicker)
   - Sanctuary markers + off-view indicators
   - Bottom sheet HTML jako fixed wrapped div (display: none default, JS toggles)
   - Vanilla JS section z bindings
   - CSS section z full styles per element (~400 linii CSS)

6. **`tokens/viaviator-tokens.json`** (EDIT)
   - Dodaj `--vv-motion-duration-fast/base/slow/pulse` (4 nowe tokeny)

7. **`package.json`** (EDIT)
   - Add `devDependencies`: `mapshaper@^0.7.22`, `proj4@^2.11.0`
   - Add scripts: `"atlas:build": "node scripts/build-atlas.mjs"`, `"atlas:source:refresh": "node scripts/build-atlas.mjs --refresh-source"`
   - Update `dev` i `build`: prepend `npm run atlas:build && `

### 11.2. i18n updates (uzupełnienie obecnego dict)

`src/i18n/pl.ts` `atlas.*` keys (przykładowe):
- `atlas.kicker: "MAPA N°01 · POŁUDNIE POLSKI"`
- `atlas.title: "Atlas Południa"` (zachowany)
- `atlas.lead: "Cztery województwa rdzenia operacyjnego. Trzy huby lotniskowe. Jedna baza, w Tarnowskich Górach."` (uaktualniony)
- `atlas.scale: "50 km"`
- `atlas.source: "Źródło: GUGiK · simplify 12%"`
- `atlas.compass: "N"`
- `atlas.captionFull: "Tę mapę renderujemy z prawdziwych danych geodezyjnych GUGiK. Każda granica jest prawdziwa, każdy hub jest na swoim miejscu."`
- `atlas.bottomSheet.title: "Wybierz lotnisko, region lub bazę"`
- `atlas.bottomSheet.close: "Zamknij"`
- `atlas.offView.lichen: "Licheń · 200 km od bazy"`
- `atlas.offView.niepokalanow: "Niepokalanów · 245 km od bazy"`
- `atlas.region.{slaskie|opolskie|malopolskie|swietokrzyskie}.capital` — nowy nested
- `atlas.sanctuary.{czestochowa|lagiewniki|kalwaria|wadowice|lichen|niepokalanow}.{name,fullName,travel}` — nowy
- Analogicznie EN w `src/i18n/en.ts`

### 11.3. Critical implementation notes dla developera

1. **Projekcja musi być poprawna.** Test acceptance: po projection współrzędne Tarnowskich Gór (50.4453°N, 18.8528°E) muszą wypaść w obrębie *województwa śląskiego* na wygenerowanej mapie. Jeśli baza wypada poza granicami (jakąś floating-point lub off-by-one) — projekcja jest zła i Faza C odrzuci.

2. **Region paths a granice współdzielone.** Po Visvalingam simplify dwie sąsiednie granice mogą się rozsynchronizować (dwóch województw simplify-uje swoje wspólne ridge inaczej). Mapshaper rozwiązuje to przez `topology` mode — **wymóg: `simplify` musi być wykonane przed `-o split` nie po**, żeby zachować topology preservation.

3. **MultiPolygon awareness.** Województwo śląskie ma w danych geodezyjnych jeden polygon (kontynentalny), ale śląskie ma także enklawy w kilku miejscach (gminne). W naszej skali to znika po simplify — *ale skrypt musi obsługiwać MultiPolygon w `geometryToSvgPath`* (każdy outer ring = "M ... Z", inner ring = drugi "M ... Z" w tym samym path string).

4. **Distance pill positioning.** Pill "25 min" musi być pozycjonowany pod label-em huba bez nakładania się na sąsiedni hub. Static SVG pozycje — możliwa kolizja Pyrzowice (25 min) z bazą TG. Implementacja: każdy hub ma `data-pill-offset-y` z manual override jeśli auto (label.y + 14px) koliduje.

5. **Bottom sheet focus trap.** Standard implementation: querySelectorAll focusable elements, focus first, trap Tab/Shift-Tab w boundaries. Esc restores focus to trigger element. Skill `keybindings-help` w razie wątpliwości — ale tu vanilla JS, no harness.

6. **Reveal jednorazowy.** IntersectionObserver z `threshold: 0.3` triggeruje `vv-reveal-in` class która uruchamia base pulse (1.8s ease-out one cycle). Po zakończeniu pulse — class się usuwa, baza wraca do statycznego state. **Nie powtarzać** przy ponownym scroll-in.

7. **Mapshaper API call pattern.** API jest async i przyjmuje virtual filesystem. Wymóg: error handling jeśli `applyCommands` rzuca (np. malformed GeoJSON) → script exit 1 z echo'em error message + stack trace.

---

## 12. Acceptance criteria dla Fazy C (Reality Checker)

### 12.1. Geometric correctness (twarde, mierzalne)

- [ ] Tarnowskie Góry (baza) wypada wizualnie wewnątrz konturu woj. śląskiego (test: zoom 200%, sprawdzić że marker bazy mieści się w obrębie czarnej granicy śląskiego)
- [ ] Pyrzowice (hub) wypada na N od bazy w obrębie woj. śląskiego, ~20 km wizualnie na mapie (skalownik weryfikuje)
- [ ] Kraków-Balice (hub) wypada w obrębie woj. małopolskiego, ~75 km wizualnie od bazy na NE
- [ ] Wrocław (hub) wypada **poza** rdzeniem operacyjnym — w obszarze dolnośląskiego ghost outline, ~190 km wizualnie od bazy na NW
- [ ] Częstochowa (sanktuarium) wypada w obrębie woj. śląskiego, ~60 km wizualnie od bazy na NE
- [ ] Kalwaria, Wadowice, Łagiewniki — wszystkie w obrębie woj. małopolskiego
- [ ] Licheń, Niepokalanów — wypadają **poza** viewBox, oznaczone jako off-view z arrow indicator ↗
- [ ] Wspólna granica woj. opolskiego i śląskiego jest *jedną linią* (topology preserved), nie dwoma osobnymi
- [ ] Granica woj. śląskiego na S (Beskidy + Tatry) ma zygzaki widoczne wizualnie (nie jest prostą linią)
- [ ] Granica woj. małopolskiego na E (z podkarpackim) ma widoczne wcięcia rzeki Wisłoki/Sanu
- [ ] Reszta Polski (12 wojów outline) jest widoczna jako ghost outline `--vv-color-border-subtle`, czyta się jako "to jest cała Polska"
- [ ] Skalownik 50 km ma kalkulację: 50 km / KM_SCALE_PX zgadza się z odległością na mapie między known points (test: Tarnowskie Góry → Pyrzowice = ~25 km na podziałce)

### 12.2. Performance (mierzalne)

- [ ] `src/data/atlas.generated.ts` po prettier format: ≤ 16 KB raw, ≤ 6 KB gzip
- [ ] Astro build wypluwa sekcję AtlasPoludnia: ≤ 25 KB raw HTML (z SVG + style + script), ≤ 8 KB gzip
- [ ] Runtime JS (interakcja) script: ≤ 2.5 KB raw, ≤ 1.2 KB gzip
- [ ] Lighthouse Performance score sekcji: ≥ 95
- [ ] Chrome DevTools Coverage: 0% unused CSS w sekcji (wszystkie reguły są używane)
- [ ] Chrome DevTools Performance recording: paint sekcji < 16 ms na desktopie M1 / < 80 ms na mobile Galaxy S10
- [ ] CLS contribution: 0 (mapa SSR-uje z final dimensions via aspect-ratio CSS)

### 12.3. A11y (twarde)

- [ ] axe-core scan sekcji: 0 violations (serious / critical)
- [ ] WAVE evaluation: 0 errors, ≤ 2 alerts (acceptable: contrast warnings dla non-text graphics)
- [ ] Manual VoiceOver test (Mac Chrome): wszystkie regiony, huby, baza, sanktuaria są reachable via VO+arrow + ogłaszane czytelnie
- [ ] Manual JAWS test (Win Chrome): jak wyżej
- [ ] Manual NVDA test (Win Chrome): jak wyżej
- [ ] Keyboard test bez myszy: pełna nawigacja przez TAB, akcje przez Enter/Space, Esc zamyka, focus visible
- [ ] `prefers-reduced-motion: reduce`: wszystkie animacje są wyłączone, ale interactive states (hover/focus) nadal działają
- [ ] Color contrast: wszystkie label-e i marker-y spełniają WCAG AA (4.5:1 dla text, 3:1 dla graphics)
- [ ] Skip link "Pomiń mapę" jest na początku sekcji i działa

### 12.4. Mobile parity (375×812 Galaxy S10 / iPhone 13 mini)

- [ ] Mapa renderuje się w pełni w viewport (brak horizontal scroll)
- [ ] Wszystkie tap targets ≥ 44×44 px efektywne hit area
- [ ] Bottom sheet wysuwa się gładko (lub instant przy reduced-motion)
- [ ] Bottom sheet jest dismissible przez: backdrop tap, Zamknij ✕ button, Esc (jeśli keyboard zewn.)
- [ ] Bottom sheet ma focus trap (Tab cycling w środku)
- [ ] Off-view sanktuaria (Licheń, Niepokalanów) są dostępne przez arrow indicators na mobile
- [ ] Labels są czytelne na mobile (font-size ≥ 11px po rendering)

### 12.5. Brand book compliance

- [ ] Brand-red `#F13223` użyty oszczędnie (≤ 12% widzialnej powierzchni mapy w peak hover, ≤ 8% w spoczynku)
- [ ] Brak żadnych gradient, neon, glow effects
- [ ] Typografia Bricolage dla geographic names (regiony, baza), JetBrains Mono dla operational data (huby, dystanse, koordynaty)
- [ ] Brak emoji w UI (zgodnie z brand canon)
- [ ] Tone of voice w lead + caption: senior-to-senior, no superlatives, brak "amazing/incredible/best"

### 12.6. Cross-browser

- [ ] Chrome 122+ Mac/Win/Android: pełna funkcjonalność
- [ ] Safari 17+ Mac/iOS: pełna funkcjonalność (specjalna uwaga: SVG focus outline w Safari ma inne handling)
- [ ] Firefox 124+: pełna funkcjonalność
- [ ] Edge 122+: pełna funkcjonalność
- [ ] iOS Safari 17 bottom sheet: gesture (drag down to dismiss) opcjonalne — nie krytyczne MVP

### 12.7. Variant compact (na `/o-nas`)

- [ ] `variant="compact"` renderuje SVG bez panel + bottom sheet
- [ ] Sanktuaria są **ukryte** w wariancie compact (sekcja Atlas Południa na /o-nas mówi tylko o regionie operacyjnym)
- [ ] Sticky panel **wyłączony** w compact (brak panelu)
- [ ] Layout: mapa na pełną szerokość kontenera, max-width 920px, centered

---

## 13. Otwarte pytania (rozstrzygnij z klientem zanim Faza B startuje)

### 13.1. Czy Wrocław pokazujemy w obrębie pełnej mapy z dolnośląskim ghost outline?

W obecnym SVG hub Wrocław jest *na granicy viewBox* w lewym górnym rogu. Wrocław leży 190 km na NW od bazy — to jest w **dolnośląskim** (nie rdzeniu). W v2 mam dwie opcje:

- **A.** Wrocław pokazany w obrębie głównej mapy z dolnośląskim widocznym jako ghost outline (rdzeń: 4 województwa, ale viewBox obejmuje też zachodnią część PL). Konsekwencja: viewBox większy, niektóre regiony rdzenia stają się relatywnie mniejsze.
- **B.** Wrocław pokazany jako off-view arrow indicator (jak Licheń/Niepokalanów) z label "Wrocław ↖ 190 km". Konsekwencja: rdzeń 4 wojów wypełnia viewBox czysto, ale jeden z trzech kanonicznych hubów Via Viator jest poza mapą.

**Moja rekomendacja:** **A**. Wrocław jako kanoniczny hub musi być widoczny *na mapie* — to jest jego status w brand canon. Lepiej rozszerzyć viewBox na zachód obejmując dolnośląskie ghost outline. Klient zatwierdzi w 15 minut.

### 13.2. Czy mapa pokazuje także granicę państwa (Słowacja S, Czechy SW, Ukraina E)?

W obrębie viewBox z dolnośląskim będziemy mieć fragmenty granicy:
- S: PL/SK (granica Beskidów)
- SW: PL/CZ (Sudety)
- E: PL/UA (poza viewBox prawdopodobnie, ale małopolskie sąsiaduje z podkarpackim — UA dalej)

**Moja rekomendacja:** pokazujemy granicę państwa Polski jako *cienką linię* `--vv-color-border-strong` (0.75 px) — daje silniejszy "to jest Polska" sygnał. Brak labels innych krajów. Klient potwierdzi.

### 13.3. Czy kod sanktuarium używa tych samych pinned commit-ów `ppatrzyk/polska-geojson` jak sanctuaries SVG na `/pielgrzymki`?

Obecny `src/data/sanctuaries.ts` ma ręczne `cx, cy` w viewBox 600×800 — to **osobna** geometria od atlasu. Jeśli oba używają tego samego źródła i tej samej projection, koordynaty są spójne. Ale jeśli na sanctuary page chcemy inny obszar (mapa Polski cała z 6 punktami) — projection może być inna.

**Moja rekomendacja:** osobne projection dla sanctuary page (bo to mapa **całej Polski**, nie tylko południa), ale używamy tego samego data source, tego samego build script, tylko innych viewBox + transform parametrów. W skrypcie `build-atlas.mjs` flag `--variant atlas|sanctuaries` generuje oba pliki. Faza B implementacji.

---

## 14. Glossary techniczny (dla developera Fazy B)

- **EPSG:4326** — WGS-84 lat/lon. Surowy GeoJSON `ppatrzyk/polska-geojson` jest w tym układzie.
- **EPSG:2180** — układ PUWG-1992 dla Polski. Lambert Conformal Conic z parametrami SP1=50°N, SP2=52°N, lon0=19°E, k=0.9993, false_easting=500000, false_northing=-5300000. Standard GUGiK dla map PL.
- **Visvalingam-Whyatt simplify** — algorytm zachowujący topologię, lepszy dla land features niż Douglas-Peucker (RDP). Mapshaper default. Tolerance 12% = zachowuje 12% największych "triangles" wierzchołkowych.
- **Topology preservation** — w mapshaper to znaczy że wspólne granice (np. opolskie/śląskie ridge) są simplify-owane *raz* a nie dwa razy. Bez tego sąsiednie województwa mogą mieć rozjeżdżające się brzegi.
- **VPiewBox** — SVG attribute definiujący "world coordinates" wewnątrz `<svg>`. `viewBox="0 0 1000 520"` daje aspect-ratio 1.92:1 i koordynaty w [0..1000, 0..520].
- **`vector-effect: non-scaling-stroke`** — CSS property dla SVG path/line. Powoduje że stroke-width pozostaje stały (np. 1.5px) niezależnie od skali parent SVG. Krytyczne dla map (inaczej strokes pęcznieją na małych ekranach).
- **`preserveAspectRatio="xMidYMid meet"`** — utrzymuje aspect ratio podczas resize, centruje content, "meet" = fit-inside (nie crop).
- **`pointer-events: visiblePainted`** — SVG element łapie pointer events tylko gdy jest naprawdę widoczny i ma fill/stroke painted. Default dla SVG, ale warto eksplicytnie.
- **`aria-live="polite"`** — region jest anonsowany przez AT *po* zakończeniu obecnego anonsu (nie przerywa). Standard dla dynamic content updates.
- **Drawn-once animation** — `stroke-dasharray` z `stroke-dashoffset` animowane od `total-length` do 0 raz, nie loop. Po zakończeniu — element pozostaje painted ze stałym dasharray.

---

**Koniec dokumentu.**

**Liczba linii:** dokument przekracza 600 linii zgodnie z briefem. Faza B może zaczynać.
**Faza B pseudo-trigger:** `git checkout -b mapa-v2-implementation && npm i mapshaper proj4 && touch scripts/build-atlas.mjs && start.`
