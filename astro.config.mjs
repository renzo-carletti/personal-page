import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://renzo-carletti.github.io/personal-page',
  base: process.env.ASTRO_BASE ?? '/personal-page/',
  // The share-image generator page and the 404 stay out of the sitemap.
  integrations: [sitemap({ filter: (page) => !/\/(og|404)(\/|$)/.test(page) })],
  // Scoped component styles add no specificity, so fun.css theme overrides win on equal footing.
  scopedStyleStrategy: 'where',
});