/**
 * UltraSignup source — the calendar behind ultrasignup.com, the registration
 * platform most US trail and ultra races run on.
 *
 * Chosen because it is the only free calendar found that ships coordinates with
 * every record, so its events land on the map without a geocoding round trip.
 * It carries no entry fees, which is why RunSignup stays the fee-bearing source
 * and merge precedence lets RunSignup win on overlapping races.
 *
 * The endpoint is undocumented, so the parser treats every field as optional and
 * drops anything it cannot read rather than guessing.
 */

export const id = 'ultrasignup';

const ENDPOINT = 'https://ultrasignup.com/service/events.svc/closestevents';
const KM_PER_MILE = 1.609344;

/**
 * The payload has no country field. Rather than assume every record is American
 * — UltraSignup does list the occasional race abroad — only recognised US state
 * and territory codes are accepted, and everything else is skipped.
 */
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
]);

/** "9/4/2026" (M/D/YYYY) -> "2026-09-04". */
export function parseDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(value ?? '').trim());
  if (!match) return null;
  const [, month, day, year] = match;
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

/**
 * Distances arrive as free text: "50K, 100 Mile", "48hrs, 36 Hour", "Marathon".
 * Returns readable labels plus the kilometre figures that could be derived, so
 * timed events ("48 h") keep a label without pretending to a distance.
 */
export function parseDistances(value) {
  const labels = [];
  const km = [];
  let timedHours = 0;

  for (const raw of String(value ?? '').split(/[,/]/)) {
    const token = raw.trim();
    if (token === '') continue;

    const hours = /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)$/i.exec(token);
    if (hours) {
      timedHours = Math.max(timedHours, Number(hours[1]));
      labels.push(`${Number(hours[1])} h`);
      continue;
    }

    const days = /^(\d+(?:\.\d+)?)\s*(?:d|day|days)$/i.exec(token);
    if (days) {
      timedHours = Math.max(timedHours, Number(days[1]) * 24);
      labels.push(`${Number(days[1])} d`);
      continue;
    }

    const kilometres = /^(\d+(?:\.\d+)?)\s*k(?:m)?$/i.exec(token);
    if (kilometres) {
      const value = Number(kilometres[1]);
      km.push(value);
      labels.push(`${value} km`);
      continue;
    }

    const miles = /^(\d+(?:\.\d+)?)\s*(?:m|mi|mile|miler|miles)$/i.exec(token);
    if (miles) {
      const value = Number(miles[1]) * KM_PER_MILE;
      km.push(value);
      labels.push(`${Math.round(value * 10) / 10} km`);
      continue;
    }

    if (/^marathon$/i.test(token)) {
      km.push(42.195);
      labels.push('42.2 km');
      continue;
    }
    if (/^half(?:\s*marathon)?$/i.test(token)) {
      km.push(21.0975);
      labels.push('21.1 km');
      continue;
    }

    // Unparseable but real — keep it as a label so the card is not misleading.
    labels.push(token);
  }

  return { labels: [...new Set(labels)], km, timedHours };
}

/**
 * Marathon and up, or any timed race of six hours or more. Shorter companion
 * distances travel with the event, but never justify an entry on their own.
 */
export function isInteresting({ km, timedHours }, categories) {
  if (/\bultra\b/i.test(String(categories ?? '').replace(/non[\s-]*ultra/gi, ''))) return true;
  if (timedHours >= 6) return true;
  return km.some((value) => value >= 41);
}

function coordinates(row) {
  const lat = Number(row.Latitude);
  const lon = Number(row.Longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat === 0 && lon === 0) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

export function parseEvents(json, { today = new Date() } = {}) {
  const rows = Array.isArray(json) ? json : (json?.events ?? []);
  const fetchedAt = new Date().toISOString();
  const out = [];

  for (const row of rows) {
    if (!row?.EventName) continue;
    if (row.Cancelled === true || row.VirtualEvent === true) continue;

    const date = parseDate(row.EventDate);
    if (!date || new Date(`${date}T23:59:59Z`) < today) continue;

    const point = coordinates(row);
    if (!point) continue;

    const state = String(row.State ?? '').trim().toUpperCase();
    if (!US_STATES.has(state)) continue;

    const city = String(row.City ?? '').trim();
    if (city === '') continue;

    const distances = parseDistances(row.Distances);
    if (!isInteresting(distances, row.DistanceCategories)) continue;

    const endDate = parseDate(row.EventDateEnd);
    const isUltra = distances.km.some((value) => value > 42.5) || distances.timedHours >= 6;
    const isTrail = /trail|mountain|ridge|canyon|peak|forest/i.test(row.EventName);
    const eventDateId = row.EventDateId ?? row.EventId;

    out.push({
      name: String(row.EventName).trim(),
      date,
      endDate: endDate && endDate > date ? endDate : null,
      dateStatus: 'confirmed',
      type: isUltra ? 'ultra' : isTrail ? 'trail' : 'road',
      distances: distances.labels,
      tags: ['ultrasignup', isUltra ? 'ultra' : isTrail ? 'trail' : 'road'],
      location: {
        city,
        region: state,
        country: 'United States',
        countryCode: 'US',
      },
      start: { lat: point.lat, lon: point.lon, name: null },
      // UltraSignup does not publish fees in this payload; RunSignup remains the
      // source that can fill them in for races listed on both.
      fees: [],
      links: [],
      website: typeof row.EventWebsite === 'string' && row.EventWebsite.startsWith('http')
        ? row.EventWebsite
        : null,
      registrationUrl: eventDateId ? `https://ultrasignup.com/register.aspx?did=${eventDateId}` : null,
      source: {
        id,
        url: eventDateId ? `https://ultrasignup.com/register.aspx?did=${eventDateId}` : null,
        ref: String(row.EventId ?? eventDateId ?? ''),
        fetchedAt,
      },
    });
  }

  return out;
}

export async function fetchEvents({ fetchImpl = fetch, today = new Date() } = {}) {
  const params = new URLSearchParams({ virtual: '0', open: '1', count: '500' });
  const response = await fetchImpl(`${ENDPOINT}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)',
    },
  });
  if (!response.ok) {
    throw new Error(`UltraSignup returned ${response.status} ${response.statusText}`);
  }
  return parseEvents(await response.json(), { today });
}
