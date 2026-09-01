/**
 * Wikidata SPARQL source — the world's notable races (Majors, classic ultras, city
 * marathons) with coordinates, official website and Wikipedia article.
 *
 * Wikidata stores the race series rather than next year's date, so the next edition is
 * estimated from the most recent edition that carries a point-in-time (P585) value.
 * Anything without a derivable date is skipped rather than guessed from nothing.
 */

export const id = 'wikidata';

const ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'WhereToRun/0.1 (https://github.com/ClaudePlos/WhereToRun) node-fetch';

export const QUERY = `
SELECT ?race ?raceLabel ?raceDescription ?coord ?countryCode ?countryLabel ?placeLabel ?website ?article ?lastEdition WHERE {
  ?race wdt:P31/wdt:P279* ?class .
  VALUES ?class { wd:Q207468 wd:Q629561 wd:Q1141896 }
  ?race wdt:P625 ?coord .
  OPTIONAL { ?race wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  OPTIONAL { ?race wdt:P276|wdt:P131 ?place . }
  OPTIONAL { ?race wdt:P856 ?website . }
  OPTIONAL {
    ?article schema:about ?race ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }
  OPTIONAL {
    SELECT ?race (MAX(?editionDate) AS ?lastEdition) WHERE {
      ?edition wdt:P361|wdt:P179 ?race ;
               wdt:P585 ?editionDate .
    } GROUP BY ?race
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 400
`;

/** "Point(13.35 52.51)" -> { lat, lon } */
export function parsePoint(literal) {
  const match = /^Point\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/.exec(literal ?? '');
  if (!match) return null;
  return { lon: Number(match[1]), lat: Number(match[2]) };
}

/** Rolls the most recent known edition forward to the next occurrence in the future. */
export function nextEditionDate(lastEditionISO, today = new Date()) {
  if (!lastEditionISO) return null;
  const last = new Date(lastEditionISO);
  if (Number.isNaN(last.getTime())) return null;
  const next = new Date(Date.UTC(today.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
  if (next.getTime() <= today.getTime()) next.setUTCFullYear(next.getUTCFullYear() + 1);
  // Anything more than ~5 years stale is not a live race any more.
  if (today.getUTCFullYear() - last.getUTCFullYear() > 5) return null;
  return next.toISOString().slice(0, 10);
}

function classify(label, description) {
  const text = `${label} ${description ?? ''}`.toLowerCase();
  if (/ultra|100 ?km|100 ?mile|24[- ]hour/.test(text)) return { type: 'ultra', tags: ['ultra'] };
  if (/trail|mountain|sky ?race/.test(text)) return { type: 'trail', tags: ['trail'] };
  return { type: 'road', tags: ['road'] };
}

export function parseBindings(json, today = new Date()) {
  const bindings = json?.results?.bindings ?? [];
  const events = [];
  const now = new Date().toISOString();

  for (const row of bindings) {
    const name = row.raceLabel?.value?.trim();
    const point = parsePoint(row.coord?.value);
    const date = nextEditionDate(row.lastEdition?.value, today);
    const countryCode = row.countryCode?.value;
    if (!name || !point || !date || !countryCode) continue;
    if (/^Q\d+$/.test(name)) continue; // unlabelled item

    const { type, tags } = classify(name, row.raceDescription?.value);
    const links = [];
    if (row.article?.value) {
      links.push({ url: row.article.value, label: { en: 'Wikipedia', pl: 'Wikipedia' } });
    }

    events.push({
      name,
      date,
      dateStatus: 'estimated',
      type,
      tags: [...tags, 'wikidata'],
      distances: [],
      location: {
        city: row.placeLabel?.value?.trim() || name.replace(/ (Marathon|Ultra|Ultramarathon).*$/i, '').trim(),
        country: row.countryLabel?.value?.trim() ?? '',
        countryCode,
      },
      start: { lat: point.lat, lon: point.lon, name: null },
      fees: [],
      links,
      website: row.website?.value ?? null,
      source: { id, url: row.race?.value ?? null, ref: row.race?.value?.split('/').pop() ?? null, fetchedAt: now },
    });
  }
  return events;
}

export async function fetchEvents({ fetchImpl = fetch, today = new Date() } = {}) {
  const url = `${ENDPOINT}?query=${encodeURIComponent(QUERY)}`;
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Wikidata SPARQL returned ${response.status} ${response.statusText}`);
  }
  return parseBindings(await response.json(), today);
}
