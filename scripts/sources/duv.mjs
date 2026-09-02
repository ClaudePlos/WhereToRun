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
 * 2. No date filter. A from/to window makes the endpoint emit a PHP warning
 *    instead of JSON, and the month parameter is ignored, so the calendar is
 *    always returned from January in date order, 400 records to a page. Rather
 *    than walk months of past races, the first page holding a future race is
 *    found by binary search over the page index.
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

export function buildUrl({ year, page = 1 }) {
  const params = new URLSearchParams({
    plain: '1',
    year: String(year),
    dist: 'all',
    country: 'all',
    page: String(page),
  });
  return `${ENDPOINT}?${params}`;
}

/**
 * Pages are ordered by date, so the first page containing a race on or after
 * `today` can be found without downloading the ones before it. Returns 1 when
 * every page is in the future, and maxPage when they are all past.
 */
export async function findFirstUpcomingPage(readPage, maxPage, todayISO) {
  let low = 1;
  let high = maxPage;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const dates = (await readPage(middle)).map((row) => parseDate(row.Startdate)).filter(Boolean);
    const last = dates.length > 0 ? dates[dates.length - 1] : null;
    if (last !== null && last < todayISO) low = middle + 1;
    else high = middle;
  }
  return low;
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
  pagesToRead = 2,
  log = console,
} = {}) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)',
  };

  async function readPage(year, page) {
    const response = await fetchImpl(buildUrl({ year, page }), { headers });
    if (!response.ok) throw new Error(`DUV returned ${response.status} ${response.statusText}`);
    const json = await response.json();
    return { rows: json?.Races ?? [], maxPage: Number(json?.Pagination?.MaxPage ?? 1) };
  }

  const year = today.getUTCFullYear();
  const first = await readPage(year, 1);
  const cache = new Map([[1, first.rows]]);

  const startPage = await findFirstUpcomingPage(
    async (page) => {
      if (!cache.has(page)) cache.set(page, (await readPage(year, page)).rows);
      return cache.get(page);
    },
    Math.max(1, first.maxPage),
    today.toISOString().slice(0, 10),
  );

  const rows = [];
  for (let page = startPage; page < startPage + pagesToRead && page <= first.maxPage; page += 1) {
    rows.push(...(cache.get(page) ?? (await readPage(year, page)).rows));
  }
  // Late in the season the remaining pages are thin, so top up from next year.
  if (rows.length < 100) {
    const next = await readPage(year + 1, 1);
    rows.push(...next.rows);
  }

  const candidates = parseRaces(rows, { today });
  if (!geocoder) return [];

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
    `  duv: ${candidates.length} upcoming races, ${located.length} with coordinates`,
  );
  return located;
}
