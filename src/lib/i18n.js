export const LANGS = ['en', 'pl'];
export const DEFAULT_LANG = 'en';

export const ui = {
  en: {
    'site.title': 'WhereToRun',
    'site.tagline': 'The world’s most interesting running events — dates, fees, start locations and maps.',
    'site.description': 'A bilingual guide to the world’s most interesting running events: marathons, ultras and trail races with entry fees, start locations and OpenStreetMap maps.',
    'nav.events': 'Events',
    'nav.about': 'About',
    'nav.language': 'Polski',
    'home.featured': 'Featured races',
    'home.upcoming': 'All upcoming events',
    'home.past': 'Past editions',
    'home.empty': 'No events match these filters.',
    'filter.search': 'Search',
    'filter.searchPlaceholder': 'Race, city or country…',
    'filter.country': 'Country',
    'filter.type': 'Type',
    'filter.tag': 'Tag',
    'filter.all': 'All',
    'filter.reset': 'Reset filters',
    'event.date': 'Date',
    'event.location': 'Location',
    'event.distances': 'Distances',
    'event.fees': 'Entry fees',
    'event.fees.none': 'No fee published — check with the organiser.',
    'event.fees.indicative': 'Indicative price — verify on the organiser’s site.',
    'event.start': 'Start location',
    'event.links': 'Links',
    'event.website': 'Official website',
    'event.register': 'Register',
    'event.estimated': 'Estimated date — confirm with the organiser.',
    'event.back': '← All events',
    'event.source': 'Data source',
    'event.updated': 'Entry updated',
    'event.coords': 'Coordinates',
    'event.start.approximate': 'Approximate: this pin is the host town, not the start line. Check the organiser for the exact start.',
    'event.osm': 'Open in OpenStreetMap',
    'map.title': 'Where the races start',
    'map.attribution': 'Map data © OpenStreetMap contributors',
    'type.road': 'Road',
    'type.trail': 'Trail',
    'type.ultra': 'Ultra',
    'type.stage': 'Stage race',
    'type.obstacle': 'Obstacle',
    'type.track': 'Track',
    'type.other': 'Other',
    'footer.updated': 'Event data last refreshed',
    'footer.auto': 'Updated automatically three times a day from open race data.',
    'footer.source': 'Source code on GitHub',
    'about.title': 'About this portal',
  },
  pl: {
    'site.title': 'WhereToRun',
    'site.tagline': 'Najciekawsze biegi na świecie — terminy, opłaty, miejsca startu i mapy.',
    'site.description': 'Dwujęzyczny przewodnik po najciekawszych biegach świata: maratony, ultra i trail z opłatami startowymi, miejscami startu i mapami OpenStreetMap.',
    'nav.events': 'Biegi',
    'nav.about': 'O portalu',
    'nav.language': 'English',
    'home.featured': 'Wyróżnione biegi',
    'home.upcoming': 'Wszystkie nadchodzące biegi',
    'home.past': 'Minione edycje',
    'home.empty': 'Żaden bieg nie pasuje do tych filtrów.',
    'filter.search': 'Szukaj',
    'filter.searchPlaceholder': 'Bieg, miasto lub kraj…',
    'filter.country': 'Kraj',
    'filter.type': 'Typ',
    'filter.tag': 'Tag',
    'filter.all': 'Wszystkie',
    'filter.reset': 'Wyczyść filtry',
    'event.date': 'Termin',
    'event.location': 'Lokalizacja',
    'event.distances': 'Dystanse',
    'event.fees': 'Opłaty startowe',
    'event.fees.none': 'Brak opublikowanej opłaty — sprawdź u organizatora.',
    'event.fees.indicative': 'Cena orientacyjna — zweryfikuj na stronie organizatora.',
    'event.start': 'Miejsce startu',
    'event.links': 'Linki',
    'event.website': 'Strona oficjalna',
    'event.register': 'Zapisy',
    'event.estimated': 'Data orientacyjna — potwierdź u organizatora.',
    'event.back': '← Wszystkie biegi',
    'event.source': 'Źródło danych',
    'event.updated': 'Wpis zaktualizowany',
    'event.coords': 'Współrzędne',
    'event.start.approximate': 'Orientacyjnie: pinezka wskazuje miejscowość, nie linię startu. Dokładne miejsce sprawdź u organizatora.',
    'event.osm': 'Otwórz w OpenStreetMap',
    'map.title': 'Gdzie startują biegi',
    'map.attribution': 'Dane mapy © współtwórcy OpenStreetMap',
    'type.road': 'Uliczny',
    'type.trail': 'Trail',
    'type.ultra': 'Ultra',
    'type.stage': 'Etapowy',
    'type.obstacle': 'Z przeszkodami',
    'type.track': 'Bieżnia',
    'type.other': 'Inny',
    'footer.updated': 'Dane biegów odświeżone',
    'footer.auto': 'Aktualizowane automatycznie trzy razy dziennie z otwartych źródeł danych.',
    'footer.source': 'Kod źródłowy na GitHubie',
    'about.title': 'O portalu',
  },
};

/** Plural forms of "event", used both at build time and by the client-side filter. */
export const eventUnits = {
  en: { one: 'event', other: 'events' },
  pl: { one: 'bieg', few: 'biegi', many: 'biegów', other: 'biegów' },
};

export function eventCountLabel(lang, count) {
  const forms = eventUnits[lang] ?? eventUnits[DEFAULT_LANG];
  const rule = new Intl.PluralRules(lang === 'pl' ? 'pl-PL' : 'en-GB').select(count);
  return `${count} ${forms[rule] ?? forms.other}`;
}

export function useTranslations(lang) {
  const dict = ui[lang] ?? ui[DEFAULT_LANG];
  return (key, ...args) => {
    const value = dict[key] ?? ui[DEFAULT_LANG][key] ?? key;
    return typeof value === 'function' ? value(...args) : value;
  };
}

/** Builds a URL that respects both the Astro base path and the current language. */
export function localizedPath(lang, pathname = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const prefix = lang === DEFAULT_LANG ? '' : `/${lang}`;
  const full = `${base}${prefix}${clean}`;
  return full.endsWith('/') ? full : `${full}/`;
}
