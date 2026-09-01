import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://claudeplos.github.io';
const base = process.env.BASE_PATH ?? '/WhereToRun';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
