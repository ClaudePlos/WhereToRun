import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const EVENTS_DIR = path.join(ROOT, 'data', 'events');

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
