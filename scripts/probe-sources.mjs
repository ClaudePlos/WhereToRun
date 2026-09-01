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
    id: 'duv-alt',
    status: 'candidate',
    note: 'DUV calendar, alternate query shape',
    url: `https://statistik.d-u-v.org/json/mcalendar.php?plain=1&year=${YEAR}&dist=all&country=all&cups=all`,
  },
  {
    id: 'runraceusa',
    status: 'candidate',
    note: 'Open CC BY 4.0 dump of US races',
    url: 'https://runraceusa.com/api/races.json',
  },
  {
    id: 'runraceusa-index',
    status: 'candidate',
    note: 'Landing page — read it for the real JSON URL if races.json 404s',
    url: 'https://runraceusa.com/api',
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

/** Finds the array of records inside an arbitrarily wrapped payload. */
export function findRecords(json) {
  if (Array.isArray(json)) return { path: '$', rows: json };
  if (!json || typeof json !== 'object') return null;
  for (const [key, value] of Object.entries(json)) {
    if (Array.isArray(value) && value.length > 0) return { path: `$.${key}`, rows: value };
  }
  for (const [key, value] of Object.entries(json)) {
    const nested = value && typeof value === 'object' ? findRecords(value) : null;
    if (nested) return { path: `$.${key}${nested.path.slice(1)}`, rows: nested.rows };
  }
  return null;
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
