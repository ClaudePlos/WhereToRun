#!/usr/bin/env node
/** Validates every stored event against the schema. Used by CI before a build. */

import { readEvents } from './lib/store.mjs';
import { validateEvent } from './lib/schema.mjs';

const events = await readEvents();
let failed = 0;

for (const event of events) {
  const errors = validateEvent(event);
  if (errors.length > 0) {
    failed += 1;
    console.error(`✗ ${event.slug ?? '(no slug)'}`);
    for (const error of errors) console.error(`    ${error}`);
  }
}

const slugs = events.map((event) => event.slug);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicates.length > 0) {
  failed += duplicates.length;
  console.error(`✗ duplicate slugs: ${[...new Set(duplicates)].join(', ')}`);
}

if (failed > 0) {
  console.error(`\n${failed} problem(s) in ${events.length} events`);
  process.exit(1);
}
console.log(`✓ ${events.length} events valid`);
