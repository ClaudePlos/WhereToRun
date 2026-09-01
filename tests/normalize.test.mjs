import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify, normalizeEvent, mergeEvent, isSameEvent, isEquivalent, buildContent, formatDateRange,
} from '../scripts/lib/normalize.mjs';
import { sortKeys } from '../scripts/lib/store.mjs';

const base = {
  name: 'Test Marathon',
  date: '2027-05-01',
  dateStatus: 'confirmed',
  type: 'road',
  distances: ['42.2 km'],
  location: { city: 'Kraków', country: 'Poland', countryCode: 'PL' },
  start: { lat: 50.0616, lon: 19.9373 },
  fees: [{ amount: 200, currency: 'PLN', indicative: true, label: { en: 'Entry', pl: 'Opłata' } }],
  source: { id: 'runsignup', url: 'https://example.com/race' },
};

test('slugify strips diacritics and punctuation', () => {
  assert.equal(slugify('Maratoń Warszawski – Łódź!'), 'maraton-warszawski-lodz');
  assert.equal(slugify('UTMB Mont-Blanc'), 'utmb-mont-blanc');
});

test('normalizeEvent derives a slug and fills both languages', () => {
  const event = normalizeEvent(base);
  assert.equal(event.slug, 'test-marathon-pl');
  assert.ok(event.content.en.summary.length > 0);
  assert.ok(event.content.pl.description.includes('Kraków'));
  assert.equal(event.manual, false);
});

test('generated Polish copy reports an indicative fee and the date', () => {
  const event = normalizeEvent(base);
  const { description } = buildContent(event, 'pl');
  assert.match(description, /Opłata startowa: od 200 zł \(orientacyjnie\)/);
  assert.match(description, /sobota, 1 maja 2027/);
});

test('estimated dates are flagged in both languages', () => {
  const event = normalizeEvent({ ...base, dateStatus: 'estimated' });
  assert.match(buildContent(event, 'en').description, /estimated, confirm with the organiser/);
  assert.match(buildContent(event, 'pl').description, /data orientacyjna/);
});

test('formatDateRange collapses a single-day event', () => {
  assert.equal(formatDateRange('2027-05-01', null, 'en'), 'Saturday, 1 May 2027');
  assert.match(formatDateRange('2027-05-01', '2027-05-03', 'en'), /1 May 2027 – 3 May 2027/);
});

test('a higher-precedence source wins conflicts, a lower one only fills gaps', () => {
  const stored = normalizeEvent({ ...base, source: { id: 'wikidata' }, fees: [] });
  const { event, changed } = mergeEvent(stored, {
    ...base,
    source: { id: 'curated' },
    name: 'Cracovia Maraton',
  });
  assert.equal(changed, true);
  assert.equal(event.name, 'Cracovia Maraton');
  assert.equal(event.fees.length, 1, 'curated fees fill the empty wikidata list');
  assert.equal(event.slug, stored.slug, 'slug is stable across merges');
  assert.equal(event.createdAt, stored.createdAt);
});

test('a lower-precedence source cannot overwrite curated facts', () => {
  const stored = normalizeEvent({ ...base, source: { id: 'curated' }, name: 'Cracovia Maraton' });
  const { event } = mergeEvent(stored, { ...base, source: { id: 'wikidata' }, name: 'Krakow Marathon' });
  assert.equal(event.name, 'Cracovia Maraton');
});

test('manual entries are never modified by the collector', () => {
  const stored = normalizeEvent({ ...base, manual: true, name: 'Hand written' });
  const { event, changed } = mergeEvent(stored, { ...base, source: { id: 'curated' }, name: 'Robot written' });
  assert.equal(changed, false);
  assert.equal(event.name, 'Hand written');
});

test('re-collecting identical data reports no change', () => {
  const stored = normalizeEvent(base);
  const { changed } = mergeEvent(stored, base);
  assert.equal(changed, false);
});

test('isEquivalent ignores key order and bookkeeping timestamps', () => {
  const a = normalizeEvent(base);
  const b = sortKeys(structuredClone(a));
  b.updatedAt = new Date(Date.now() + 60_000).toISOString();
  b.source.fetchedAt = b.updatedAt;
  assert.equal(isEquivalent(a, b), true);
});

test('isSameEvent matches near-duplicate dates but not other countries', () => {
  const a = normalizeEvent(base);
  const b = normalizeEvent({ ...base, slug: 'other', date: '2027-05-03' });
  assert.equal(isSameEvent(a, b), true);
  const elsewhere = normalizeEvent({
    ...base, slug: 'other', location: { ...base.location, countryCode: 'DE' },
  });
  assert.equal(isSameEvent(a, elsewhere), false);
});
