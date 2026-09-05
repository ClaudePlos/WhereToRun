/**
 * RunRaceUSA source — https://runraceusa.com/api
 *
 * A nightly CC BY 4.0 dump of upcoming US races, itself aggregated from six
 * registration platforms. RunSignup is one of them, so the overlap is expected
 * and handled by merge precedence; the value here is the other five, which no
 * other free source in this project reaches.
 *
 * Records carry a `geo` field saying how the coordinates were derived. Anything
 * geocoded to the host town is marked `precision: 'city'` so the site can say
 * the pin is the town rather than the start line, which is the whole promise of
 * the map.
 */

import { parseDistances, isNotableDistance, isMultisport } from '../lib/distances.mjs';

export const id = 'runraceusa';

const ENDPOINT = 'https://runraceusa.com/data/upcoming.json';

const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
]);

/** Only `city` is known to mean "geocoded to the town"; treat the rest as exact. */
export function startPrecision(geo) {
  return String(geo ?? '').toLowerCase() === 'city' ? 'city' : 'exact';
}

/**
 * The `d` field is a list of distance labels, sometimes empty. An empty list is
 * not evidence of a long race, so those records are dropped unless the name
 * itself says otherwise — this dump is dominated by 5Ks.
 */
export function isInteresting(name, distances) {
  if (distances.labels.length > 0 && isNotableDistance(distances)) return true;
  return /\b(ultra|marathon|100\s?(?:k|mile|miler)|50\s?(?:k|mile|miler)|24[- ]hour)\b/i.test(
    String(name ?? ''),
  ) && !/half[- ]marathon/i.test(String(name ?? ''));
}

export function parseRaces(json, { today = new Date() } = {}) {
  const rows = Array.isArray(json?.races) ? json.races : [];
  const fetchedAt = new Date().toISOString();
  const out = [];

  for (const row of rows) {
    const name = String(row?.name ?? '').trim();
    if (name === '') continue;

    const date = String(row.date ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (new Date(`${date}T23:59:59Z`) < today) continue;

    const lat = Number(row.lat);
    const lon = Number(row.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat === 0 && lon === 0) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;

    const state = String(row.state ?? '').trim().toUpperCase();
    if (!US_STATES.has(state)) continue;

    const city = String(row.city ?? '').trim();
    if (city === '') continue;

    const distances = parseDistances(Array.isArray(row.d) ? row.d.join(',') : row.d);
    if (!isInteresting(name, distances)) continue;

    const multisport = isMultisport(name, distances.labels.join(' '));
    const isUltra = distances.km.some((value) => value > 42.5)
      || distances.timedHours >= 6
      || /\bultra\b/i.test(name);
    const isTrail = /trail|mountain|ridge|canyon|peak|forest/i.test(name);
    const type = multisport ? 'triathlon' : isUltra ? 'ultra' : isTrail ? 'trail' : 'road';
    const url = typeof row.url === 'string' && row.url.startsWith('http') ? row.url : null;

    out.push({
      name,
      date,
      endDate: null,
      dateStatus: 'confirmed',
      type,
      distances: distances.labels,
      tags: ['runraceusa', type],
      location: { city, region: state, country: 'United States', countryCode: 'US' },
      start: { lat, lon, name: null, precision: startPrecision(row.geo) },
      // The dump carries no prices.
      fees: [],
      links: [],
      website: url,
      registrationUrl: url,
      source: { id, url, ref: String(row.s ?? ''), fetchedAt },
    });
  }

  return out;
}

export async function fetchEvents({ fetchImpl = fetch, today = new Date() } = {}) {
  const response = await fetchImpl(ENDPOINT, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)',
    },
  });
  if (!response.ok) {
    throw new Error(`RunRaceUSA returned ${response.status} ${response.statusText}`);
  }
  return parseRaces(await response.json(), { today });
}
