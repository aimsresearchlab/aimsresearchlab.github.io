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
src/components/Footer.astro
src/pages/*.astro             one file per route
public/favicon.svg            copied from favicon/logo.svg
```

## Commands

```
npm run dev      local dev server with hot reload
npm run build    static build to dist/
npm run preview  serve the built dist/ locally
```

## Brand assets

Logo variants live outside `src/` in `full/`, `small/`, `favicon/` (svg, png,
pdf each). LaTeX paper templates for AIMS are in `latex/` (aaai, arxiv, acl, iclr).
