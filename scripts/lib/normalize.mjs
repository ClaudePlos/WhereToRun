import { LANGS } from './schema.mjs';

/**
 * Higher wins when two sources describe the same race. RunSignup outranks
 * UltraSignup because it is the only source carrying entry fees; UltraSignup
 * outranks RunRaceUSA, whose coordinates are often only the host town, which in
 * turn outranks Wikidata, whose dates are rolled forward from a past edition.
 */
export const SOURCE_PRECEDENCE = {
  curated: 100,
  runsignup: 50,
  ultrasignup: 45,
  runraceusa: 42,
  wikidata: 40,
  unknown: 0,
};

const COUNTRY_NAMES_PL = {
  AR: 'Argentyna', AT: 'Austria', AU: 'Australia', AQ: 'Antarktyda', BE: 'Belgia', BR: 'Brazylia',
  CA: 'Kanada', CH: 'Szwajcaria', CL: 'Chile', CN: 'Chiny', CZ: 'Czechy', DE: 'Niemcy', DK: 'Dania',
  EE: 'Estonia', ES: 'Hiszpania', FI: 'Finlandia', FR: 'Francja', GB: 'Wielka Brytania', GR: 'Grecja',
  HR: 'Chorwacja', HU: 'Węgry', ID: 'Indonezja', IE: 'Irlandia', IL: 'Izrael', IN: 'Indie',
  IS: 'Islandia', IT: 'Włochy', JP: 'Japonia', KE: 'Kenia', KR: 'Korea Południowa', LT: 'Litwa',
  LV: 'Łotwa', MA: 'Maroko', MX: 'Meksyk', NL: 'Holandia', NO: 'Norwegia', NP: 'Nepal',
  NZ: 'Nowa Zelandia', PE: 'Peru', PL: 'Polska', PT: 'Portugalia', RO: 'Rumunia', SE: 'Szwecja',
  SI: 'Słowenia', SK: 'Słowacja', TH: 'Tajlandia', TR: 'Turcja', UA: 'Ukraina', US: 'Stany Zjednoczone',
  ZA: 'Republika Południowej Afryki',
};

const TYPE_LABELS = {
  road: { en: 'road race', pl: 'bieg uliczny' },
  trail: { en: 'trail race', pl: 'bieg trailowy' },
  ultra: { en: 'ultramarathon', pl: 'ultramaraton' },
  stage: { en: 'multi-stage race', pl: 'bieg etapowy' },
  obstacle: { en: 'obstacle race', pl: 'bieg z przeszkodami' },
  track: { en: 'track race', pl: 'bieg na bieżni' },
  other: { en: 'running event', pl: 'impreza biegowa' },
};

export function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[łŁ]/g, 'l')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function countryName(code, lang, fallback) {
  if (lang === 'pl' && COUNTRY_NAMES_PL[code]) return COUNTRY_NAMES_PL[code];
  if (fallback) return fallback;
  try {
    return new Intl.DisplayNames([lang], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatDate(dateISO, lang) {
  const date = new Date(`${dateISO}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date);
}

export function formatDateRange(dateISO, endDateISO, lang) {
  if (!endDateISO || endDateISO === dateISO) return formatDate(dateISO, lang);
  const start = new Date(`${dateISO}T12:00:00Z`);
  const end = new Date(`${endDateISO}T12:00:00Z`);
  const fmt = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatMoney(amount, currency, lang) {
  try {
    return new Intl.NumberFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
      style: 'currency', currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function cheapestFee(fees) {
  if (!Array.isArray(fees) || fees.length === 0) return null;
  return fees.reduce((min, fee) => (min === null || fee.amount < min.amount ? fee : min), null);
}

/**
 * Auto-written bilingual copy for machine-collected events. Deliberately built from
 * colon-separated facts so the Polish stays grammatical without noun declension.
 */
export function buildContent(event, lang) {
  const type = TYPE_LABELS[event.type] ?? TYPE_LABELS.other;
  const country = countryName(event.location.countryCode, lang, lang === 'en' ? event.location.country : null);
  const place = `${event.location.city}, ${country}`;
  const when = formatDateRange(event.date, event.endDate, lang);
  const distances = (event.distances ?? []).join(', ');
  const fee = cheapestFee(event.fees);
  const estimated = event.dateStatus === 'estimated';

  if (lang === 'pl') {
    const summary = `${type.pl} — ${place}, ${when}${estimated ? ' (data orientacyjna)' : ''}`;
    const lines = [
      `${event.name} to ${type.pl}. Lokalizacja: ${place}.`,
      `Termin: ${when}${estimated ? ' (data orientacyjna, potwierdź na stronie organizatora)' : ''}.`,
    ];
    if (distances) lines.push(`Dystanse: ${distances}.`);
    if (fee) {
      lines.push(`Opłata startowa: od ${formatMoney(fee.amount, fee.currency, 'pl')}${fee.indicative ? ' (orientacyjnie)' : ''}.`);
    } else {
      lines.push('Opłata startowa: sprawdź na stronie organizatora.');
    }
    lines.push(event.start?.precision === 'city'
      ? 'Mapa poniżej pokazuje miejscowość — dokładnego miejsca startu szukaj u organizatora.'
      : 'Miejsce startu zaznaczone na mapie poniżej.');
    return { summary: capitalize(summary), description: lines.join(' ') };
  }

  const summary = `${type.en} — ${place}, ${when}${estimated ? ' (estimated date)' : ''}`;
  const lines = [
    `${event.name} is a ${type.en}. Location: ${place}.`,
    `Date: ${when}${estimated ? ' (estimated, confirm with the organiser)' : ''}.`,
  ];
  if (distances) lines.push(`Distances: ${distances}.`);
  if (fee) {
    lines.push(`Entry fee: from ${formatMoney(fee.amount, fee.currency, 'en')}${fee.indicative ? ' (indicative)' : ''}.`);
  } else {
    lines.push('Entry fee: check with the organiser.');
  }
  lines.push(event.start?.precision === 'city'
    ? 'The map below shows the host town; check the organiser for the exact start line.'
    : 'The start location is marked on the map below.');
  return { summary: capitalize(summary), description: lines.join(' ') };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Fills defaults, generates missing copy and stamps timestamps. */
export function normalizeEvent(input, now = new Date()) {
  const stamp = now.toISOString();
  const event = {
    slug: input.slug ?? slugify(`${input.name}-${input.location?.countryCode ?? ''}`),
    name: String(input.name ?? '').trim(),
    date: input.date,
    endDate: input.endDate ?? null,
    dateStatus: input.dateStatus ?? 'estimated',
    type: input.type ?? 'other',
    distances: input.distances ?? [],
    tags: [...new Set(input.tags ?? [])].sort(),
    featured: input.featured === true,
    location: {
      city: input.location?.city ?? '',
      region: input.location?.region ?? null,
      country: input.location?.country ?? '',
      countryCode: input.location?.countryCode ?? '',
    },
    start: {
      lat: round6(input.start?.lat),
      lon: round6(input.start?.lon),
      name: input.start?.name ?? null,
      precision: input.start?.precision ?? 'exact',
    },
    fees: input.fees ?? [],
    links: input.links ?? [],
    website: input.website ?? null,
    registrationUrl: input.registrationUrl ?? null,
    content: input.content ?? {},
    source: {
      id: input.source?.id ?? 'unknown',
      url: input.source?.url ?? null,
      ref: input.source?.ref ?? null,
      fetchedAt: input.source?.fetchedAt ?? stamp,
    },
    manual: input.manual === true,
    createdAt: input.createdAt ?? stamp,
    updatedAt: stamp,
  };

  for (const lang of LANGS) {
    const existing = event.content[lang];
    if (!existing || !existing.summary || !existing.description) {
      event.content[lang] = { ...buildContent(event, lang), ...(existing ?? {}) };
    }
  }
  return event;
}

function round6(value) {
  return typeof value === 'number' ? Math.round(value * 1e6) / 1e6 : value;
}

/** True when two candidates describe the same race (same slug, or same name+country+nearby date). */
export function isSameEvent(a, b) {
  if (a.slug === b.slug) return true;
  if (a.location?.countryCode !== b.location?.countryCode) return false;
  if (slugify(a.name) !== slugify(b.name)) return false;
  const days = Math.abs(Date.parse(a.date) - Date.parse(b.date)) / 86_400_000;
  return days <= 3;
}

function precedence(event) {
  return SOURCE_PRECEDENCE[event?.source?.id] ?? SOURCE_PRECEDENCE.unknown;
}

/**
 * Merges a freshly collected event into the stored one.
 * Manually edited events are never touched; otherwise the higher-precedence source
 * wins on conflicts and the lower one only fills gaps.
 */
export function mergeEvent(existing, incoming, now = new Date()) {
  if (!existing) return { event: normalizeEvent(incoming, now), changed: true };
  if (existing.manual) return { event: existing, changed: false };

  const incomingWins = precedence(incoming) >= precedence(existing);
  const winner = incomingWins ? incoming : existing;
  const filler = incomingWins ? existing : incoming;

  const merged = normalizeEvent({
    ...filler,
    ...stripEmpty(winner),
    slug: existing.slug,
    createdAt: existing.createdAt,
    location: { ...filler.location, ...stripEmpty(winner.location ?? {}) },
    start: { ...filler.start, ...stripEmpty(winner.start ?? {}) },
    fees: pickList(winner.fees, filler.fees),
    links: mergeLinks(existing.links, incoming.links),
    content: mergeContent(filler.content, winner.content),
    source: incomingWins ? incoming.source : existing.source,
  }, now);

  const changed = !isEquivalent(existing, merged);
  return { event: changed ? merged : existing, changed };
}

function stripEmpty(object) {
  const out = {};
  for (const [key, value] of Object.entries(object ?? {})) {
    if (value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
      out[key] = value;
    }
  }
  return out;
}

function pickList(preferred, fallback) {
  return Array.isArray(preferred) && preferred.length > 0 ? preferred : (fallback ?? []);
}

function mergeLinks(a = [], b = []) {
  const byUrl = new Map();
  for (const link of [...a, ...b]) {
    if (link?.url && !byUrl.has(link.url)) byUrl.set(link.url, link);
  }
  return [...byUrl.values()];
}

function mergeContent(fallback = {}, preferred = {}) {
  const out = {};
  for (const lang of LANGS) {
    out[lang] = { ...(fallback[lang] ?? {}), ...(preferred[lang] ?? {}) };
    if (!out[lang].summary && !out[lang].description) delete out[lang];
  }
  return out;
}

/** Compares two events ignoring the updatedAt/fetchedAt bookkeeping fields. */
export function isEquivalent(a, b) {
  return stableStringify(withoutStamps(a)) === stableStringify(withoutStamps(b));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

function withoutStamps(event) {
  const { updatedAt, source, ...rest } = event;
  const { fetchedAt, ...sourceRest } = source ?? {};
  return { ...rest, source: sourceRest };
}
