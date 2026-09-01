#!/usr/bin/env node
/**
 * Collects running events from every enabled source, merges them into data/events
 * and records a run summary in data/meta.json.
 *
 * Usage:
 *   node scripts/collect.mjs [--dry-run] [--sources=curated,runsignup] [--max-new=25] [--quiet]
 *
 * Every source is isolated: one failing API never aborts the run, so the scheduled
 * job still commits whatever the healthy sources produced.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as curated from './sources/curated.mjs';
import * as runsignup from './sources/runsignup.mjs';
import * as wikidata from './sources/wikidata.mjs';
import * as aiDiscovery from './sources/ai-discovery.mjs';
import { mergeEvent, normalizeEvent, isSameEvent } from './lib/normalize.mjs';
import { validateEvent } from './lib/schema.mjs';
import { readEvents, writeEvent, sortKeys, ROOT, EVENTS_DIR } from './lib/store.mjs';

const ALL_SOURCES = [curated, runsignup, wikidata, aiDiscovery];

function parseArgs(argv) {
  const args = { dryRun: false, sources: null, maxNew: 25, quiet: false };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--quiet') args.quiet = true;
    else if (arg.startsWith('--sources=')) args.sources = arg.slice(10).split(',').filter(Boolean);
    else if (arg.startsWith('--max-new=')) args.maxNew = Number(arg.slice(10));
  }
  return args;
}

export async function collect({ argv = [], sources = ALL_SOURCES, now = new Date(), log = console } = {}) {
  const args = parseArgs(argv);
  const enabled = args.sources ? sources.filter((s) => args.sources.includes(s.id)) : sources;

  const stored = await readEvents();
  const byslug = new Map(stored.map((event) => [event.slug, event]));
  const known = stored.map((event) => `${event.name} (${event.date})`);

  const stats = { added: 0, updated: 0, unchanged: 0, skipped: 0, sources: {} };
  let newThisRun = 0;

  for (const source of enabled) {
    let candidates = [];
    try {
      candidates = await source.fetchEvents({ today: now, known });
      stats.sources[source.id] = { fetched: candidates.length, error: null };
    } catch (error) {
      stats.sources[source.id] = { fetched: 0, error: String(error.message ?? error) };
      log.warn?.(`! ${source.id}: ${error.message ?? error}`);
      continue;
    }

    for (const candidate of candidates) {
      const normalized = normalizeEvent(candidate, now);
      const existing = byslug.get(normalized.slug)
        ?? stored.find((event) => isSameEvent(event, normalized));

      if (!existing) {
        if (new Date(`${normalized.date}T23:59:59Z`) < now) { stats.skipped += 1; continue; }
        if (newThisRun >= args.maxNew) { stats.skipped += 1; continue; }
      }

      const { event, changed } = mergeEvent(existing, { ...candidate, slug: existing?.slug ?? normalized.slug }, now);
      const errors = validateEvent(event);
      if (errors.length > 0) {
        stats.skipped += 1;
        log.warn?.(`! skipped ${normalized.slug}: ${errors[0]}`);
        continue;
      }

      if (!changed) { stats.unchanged += 1; continue; }

      if (!args.dryRun) await writeEvent(event);
      if (existing) {
        stats.updated += 1;
        if (!args.quiet) log.info?.(`~ updated ${event.slug} (${source.id})`);
      } else {
        stats.added += 1;
        newThisRun += 1;
        byslug.set(event.slug, event);
        stored.push(event);
        if (!args.quiet) log.info?.(`+ added   ${event.slug} (${source.id})`);
      }
    }
  }

  const meta = {
    lastRun: now.toISOString(),
    eventCount: (await readEvents()).length,
    dryRun: args.dryRun,
    ...stats,
  };
  if (!args.dryRun) {
    await writeFile(path.join(ROOT, 'data', 'meta.json'), `${JSON.stringify(sortKeys(meta), null, 2)}\n`, 'utf8');
  }

  log.info?.(
    `\n${args.dryRun ? '[dry run] ' : ''}added ${stats.added}, updated ${stats.updated}, ` +
    `unchanged ${stats.unchanged}, skipped ${stats.skipped} → ${EVENTS_DIR}`,
  );
  return meta;
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  collect({ argv: process.argv.slice(2) }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
