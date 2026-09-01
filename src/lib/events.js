import { formatDateRange, formatMoney, countryName } from '../../scripts/lib/normalize.mjs';

const modules = import.meta.glob('../../data/events/*.json', { eager: true });
const meta = import.meta.glob('../../data/meta.json', { eager: true });

export const allEvents = Object.values(modules)
  .map((module) => module.default ?? module)
  .sort((a, b) => a.date.localeCompare(b.date));

export const collectionMeta = Object.values(meta)[0]?.default ?? null;

export { formatDateRange, formatMoney, countryName };

const startOfToday = () => new Date(new Date().toISOString().slice(0, 10));

export function upcomingEvents(events = allEvents) {
  const today = startOfToday();
  return events.filter((event) => new Date(event.endDate ?? event.date) >= today);
}

export function pastEvents(events = allEvents) {
  const today = startOfToday();
  return events.filter((event) => new Date(event.endDate ?? event.date) < today).reverse();
}

export function featuredEvents(events = upcomingEvents()) {
  return events.filter((event) => event.featured);
}

export function countryOptions(events, lang) {
  const seen = new Map();
  for (const event of events) {
    const code = event.location.countryCode;
    if (!seen.has(code)) seen.set(code, countryName(code, lang, event.location.country));
  }
  return [...seen.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}

export function tagOptions(events) {
  const counts = new Map();
  for (const event of events) {
    for (const tag of event.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export function cheapestFee(event) {
  if (!event.fees?.length) return null;
  return event.fees.reduce((min, fee) => (min === null || fee.amount < min.amount ? fee : min), null);
}

export function eventText(event, lang) {
  return event.content?.[lang] ?? event.content?.en ?? { summary: '', description: '' };
}
