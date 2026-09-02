# WhereToRun

A bilingual (English / Polish) static portal for the world's most interesting running events —
dates, entry fees, start locations and OpenStreetMap maps with the start line marked.
It runs entirely from GitHub: GitHub Pages hosts the site, GitHub Actions refreshes the data
three times a day.

*Dwujęzyczny (EN/PL) statyczny portal o najciekawszych biegach świata — terminy, opłaty startowe,
lokalizacje i mapy OpenStreetMap z zaznaczonym miejscem startu. Działa w całości z GitHuba:
GitHub Pages hostuje stronę, GitHub Actions odświeża dane trzy razy dziennie.*

---

## English

### What it does

- **Two languages, one build.** English is the default at `/`, Polish lives under `/pl/`.
  Every event carries hand-written or generated copy in both languages.
- **Maps.** Each event page shows a Leaflet map on OpenStreetMap tiles with a marker on the
  start line; the home page plots every upcoming race on one world map.
- **Fees and links.** Entry fees where they are published (marked `≈` when indicative),
  plus links to the organiser, registration and the data source.
- **Filters.** Search, country, race type and tag, all client-side — no backend.
- **Self-updating.** A scheduled workflow collects new events, validates them against a schema
  and commits them; the commit redeploys the site.

### Running locally

```bash
npm install
npm run dev        # http://localhost:4321/WhereToRun/
npm run build      # static output in dist/
npm test           # unit tests for the collector and schema
npm run validate   # check every file in data/events against the schema
```

Collect events by hand:

```bash
npm run collect                      # all sources
npm run collect:dry                  # no files written
node scripts/collect.mjs --sources=runsignup --max-new=10
node scripts/collect.mjs --sources=duv --max-geocode=3   # cap Nominatim lookups
```

### Geocoding

DUV publishes a town and a country but no coordinates. Towns are resolved through
[Nominatim](https://nominatim.openstreetmap.org/) and cached in `data/geocache.json`, which is
committed: each town is looked up once ever, never once per run. Nominatim's usage policy is
enforced in code — one request a second, an identifying User-Agent, and a hard cap per run
(`--max-geocode`, default 10), so the world calendar fills in over days instead of hammering a
donated service. Geocoded pins are town-level and marked `precision: "city"` in the UI.

### Data sources

| Source | Key needed | What it provides |
|---|---|---|
| `curated` | no | Hand-written entries for the world's best-known races, verified against organiser sites. |
| `runsignup` | no | [RunSignup's open REST API](https://runsignup.com/API): dates, coordinates, entry fees and registration links. Mostly North America. |
| `ultrasignup` | no | The calendar behind [UltraSignup](https://ultrasignup.com/), where most US trail and ultra races register. Exact start coordinates, no fees. |
| `runraceusa` | no | [RunRaceUSA's](https://runraceusa.com/api) nightly CC BY 4.0 dump, itself aggregating six registration platforms. Coordinates are often only the host town, and are flagged as such. |
| `duv` | no | The [DUV worldwide ultramarathon calendar](https://statistik.d-u-v.org/) — the only source here with genuinely global reach. Publishes no coordinates, so host towns are geocoded once each and cached. |
| `wikidata` | no | [Wikidata SPARQL](https://query.wikidata.org/): notable races worldwide with coordinates, official sites and Wikipedia articles. Next-edition dates are estimated from the last known edition. |
| `ai-discovery` | `ANTHROPIC_API_KEY` | Claude with the web search tool proposes races the open APIs miss. Skipped silently when the key is absent. |

There is no single global race API — Ahotu and AIMS have no public one — so the collector
combines several and merges the results by source precedence
(`curated` > `runsignup` > `ultrasignup` > `runraceusa` > `duv` > `wikidata` > `ai-discovery`
for conflicts; lower-precedence sources still fill in fields the winner left empty). RunSignup
ranks highest of the automated sources because it is the only one carrying entry fees.

Sources are picked by probing them first, not by trusting documentation:

```bash
node scripts/probe-sources.mjs             # every endpoint
node scripts/probe-sources.mjs duv         # just one
```

It prints each endpoint's status, payload shape and first record. The same script runs from
the Actions tab as **Probe data sources** — useful when a collector run reports `fetched: 0`
and you need to know whether the endpoint died or just renamed a field.

### Repository setup

1. **Pages** is enabled by the deploy workflow itself on its first run
   (`actions/configure-pages` with `enablement: true`), and the site URL and base path are
   read back from it, so nothing is hard-coded. Check it under **Settings → Pages** afterwards.
2. *(Optional)* **Settings → Secrets and variables → Actions → New repository secret:**
   `ANTHROPIC_API_KEY` to enable AI discovery. Everything else works without it.
3. **Settings → Actions → General → Workflow permissions: Read and write**, so the scheduled
   collector can commit the data it finds.

The collector runs at 06:23, 13:13 and 20:13 UTC — deliberately off the hour, because GitHub
queues every cron scheduled on :00 together and those runs are the ones most often delayed.
It can also be triggered by hand from the Actions tab (with optional source filter and dry-run).

### Adding or fixing an event

Each event is one JSON file in `data/events/<slug>.json`. Edit it, or add a new one, and open
a pull request — `npm run validate` in CI checks the shape. Set `"manual": true` on an entry
and the automated collector will never overwrite it.

Curated events live in `scripts/sources/curated.mjs`; add one there to have it regenerated by
the pipeline with the same validation as every other source.

### Accuracy

Dates with `"dateStatus": "estimated"` come from an event's usual pattern rather than an
organiser's announcement, fees with `"indicative": true` are ballpark figures, and
`"start": { "precision": "city" }` means the pin is the host town rather than the start line.
All three are labelled in the UI. Always confirm on the organiser's own site before booking a trip.

---

## Polski

### Co to jest

- **Dwa języki, jeden build.** Angielski jest domyślny pod `/`, polski pod `/pl/`.
  Każdy bieg ma opis w obu językach — ręcznie pisany lub generowany z danych.
- **Mapy.** Strona biegu pokazuje mapę Leaflet na kafelkach OpenStreetMap z pinezką na starcie;
  strona główna nanosi wszystkie nadchodzące biegi na jedną mapę świata.
- **Opłaty i linki.** Opłaty startowe tam, gdzie są opublikowane (`≈` oznacza cenę orientacyjną),
  plus linki do organizatora, zapisów i źródła danych.
- **Filtry.** Wyszukiwarka, kraj, typ biegu i tag — wszystko po stronie przeglądarki, bez backendu.
- **Samoaktualizacja.** Zaplanowany workflow zbiera nowe biegi, waliduje je względem schematu
  i commituje; commit uruchamia ponowne wdrożenie strony.

### Uruchomienie lokalnie

```bash
npm install
npm run dev        # http://localhost:4321/WhereToRun/
npm run build      # statyczny wynik w dist/
npm test           # testy jednostkowe kolektora i schematu
npm run validate   # sprawdzenie wszystkich plików w data/events
```

Ręczne zebranie danych:

```bash
npm run collect                      # wszystkie źródła
npm run collect:dry                  # bez zapisu plików
node scripts/collect.mjs --sources=runsignup --max-new=10
node scripts/collect.mjs --sources=duv --max-geocode=3   # cap Nominatim lookups
```

### Geocoding

DUV publishes a town and a country but no coordinates. Towns are resolved through
[Nominatim](https://nominatim.openstreetmap.org/) and cached in `data/geocache.json`, which is
committed: each town is looked up once ever, never once per run. Nominatim's usage policy is
enforced in code — one request a second, an identifying User-Agent, and a hard cap per run
(`--max-geocode`, default 10), so the world calendar fills in over days instead of hammering a
donated service. Geocoded pins are town-level and marked `precision: "city"` in the UI.

### Źródła danych

| Źródło | Klucz | Co daje |
|---|---|---|
| `curated` | nie | Ręcznie pisane wpisy o najbardziej znanych biegach świata, weryfikowane na stronach organizatorów. |
| `runsignup` | nie | [Otwarte API REST RunSignup](https://runsignup.com/API): terminy, współrzędne, opłaty startowe i linki do zapisów. Głównie Ameryka Północna. |
| `ultrasignup` | nie | Kalendarz [UltraSignup](https://ultrasignup.com/), gdzie zapisuje się większość amerykańskich biegów trailowych i ultra. Dokładne współrzędne startu, bez opłat. |
| `runraceusa` | nie | Codzienny zrzut [RunRaceUSA](https://runraceusa.com/api) na licencji CC BY 4.0, sam agregujący sześć platform zapisowych. Współrzędne to często tylko miejscowość — i tak są oznaczane. |
| `duv` | nie | [Światowy kalendarz ultramaratonów DUV](https://statistik.d-u-v.org/) — jedyne źródło o naprawdę globalnym zasięgu. Nie podaje współrzędnych, więc miejscowości są geokodowane raz i zapisywane w cache'u. |
| `wikidata` | nie | [Wikidata SPARQL](https://query.wikidata.org/): znane biegi z całego świata ze współrzędnymi, stronami oficjalnymi i artykułami Wikipedii. Data kolejnej edycji jest szacowana na podstawie ostatniej znanej. |
| `ai-discovery` | `ANTHROPIC_API_KEY` | Claude z wyszukiwaniem w sieci proponuje biegi, których nie mają otwarte API. Bez klucza źródło jest po prostu pomijane. |

Nie istnieje jedno globalne API z biegami — Ahotu ani AIMS nie udostępniają publicznego —
więc kolektor łączy kilka źródeł i scala wyniki według priorytetu
(przy konflikcie `curated` > `runsignup` > `ultrasignup` > `runraceusa` > `duv` >
`wikidata` > `ai-discovery`; źródła o niższym priorytecie i tak uzupełniają pola, których zwycięzca nie
wypełnił). RunSignup stoi najwyżej wśród źródeł automatycznych, bo jako jedyne niesie opłaty
startowe.

Źródła dobieramy, sprawdzając je na żywo, a nie ufając dokumentacji:

```bash
node scripts/probe-sources.mjs             # wszystkie endpointy
node scripts/probe-sources.mjs duv         # tylko jeden
```

Skrypt wypisuje status, kształt odpowiedzi i pierwszy rekord. To samo uruchamia się z zakładki
Actions jako **Probe data sources** — przydaje się, gdy kolektor raportuje `fetched: 0` i trzeba
wiedzieć, czy endpoint padł, czy tylko zmienił nazwy pól.

### Konfiguracja repozytorium

1. **Pages** włącza się samo przy pierwszym uruchomieniu workflow wdrożeniowego
   (`actions/configure-pages` z `enablement: true`), a adres strony i ścieżka bazowa są z niego
   odczytywane — nic nie jest zapisane na sztywno. Po fakcie sprawdź **Settings → Pages**.
2. *(Opcjonalnie)* **Settings → Secrets and variables → Actions → New repository secret:**
   `ANTHROPIC_API_KEY`, żeby włączyć źródło AI. Reszta działa bez klucza.
3. **Settings → Actions → General → Workflow permissions: Read and write**, żeby automat
   mógł commitować znalezione dane.

Kolektor uruchamia się o 06:23, 13:13 i 20:13 UTC — celowo nie o pełnych godzinach, bo GitHub
kolejkuje wszystkie zadania cron ustawione na :00 naraz i to one najczęściej się opóźniają.
Można go też odpalić ręcznie z zakładki Actions (z opcjonalnym wyborem źródeł i trybem dry-run).

### Dodawanie i poprawianie biegów

Każdy bieg to jeden plik JSON w `data/events/<slug>.json`. Popraw go albo dodaj nowy i otwórz
pull request — `npm run validate` w CI sprawdzi strukturę. Ustaw `"manual": true`, a automat
nigdy nie nadpisze takiego wpisu.

Wpisy kuratorowane znajdują się w `scripts/sources/curated.mjs`; dodanie biegu tam sprawia,
że przechodzi on przez ten sam pipeline walidacji co pozostałe źródła.

### O dokładności danych

Daty z `"dateStatus": "estimated"` wynikają z typowego terminu biegu, a nie z ogłoszenia
organizatora; opłaty z `"indicative": true` są orientacyjne. Jedno i drugie jest oznaczone
w interfejsie. Przed rezerwacją wyjazdu zawsze potwierdź dane na stronie organizatora.

---

## Licencja / License

Code: MIT. Map data © OpenStreetMap contributors (ODbL).
