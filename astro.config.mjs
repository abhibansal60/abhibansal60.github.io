// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abhibansal.dev',
  integrations: [sitemap()],
  // Code blocks use the site's own pre styles (ink on paper, dark-mode aware), not a Shiki theme.
  markdown: { syntaxHighlight: false },
});
