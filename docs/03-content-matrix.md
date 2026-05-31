# Via Viator — Content Matrix (v1.0)

> **Faza 03 — Content blueprint dla wszystkich 14 stron × 2 języki**
> Autor: ArchitectUX (agent QA10) | Data: 2026-05-31
> Pokrycie: copy gotowe do podstawienia w `<Layout>` + lista sekcji per route + SEO meta.
> Komplement do: `docs/03-ia.md` (IA), `src/data/segments.ts` (persona content), `src/data/nav.ts` (nawigacja).

---

## Konwencje

- **H1 i subhead** — gotowe do copy-paste do komponentu `HeroSection`. Tłumaczenia EN sprawdzone pod kątem rytmu (krótkie zdania, ten sam ładunek emocjonalny).
- **Sekcje** — numerowane w kolejności renderowania top→bottom. Jeśli sekcja jest sticky/floating (np. RFQ jako anchor), zaznaczone w opisie.
- **Primary CTA** — jedyne, główne. Tekst PL + EN + docelowy href (zgodny z `segments.ts.ctaHref`).
- **Secondary CTA** — opcjonalny, słabszy wizualnie. Najczęściej telefon (`tel:+48690691886`).
- **Target keyword PL** — fraza główna SEO (long-tail dla landingów segmentowych, brand dla home).
- **Meta description** — max 155 znaków, czytelne zdanie z value prop + CTA-trigger.

---

## 1. `/` — Strona główna (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/` |
| Slug EN | `/en/` |
| Persona target | router — wszystkie 6 person, kierowanie do landingu w 8 sekund |
| H1 PL | **Zawsze na miejscu.** |
| H1 EN | **Always there.** |
| Hero subhead PL | Przewóz osób w południowej Polsce — od transferu lotniskowego dla firmy po pielgrzymkę i wesele. Sześć rzeczy, które robimy dobrze. Jedna obietnica: będziesz na czas. |
| Hero subhead EN | Passenger transport in southern Poland — from corporate airport transfers to pilgrimages and weddings. Six things we do well. One promise: you'll arrive on time. |
| Sekcje | 1. Hero (logo overlay, H1, subhead, brak primary CTA — sama nawigacja segmentowa). 2. SegmentCardsGrid (6 kart 3×2 desktop, każda z color accent + TTQ badge). 3. „Co znaczy 'zawsze na miejscu'" — 3-block (operacja, ludzie, region). 4. OperationalRangeMap (mapa 4 województw + 3 huby). 5. FleetBlock (Trafic + Master, krótko). 6. SocialProofBlock (zbiorcze testimoniale, mieszane segmenty). 7. FAQBlock (8 najczęstszych pytań cross-segment). 8. CTASection („Nie wiesz który segment? Zadzwoń — dobierzemy" + telefon). 9. Footer. |
| Primary CTA | brak na hero (router-style) — całość konwersji idzie przez 6 kart |
| Secondary CTA | „Zadzwoń: +48 690 691 886" w CTASection (sekcja 8) — `tel:+48690691886` |
| Target keyword PL | „przewóz osób południowa polska" |
| Meta description PL | Przewóz osób w południowej Polsce — transfery lotniskowe, pielgrzymki, transport dostępny, wynajem busa, eventy. Cztery województwa, trzy huby. (155) |

## 2. `/en/` — Home (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Always there.** |
| Subhead EN | Passenger transport in southern Poland — from corporate airport transfers to pilgrimages and weddings. Six things we do well. One promise: you'll arrive on time. |
| Sekcje | identyczne jak PL — tłumaczone strings z `en.ts` |
| Primary CTA | brak — segment cards |
| Secondary CTA | „Call: +48 690 691 886" — `tel:+48690691886` |
| Target keyword EN | „passenger transport southern Poland" |
| Meta description EN | Passenger transport in southern Poland — airport transfers, pilgrimages, accessible transport, van rental, events. Four regions, three hubs. (151) |

---

## 3. `/transfery-korporacyjne` — Transfery korporacyjne (P1, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/transfery-korporacyjne` |
| Slug EN | `/en/corporate-transfers` |
| Persona target | **P1 — Korpo Koordynator** (Anna, office manager 32-42, B2B 80-150 os.) |
| H1 PL | **Twój gość wyląduje o 7:42. My będziemy o 7:40.** |
| Hero subhead PL | Transfery lotniskowe Pyrzowice, Kraków-Balice, Wrocław dla firm. Oferta w 4 godziny, faktura VAT, kierowca anglojęzyczny na żądanie. |
| Sekcje | 1. Hero (segment color: korpo, TTQ badge „Oferta w 4h"). 2. „Co dostajesz w 4 godziny" (3-kolumnowy block z timeline: zapytanie → oferta → akceptacja → realizacja). 3. DecisionCriteriaList (7 kryteriów z `segments.ts`). 4. FleetBlock (Renault Trafic 8 — branded, 8 miejsc, klimatyzacja, wifi opcjonalnie). 5. OperationalRangeMap (3 huby z czasami dojazdu). 6. SocialProofBlock („MŚP IT 120 os., Gliwice" + logo strip). 7. FAQBlock (8 pytań: VAT, EN driver, tracking lotu, umowa ramowa, delays, no-show, korekta godziny, anulowanie). 8. ContactFormSegment inline `#rfq` (preset segment=korpo, NIP auto-VAT lookup, opcja „EN driver"). 9. CTASection (duplikat primary CTA + tagline „Będziesz na czas."). 10. Footer. |
| Primary CTA | „Poproś o ofertę w 4 godziny" → `#rfq` (scroll do formularza inline) |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „transfer lotniskowy dla firm pyrzowice balice" |
| Meta description PL | Transfery lotniskowe Pyrzowice, Balice, Wrocław dla firm. Oferta w 4 godziny, faktura VAT, kierowca anglojęzyczny, Renault Trafic 8 miejsc. (152) |

## 4. `/en/corporate-transfers` — Corporate transfers (P1, EN)

| Pole | Treść |
|---|---|
| H1 EN | **Your guest lands at 7:42. We'll be there at 7:40.** |
| Subhead EN | Airport transfers Katowice, Krakow, Wroclaw for companies. Quote in 4 hours, VAT invoice, English-speaking driver on request. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Request a quote in 4 hours" → `#rfq` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „corporate airport transfer Katowice Krakow" |
| Meta description EN | Airport transfers Katowice, Krakow, Wroclaw for companies. Quote in 4 hours, VAT invoice, English-speaking driver, Renault Trafic 8 seats. (147) |

---

## 5. `/pielgrzymki` — Pielgrzymki (P2, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/pielgrzymki` |
| Slug EN | `/en/pilgrimages` |
| Persona target | **P2 — Organizator Pielgrzymki** (Maria 48-65, parafialne wyjazdy grupowe) |
| H1 PL | **Znamy bramę Jasnogórską i parking pod Łagiewnikami.** |
| Hero subhead PL | Pielgrzymki Częstochowa, Licheń, Kalwaria Zebrzydowska, Łagiewniki, Wadowice. Wycena w 1–3 dni. Kierowca cierpliwy, pojazd czysty, postój co 1,5 godziny. |
| Sekcje | 1. Hero (segment color: pielgrzymki, TTQ „Wycena 1–3 dni"). 2. RoutesKnownList („Trasy które znamy" — 5 sanktuariów z fotką + krótkim opisem co wiemy o każdym miejscu). 3. „Jak wygląda pielgrzymka z Via Viator" — narracja krok-po-kroku (zbiórka → postoje → sanktuarium → powrót). 4. DecisionCriteriaList (7 kryteriów). 5. SocialProofBlock (cytat księdza/organizatorki + lista parafii). 6. FleetBlock (Renault Trafic 8 — dla mniejszych grup; informacja że na większe zlecenia podwykonawcy z busami 20+). 7. FAQBlock (8 pytań: postoje, czas trwania, posiłki, parking pod sanktuarium, faktura na parafię, czy może być więcej niż 8 osób, asysta z bagażem, kierowca a praktyki religijne). 8. ContactFormSegment `#wycena` (preset segment=pielgrzymki, dropdown sanktuarium, data, liczba osób). 9. CTASection. 10. Footer. |
| Primary CTA | „Zapytaj o wycenę wyjazdu" → `#wycena` |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „transport pielgrzymka częstochowa parafia" |
| Meta description PL | Pielgrzymki Częstochowa, Licheń, Kalwaria, Łagiewniki, Wadowice. Wycena 1–3 dni, kierowca cierpliwy, postój co 1,5h, pomoc z bagażem. (153) |

## 6. `/en/pilgrimages` — Pilgrimages (P2, EN)

| Pole | Treść |
|---|---|
| H1 EN | **We know the Jasna Góra gate and the Łagiewniki car park.** |
| Subhead EN | Pilgrimages to Częstochowa, Licheń, Kalwaria Zebrzydowska, Łagiewniki, Wadowice. Quote in 1–3 days. Patient driver, clean vehicle, breaks every 90 minutes. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Ask for a pilgrimage quote" → `#wycena` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „pilgrimage transport Częstochowa Poland" |
| Meta description EN | Pilgrimages to Częstochowa, Licheń, Kalwaria, Łagiewniki, Wadowice. Quote in 1–3 days, patient driver, breaks every 90 min, baggage help. (143) |

---

## 7. `/transport-dostepny` — Transport dostępny (P3, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/transport-dostepny` |
| Slug EN | `/en/accessible-transport` |
| Persona target | **P3 — Koordynator DPS/Fundacji** (Tomasz 38-55, transport PRM, umowy długoterminowe) |
| H1 PL | **Wózek wniesiemy. Walizkę też. Spóźnimy się tylko jeśli ktoś potrzebuje minuty więcej.** |
| Hero subhead PL | Transport osób z niepełnosprawnościami dla DPS, fundacji, organizacji opiekuńczych. Umowy 12-miesięczne, kierowca przeszkolony PRM, bezpośredni kontakt z koordynatorem. |
| Sekcje | 1. Hero (segment color: dostepny — zielony, TTQ „Umowa 8–16 tyg. / kontakt 30 min"). 2. „Dla kogo jest ta oferta" (3 typy: DPS, fundacje, organizacje opiekuńcze — z przykładami zleceń). 3. DecisionCriteriaList (7 kryteriów). 4. „Co to znaczy 'przeszkolony PRM'" — sekcja o szkoleniu kierowcy, certyfikat (TODO klient), praktyka. 5. FleetBlock (oba pojazdy: Trafic i Master — opcja cargo dla wózka + walizki). 6. SocialProofBlock (referencja od koordynatora DPS, pełne imię + instytucja). 7. „Jak wygląda umowa 12-miesięczna" — krok-po-kroku (rozmowa → SLA → podpisanie → faktura zbiorcza miesięczna). 8. FAQBlock (8 pytań: szkolenie PRM, asysta, transfery szpitalne, czas pilny, faktura zbiorcza, wyjazdy integracyjne, kontakt z koordynatorem, pojazd zastępczy). 9. ContactFormSegment `#koordynator` (preset segment=dostepny, opcja „kontakt pilny" 30 min). 10. CTASection. 11. Footer. |
| Primary CTA | „Umów rozmowę z naszym koordynatorem" → `#koordynator` |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „transport osób z niepełnosprawnością dps" |
| Meta description PL | Transport osób z niepełnosprawnościami dla DPS i fundacji. Umowy 12-mies., kierowca PRM, asysta z wózkiem, kontakt z koordynatorem 30 min. (153) |

## 8. `/en/accessible-transport` — Accessible transport (P3, EN)

| Pole | Treść |
|---|---|
| H1 EN | **We'll lift the wheelchair. The suitcase too. We're late only if someone needs an extra minute.** |
| Subhead EN | Transport for people with disabilities for care homes, foundations and care organisations. 12-month contracts, PRM-trained driver, direct coordinator contact. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Schedule a call with our coordinator" → `#koordynator` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „accessible transport disability care home Poland" |
| Meta description EN | Disability transport for care homes and foundations. 12-month contracts, PRM-trained driver, wheelchair assistance, coordinator response in 30 min. (149) |

---

## 9. `/przewozy-rodzinne` — Przewozy rodzinne (P4, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/przewozy-rodzinne` |
| Slug EN | `/en/family-transport` |
| Persona target | **P4 — B2C Jednorazowy** (Marek 30-50, wesele/komunia/transfer rodzinny) |
| H1 PL | **Lotnisko, wesele, komunia — cztery lub osiem miejsc, jedna trasa, jedna cena.** |
| Hero subhead PL | Transfery rodzinne i okazjonalne. Odpowiadamy w 2 godziny — Messenger albo telefon, jak wolisz. Cena za przejazd, nie „od" — żadnych gwiazdek. |
| Sekcje | 1. Hero (segment color: rodzinne — pomarańczowy, TTQ „Odpowiedź w 2h"). 2. „Co najczęściej obsługujemy" (4 karty: transfer lotniskowy, wesele, komunia, pogrzeb — każda z mini-opisem). 3. DecisionCriteriaList (7 kryteriów). 4. „Dlaczego Messenger to nasz preferowany kanał" — krótka sekcja wyjaśniająca (UX znajomy, asynchroniczność, brak telefonowania wieczorem). 5. FleetBlock (Trafic — 8 miejsc, czysty, kierowca w koszuli). 6. SocialProofBlock (testimoniale z Facebook + galeria realizacji). 7. „Ile to kosztuje" — kalkulator orientacyjny lub tabela przykładowych tras (Gliwice-Balice = X zł, Katowice-Pyrzowice = Y zł). 8. FAQBlock (8 pytań: cena za busa czy za osobę, weekendy/święta, anulowanie, opóźnienie lotu, dzieci w foteliku, walizki, kierowca w garniturze, Messenger response time). 9. ContactFormSegment `#szybkie-zapytanie` (preset segment=rodzinne, krótki: data/godzina/skąd/dokąd/liczba osób — minimum pól). 10. CTASection (duże przyciski Messenger + Telefon obok siebie). 11. Footer. |
| Primary CTA | „Napisz na Messengerze" → `https://m.me/viaviator` (TODO klient: handle) |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „transfer wesele komunia bus śląsk" |
| Meta description PL | Transfery rodzinne — lotnisko, wesele, komunia. Odpowiadamy w 2h przez Messenger lub telefon. 4 lub 8 miejsc, jedna cena, bez gwiazdek. (150) |

## 10. `/en/family-transport` — Family transport (P4, EN)

| Pole | Treść |
|---|---|
| H1 EN | **Airport, wedding, communion — four or eight seats, one route, one price.** |
| Subhead EN | Family and occasional transfers. We reply within 2 hours — Messenger or phone, your choice. A price per ride, not „from" — no asterisks. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Message us on Messenger" → `https://m.me/viaviator` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „family transfer airport wedding Silesia Poland" |
| Meta description EN | Family transfers — airport, wedding, communion. We reply in 2h via Messenger or phone. 4 or 8 seats, one price, no asterisks. (132) |

---

## 11. `/wynajem-busa` — Wynajem busa (P5, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/wynajem-busa` |
| Slug EN | `/en/van-rental` |
| Persona target | **P5 — Wynajem Mastera** (Piotr 25-45, samodzielny wynajem bez kierowcy) |
| H1 PL | **Master. Doba. Limit km i cena na stronie. Bez gwiazdek.** |
| Hero subhead PL | Wynajem Renault Master bez kierowcy. Doba, weekend, tydzień. Transparentny cennik, kaucja zwracana w 48h, regulamin do przeczytania przed odbiorem. |
| Sekcje | 1. Hero (segment color: wynajem — szary, TTQ „Dostępność w 30 min"). 2. PriceTable (3 plany: doba / weekend (pt-nd) / tydzień — z dokładną kwotą, limitem km, ceną nadbiegu). TODO klient: stawki. 3. DecisionCriteriaList (7 kryteriów). 4. „Co dostajesz w cenie" (lista: ubezpieczenie OC/AC, pełny bak przy odbiorze, asystent telefoniczny 24/7 — TODO klient potwierdzić). 5. FleetBlock (Renault Master szczegółowo: rok produkcji, przebieg, wyposażenie, opcje 8-os. lub cargo). 6. „Jak wynająć w 4 krokach" (zapytanie → potwierdzenie dostępności → podpisanie umowy → odbiór). 7. „Czego nie wolno" — krótka, uczciwa lista (wyjazd poza UE bez zgody, palenie, zwierzęta bez kaucji dodatkowej). 8. FAQBlock (8 pytań: kaucja, wyjazd zagraniczny, ubezpieczenie, kapeć w trasie, holowanie, anulowanie, przedłużenie wynajmu, godziny odbioru/zwrotu). 9. ContactFormSegment `#dostepnosc` (preset segment=wynajem, datepicker: od-do, opcja 8-os./cargo). 10. „Regulamin do pobrania" — link do PDF (TODO klient). 11. CTASection. 12. Footer. |
| Primary CTA | „Sprawdź dostępność" → `#dostepnosc` |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „wynajem busa renault master bez kierowcy śląsk" |
| Meta description PL | Wynajem Renault Master bez kierowcy — doba, weekend, tydzień. Cennik na stronie, limit km, kaucja, regulamin. Sprawdź dostępność w 30 min. (149) |

## 12. `/en/van-rental` — Van rental (P5, EN)

| Pole | Treść |
|---|---|
| H1 EN | **Master. Per day. Mileage limit and price on the page. No asterisks.** |
| Subhead EN | Renault Master van rental without driver. Day, weekend, week. Transparent pricing, deposit returned within 48h, terms to read before pickup. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Check availability" → `#dostepnosc` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „Renault Master van rental Silesia Poland self-drive" |
| Meta description EN | Renault Master van rental, self-drive — day, weekend, week. Transparent pricing, mileage limit, deposit, terms online. Availability in 30 min. (147) |

---

## 13. `/imprezy` — Imprezy (P6, PL)

| Pole | Treść |
|---|---|
| Slug PL | `/imprezy` |
| Slug EN | `/en/events` |
| Persona target | **P6 — Eventy** (organizatorzy festynów, urodzin, imprez firmowych) |
| H1 PL | **Namiot, popcorn, wata cukrowa — i bus, którym to wszystko dojedzie.** |
| Hero subhead PL | Wyposażenie eventowe dla festynów, urodzin i imprez firmowych. Jeden numer telefonu na całą logistykę. Oferta w 24 godziny, faktura VAT. |
| Sekcje | 1. Hero (segment color: eventy — czerwony, TTQ „Oferta w 24h"). 2. EventEquipmentGrid (3 karty: namiot eventowy, maszyna do popcornu, maszyna do waty cukrowej — każda z fotką, parametrami, ceną „od" lub RFQ). 3. „Co planujemy w jesieni 2026" — stoły + ławki biesiadne, możliwość rezerwacji z wyprzedzeniem. 4. „Dla jakich wydarzeń" (4 karty: festyn gminny, urodziny dziecka, impreza firmowa, dożynki). 5. DecisionCriteriaList (7 kryteriów). 6. „Co dostajesz w pakiecie" (transport wyposażenia + montaż namiotu + odbiór po wydarzeniu + faktura VAT). 7. SocialProofBlock (zdjęcia z realizacji, cytat organizatora festynu). 8. FAQBlock (8 pytań: zasięg geograficzny, montaż namiotu, obsługa maszyn, ile osób potrzebnych, pogoda — namiot a wiatr, dostępność w weekendy lipca/sierpnia, kaucja, anulowanie). 9. ContactFormSegment `#oferta` (preset segment=eventy, dropdown typ wydarzenia, data, liczba uczestników, lokalizacja). 10. CTASection. 11. Footer. |
| Primary CTA | „Zapytaj o ofertę eventową" → `#oferta` |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „wynajem namiotu eventowego popcorn wata cukrowa śląsk" |
| Meta description PL | Wyposażenie eventowe — namiot, maszyna do popcornu i waty cukrowej. Festyny, urodziny, imprezy firmowe. Oferta w 24h, faktura VAT, transport w cenie. (155) |

## 14. `/en/events` — Events (P6, EN)

| Pole | Treść |
|---|---|
| H1 EN | **Tent, popcorn, cotton candy — and the van to deliver it all.** |
| Subhead EN | Event equipment for fairs, birthdays and company events. One phone number for all the logistics. Quote in 24 hours, VAT invoice. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Ask for an event quote" → `#oferta` |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „event tent rental popcorn cotton candy southern Poland" |
| Meta description EN | Event equipment — tent, popcorn and cotton candy machines. Fairs, birthdays, company events. Quote in 24h, VAT invoice, transport included. (140) |

---

## 15. `/o-nas` — O nas (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/o-nas` |
| Slug EN | `/en/about` |
| Persona target | wszystkie (trust + brand story) |
| H1 PL | **O Via Viator** |
| Hero subhead PL | Polski przewoźnik z południa Polski. Cztery województwa, trzy huby lotniskowe, dwa busy, jedna obietnica: będziesz na czas. |
| Sekcje | 1. Hero (logo wielki + tagline overlay). 2. „Skąd Via Viator" — krótka historia firmy (założenie, pierwsze zlecenia, kiedy doszedł drugi bus). 3. „Twarz marki: Patryk Tomeczek" — wspólnik operacyjny, krótko o filozofii „zawsze na miejscu". (Wspólnik cichy NIE eksponowany — zasada „cichej dobroci"). 4. OperationalRangeMap (4 województwa + 3 huby — pełna mapa). 5. FleetBlock (Trafic + Master szczegółowo z fotkami). 6. „Czego nie robimy" — krótka, uczciwa lista (nie obsługujemy całej Polski, nie mamy autokarów 50+, nie wynajmujemy z kierowcą innym niż nasz). 7. SocialProofBlock (cytaty cross-segment — po jednym z każdej persony). 8. TrustStrip (NIP, od kiedy działamy, certyfikaty TODO klient). 9. CTASection („Masz pytanie? Zadzwoń lub napisz" — telefon + email). 10. Footer. |
| Primary CTA | „Zadzwoń: +48 690 691 886" → `tel:+48690691886` |
| Secondary CTA | „Napisz: kontakt@viaviator.pl" → `mailto:kontakt@viaviator.pl` |
| Target keyword PL | „via viator przewoźnik południowa polska" |
| Meta description PL | Polski przewoźnik z południa Polski. Cztery województwa, trzy huby lotniskowe, dwa busy, jedna obietnica: będziesz na czas. (124) |

## 16. `/en/about` — About (EN)

| Pole | Treść |
|---|---|
| H1 EN | **About Via Viator** |
| Subhead EN | A Polish carrier from southern Poland. Four regions, three airport hubs, two vans, one promise: you'll arrive on time. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Call: +48 690 691 886" |
| Secondary CTA | „Email: kontakt@viaviator.pl" |
| Target keyword EN | „Via Viator passenger transport southern Poland company" |
| Meta description EN | A Polish carrier from southern Poland. Four regions, three airport hubs, two vans, one promise: you'll arrive on time. (118) |

---

## 17. `/kontakt` — Kontakt (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/kontakt` |
| Slug EN | `/en/contact` |
| Persona target | wszystkie (utility — fallback dla każdego segmentu) |
| H1 PL | **Kontakt** |
| Hero subhead PL | Telefon, email, formularz. Odpowiadamy zgodnie z time-to-quote per segment — od 2 godzin (rodzinne) do 1–3 dni (pielgrzymki). Po godzinach: następny dzień roboczy. |
| Sekcje | 1. Hero. 2. „Wybierz kanał" — 3 duże karty (telefon, email, formularz) z one-linerem dla każdego. 3. ContactFormSegment uniwersalny (z dropdown segment selector — preselect z query param `?segment=...`). 4. „Czas odpowiedzi per segment" — tabela TTQ (P1 4h, P2 1–3 dni, P3 30 min/8–16 tyg., P4 2h, P5 30 min, P6 24h). 5. OperationalRangeMap (z lokalizacją siedziby — TODO klient adres). 6. „Adresy mailowe" — `kontakt@viaviator.pl` (główny), `zarzad@viaviator.pl` (sprawy formalne), `marketing@viaviator.pl` (współpraca). 7. „Dane rejestrowe" — krótko (NIP, link do impressum). 8. CTASection (telefon + tagline). 9. Footer. |
| Primary CTA | „Wyślij zapytanie" (na formularzu, w sekcji 3) |
| Secondary CTA | „Zadzwoń: +48 690 691 886" — `tel:+48690691886` |
| Target keyword PL | „via viator kontakt telefon" |
| Meta description PL | Telefon +48 690 691 886, kontakt@viaviator.pl, formularz dla każdego segmentu. Odpowiadamy zgodnie z time-to-quote per segment. (134) |

## 18. `/en/contact` — Contact (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Contact** |
| Subhead EN | Phone, email, form. We reply by segment-specific time-to-quote — from 2 hours (family) to 1–3 days (pilgrimages). After hours: next business day. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Send enquiry" |
| Secondary CTA | „Call: +48 690 691 886" |
| Target keyword EN | „Via Viator contact phone email" |
| Meta description EN | Phone +48 690 691 886, kontakt@viaviator.pl, contact form per segment. We respond by segment-specific time-to-quote. (118) |

---

## 19. `/jakosc` — Jakość / QA10 Quality Seal (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/jakosc` |
| Slug EN | `/en/quality` |
| Persona target | wszystkie (trust + provenance) |
| H1 PL | **QA10 Quality Seal — 10 wymiarów jakości** |
| Hero subhead PL | Strona Via Viator została zaprojektowana, zbudowana i poświadczona przez QA10 sp. z o.o. według dziesięciu mierzalnych kryteriów. Każde z nich można zweryfikować niezależnie. |
| Sekcje | 1. Hero (z badge QA10 Verified · v1.0 centralnie). 2. „Dlaczego dziesięć wymiarów" — krótkie wprowadzenie do filozofii QA10. 3. QualitySealBlock — 10 sekcji, po jednej na wymiar: (1) Accessibility WCAG 2.2 AA, (2) Performance Core Web Vitals, (3) Privacy RODO + consent-first, (4) Security CSP + secret hygiene + HSTS, (5) SEO schema.org + hreflang + llms.txt, (6) Bilingual parity PL↔EN, (7) Tokens & design system reproducibility, (8) Provenance pełna ścieżka decyzji, (9) Holistic consistency, (10) Brand fidelity. Każda sekcja: nazwa, opis, jak weryfikujemy (link do audytu/raportu jeśli publiczny). 4. „O QA10" — kilka linijek o wykonawcy + link do `qa10.io`. 5. FAQBlock (5 pytań: po co Quality Seal, jak go zweryfikować, czy strona spełnia wszystkie 10 dzisiaj, kto audytuje, jak zgłosić problem). 6. CTASection („Masz pytanie do wykonawcy? Napisz: hello@qa10.io"). 7. Footer (z badge QA10 jak wszędzie). |
| Primary CTA | „Zobacz pieczęć u wykonawcy" → `https://qa10.io/seal/viaviator` (external) |
| Secondary CTA | „Napisz do wykonawcy: hello@qa10.io" → `mailto:hello@qa10.io` |
| Target keyword PL | „qa10 quality seal jakość wdrożenia" |
| Meta description PL | Strona Via Viator poświadczona pieczęcią QA10 Quality Seal v1.0: dostępność, performance, prywatność, bezpieczeństwo, SEO i pięć innych wymiarów. (153) |

## 20. `/en/quality` — Quality / QA10 Seal (EN)

| Pole | Treść |
|---|---|
| H1 EN | **QA10 Quality Seal — 10 dimensions of quality** |
| Subhead EN | The Via Viator website was designed, built and certified by QA10 sp. z o.o. against ten measurable criteria. Each can be independently verified. |
| Sekcje | identyczne jak PL |
| Primary CTA | „See the seal at the contractor" → `https://qa10.io/seal/viaviator` |
| Secondary CTA | „Email the contractor: hello@qa10.io" → `mailto:hello@qa10.io` |
| Target keyword EN | „QA10 Quality Seal website verification" |
| Meta description EN | The Via Viator website verified by QA10 Quality Seal v1.0: accessibility, performance, privacy, security, SEO and five other dimensions. (140) |

---

## 21. `/polityka-prywatnosci` — Polityka prywatności (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/polityka-prywatnosci` |
| Slug EN | `/en/privacy-policy` |
| Persona target | wszystkie (legal compliance — RODO) |
| H1 PL | **Polityka prywatności** |
| Hero subhead PL | Jak przetwarzamy Twoje dane osobowe, na jakiej podstawie prawnej i jakie masz prawa. Stan na 2026-05-31. |
| Sekcje | LegalContentLayout (long-form prose, MDX): 1. Administrator danych (Via Viator sp. z o.o. + NIP + adres TODO). 2. Cel i podstawa prawna przetwarzania (RODO art. 6 ust. 1 lit. b, f). 3. Kategorie danych. 4. Odbiorcy danych (AWS SES jako podmiot przetwarzający, Vercel jako hosting). 5. Czas przechowywania. 6. Prawa osoby (dostęp, sprostowanie, usunięcie, ograniczenie, przeniesienie, sprzeciw). 7. Skarga do PUODO. 8. Zautomatyzowane decyzje (brak). 9. Cookies (link do osobnej polityki). 10. Kontakt do administratora (`zarzad@viaviator.pl`). 11. Zmiany polityki. |
| Primary CTA | brak (strona legal) |
| Secondary CTA | „Pisz w sprawie danych: zarzad@viaviator.pl" → `mailto:zarzad@viaviator.pl` |
| Target keyword PL | „via viator polityka prywatności rodo" |
| Meta description PL | Polityka prywatności Via Viator sp. z o.o. — przetwarzanie danych, RODO, prawa osób, kontakt do administratora. Stan 2026-05-31. (132) |

## 22. `/en/privacy-policy` — Privacy policy (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Privacy policy** |
| Subhead EN | How we process your personal data, on what legal basis and what rights you have. As of 2026-05-31. |
| Sekcje | identyczne jak PL — tłumaczenie prawne, NIE łopatologia |
| Primary CTA | brak |
| Secondary CTA | „Write about data: zarzad@viaviator.pl" |
| Target keyword EN | „Via Viator privacy policy GDPR" |
| Meta description EN | Privacy policy of Via Viator sp. z o.o. — data processing, GDPR, data subject rights, controller contact. As of 2026-05-31. (122) |

---

## 23. `/polityka-cookies` — Polityka cookies (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/polityka-cookies` |
| Slug EN | `/en/cookies-policy` |
| Persona target | wszystkie (legal compliance — ePrivacy + RODO) |
| H1 PL | **Polityka cookies** |
| Hero subhead PL | Jakie ciasteczka używamy, do czego i jak nimi zarządzać. Consent-first — bez Twojej zgody nie odpalamy nic poza tym, co absolutnie niezbędne. |
| Sekcje | LegalContentLayout: 1. Co to są cookies. 2. Kategorie cookies używane na stronie: (a) niezbędne (always on — session, CSRF), (b) preferencje (język), (c) statystyczne (Plausible lub Vercel Analytics — consent-first), (d) marketingowe (brak w v1.0). 3. Tabela cookies (nazwa, dostawca, cel, czas trwania). 4. Jak zarządzać zgodami (link `#consent-manager` — re-otwiera manager). 5. Jak wyłączyć cookies w przeglądarce (krótko per Chrome/Firefox/Safari/Edge). 6. Kontakt (`zarzad@viaviator.pl`). 7. Zmiany polityki. |
| Primary CTA | „Zarządzaj zgodami" → `#consent-manager` (re-otwiera consent UI) |
| Secondary CTA | brak |
| Target keyword PL | „via viator polityka cookies zgody" |
| Meta description PL | Polityka cookies Via Viator — kategorie ciasteczek, consent-first analytics, zarządzanie zgodami. Bez zgody — tylko niezbędne. (130) |

## 24. `/en/cookies-policy` — Cookies policy (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Cookies policy** |
| Subhead EN | Which cookies we use, why and how to manage them. Consent-first — without your consent we don't fire anything beyond strictly necessary. |
| Sekcje | identyczne jak PL |
| Primary CTA | „Manage consents" → `#consent-manager` |
| Secondary CTA | brak |
| Target keyword EN | „Via Viator cookies policy consent management" |
| Meta description EN | Via Viator cookies policy — cookie categories, consent-first analytics, consent management. Without consent — strictly necessary only. (135) |

---

## 25. `/regulamin` — Regulamin (PL) *[scope-dodatkowy: poza listą 14 stron, ale wymagany dla `/wynajem-busa`]*

| Pole | Treść |
|---|---|
| Slug PL | `/regulamin` |
| Slug EN | `/en/terms` |
| Persona target | P5 wynajem (priorytet) + wszystkie (legal) |
| H1 PL | **Regulamin** |
| Hero subhead PL | Warunki świadczenia usług przewozu osób i wynajmu pojazdów Via Viator sp. z o.o. Do przeczytania przed pierwszym zleceniem lub odbiorem busa. |
| Sekcje | LegalContentLayout: 1. Definicje. 2. Zakres usług (przewóz, wynajem, eventy). 3. Zawarcie umowy. 4. Cennik i płatności. 5. Anulowanie i zwroty. 6. Odpowiedzialność przewoźnika. 7. Obowiązki wynajmującego (P5 specific — kaucja, limit km, zakaz palenia, zakaz wyjazdu poza UE bez zgody). 8. Reklamacje. 9. Postanowienia końcowe (jurysdykcja, sąd właściwy). 10. PDF do pobrania (TODO klient). |
| Primary CTA | brak |
| Secondary CTA | „Masz pytanie do regulaminu? Zadzwoń: +48 690 691 886" |
| Target keyword PL | „via viator regulamin wynajem przewóz" |
| Meta description PL | Regulamin świadczenia usług przewozu osób i wynajmu pojazdów Via Viator sp. z o.o. Warunki, cennik, anulowanie, reklamacje. (124) |

## 26. `/en/terms` — Terms (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Terms of service** |
| Subhead EN | Terms for passenger transport and vehicle rental services by Via Viator sp. z o.o. Read before your first order or van pickup. |
| Sekcje | identyczne jak PL |
| Primary CTA | brak |
| Secondary CTA | „Question about terms? Call: +48 690 691 886" |
| Target keyword EN | „Via Viator terms of service van rental" |
| Meta description EN | Terms of service for passenger transport and vehicle rental by Via Viator sp. z o.o. Conditions, pricing, cancellation, complaints. (130) |

---

## 27. `/impressum` — Impressum (PL)

| Pole | Treść |
|---|---|
| Slug PL | `/impressum` |
| Slug EN | `/en/legal-notice` |
| Persona target | wszystkie (legal — DE/EU compliance) |
| H1 PL | **Impressum** |
| Hero subhead PL | Dane rejestrowe podmiotu odpowiedzialnego za treść strony i podmiotu wykonawczego. |
| Sekcje | LegalContentLayout: 1. „Podmiot odpowiedzialny za treść": Via Viator sp. z o.o., NIP 6452595911, KRS TODO, adres TODO, telefon, email, reprezentacja (Patryk Tomeczek). 2. „Wykonawca strony": QA10 sp. z o.o., NIP 9542906279, `qa10.io`, email `hello@qa10.io`, pieczęć QA10 Quality Seal v1.0. 3. „Treść": za treść merytoryczną odpowiada Via Viator; za implementację techniczną i zgodność z 10 wymiarami QA10 — QA10. 4. „Linki zewnętrzne" — disclaimer. 5. „Prawa autorskie" — treść © Via Viator + QA10 2026. |
| Primary CTA | brak |
| Secondary CTA | „Skontaktuj się z Via Viator: kontakt@viaviator.pl" |
| Target keyword PL | „via viator impressum nip krs" |
| Meta description PL | Dane rejestrowe Via Viator sp. z o.o. — NIP, KRS, adres, organ rejestrowy. Wykonawca strony: QA10 sp. z o.o. (130) |

## 28. `/en/legal-notice` — Legal notice (EN)

| Pole | Treść |
|---|---|
| H1 EN | **Legal notice** |
| Subhead EN | Registration data of the entity responsible for the website content and the entity that built it. |
| Sekcje | identyczne jak PL |
| Primary CTA | brak |
| Secondary CTA | „Contact Via Viator: kontakt@viaviator.pl" |
| Target keyword EN | „Via Viator legal notice impressum" |
| Meta description EN | Company registration data of Via Viator sp. z o.o. — VAT ID, KRS, address, registration body. Website by QA10 sp. z o.o. (124) |

---

## Otwarte pytania do klienta (zbiorczo, z mapingu treści)

- **KRS** Via Viator sp. z o.o. — potrzebne na `/impressum`, `/polityka-prywatnosci`, w `Organization` schema.org.
- **Adres siedziby** — decyzja czy publikujemy na `/impressum` (rekomendacja: tak, choćby korespondencyjny).
- **Facebook Page URL + Messenger m.me handle** — krytyczne dla landingu `/przewozy-rodzinne` (P4 primary CTA prowadzi na Messenger).
- **Instagram** — istnieje czy nie. Wpływa na sekcję social w stopce i `sameAs` schema.
- **Cennik wynajmu Master** — stawki doba/weekend/tydzień + limit km + kaucja. Konkretne liczby zamiast „od".
- **Cennik wyposażenia eventowego** — czy publiczny per pozycja, czy „od X + RFQ".
- **Certyfikat PRM kierowcy** — jaki kurs, kiedy ukończony, czy mamy skan do referencji (sekcja na `/transport-dostepny`).
- **Lista parafii/grup współpracujących** — kogo możemy wymienić za zgodą (sekcja social proof na `/pielgrzymki`).
- **Zdjęcia z realizacji** — zgody RODO klientów (wesela, komunie, eventy) potrzebne dla `/przewozy-rodzinne`, `/imprezy`.
- **Logo strip B2B** — które marki możemy wymienić anonimowo a które z logo (sekcja social proof na `/transfery-korporacyjne`).
- **Regulamin wynajmu PDF** — finalny dokument do pobrania na `/wynajem-busa` i `/regulamin`.

---

**ArchitectUX Agent**: QA10 swarm
**Foundation Date**: 2026-05-31
**Developer Handoff**: ready for LuxuryDeveloper — copy gotowe do podstawienia w komponenty
**Next Steps**: LuxuryDeveloper konstruuje komponenty wg `03-ia.md` §5 + ten content matrix wypełnia kopię
