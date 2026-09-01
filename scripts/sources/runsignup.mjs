/**
 * RunSignup REST source — https://runsignup.com/API
 * Public races need no API key. Huge volume, mostly North America, and the only free
 * source here that reliably carries entry fees plus a working registration link.
 *
 * Only races that clear the "worth a portal entry" bar are kept: marathon distance and
 * up, or trail/ultra events, and only when the race exposes usable coordinates.
 */

export const id = 'runsignup';

const ENDPOINT = 'https://runsignup.com/rest/races';
const KM_PER_MILE = 1.609344;

function toKilometres(distance, unit) {
  const value = Number(String(distance ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(value) || value <= 0) return null;
  const normalized = String(unit ?? '').toUpperCase();
  if (normalized.startsWith('M')) return value * KM_PER_MILE;
  if (normalized.startsWith('K')) return value;
  return null;
}

function parseDate(value) {
  // RunSignup returns dates such as "10/11/2026" or "2026-10-11".
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value);
  if (us) return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString().slice(0, 10);
}

function coordinates(race) {
  const lat = Number(race.latitude ?? race.address?.latitude);
  const lon = Number(race.longitude ?? race.address?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat === 0 && lon === 0) return null;
  return { lat, lon };
}

function collectFees(events) {
  const fees = [];
  for (const event of events ?? []) {
    for (const period of event.registration_periods ?? []) {
      const amount = Number(String(period.race_fee ?? '').replace(/[^\d.]/g, ''));
      if (!Number.isFinite(amount) || amount <= 0) continue;
      fees.push({
        amount,
        currency: 'USD',
        indicative: false,
        label: {
          en: `${event.name ?? 'Entry'} — registration fee`,
          pl: `${event.name ?? 'Zapisy'} — opłata startowa`,
        },
      });
    }
  }
  // One fee per distance is enough; keep the cheapest few so the card stays readable.
  return fees.sort((a, b) => a.amount - b.amount).slice(0, 3);
}

/** Marathon and up, or anything explicitly trail/ultra. */
export function isInteresting(race, distancesKm) {
  const text = `${race.name ?? ''} ${race.description ?? ''}`.toLowerCase();
  if (/ultra|100 ?mile|50 ?mile|100 ?k|24[- ]hour|trail/.test(text)) return true;
  return distancesKm.some((km) => km >= 41);
}

export function parseRaces(json, { today = new Date() } = {}) {
  const rows = json?.races ?? [];
  const now = new Date().toISOString();
  const out = [];

  for (const row of rows) {
    const race = row?.race ?? row;
    if (!race?.name) continue;
    if (race.is_draft_race === 'T' || race.is_private_race === 'T') continue;

    const date = parseDate(race.next_date ?? race.last_date);
    if (!date || new Date(`${date}T23:59:59Z`) < today) continue;

    const point = coordinates(race);
    if (!point) continue;

    const countryCode = String(race.address?.country_code ?? '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) continue;

    const events = race.events ?? [];
    const distancesKm = events
      .map((event) => toKilometres(event.distance, event.distance_unit))
      .filter((km) => km !== null);
    if (!isInteresting(race, distancesKm)) continue;

    const distances = [...new Set(distancesKm.map((km) => `${Math.round(km * 10) / 10} km`))].sort(
      (a, b) => parseFloat(a) - parseFloat(b),
    );
    const isUltra = distancesKm.some((km) => km > 42.5);
    const isTrail = /trail|mountain/i.test(race.name);

    out.push({
      name: race.name.trim(),
      date,
      endDate: null,
      dateStatus: 'confirmed',
      type: isUltra ? 'ultra' : isTrail ? 'trail' : 'road',
      distances,
      tags: ['runsignup', isUltra ? 'ultra' : isTrail ? 'trail' : 'road'],
      location: {
        city: race.address?.city ?? '',
        region: race.address?.state ?? null,
        country: race.address?.country_code === 'US' ? 'United States' : (race.address?.country ?? ''),
        countryCode,
      },
      start: { lat: point.lat, lon: point.lon, name: race.address?.street ?? null },
      fees: collectFees(events),
      links: [],
      website: race.external_race_url || race.url || null,
      registrationUrl: race.url ?? null,
      source: { id, url: race.url ?? null, ref: String(race.race_id ?? ''), fetchedAt: now },
    });
  }
  return out;
}

export async function fetchEvents({ fetchImpl = fetch, today = new Date(), pages = 2, perPage = 250 } = {}) {
  const events = [];
  for (let page = 1; page <= pages; page += 1) {
    const params = new URLSearchParams({
      format: 'json',
      results_per_page: String(perPage),
      page: String(page),
      start_date: 'today',
      events: 'T',
      race_headings: 'F',
      race_links: 'F',
      include_event_days: 'F',
      only_partner_races: 'F',
      sort: 'date ASC',
    });
    const response = await fetchImpl(`${ENDPOINT}?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)' },
    });
    if (!response.ok) {
      throw new Error(`RunSignup returned ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    const parsed = parseRaces(json, { today });
    events.push(...parsed);
    if ((json?.races ?? []).length < perPage) break;
  }
  return events;
}
