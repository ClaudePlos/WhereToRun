#!/usr/bin/env node
/**
 * Probes the HTTP endpoints the collector depends on and prints what each one
 * actually returns: status, content type, and the shape of the payload.
 *
 * The portal is built on APIs that are public but mostly undocumented, so they
 * change shape without warning. Running this from the Actions tab answers the
 * question a failing collector cannot: is the endpoint gone, rate-limiting us,
 * or just returning different field names than the parser expects?
 *
 * Usage:
 *   node scripts/probe-sources.mjs                # every endpoint
 *   node scripts/probe-sources.mjs duv wikipedia  # only these ids
 */

const YEAR = new Date().getUTCFullYear();

/**
 * `live` endpoints back a wired-up source; `candidate` ones are being evaluated
 * for inclusion and are expected to fail until proven otherwise.
 */
export const ENDPOINTS = [
  {
    id: 'runsignup',
    status: 'live',
    url: 'https://runsignup.com/rest/races?format=json&results_per_page=3&start_date=today&events=T',
  },
  {
    id: 'wikidata',
    status: 'live',
    url: `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
      'SELECT ?race WHERE { ?race wdt:P31 wd:Q207468 } LIMIT 3',
    )}`,
  },
  {
    id: 'duv',
    status: 'candidate',
    note: 'DUV worldwide ultramarathon calendar',
    url: `https://statistik.d-u-v.org/json/mcalendar.php?year=${YEAR}&month=${
      new Date().getUTCMonth() + 1
    }&dist=all&country=all&plain=1`,
  },
  {
    id: 'duv-page2',
    status: 'candidate',
    note: 'Does a page parameter advance past the first 400 records?',
    url: `https://statistik.d-u-v.org/json/mcalendar.php?plain=1&year=${YEAR}&dist=all&country=all&page=2`,
  },
  {
    id: 'duv-event-a',
    status: 'candidate',
    note: 'Candidate per-event page, to link DUV races without guessing',
    url: 'https://statistik.d-u-v.org/eventdetail.php?eventid=128022',
    // Event 128022 is "BAU Binnenalsterultra"; both candidates answer 200 with
    // the site's generic title, so only the body says which one is the race.
    expect: 'Binnenalster',
  },
  {
    id: 'duv-event-b',
    status: 'candidate',
    note: 'Second candidate per-event page',
    url: 'https://statistik.d-u-v.org/getresultevent.php?event=128022',
    expect: 'Binnenalster',
  },
  {
    id: 'duv-from',
    status: 'candidate',
    note: 'Does a from/to date window work? (we only want future races)',
    url: `https://statistik.d-u-v.org/json/mcalendar.php?plain=1&from=${YEAR}-10-01&to=${YEAR}-12-31&dist=all&country=all`,
  },
  {
    id: 'duv-nextyear',
    status: 'candidate',
    note: 'Next season, to confirm the year parameter is honoured',
    url: `https://statistik.d-u-v.org/json/mcalendar.php?plain=1&year=${YEAR + 1}&dist=all&country=all`,
  },
  {
    id: 'runsignup-diagnose',
    status: 'live',
    note: 'Collector reports fetched:0 with no error — see what the API returns',
    url: 'https://runsignup.com/rest/races?format=json&results_per_page=3&start_date=today&events=T&race_headings=F&race_links=F&include_event_days=F&only_partner_races=F&sort=date+ASC',
  },
  {
    id: 'runsignup-isodate',
    status: 'live',
    note: 'Hypothesis: start_date=today is ignored, an explicit ISO date is not',
    url: `https://runsignup.com/rest/races?format=json&results_per_page=3&start_date=${
      new Date().toISOString().slice(0, 10)
    }&events=T&sort=date+ASC`,
  },
  {
    id: 'runsignup-window',
    status: 'live',
    note: 'Same, with an explicit end date closing the window',
    url: `https://runsignup.com/rest/races?format=json&results_per_page=3&start_date=${
      new Date().toISOString().slice(0, 10)
    }&end_date=${YEAR + 1}-12-31&events=T&sort=date+ASC`,
  },
  {
    id: 'runraceusa',
    status: 'candidate',
    note: 'Open CC BY 4.0 dump of US races',
    url: 'https://runraceusa.com/data/upcoming.json',
  },
  {
    id: 'runraceusa-index',
    status: 'candidate',
    note: 'Landing page — read it for the real JSON URL if the dump moves',
    url: 'https://runraceusa.com/api',
  },
  {
    id: 'nominatim',
    status: 'candidate',
    note: 'Geocoder — DUV gives city and country but no coordinates',
    url: 'https://nominatim.openstreetmap.org/search?format=json&limit=1&city=S%C3%A3o+Paulo&country=Brazil',
  },
  {
    id: 'wikipedia-pl',
    status: 'candidate',
    note: 'Polish summaries for the PL side of the portal',
    url: 'https://pl.wikipedia.org/api/rest_v1/page/summary/Maraton_Bosto%C5%84ski',
  },
  {
    id: 'ultrasignup',
    status: 'candidate',
    note: 'US trail/ultra calendar',
    url: 'https://ultrasignup.com/service/events.svc/closestevents?virtual=0&open=1&count=3',
  },
  {
    id: 'wikipedia',
    status: 'candidate',
    note: 'Official REST API, for enriching descriptions',
    url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Boston_Marathon',
  },
];

/** A compact, readable description of an unknown JSON value. */
export function describe(value, depth = 0) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array(0)';
    return depth >= 2 ? `array(${value.length})` : `array(${value.length}) of ${describe(value[0], depth + 1)}`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (depth >= 2) return `object{${keys.length} keys}`;
    return `{ ${keys.slice(0, 25).join(', ')}${keys.length > 25 ? ', …' : ''} }`;
  }
  if (typeof value === 'string') return value.length > 60 ? `string("${value.slice(0, 60)}…")` : `string("${value}")`;
  return `${typeof value}(${value})`;
}

const RECORD_KEYS = /^(races|events|results|items|records|data|entries|list)$/i;

/**
 * Finds the array of records inside an arbitrarily wrapped payload.
 *
 * Payloads often carry several arrays — RunRaceUSA's dump has a six-entry
 * `sources` list alongside the tens of thousands of `races` — so candidates are
 * scored rather than taken in key order: a promising key name wins, and length
 * breaks the tie. Arrays of objects beat arrays of strings, which are usually
 * metadata.
 */
export function findRecords(json, path = '$') {
  if (Array.isArray(json)) return json.length > 0 ? { path, rows: json } : null;
  if (!json || typeof json !== 'object') return null;

  const candidates = [];
  for (const [key, value] of Object.entries(json)) {
    const found = findRecords(value, `${path}.${key}`);
    if (!found) continue;
    const named = RECORD_KEYS.test(key) ? 1 : 0;
    const structured = typeof found.rows[0] === 'object' && found.rows[0] !== null ? 1 : 0;
    candidates.push({ ...found, score: [named, structured, found.rows.length] });
  }
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    for (let i = 0; i < a.score.length; i += 1) {
      if (a.score[i] !== b.score[i]) return b.score[i] - a.score[i];
    }
    return 0;
  });
  return { path: candidates[0].path, rows: candidates[0].rows };
}

async function probe(endpoint, fetchImpl) {
  const started = Date.now();
  const label = `${endpoint.id} [${endpoint.status}]${endpoint.note ? ` — ${endpoint.note}` : ''}`;
  console.log(`\n=== ${label}`);
  console.log(`    ${endpoint.url}`);

  let response;
  try {
    response = await fetchImpl(endpoint.url, {
      headers: {
        Accept: 'application/json, text/html;q=0.8',
        'User-Agent': 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)',
      },
      redirect: 'follow',
    });
  } catch (error) {
    console.log(`    NETWORK ERROR: ${error.message ?? error}`);
    return { id: endpoint.id, ok: false };
  }

  const type = response.headers.get('content-type') ?? 'unknown';
  const body = await response.text();
  console.log(`    HTTP ${response.status} ${response.statusText} · ${type} · ${body.length} bytes · ${Date.now() - started}ms`);

  if (endpoint.expect) {
    const found = body.toLowerCase().includes(endpoint.expect.toLowerCase());
    console.log(`    expect "${endpoint.expect}": ${found ? 'FOUND' : 'NOT FOUND'}`);
  }

  if (!response.ok) {
    console.log(`    body: ${body.slice(0, 200).replace(/\s+/g, ' ')}`);
    return { id: endpoint.id, ok: false };
  }

  if (!/json/i.test(type)) {
    // Not JSON: show the title and any URL that looks like a data file, which is
    // usually enough to find the real endpoint from a documentation page.
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim();
    const candidates = [...body.matchAll(/https?:\/\/[^\s"'<>]+\.(?:json|csv)\b/gi)].map((m) => m[0]);
    console.log(`    non-JSON response. title: ${title ?? '(none)'}`);
    if (candidates.length > 0) console.log(`    data links found: ${[...new Set(candidates)].slice(0, 5).join(', ')}`);
    else console.log(`    body: ${body.slice(0, 200).replace(/\s+/g, ' ')}`);
    return { id: endpoint.id, ok: false };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch (error) {
    console.log(`    JSON parse failed: ${error.message}`);
    return { id: endpoint.id, ok: false };
  }

  console.log(`    top level: ${describe(json)}`);
  // Wrapper fields carry the pagination and hit counts needed to page through a
  // calendar, so print them rather than only the records.
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    for (const [key, value] of Object.entries(json)) {
      if (Array.isArray(value)) continue;
      console.log(`      ${key} = ${describe(value, 1)}`);
    }
  }
  const found = findRecords(json);
  if (!found) {
    console.log('    no record array found');
    return { id: endpoint.id, ok: true, rows: 0 };
  }
  console.log(`    records at ${found.path}: ${found.rows.length}`);
  const first = found.rows[0];
  console.log(`    first record: ${describe(first)}`);
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    for (const [key, value] of Object.entries(first).slice(0, 30)) {
      console.log(`      ${key}: ${describe(value, 1)}`);
    }
    const raw = JSON.stringify(first);
    console.log(`    raw: ${raw.length > 1500 ? `${raw.slice(0, 1500)}…` : raw}`);
  }
  return { id: endpoint.id, ok: true, rows: found.rows.length };
}

export async function main(argv = [], { fetchImpl = fetch } = {}) {
  const wanted = argv.filter((arg) => !arg.startsWith('-'));
  const selected = wanted.length > 0 ? ENDPOINTS.filter((e) => wanted.includes(e.id)) : ENDPOINTS;
  if (selected.length === 0) {
    console.error(`No endpoint matched. Known ids: ${ENDPOINTS.map((e) => e.id).join(', ')}`);
    process.exitCode = 1;
    return;
  }
  for (const endpoint of selected) {
    await probe(endpoint, fetchImpl);
  }
  console.log('\nDone. Endpoints marked "candidate" are being evaluated, not yet collected from.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main(process.argv.slice(2));
}
