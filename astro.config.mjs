import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Switch to the lab's custom domain once DNS is wired up (also add public/CNAME).
  site: 'https://aimsresearchlab.com',
  // Phosphor icons resolve from @iconify-json/ph and are inlined as SVG at
  // build time (no client-side JS). Use in markup as: <Icon name="ph:book-open" />
  // sitemap writes sitemap-index.xml + sitemap-0.xml into dist/ at build time.
  // /reel (the lab TV loop) and /banner (a projector slide) are noindex, so
  // they stay out of the sitemap.
  integrations: [icon(), sitemap({ filter: (page) => !page.includes('/reel') && !page.includes('/banner') })],
});
