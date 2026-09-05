import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRaces, isInteresting } from '../scripts/sources/runsignup.mjs';
import { parseBindings, parsePoint, nextEditionDate } from '../scripts/sources/wikidata.mjs';
import { extractJsonArray } from '../scripts/sources/ai-discovery.mjs';
import {
  parseEvents as parseUltraSignup,
  parseDistances as parseUltraSignupDistances,
  isInteresting as isUltraSignupInteresting,
} from '../scripts/sources/ultrasignup.mjs';
import { findRecords } from '../scripts/probe-sources.mjs';
import { parseRaces as parseDuv, selectCountries, buildUrl as duvUrl, COUNTRIES } from '../scripts/sources/duv.mjs';
import { alpha2 } from '../scripts/lib/countries.mjs';
import { createGeocoder } from '../scripts/lib/geocode.mjs';
import { isMultisport } from '../scripts/lib/distances.mjs';
import { EVENT_TYPES } from '../scripts/lib/schema.mjs';
import {
  parseRaces as parseRunRaceUsa,
  startPrecision,
  isInteresting as isRunRaceUsaInteresting,
} from '../scripts/sources/runraceusa.mjs';

const today = new Date('2027-01-01T00:00:00Z');

const runsignupPayload = {
  races: [
    {
      race: {
        race_id: 1,
        name: 'Big City Marathon',
        next_date: '05/02/2027',
        url: 'https://runsignup.com/Race/CA/City/BigCity',
        latitude: '43.6532',
        longitude: '-79.3832',
        address: { city: 'Toronto', state: 'ON', country_code: 'CA', street: '1 Front St' },
        events: [
          {
            name: 'Marathon',
            distance: '26.2',
            distance_unit: 'M',
            registration_periods: [{ race_fee: '120.00' }, { race_fee: '95.00' }],
          },
        ],
      },
    },
    {
      race: {
        race_id: 2,
        name: 'Village Fun Run 5K',
        next_date: '2027-06-01',
        latitude: '40.0',
        longitude: '-75.0',
        address: { city: 'Nowhere', country_code: 'US' },
        events: [{ name: '5K', distance: '5', distance_unit: 'K', registration_periods: [] }],
      },
    },
    {
      race: {
        race_id: 3,
        name: 'Past Marathon',
        next_date: '2026-06-01',
        latitude: '10',
        longitude: '10',
        address: { city: 'Old', country_code: 'US' },
        events: [{ name: 'Marathon', distance: '26.2', distance_unit: 'M' }],
      },
    },
    {
      race: {
        race_id: 4,
        name: 'No Coordinates Ultra',
        next_date: '2027-07-01',
        address: { city: 'Unknown', country_code: 'US' },
        events: [{ name: '100K', distance: '100', distance_unit: 'K' }],
      },
    },
    {
      race: {
        race_id: 5,
        name: 'Private Trail Ultra',
        next_date: '2027-07-01',
        is_private_race: 'T',
        latitude: '1', longitude: '1',
        address: { city: 'Secret', country_code: 'US' },
        events: [{ name: '50M', distance: '50', distance_unit: 'M' }],
      },
    },
  ],
};

test('runsignup keeps marathon-and-up races with usable coordinates', () => {
  const events = parseRaces(runsignupPayload, { today });
  assert.deepEqual(events.map((event) => event.name), ['Big City Marathon']);
});

test('runsignup converts miles to kilometres and keeps the cheapest fees first', () => {
  const [event] = parseRaces(runsignupPayload, { today });
  assert.deepEqual(event.distances, ['42.2 km']);
  assert.equal(event.date, '2027-05-02');
  assert.equal(event.location.countryCode, 'CA');
  assert.equal(event.start.lat, 43.6532);
  assert.deepEqual(event.fees.map((fee) => fee.amount), [95, 120]);
  assert.equal(event.fees[0].currency, 'USD');
});

test('isInteresting accepts trail and ultra names below marathon distance', () => {
  assert.equal(isInteresting({ name: 'Skyline Trail 30K' }, [30]), true);
  assert.equal(isInteresting({ name: 'Turkey Trot' }, [5, 10]), false);
});

test('wikidata point literals parse into lat/lon', () => {
  assert.deepEqual(parsePoint('Point(13.35 52.51)'), { lon: 13.35, lat: 52.51 });
  assert.equal(parsePoint('not a point'), null);
});

test('nextEditionDate rolls the last edition forward into the future', () => {
  assert.equal(nextEditionDate('2026-09-27T00:00:00Z', new Date('2027-01-01T00:00:00Z')), '2027-09-27');
  assert.equal(nextEditionDate('2026-09-27T00:00:00Z', new Date('2026-09-01T00:00:00Z')), '2026-09-27');
  assert.equal(nextEditionDate('2010-05-01T00:00:00Z', new Date('2027-01-01T00:00:00Z')), null, 'stale race dropped');
  assert.equal(nextEditionDate(null), null);
});

test('wikidata rows without coordinates, country or a derivable date are skipped', () => {
  const events = parseBindings({
    results: {
      bindings: [
        {
          race: { value: 'http://www.wikidata.org/entity/Q1' },
          raceLabel: { value: 'Example Ultra' },
          raceDescription: { value: 'annual ultramarathon' },
          coord: { value: 'Point(6.87 45.92)' },
          countryCode: { value: 'FR' },
          countryLabel: { value: 'France' },
          placeLabel: { value: 'Chamonix' },
          website: { value: 'https://example.org' },
          article: { value: 'https://en.wikipedia.org/wiki/Example' },
          lastEdition: { value: '2026-08-28T00:00:00Z' },
        },
        {
          race: { value: 'http://www.wikidata.org/entity/Q2' },
          raceLabel: { value: 'No Date Marathon' },
          coord: { value: 'Point(1 1)' },
          countryCode: { value: 'DE' },
        },
      ],
    },
  }, today);

  assert.equal(events.length, 1);
  const [event] = events;
  assert.equal(event.name, 'Example Ultra');
  assert.equal(event.type, 'ultra');
  assert.equal(event.date, '2027-08-28');
  assert.equal(event.dateStatus, 'estimated');
  assert.equal(event.location.city, 'Chamonix');
  assert.equal(event.links[0].url, 'https://en.wikipedia.org/wiki/Example');
});

test('AI discovery output survives prose around the JSON block', () => {
  const text = 'Here is what I found:\n```json\n[{"name":"Race"}]\n```\nHope that helps.';
  assert.deepEqual(extractJsonArray(text), [{ name: 'Race' }]);
  assert.deepEqual(extractJsonArray('no json here'), []);
  assert.deepEqual(extractJsonArray('```json\n{ broken\n```'), []);
});

// --- UltraSignup ---------------------------------------------------------
// Field names and value formats below are copied from a live probe run, not
// invented: "9/4/2026" dates, coordinates as strings, free-text distances.

const ultrasignupPayload = [
  {
    EventId: 8097,
    EventDateId: 64538,
    EventName: 'Bear Ridge 100 Mile',
    EventDate: '9/4/2027',
    EventDateEnd: '9/6/2027',
    Distances: '100 Mile, 50K',
    DistanceCategories: ' ultra',
    City: 'Lennox',
    State: 'SD',
    Latitude: '43.2842',
    Longitude: '-96.884',
    EventWebsite: 'https://example.org/bear-ridge',
    Cancelled: false,
    VirtualEvent: false,
  },
  {
    EventId: 2,
    EventDateId: 2,
    EventName: 'Timed Backyard Classic',
    EventDate: '10/1/2027',
    Distances: '48hrs, 36 Hour',
    DistanceCategories: ' non ultra',
    City: 'Austin',
    State: 'TX',
    Latitude: '30.2672',
    Longitude: '-97.7431',
    Cancelled: false,
    VirtualEvent: false,
  },
  {
    EventId: 3,
    EventDateId: 3,
    EventName: 'Sprint 10K',
    EventDate: '10/2/2027',
    Distances: '10K',
    DistanceCategories: ' non ultra',
    City: 'Reno',
    State: 'NV',
    Latitude: '39.5296',
    Longitude: '-119.8138',
    Cancelled: false,
    VirtualEvent: false,
  },
  {
    EventId: 4,
    EventDateId: 4,
    EventName: 'Cancelled 100K',
    EventDate: '10/3/2027',
    Distances: '100K',
    City: 'Denver',
    State: 'CO',
    Latitude: '39.7392',
    Longitude: '-104.9903',
    Cancelled: true,
    VirtualEvent: false,
  },
  {
    EventId: 5,
    EventDateId: 5,
    EventName: 'Overseas 100K',
    EventDate: '10/4/2027',
    Distances: '100K',
    City: 'Chamonix',
    State: 'HautgSavoie',
    Latitude: '45.9237',
    Longitude: '6.8694',
    Cancelled: false,
    VirtualEvent: false,
  },
];

test('ultrasignup keeps ultra and timed races, drops short, cancelled and non-US ones', () => {
  const events = parseUltraSignup(ultrasignupPayload, { today });
  assert.deepEqual(
    events.map((event) => event.name),
    ['Bear Ridge 100 Mile', 'Timed Backyard Classic'],
  );
});

test('ultrasignup reads M/D/YYYY dates and string coordinates', () => {
  const [race] = parseUltraSignup(ultrasignupPayload, { today });
  assert.equal(race.date, '2027-09-04');
  assert.equal(race.endDate, '2027-09-06');
  assert.deepEqual(race.start, { lat: 43.2842, lon: -96.884, name: null, precision: 'exact' });
  assert.equal(race.location.countryCode, 'US');
  assert.equal(race.registrationUrl, 'https://ultrasignup.com/register.aspx?did=64538');
});

test('ultrasignup converts miles to kilometres and labels timed races by duration', () => {
  assert.deepEqual(parseUltraSignupDistances('100 Mile, 50K').labels, ['160.9 km', '50 km']);
  const timed = parseUltraSignupDistances('48hrs, 36 Hour');
  assert.deepEqual(timed.labels, ['48 h', '36 h']);
  assert.equal(timed.timedHours, 48);
  assert.deepEqual(timed.km, []);
});

test('ultrasignup keeps unparseable distance text rather than dropping it', () => {
  assert.deepEqual(parseUltraSignupDistances('Marathon, Backyard').labels, ['42.2 km', 'Backyard']);
});

test('"non ultra" does not count as an ultra category', () => {
  assert.equal(isUltraSignupInteresting({ km: [10], timedHours: 0 }, ' non ultra'), false);
  assert.equal(isUltraSignupInteresting({ km: [10], timedHours: 0 }, ' ultra'), true);
});

test('probe picks the record array over a short metadata array', () => {
  // RunRaceUSA's dump carries a six-entry "sources" list next to its races.
  const found = findRecords({ sources: ['a', 'b'], races: [{ name: 'X' }, { name: 'Y' }] });
  assert.equal(found.path, '$.races');
  assert.equal(found.rows.length, 2);
});

// --- RunRaceUSA ----------------------------------------------------------
// Shape taken from a live probe of https://runraceusa.com/data/upcoming.json.

const runRaceUsaPayload = {
  window_days: 365,
  sources: ['runsignup', 'raceroster'],
  races: [
    {
      name: 'Prairie Ultra 50K',
      date: '2027-05-15',
      city: 'Dallas Center',
      state: 'IA',
      lat: 41.6853,
      lng: -93.9659,
      d: ['50K', '25K'],
      url: 'https://raceroster.com/events/2027/1/prairie-ultra',
      geo: 'city',
      s: 'prairie-ultra-50k-ia',
    },
    {
      name: 'Harbour Marathon',
      date: '2027-06-01',
      city: 'Portland',
      state: 'ME',
      lat: 43.6591,
      lng: -70.2568,
      d: ['Marathon'],
      url: 'https://example.org/harbour',
      geo: 'venue',
      s: 'harbour-marathon-me',
    },
    {
      name: 'Village Fun Run 5K',
      date: '2027-06-02',
      city: 'Nowhere',
      state: 'KS',
      lat: 39.0,
      lng: -98.0,
      d: ['5K'],
      geo: 'city',
      s: 'village-fun-run-ks',
    },
  ],
};

test('runraceusa keeps long races and drops the 5Ks that dominate the dump', () => {
  const races = parseRunRaceUsa(runRaceUsaPayload, { today });
  assert.deepEqual(races.map((race) => race.name), ['Prairie Ultra 50K', 'Harbour Marathon']);
});

test('runraceusa marks town-level coordinates as approximate', () => {
  const [ultra, marathon] = parseRunRaceUsa(runRaceUsaPayload, { today });
  assert.equal(ultra.start.precision, 'city');
  assert.equal(marathon.start.precision, 'exact');
});

test('startPrecision only trusts "city" to mean a geocoded town', () => {
  assert.equal(startPrecision('city'), 'city');
  assert.equal(startPrecision('venue'), 'exact');
  assert.equal(startPrecision(undefined), 'exact');
});

test('an empty distance list is not evidence of a long race', () => {
  const empty = { labels: [], km: [], timedHours: 0 };
  assert.equal(isRunRaceUsaInteresting('Some 5K', empty), false);
  assert.equal(isRunRaceUsaInteresting('Desert Ultra', empty), true);
  // A half marathon must not match on the word "marathon".
  assert.equal(isRunRaceUsaInteresting('City Half-Marathon', empty), false);
});

// --- DUV -----------------------------------------------------------------
// Field names, IOC country codes and the zeroed end-date sentinel are all taken
// from live probe output.

const duvRows = [
  {
    EventID: '128022',
    EventName: 'BAU Binnenalsterultra',
    City: 'Hamburg',
    Country: 'GER',
    Length: '51.2km',
    Duration: '',
    Startdate: '2027-01-01',
    Enddate: '0000-00-00 00:00:00',
    IAULabel: 'N',
  },
  {
    EventID: '128959',
    EventName: 'Ultramaraton non stop 6 horas Cancún',
    City: 'Cancun',
    Country: 'MEX',
    Length: null,
    Duration: '6h',
    Startdate: '2027-01-31',
    Enddate: '0000-00-00 00:00:00',
    IAULabel: 'B',
  },
  {
    EventID: '1',
    EventName: 'Last Season Classic',
    City: 'Praha',
    Country: 'CZE',
    Length: '100km',
    Startdate: '2020-05-05',
    Enddate: '0000-00-00 00:00:00',
  },
  {
    EventID: '2',
    EventName: 'Nowhere Ultra',
    City: 'Somewhere',
    Country: 'ZZZ',
    Length: '50km',
    Startdate: '2027-03-03',
    Enddate: '0000-00-00 00:00:00',
  },
];

test('duv maps IOC country codes, not just ISO ones', () => {
  assert.equal(alpha2('GER'), 'DE');
  assert.equal(alpha2('SUI'), 'CH');
  assert.equal(alpha2('NED'), 'NL');
  assert.equal(alpha2('DEU'), 'DE');
  assert.equal(alpha2('BRA'), 'BR');
  assert.equal(alpha2('ZZZ'), null);
});

test('duv keeps future ultras and drops past ones and unknown countries', () => {
  const races = parseDuv(duvRows, { today });
  assert.deepEqual(
    races.map((race) => race.name),
    ['BAU Binnenalsterultra', 'Ultramaraton non stop 6 horas Cancún'],
  );
  assert.equal(races[0].location.countryCode, 'DE');
  assert.equal(races[0].location.country, 'Germany');
});

test('duv reads a distance from Length and a time limit from Duration', () => {
  const [hamburg, cancun] = parseDuv(duvRows, { today });
  assert.deepEqual(hamburg.distances, ['51.2 km']);
  assert.deepEqual(cancun.distances, ['6 h']);
});

test('duv treats the zeroed end date as absent and tags IAU-labelled races', () => {
  const [hamburg, cancun] = parseDuv(duvRows, { today });
  assert.equal(hamburg.endDate, null);
  assert.ok(!hamburg.tags.includes('iau-label'));
  assert.ok(cancun.tags.includes('iau-label'));
  assert.equal(cancun.source.url, 'https://statistik.d-u-v.org/getresultevent.php?event=128959');
});

test('duv asks country by country, because a worldwide query is capped at 4000', () => {
  // A worldwide 2026 query runs out in May, so every race it can reach is past.
  assert.ok(duvUrl({ year: 2026, country: 'POL' }).includes('country=POL'));
  assert.ok(duvUrl({ year: 2026, country: 'POL' }).includes('year=2026'));
});

test('duv rotates through countries so three daily runs cover different ground', () => {
  const morning = selectCountries(new Date('2026-09-02T09:00:00Z'), 6);
  const evening = selectCountries(new Date('2026-09-02T17:00:00Z'), 6);
  assert.equal(morning.length, 6);
  assert.notDeepEqual(morning, evening);
  assert.ok(morning.every((code) => COUNTRIES.includes(code)));
  // The same moment always picks the same slice, so a re-run is not random.
  assert.deepEqual(morning, selectCountries(new Date('2026-09-02T09:30:00Z'), 6));
});

test('duv rotation eventually covers every country', () => {
  const seen = new Set();
  for (let slot = 0; slot < COUNTRIES.length; slot += 1) {
    const at = new Date(Date.UTC(2026, 8, 2) + slot * 8 * 3600 * 1000);
    for (const code of selectCountries(at, 6)) seen.add(code);
  }
  assert.equal(seen.size, COUNTRIES.length);
});

// --- Geocoder ------------------------------------------------------------

test('geocoder serves a cached town without touching the network', async () => {
  const cache = { 'DE|hamburg': { lat: 53.55, lon: 10.0, name: 'Hamburg', at: '2026-09-01T00:00:00Z' } };
  const geocoder = createGeocoder({
    cache,
    fetchImpl: () => { throw new Error('should not be called'); },
    now: new Date('2026-09-02T00:00:00Z'),
  });
  assert.deepEqual(await geocoder.lookup('Hamburg', 'DE', 'Germany'), {
    lat: 53.55, lon: 10.0, name: 'Hamburg',
  });
  assert.equal(geocoder.stats.hits, 1);
});

test('geocoder stops at its per-run cap so a big calendar cannot hammer Nominatim', async () => {
  const cache = {};
  let calls = 0;
  const geocoder = createGeocoder({
    cache,
    maxLookups: 2,
    minIntervalMs: 0,
    now: new Date('2026-09-02T00:00:00Z'),
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify([{ lat: '1.5', lon: '2.5', display_name: 'Somewhere' }]), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    },
  });
  assert.ok(await geocoder.lookup('A', 'PL', 'Poland'));
  assert.ok(await geocoder.lookup('B', 'PL', 'Poland'));
  assert.equal(await geocoder.lookup('C', 'PL', 'Poland'), null);
  assert.equal(calls, 2);
  assert.equal(geocoder.stats.capped, 1);
});

test('geocoder remembers a miss but not a network error', async () => {
  const now = new Date('2026-09-02T00:00:00Z');
  const cache = {};
  const empty = createGeocoder({
    cache, now, minIntervalMs: 0,
    fetchImpl: async () => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }),
  });
  assert.equal(await empty.lookup('Nowhere', 'PL', 'Poland'), null);
  assert.ok('PL|nowhere' in cache, 'a genuine miss is remembered');

  const failing = createGeocoder({
    cache, now, minIntervalMs: 0,
    log: { warn() {} },
    fetchImpl: async () => new Response('nope', { status: 503, statusText: 'Service Unavailable' }),
  });
  assert.equal(await failing.lookup('Elsewhere', 'PL', 'Poland'), null);
  assert.ok(!('PL|elsewhere' in cache), 'a network failure is not cached as a miss');
});

// --- Multisport ----------------------------------------------------------
// Running platforms carry the occasional triathlon: UltraSignup listed the
// ANVIL ultra-triathlons, and the portal filed them as road races.

test('multisport events are recognised by name or distance text', () => {
  assert.equal(isMultisport('Virginia Anvil Ultra Triathlon'), true);
  assert.equal(isMultisport('Some Race', 'Triple ANVIL Relay'), true);
  assert.equal(isMultisport('Lakeside Duathlon'), true);
  assert.equal(isMultisport('Hawk Hundred'), false);
  assert.equal(isMultisport('Mogollon Monster 100'), false);
});

test('ultrasignup types a triathlon as one, not as a road race', () => {
  const [race] = parseUltraSignup([{
    EventId: 9, EventDateId: 9,
    EventName: 'Virginia Anvil Ultra Triathlon',
    EventDate: '10/8/2027',
    Distances: 'Triple ANVIL Triathlon, Double ANVIL Triathlon',
    DistanceCategories: ' ultra',
    City: 'Spotsylvania', State: 'VA',
    Latitude: '38.19', Longitude: '-77.59',
    Cancelled: false, VirtualEvent: false,
  }], { today });
  assert.equal(race.type, 'triathlon');
  assert.ok(race.tags.includes('triathlon'));
  assert.ok(!race.tags.includes('road'));
});

test('runraceusa types a triathlon as one too', () => {
  const [race] = parseRunRaceUsa({
    races: [{
      name: 'Lakeside Ultra Triathlon', date: '2027-07-04',
      city: 'Madison', state: 'WI', lat: 43.07, lng: -89.4,
      d: ['140.6'], geo: 'city', s: 'lakeside-tri-wi',
    }],
  }, { today });
  assert.equal(race.type, 'triathlon');
});

test('triathlon is a valid event type', () => {
  assert.ok(EVENT_TYPES.includes('triathlon'));
});
