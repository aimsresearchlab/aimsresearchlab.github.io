# 2026-09-10: the site, from empty repo to aimsresearchlab.com

First working version of the AIMS site. Astro, static output, no client-side
JavaScript, because a successor should be able to edit a template without
knowing a framework and the built `dist/` hosts anywhere.

**Content model.** Four data files as the single source of truth:
`people.ts`, `publications.ts`, `news.ts`, `projects.ts`. Pages read from
them, so adding a paper or a person is one edit in one place.

**Homepage.** Lab photo banner at 5:2, intro and research-area pills on the
left, dated news feed on the right, then project cards, the roster with
headshots, and the three most recent publications. Corner ribbons removed
along the way: visual interest comes from content, not chrome. People,
Recent, header, and footer all share the wide column so nothing looks
narrower than its neighbours.

**People.** Roster with 192x192 webp headshots, an AIMS-mark placeholder for
members without a photo, and cards wide enough to keep names on one line.

**Deployment.** GitHub Pages from `aimsresearchlab/aimsresearchlab.github.io`,
published by the official Astro action on every push to `main`. Custom domain
aimsresearchlab.com via `public/CNAME` plus DNS at the registrar. The org owns
the deployment, not any one person's account.

**SEO.** Sitemap, robots.txt, canonical URLs, Open Graph, Twitter cards, and
a `ResearchOrganization` JSON-LD block, all in the layout so pages only pass a
title and a description. Branded 1200x630 social card as jpg, since WhatsApp,
LinkedIn, and iMessage do not reliably render webp previews.

Content rules, the headshot spec, and the deployment steps are documented in
`CLAUDE.md`.
