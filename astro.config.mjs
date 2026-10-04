import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://renzocarletti.dev',
  base: process.env.ASTRO_BASE ?? '/personal-page/',
  integrations: [sitemap()],
  // Scoped component styles add no specificity, so fun.css theme overrides win on equal footing.
  scopedStyleStrategy: 'where',
});