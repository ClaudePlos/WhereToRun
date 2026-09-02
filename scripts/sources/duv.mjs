/**
 * DUV source — the worldwide ultramarathon calendar published by the Deutsche
 * Ultramarathon-Vereinigung at statistik.d-u-v.org.
 *
 * This is the only source in the project with genuinely global reach: everything
 * else is North American, and Wikidata only knows races notable enough to have an
 * article. DUV lists the season's ultras from Brazil to Japan, with dates that
 * come from organisers rather than being rolled forward from a past edition.
 *
 * Two things make it awkward, and both are handled here:
 *
 * 1. No coordinates. Records carry a town and a country, so each new town is
 *    geocoded once and cached; the pin is the town, marked precision "city".
 * 2. No usable date filter, and a hard result cap. A from/to window makes the
 *    endpoint emit a PHP warning instead of JSON, the month parameter is
 *    ignored, and a worldwide year query stops at 4000 records — which for 2026
 *    runs out in May. Every race such a query can reach is therefore already in
 *    the past. Asking country by country keeps each listing well under the cap
 *    and reaches December, so the source walks a rotating slice of countries per
 *    run and covers the world over a few days.
 */

import { alpha2, englishName } from '../lib/countries.mjs';
import { parseDistances } from '../lib/distances.mjs';

export const id = 'duv';

const ENDPOINT = 'https://statistik.d-u-v.org/json/mcalendar.php';

/** DUV writes "no end date" as a zeroed MySQL timestamp. */
const NO_DATE = /^0000-00-00/;

export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? '').trim());
  if (!match) return null;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

/**
 * A race is either a distance ("51.2km") or a time limit ("6h"); DUV fills one
 * field or the other and leaves the rest empty.
 */
export function raceDistances(length, duration) {
  const fromLength = parseDistances(length);
  if (fromLength.labels.length > 0) return fromLength;
  return parseDistances(duration);
}

/**
 * Countries with an ultra calendar worth reading, as IOC codes because that is
 * what DUV's country filter takes. Order is stable so the rotation below is
 * predictable; the list is not exhaustive and can grow.
 */
export const COUNTRIES = [
  'GER', 'FRA', 'ITA', 'ESP', 'GBR', 'POL', 'CZE', 'AUT', 'SUI', 'NED',
  'BEL', 'SWE', 'NOR', 'DEN', 'FIN', 'POR', 'GRE', 'HUN', 'ROU', 'SVK',
  'SLO', 'CRO', 'IRL', 'UKR', 'TUR', 'ISL', 'EST', 'LAT', 'LTU', 'BUL',
  'SRB', 'JPN', 'KOR', 'CHN', 'HKG', 'TPE', 'THA', 'MAS', 'IND', 'NEP',
  'AUS', 'NZL', 'RSA', 'KEN', 'MAR', 'BRA', 'ARG', 'CHI', 'MEX', 'CAN',
];

/**
 * Which countries this run looks at. Derived from the clock rather than stored,
 * so nothing has to be committed to keep the rotation moving: the three daily
 * runs each take a different slice and the whole list is covered in a few days.
 */
export function selectCountries(today, count, countries = COUNTRIES) {
  const slot = Math.floor(today.getTime() / (8 * 3600 * 1000));
  const start = (slot * count) % countries.length;
  return Array.from({ length: Math.min(count, countries.length) },
    (unused, i) => countries[(start + i) % countries.length]);
}

export function buildUrl({ year, country = 'all', page = 1 }) {
  const params = new URLSearchParams({
    plain: '1',
    year: String(year),
    dist: 'all',
    country,
    page: String(page),
  });
  return `${ENDPOINT}?${params}`;
}

export function parseRaces(rows, { today = new Date() } = {}) {
  const todayISO = today.toISOString().slice(0, 10);
  const out = [];

  for (const row of rows ?? []) {
    const name = String(row?.EventName ?? '').trim();
    if (name === '') continue;

    const date = parseDate(row.Startdate);
    if (!date || date < todayISO) continue;

    const city = String(row.City ?? '').trim();
    if (city === '') continue;

    const countryCode = alpha2(row.Country);
    if (!countryCode) continue;

    const endDateRaw = NO_DATE.test(String(row.Enddate ?? '')) ? null : parseDate(row.Enddate);
    const distances = raceDistances(row.Length, row.Duration);
    const eventId = String(row.EventID ?? '').trim();

    out.push({
      name,
      date,
      endDate: endDateRaw && endDateRaw > date ? endDateRaw : null,
      dateStatus: 'confirmed',
      // Everything DUV lists is an ultramarathon; that is the point of the site.
      type: 'ultra',
      distances: distances.labels,
      tags: ['duv', 'ultra', ...(row.IAULabel && row.IAULabel !== 'N' ? ['iau-label'] : [])],
      location: {
        city,
        region: null,
        country: englishName(countryCode),
        countryCode,
      },
      // Filled in by fetchEvents once the town has been geocoded.
      start: null,
      fees: [],
      links: [],
      website: null,
      registrationUrl: null,
      source: {
        id,
        url: eventId ? `https://statistik.d-u-v.org/getresultevent.php?event=${eventId}` : null,
        ref: eventId,
        fetchedAt: new Date().toISOString(),
      },
    });
  }

  return out;
}

export async function fetchEvents({
  fetchImpl = fetch,
  today = new Date(),
  geocoder = null,
  countriesPerRun = 6,
  log = console,
} = {}) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)',
  };

  async function readPage(year, country, page) {
    const response = await fetchImpl(buildUrl({ year, country, page }), { headers });
    if (!response.ok) throw new Error(`DUV returned ${response.status} ${response.statusText}`);
    const json = await response.json();
    return { rows: json?.Races ?? [], maxPage: Number(json?.Pagination?.MaxPage ?? 1) };
  }

  const year = today.getUTCFullYear();
  const countries = selectCountries(today, countriesPerRun);
  const rows = [];

  for (const country of countries) {
    try {
      const first = await readPage(year, country, 1);
      rows.push(...first.rows);
      // Listings run January-first, so the season's remaining races sit on the
      // last page; for a big country that is not page one.
      for (let page = first.maxPage; page > 1 && page > first.maxPage - 2; page -= 1) {
        rows.push(...(await readPage(year, country, page)).rows);
      }
      // Next season opens before this one ends, and by autumn it is most of
      // what is left to enter.
      rows.push(...(await readPage(year + 1, country, 1)).rows);
    } catch (error) {
      // One unreachable country must not cost the whole run.
      log.warn?.(`! duv ${country}: ${error.message ?? error}`);
    }
  }

  const candidates = parseRaces(rows, { today });
  if (!geocoder) {
    log.warn?.('  duv: no geocoder supplied, skipping (records carry no coordinates)');
    return [];
  }

  const located = [];
  for (const event of candidates) {
    const place = await geocoder.lookup(
      event.location.city,
      event.location.countryCode,
      event.location.country,
    );
    // No coordinates means no map pin, and a map pin is the point of an entry.
    // The town stays uncollected until a later run has budget to geocode it.
    if (!place) continue;
    located.push({
      ...event,
      start: { lat: place.lat, lon: place.lon, name: null, precision: 'city' },
    });
  }

  log.info?.(
    `  duv: ${countries.join(', ')} → ${candidates.length} upcoming races, ` +
    `${located.length} with coordinates`,
  );
  return located;
}
