import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // site: 'https://your-domain.tld', // set once the domain is wired up
  // Phosphor icons resolve from @iconify-json/ph and are inlined as SVG at
  // build time (no client-side JS). Use in markup as: <Icon name="ph:book-open" />
  integrations: [icon()],
});
