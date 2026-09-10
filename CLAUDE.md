# AIMS website

Static site for the AIMS research group. Built with **Astro**, output is plain
HTML + CSS with **zero client-side JavaScript**. Chosen for longevity: a
successor should be able to edit templates without knowing a framework, and
`astro build` produces a static `dist/` that hosts anywhere.

## Non-negotiables

- **No em dashes.** Anywhere: page copy, code comments, this file. Use a period,
  comma, colon, or parentheses instead.
- **No client-side JavaScript.** Do not add Astro client directives
  (`client:load`, etc.) or `<script>` tags. If something seems to need JS, ask
  first; it almost never does for this site.
- **All visual choices go through the design tokens** at the top of
  `src/styles/global.css`. Do not hardcode colors, fonts, or the content width
  in components; reference the CSS variables.
- **Icons: Phosphor only**, via `astro-icon` (`<Icon name="ph:..." />`). They
  inline as SVG at build time. Do not add an icon font or raster icons.
- **Fonts are self-hosted** via Fontsource (imported in `src/layouts/Base.astro`).
  Do not switch to a CDN font link; a dead CDN link is exactly the kind of rot
  this site is built to avoid.

## Design tokens (source of truth: `src/styles/global.css`)

- Brand blue `--brand: #1652EC` (from `full/logo.svg`), links/headings/accents.
- Body text `--ink` (logo navy) on `--paper` (warm off-white), not black on white.
- Deep sections (footer) use `--navy`; the warm complement `--ochre` is for rare
  highlights only (~5% of the page).
- Layout is a centered column: `--content-width: min(68%, 48rem)`, wider on phones.

## Structure

```
src/styles/global.css       design tokens + base typography (edit look here)
src/layouts/Base.astro       page shell: <head>, fonts, centered <main>, sticky footer
src/components/Header.astro   logo + nav (edit nav array at top)
src/components/Footer.astro   copyright + GitHub org link
src/components/Person.astro   one person card (avatar, name, topic, link icons)
src/components/Publication.astro
src/pages/*.astro             one file per route
src/data/people.ts            roster (single source of truth for the People section)
src/data/publications.ts      papers (feeds homepage Recent and /publications)
public/people/*.webp          headshots, 192x192, referenced from people.ts
public/CNAME                  custom domain for GitHub Pages; do not delete
public/favicon.svg            copied from favicon/logo.svg
.github/workflows/deploy.yml  builds and publishes to GitHub Pages on push to main
```

## Content rules

### People (`src/data/people.ts`)

- One entry per person. Categories: `faculty`, `phd`, `masters`, `undergrad`.
  Section order and headings come from `categoryOrder` in the same file.
- `topic` is one short line (two to four words). It must fit on one line in a
  10.5rem card; if it wraps, shorten it. Cards in a row must line up.
- Names are forced onto one line (`white-space: nowrap`). If a name is too long
  for the card, widen `.people :global(.person)` in `src/pages/index.astro`
  rather than letting it wrap.
- Links: use the `links` array with a `type` from `LinkType`. No raw icons.

### Headshots (`public/people/`)

- Format: **webp only**, exactly **192x192** (2x of the 96px avatar), quality 85.
  Filename is `firstname-lastname.webp`, lowercase, hyphenated.
- Crop to the face: roughly the head and shoulders, face centered, before
  resizing. Do not upload a full-body or landscape shot and let CSS crop it.
- Make them with ImageMagick, for example:

  ```
  magick in.jpg -auto-orient -gravity north -crop WxH+X+Y +repage \
    -resize 192x192 -quality 85 public/people/first-last.webp
  ```

- Sources so far: the USM faculty directory for faculty; personal sites or
  GitHub avatars for students. Ask before scraping a photo from anywhere else.
- No photo yet: omit `image` and the card shows initials. Do not use a stock
  placeholder image.

### Publications (`src/data/publications.ts`)

- Order: published work first (journal, conference, findings), newest first;
  then arXiv preprints. The homepage Recent section shows the first three
  entries, so this order decides what appears there.
- `venue` is the short form: `Findings of EMNLP 2026`, `IEEE Internet of
  Things Journal`, `arXiv preprint`. Authors as initials plus surname,
  comma-separated.
- `url` points at the canonical record (arXiv abs page, DOI, or the USM Aquila
  record). Never `#`.
- `award` only for a real award; it renders as an ochre badge.

### Research topics (`src/pages/index.astro`)

Six topics in a two-column, three-row grid (one column under 40rem). Keep
each description to one sentence. Adding a seventh breaks the grid; discuss
first.

## Commands

```
npm run dev      local dev server with hot reload
npm run build    static build to dist/
npm run preview  serve the built dist/ locally
```

## Deployment

Hosted on **GitHub Pages** from the public repo
`aimsresearchlab/aimsresearchlab.github.io`. Every push to `main` runs
`.github/workflows/deploy.yml` (official `withastro/action`) and publishes
`dist/`. There is no Vercel or other host; the org owns the deployment, not any
one person's account.

- Live URL: https://aimsresearchlab.github.io, custom domain
  https://aimsresearchlab.com via `public/CNAME` plus A records at the
  registrar (Spaceship) pointing at GitHub's four Pages IPs and a `www` CNAME
  to `aimsresearchlab.github.io`.
- `site` in `astro.config.mjs` must match the custom domain.
- Before pushing: `npm run build` must pass and the change should be checked
  in `npm run dev` locally.
- The old `rabdelfattahlab/webpage` name redirects here; `aimsusm` org is an
  orphaned earlier attempt and can be deleted.

## Brand assets

Logo variants live outside `src/` in `full/`, `small/`, `favicon/` (svg, png,
pdf each). LaTeX paper templates for AIMS are in `latex/` (aaai, arxiv, acl, iclr).
