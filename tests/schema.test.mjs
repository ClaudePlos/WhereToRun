import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent } from '../scripts/lib/schema.mjs';
import { normalizeEvent } from '../scripts/lib/normalize.mjs';
import { readEvents } from '../scripts/lib/store.mjs';

const valid = normalizeEvent({
  slug: 'valid-race',
  name: 'Valid Race',
  date: '2027-05-01',
  dateStatus: 'confirmed',
  type: 'road',
  distances: ['10 km'],
  location: { city: 'Oslo', country: 'Norway', countryCode: 'NO' },
  start: { lat: 59.91, lon: 10.75 },
  fees: [{ amount: 50, currency: 'EUR', indicative: false, label: { en: 'Entry', pl: 'Opłata' } }],
  links: [{ url: 'https://example.org', label: { en: 'Site', pl: 'Strona' } }],
  source: { id: 'curated' },
});

test('a normalised event passes validation', () => {
  assert.deepEqual(validateEvent(valid), []);
});

test('bad coordinates, dates and currencies are rejected', () => {
  const errors = validateEvent({
    ...valid,
    date: '01/05/2027',
    start: { lat: 120, lon: 10 },
    fees: [{ amount: -1, currency: 'euro', indicative: 'yes', label: { en: 'x', pl: 'x' } }],
  });
  assert.ok(errors.some((error) => error.startsWith('date:')));
  assert.ok(errors.some((error) => error.startsWith('start.lat:')));
  assert.ok(errors.some((error) => error.startsWith('fees[0].amount:')));
  assert.ok(errors.some((error) => error.startsWith('fees[0].currency:')));
  assert.ok(errors.some((error) => error.startsWith('fees[0].indicative:')));
});

test('a missing Polish translation is an error', () => {
  const errors = validateEvent({ ...valid, content: { en: valid.content.en } });
  assert.ok(errors.some((error) => error === 'content.pl: missing translation'));
});

test('endDate must not precede date', () => {
  const errors = validateEvent({ ...valid, endDate: '2027-04-01' });
  assert.ok(errors.includes('endDate: must not be before date'));
});

test('non-https links are rejected', () => {
  const errors = validateEvent({
    ...valid,
    links: [{ url: 'javascript:alert(1)', label: { en: 'x', pl: 'x' } }],
  });
  assert.ok(errors.some((error) => error.startsWith('links[0].url:')));
});

test('every stored event in data/events is valid and uniquely slugged', async () => {
  const events = await readEvents();
  assert.ok(events.length > 0, 'expected seeded events');
  for (const event of events) {
    assert.deepEqual(validateEvent(event), [], `${event.slug} should be valid`);
  }
  const slugs = events.map((event) => event.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});
