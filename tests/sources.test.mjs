import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRaces, isInteresting } from '../scripts/sources/runsignup.mjs';
import { parseBindings, parsePoint, nextEditionDate } from '../scripts/sources/wikidata.mjs';
import { extractJsonArray } from '../scripts/sources/ai-discovery.mjs';

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
