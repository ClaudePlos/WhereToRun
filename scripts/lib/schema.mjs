export const LANGS = ['en', 'pl'];

export const EVENT_TYPES = ['road', 'trail', 'ultra', 'stage', 'obstacle', 'track', 'other'];

/**
 * How much the start coordinates can be trusted. Some sources publish the exact
 * start line, others only geocode the host town — a difference worth showing on
 * a portal whose promise is a marked start point.
 */
export const START_PRECISIONS = ['exact', 'city'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CURRENCY = /^[A-Z]{3}$/;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkUrl(value, path, errors) {
  let url;
  try {
    url = new URL(value);
  } catch {
    errors.push(`${path}: not a valid URL (${value})`);
    return;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    errors.push(`${path}: unsupported protocol ${url.protocol}`);
  }
}

function checkText(block, path, errors) {
  if (!isPlainObject(block)) {
    errors.push(`${path}: must be an object keyed by language`);
    return;
  }
  for (const lang of LANGS) {
    const entry = block[lang];
    if (!isPlainObject(entry)) {
      errors.push(`${path}.${lang}: missing translation`);
      continue;
    }
    if (typeof entry.summary !== 'string' || entry.summary.trim() === '') {
      errors.push(`${path}.${lang}.summary: required non-empty string`);
    }
    if (typeof entry.description !== 'string' || entry.description.trim() === '') {
      errors.push(`${path}.${lang}.description: required non-empty string`);
    }
  }
}

/** Returns a list of human-readable problems; empty means the event is valid. */
export function validateEvent(event) {
  const errors = [];
  if (!isPlainObject(event)) return ['event: must be an object'];

  if (typeof event.slug !== 'string' || !SLUG.test(event.slug)) {
    errors.push(`slug: must be kebab-case (${event.slug})`);
  }
  if (typeof event.name !== 'string' || event.name.trim() === '') {
    errors.push('name: required non-empty string');
  }
  if (typeof event.date !== 'string' || !ISO_DATE.test(event.date) || Number.isNaN(Date.parse(event.date))) {
    errors.push(`date: must be an ISO date YYYY-MM-DD (${event.date})`);
  }
  if (event.endDate != null) {
    if (!ISO_DATE.test(event.endDate) || Number.isNaN(Date.parse(event.endDate))) {
      errors.push(`endDate: must be an ISO date YYYY-MM-DD (${event.endDate})`);
    } else if (typeof event.date === 'string' && event.endDate < event.date) {
      errors.push('endDate: must not be before date');
    }
  }
  if (event.dateStatus !== 'confirmed' && event.dateStatus !== 'estimated') {
    errors.push(`dateStatus: must be "confirmed" or "estimated" (${event.dateStatus})`);
  }
  if (!EVENT_TYPES.includes(event.type)) {
    errors.push(`type: must be one of ${EVENT_TYPES.join(', ')} (${event.type})`);
  }
  if (!Array.isArray(event.distances) || event.distances.some((d) => typeof d !== 'string')) {
    errors.push('distances: must be an array of strings');
  }
  if (!Array.isArray(event.tags) || event.tags.some((t) => typeof t !== 'string')) {
    errors.push('tags: must be an array of strings');
  }

  if (!isPlainObject(event.location)) {
    errors.push('location: required object');
  } else {
    const { city, country, countryCode } = event.location;
    if (typeof city !== 'string' || city.trim() === '') errors.push('location.city: required non-empty string');
    if (typeof country !== 'string' || country.trim() === '') errors.push('location.country: required non-empty string');
    if (typeof countryCode !== 'string' || !/^[A-Z]{2}$/.test(countryCode)) {
      errors.push(`location.countryCode: required ISO 3166-1 alpha-2 (${countryCode})`);
    }
  }

  if (!isPlainObject(event.start)) {
    errors.push('start: required object with lat/lon');
  } else {
    const { lat, lon, precision } = event.start;
    if (typeof lat !== 'number' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      errors.push(`start.lat: must be a number between -90 and 90 (${lat})`);
    }
    if (typeof lon !== 'number' || Number.isNaN(lon) || lon < -180 || lon > 180) {
      errors.push(`start.lon: must be a number between -180 and 180 (${lon})`);
    }
    // Optional; absent means the coordinates point at the start line itself.
    if (precision != null && !START_PRECISIONS.includes(precision)) {
      errors.push(`start.precision: must be one of ${START_PRECISIONS.join(', ')} (${precision})`);
    }
  }

  if (!Array.isArray(event.fees)) {
    errors.push('fees: must be an array (possibly empty)');
  } else {
    event.fees.forEach((fee, i) => {
      if (!isPlainObject(fee)) {
        errors.push(`fees[${i}]: must be an object`);
        return;
      }
      if (typeof fee.amount !== 'number' || Number.isNaN(fee.amount) || fee.amount < 0) {
        errors.push(`fees[${i}].amount: must be a non-negative number`);
      }
      if (typeof fee.currency !== 'string' || !CURRENCY.test(fee.currency)) {
        errors.push(`fees[${i}].currency: must be an ISO 4217 code (${fee.currency})`);
      }
      if (!isPlainObject(fee.label)) {
        errors.push(`fees[${i}].label: must be an object keyed by language`);
      } else {
        for (const lang of LANGS) {
          if (typeof fee.label[lang] !== 'string' || fee.label[lang].trim() === '') {
            errors.push(`fees[${i}].label.${lang}: required non-empty string`);
          }
        }
      }
      if (typeof fee.indicative !== 'boolean') {
        errors.push(`fees[${i}].indicative: must be a boolean`);
      }
    });
  }

  if (!Array.isArray(event.links)) {
    errors.push('links: must be an array');
  } else {
    event.links.forEach((link, i) => {
      if (!isPlainObject(link)) {
        errors.push(`links[${i}]: must be an object`);
        return;
      }
      if (typeof link.url !== 'string') errors.push(`links[${i}].url: required string`);
      else checkUrl(link.url, `links[${i}].url`, errors);
      if (!isPlainObject(link.label)) {
        errors.push(`links[${i}].label: must be an object keyed by language`);
      } else {
        for (const lang of LANGS) {
          if (typeof link.label[lang] !== 'string' || link.label[lang].trim() === '') {
            errors.push(`links[${i}].label.${lang}: required non-empty string`);
          }
        }
      }
    });
  }

  if (event.website != null) checkUrl(event.website, 'website', errors);
  if (event.registrationUrl != null) checkUrl(event.registrationUrl, 'registrationUrl', errors);

  checkText(event.content, 'content', errors);

  if (!isPlainObject(event.source)) {
    errors.push('source: required object');
  } else {
    if (typeof event.source.id !== 'string' || event.source.id.trim() === '') {
      errors.push('source.id: required non-empty string');
    }
    if (event.source.url != null) checkUrl(event.source.url, 'source.url', errors);
  }

  for (const field of ['createdAt', 'updatedAt']) {
    if (typeof event[field] !== 'string' || Number.isNaN(Date.parse(event[field]))) {
      errors.push(`${field}: required ISO timestamp`);
    }
  }

  return errors;
}
