/**
 * Town-level geocoding through Nominatim, for sources that publish a place name
 * but no coordinates.
 *
 * Nominatim is free and run on donated infrastructure, and its usage policy is
 * explicit: no more than one request a second, a real User-Agent, and results
 * must be cached rather than re-requested. All three are enforced here, plus a
 * hard cap per run — the world's ultra calendar has thousands of towns in it,
 * and grinding through them in one job would be exactly the abuse the policy
 * forbids. The cache lives in the repository, so each town is looked up once
 * ever and the map fills in over a few days of scheduled runs.
 */

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'WhereToRun/0.1 (+https://github.com/ClaudePlos/WhereToRun)';

/** A failed lookup is remembered this long before it is worth retrying. */
const MISS_TTL_DAYS = 30;

export function cacheKey(city, countryCode) {
  return `${String(countryCode ?? '').toUpperCase()}|${String(city ?? '').trim().toLowerCase()}`;
}

function isFresh(entry, now) {
  if (!entry?.at) return false;
  const age = (now.getTime() - Date.parse(entry.at)) / 86_400_000;
  return Number.isFinite(age) && age < MISS_TTL_DAYS;
}

/** Nominatim returns lat/lon as strings; anything else means no usable answer. */
export function readPlace(json) {
  const first = Array.isArray(json) ? json[0] : null;
  if (!first) return null;
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, name: first.display_name ?? null };
}

/**
 * @param cache  Plain object read from data/geocache.json; mutated in place so the
 *               caller can write it back after the run.
 */
export function createGeocoder({
  cache = {},
  fetchImpl = fetch,
  now = new Date(),
  maxLookups = 10,
  minIntervalMs = 1100,
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = console,
} = {}) {
  let lookupsUsed = 0;
  let lastRequestAt = 0;
  const stats = { hits: 0, misses: 0, lookups: 0, capped: 0, errors: 0 };

  async function lookup(city, countryCode, countryName) {
    const key = cacheKey(city, countryCode);
    const cached = cache[key];

    if (cached?.lat != null) {
      stats.hits += 1;
      return { lat: cached.lat, lon: cached.lon, name: cached.name ?? null };
    }
    // A remembered failure: don't spend the run's budget re-asking.
    if (cached && isFresh(cached, now)) {
      stats.misses += 1;
      return null;
    }

    if (lookupsUsed >= maxLookups) {
      stats.capped += 1;
      return null;
    }
    lookupsUsed += 1;
    stats.lookups += 1;

    const sinceLast = Date.now() - lastRequestAt;
    if (lastRequestAt !== 0 && sinceLast < minIntervalMs) await wait(minIntervalMs - sinceLast);
    lastRequestAt = Date.now();

    const params = new URLSearchParams({
      format: 'json',
      limit: '1',
      city: String(city ?? '').trim(),
      country: String(countryName ?? countryCode ?? '').trim(),
    });

    let place = null;
    try {
      const response = await fetchImpl(`${ENDPOINT}?${params}`, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      });
      if (!response.ok) throw new Error(`Nominatim returned ${response.status} ${response.statusText}`);
      place = readPlace(await response.json());
    } catch (error) {
      // Network trouble is not a permanent miss: leave the key uncached so the
      // next run tries again instead of burying the town for a month.
      stats.errors += 1;
      log.warn?.(`! geocode ${key}: ${error.message ?? error}`);
      return null;
    }

    cache[key] = place
      ? { lat: place.lat, lon: place.lon, name: place.name, at: now.toISOString() }
      : { at: now.toISOString() };

    if (!place) stats.misses += 1;
    return place;
  }

  return { lookup, stats };
}
