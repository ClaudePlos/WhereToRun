/**
 * Shared parsing for the free-text distance lists that race calendars publish:
 * "50K, 100 Mile", "48hrs, 36 Hour", "Marathon". No source agrees on a format,
 * and several mix distance-based and time-based races in one field.
 */

const KM_PER_MILE = 1.609344;

/**
 * Distances arrive as free text: "50K, 100 Mile", "48hrs, 36 Hour", "Marathon".
 * Returns readable labels plus the kilometre figures that could be derived, so
 * timed events ("48 h") keep a label without pretending to a distance.
 */
export function parseDistances(value) {
  const labels = [];
  const km = [];
  let timedHours = 0;

  for (const raw of String(value ?? '').split(/[,/]/)) {
    const token = raw.trim();
    if (token === '') continue;

    const hours = /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)$/i.exec(token);
    if (hours) {
      timedHours = Math.max(timedHours, Number(hours[1]));
      labels.push(`${Number(hours[1])} h`);
      continue;
    }

    const days = /^(\d+(?:\.\d+)?)\s*(?:d|day|days)$/i.exec(token);
    if (days) {
      timedHours = Math.max(timedHours, Number(days[1]) * 24);
      labels.push(`${Number(days[1])} d`);
      continue;
    }

    const kilometres = /^(\d+(?:\.\d+)?)\s*k(?:m)?$/i.exec(token);
    if (kilometres) {
      const value = Number(kilometres[1]);
      km.push(value);
      labels.push(`${value} km`);
      continue;
    }

    const miles = /^(\d+(?:\.\d+)?)\s*(?:m|mi|mile|miler|miles)$/i.exec(token);
    if (miles) {
      const value = Number(miles[1]) * KM_PER_MILE;
      km.push(value);
      labels.push(`${Math.round(value * 10) / 10} km`);
      continue;
    }

    if (/^marathon$/i.test(token)) {
      km.push(42.195);
      labels.push('42.2 km');
      continue;
    }
    if (/^half(?:\s*marathon)?$/i.test(token)) {
      km.push(21.0975);
      labels.push('21.1 km');
      continue;
    }

    // Unparseable but real — keep it as a label so the card is not misleading.
    labels.push(token);
  }

  return { labels: [...new Set(labels)], km, timedHours };
}


/**
 * Marathon and up, or any timed race of six hours or more. Shorter companion
 * distances travel with an event, but never justify an entry on their own.
 */
export function isNotableDistance({ km, timedHours }) {
  if (timedHours >= 6) return true;
  return km.some((value) => value >= 41);
}

/**
 * Multisport events turn up in running calendars because they register on the
 * same platforms — UltraSignup lists the ANVIL ultra-triathlons, for instance.
 * They are worth keeping, but calling a triathlon a road race is simply wrong,
 * so they get their own type rather than being filed under running.
 */
export function isMultisport(...text) {
  return /triathlon|duathlon|aquathlon|aquabike|swimrun|ironman|\banvil\b/i
    .test(text.filter(Boolean).join(' '));
}
