import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const EVENTS_DIR = path.join(ROOT, 'data', 'events');
export const GEOCACHE_FILE = path.join(ROOT, 'data', 'geocache.json');

/**
 * Town coordinates looked up previously. Committed to the repository so a town is
 * geocoded once ever rather than once per run, which is what Nominatim's usage
 * policy asks for.
 */
export async function readGeocache(file = GEOCACHE_FILE) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

export async function writeGeocache(cache, file = GEOCACHE_FILE) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(sortKeys(cache), null, 2)}\n`, 'utf8');
}

export async function readEvents(dir = EVENTS_DIR) {
  let files;
  try {
    files = await readdir(dir);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const events = [];
  for (const file of files.filter((f) => f.endsWith('.json')).sort()) {
    events.push(JSON.parse(await readFile(path.join(dir, file), 'utf8')));
  }
  return events;
}

export async function writeEvent(event, dir = EVENTS_DIR) {
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${event.slug}.json`);
  await writeFile(file, `${JSON.stringify(sortKeys(event), null, 2)}\n`, 'utf8');
  return file;
}

/** Stable key order keeps the daily collector's commits readable. */
export function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
}
