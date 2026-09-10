import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // Switch to the lab's custom domain once DNS is wired up (also add public/CNAME).
  site: 'https://aimsresearchlab.com',
  // Phosphor icons resolve from @iconify-json/ph and are inlined as SVG at
  // build time (no client-side JS). Use in markup as: <Icon name="ph:book-open" />
  integrations: [icon()],
});
