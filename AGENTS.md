# AIMS website

Static site for the AIMS research group. Built with **Astro**, output is plain
HTML + CSS. Chosen for longevity: a successor should be able to edit templates
without knowing a framework, and `astro build` produces a static `dist/` that
hosts anywhere.

This file is the rules. `CLAUDE.md` points here, so there is one document to
keep current, not two. Keep it current: if you change how something works,
change the paragraph that describes it in the same commit.

## Non-negotiables

- **No em dashes.** Anywhere: page copy, code comments, changelog entries,
  this file. Use a period, comma, colon, or parentheses instead.
- **Pages work without JavaScript.** Every route renders and reads with
  scripting off. Do not add Astro client directives (`client:load`, etc.), and
  do not reach for a `<script>` to solve a layout or content problem; it almost
  never does for this site. Two places may run script, both under the same
  condition, that the page is complete without it:
  - `/slides/aims-lab`, the overview deck. Its `<script>` bundles
    `src/scripts/deck-present.ts` and `deck-motion.ts` at build time (no CDN).
    Present mode and motion are enhancements on a page that already scrolls and
    reads. Keep them optional, and keep the import bundled.
  - The hand-written demos under `public/`, outside the Astro pipeline:
    `public/seam/` and `public/tiap/`. They are interactive by nature.

  Every other rule here, em dashes and design tokens included, applies to those
  files too.
- **All visual choices go through the design tokens** at the top of
  `src/styles/global.css`. Do not hardcode colors, fonts, or widths in
  components; reference the CSS variables. The site has been quietly
  re-hardcoded twice through the GitHub web editor, so check this when picking
  up someone else's edit.
- **Icons: Phosphor** via `astro-icon` (`<Icon name="ph:..." />`), plus
  **Simple Icons only for brand marks** (`simple-icons:arxiv`,
  `simple-icons:github`). Both inline as SVG at build time. Do not add an icon
  font or raster icons.
- **Fonts are self-hosted** via Fontsource (imported in `src/layouts/Base.astro`).
  Do not switch to a CDN font link; a dead CDN link is exactly the kind of rot
  this site is built to avoid.

## Design tokens (source of truth: `src/styles/global.css`)

Every token, and what it is for. If you need a value that is not here, add a
token with a comment rather than a literal in a component.

**Brand**

- `--brand` `#1652EC`, from `full/logo.svg`: links, headings, accents.
- `--brand-deep` `#0A2596`: the same blue where small text needs more contrast.
- `--navy` `#041A62`: deep sections, currently the footer.

**Neutrals**

- `--paper` `#FAFAF8`: page background, warm off-white, not pure white. The
  header sits on it too.
- `--ink` `#0A1B4C`: body text, the logo navy.
- `--ink-soft` `#3A4266`: secondary text, captions, nav links at rest.
- `--rule` `#E4E4DE`: hairlines and borders.

**Accents, used sparingly**

- `--ochre` `#C8892A`: one-off highlights, a "new" badge, an award.
- `--gold` `#F5CE55`: USM gold. Filled panels (the culture card on `/people`)
  and the rule under the page header band.
- `--gold-ink` `#8A6A1F`: gold that reads as text on paper, for kickers and
  role lines.
- `--charcoal` `#302F2C`: the full-bleed page header band.
- `--on-charcoal` `#D6D5D0`: secondary text on that band. Headings stay white.
- `--usm-band` `#E8E5DF`: the university band above the header.

**Figure palette**

`--area-perceive`, `--area-understand`, `--area-reason`, `--area-act`,
`--area-interact`, `--area-trust`. Six categorical hues for figures that have
to tell six things apart (the research loop on `/what-is-aims`). Not for page
chrome: a page still uses `--brand`, `--ink`, and `--ochre`.

**Type**

- `--font-serif` Tinos, Times-metric, the body face.
- `--font-ui` system sans, for the `.ui` class: nav, meta lines, small labels.

**Layout**

- `--content-width` `min(68%, 48rem)`: the centered prose column.
- `--content-wide` `min(88vw, 64rem)`: the wider column for grids and the
  banner. The homepage sections, the footer, and `.wide` anywhere use it.
- `--header-width` `min(94vw, 78rem)`: the header and the university band only.
  It is deliberately wider than `--content-wide` so the six nav links clear the
  logo on one line. Do not "align" it to the content column; that is what made
  the labels wrap.
- `--space` `1.5rem`.

No decorative chrome (ribbons, blobs, animations) on the site pages. Visual
interest comes from content: photos, cards, the news feed.

## Structure

```
src/styles/global.css          design tokens + base typography (edit look here)
src/styles/deck.css            the overview deck only, all under `.deck`
src/layouts/Base.astro         page shell: <head>, fonts, USM band, centered <main>, footer
src/components/Header.astro    logo + nav (edit the nav array at the top)
src/components/Footer.astro    copyright + GitHub org link
src/components/PageHeader.astro  the charcoal band every page below / opens with
src/components/Person.astro    one person card (avatar, name, topic, link icons)
src/components/Publication.astro
src/components/ProjectCard.astro  one project card (homepage + /projects)
src/components/Cover.astro     16:9 project cover (image, video, or placeholder)
src/components/ResearchLoop.astro  the six-area figure on /what-is-aims, inline SVG
src/components/deck/*.astro    one sheet type each, for /slides/aims-lab
src/pages/*.astro              one file per route
src/pages/projects/[slug].astro   one page per project, from the collection
src/pages/slides/aims-lab.astro   the overview deck
src/content.config.ts          schema for the projects collection
src/content/projects/*.md      one markdown file per project (source of truth)
src/data/people.ts             roster (feeds homepage People and /people)
src/data/publications.ts       papers (feeds homepage Recent and /publications)
src/data/news.ts               dated news feed (homepage right column and /news)
src/data/projects.ts           helpers over the projects collection + link icons
src/data/deck.ts               deck-only copy: areas, title tags, leadership
src/data/qr.ts                 the QR file naming rule, shared with the script
src/scripts/deck-present.ts    deck present mode (optional, bundled)
src/scripts/deck-motion.ts     deck motion (optional, bundled)
scripts/deck-pptx.mjs          renders the deck to .pptx with Playwright
scripts/deck-qr.mjs            writes every QR code under public/slides/
scripts/sync-tiap-data.py      pulls the TIAP demo's numbers from the paper repo
public/projects/*.webp         project covers, 1600x900 (16:9)
public/projects/*.{mp4,webm}   project cover videos, plus -thumb cuts
public/people/*.webp           headshots, 192x192, referenced from people.ts
public/lab.webp                homepage banner, 1600x640 (5:2), lab photo
public/assets/aims-lab-logo.png  the header logo
public/assets/usm1.png         the university band logo
public/usm-logo.svg            USM mark for the deck title sheet
public/slides/                 deck exports (.pptx) and QR codes
public/seam/                   SEAM-Bench demo + leaderboard, served at /seam/
public/tiap/                   TIAP walkthrough, served at /tiap/
public/CNAME                   custom domain for GitHub Pages; do not delete
public/favicon.svg             copied from favicon/logo.svg
public/og.jpg                  social preview image, 1200x630 jpg (not webp)
public/robots.txt              allows all, points at the sitemap
.github/workflows/deploy.yml   builds and publishes to GitHub Pages on push to main
```

## Page chrome

Three pieces stack above every page, in this order:

1. **The university band** (`src/layouts/Base.astro`): USM's own mark on
   `--usm-band`, linking to usm.edu. It is the university's chrome and sits
   above ours, not inside the header.
2. **The header** (`src/components/Header.astro`): the AIMS Lab logo and the
   nav. Edit the `nav` array at the top of the file to change the links; the
   current page is detected from the path and marked with a brand underline.
   Nav links are underlined, never boxed or pilled.
3. **The page header band** (`src/components/PageHeader.astro`): charcoal,
   full bleed, with a gold rule under it. Every route below the homepage opens
   with it. The homepage does not: it has the banner and hero instead.

```astro
<PageHeader title="People">
  <p class="lede">One line under the title.</p>
</PageHeader>
```

`width` picks the inner column so the title lines up with what follows:
`wide` (the default, `--content-wide`) on pages that open with a grid,
`prose` (`--content-width`) on pages that open with text. Do not hand-roll
another band; `/projects` carried its own copy for a while and they drifted.

## Content rules

### People (`src/data/people.ts`)

- One entry per person. Categories: `faculty`, `phd`, `masters`, `undergrad`.
  Section order and headings come from `categoryOrder` in the same file.
- Someone who has finished gets `graduated: 'Spring 2026'` (season plus year).
  That drops them from the roster on the homepage and moves them into the
  Alumni section at the foot of `/people`, grouped by category and term, most
  recent term first. Keep the entry where it is in the array; do not delete it.
- `role` and `bio` together promote a faculty member to the featured card at
  the top of `/people`. Set both or neither.
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
- No photo yet: point `image` at `/people/aims-placeholder.webp` (the AIMS
  mark in brand blue on the grey circle). Omitting `image` shows initials
  instead; either is fine, but do not use a stock placeholder image.
- The featured card renders its portrait near 285x370, so the director's file
  wants a larger source than 192x192.

### Publications (`src/data/publications.ts`)

- Order: published work first (journal, conference, findings), newest first;
  then work under review or revision; then arXiv preprints. The homepage Recent
  section shows the first three entries, so this order decides what appears
  there.
- `venue` is the short form: `Findings of EMNLP 2026`, `IEEE Internet of
  Things Journal`, `arXiv preprint`. Authors as initials plus surname,
  comma-separated.
- `url` points at the canonical record (arXiv abs page, DOI, or the USM Aquila
  record). Never `#`.
- `award` only for a real award; it renders as an ochre badge.
- Adding a paper means regenerating the deck's QR codes: `npm run deck:qr`.

### News (`src/data/news.ts`)

- One entry per event, newest first, ISO date. The homepage shows the first
  five. `text` is one line, no trailing period; quote paper titles.
- Add an entry for every acceptance, preprint, new member, talk, or award.
  A stale feed reads worse than none.

### Banner (`public/lab.webp`)

The homepage banner is a **5:2** image, **1600x640 webp**, quality 82. Crop
the source to 5:2 first (keep the wall sign fully in frame), then resize. The
`<img>` in `src/pages/index.astro` carries matching width/height.

### Research areas (hero, `src/pages/index.astro`)

The `areas` array at the top of the homepage renders as filled brand-blue
pills under the lede, each linking to `#projects`. CamelCase tokens, no
spaces, 6 to 8 of them. Keep them in sync with the tags used on project cards.

### Projects (`src/content/projects/*.md`)

One markdown file per line of work, not per paper. The filename is the slug and
the URL (`gaussian-streaming.md` -> `/projects/gaussian-streaming/`). Frontmatter
is validated by `src/content.config.ts`, so a bad field fails the build.

```yaml
---
title: '4D Gaussian Streaming'
claim: 'One sentence stating the finding or the goal.'
tags: [ComputerVision, GaussianSplatting]   # 1 to 3 CamelCase tokens, no spaces
cover: /projects/gaussian-streaming.webp    # optional, 16:9, also the video poster
coverVideo: /projects/anchor_policies.mp4   # optional, see Project covers
coverCaption: 'Optional bar over the cover'
featured: 4                                 # homepage order; omit to leave it off
links:
  - { kind: arxiv, url: 'https://arxiv.org/abs/2603.17227' }
publications:
  - 'Exact title from src/data/publications.ts'
---
```

- Quote `title` and `claim`. A colon in an unquoted YAML scalar breaks the parse.
- The body is the project page: two or three short `##` sections (overview, what
  we found, what is next). Keep it to what the papers actually support.
- `featured` orders the homepage grid, which shows the first three. Raise the
  limit in `src/pages/index.astro` if you want two rows.
- `links` use `kind`: `arxiv`, `github`, `paper`, or `demo`. Each renders as an
  outlined pill with the matching icon. Only canonical records (arXiv, DOI,
  public GitHub repo, a demo on this site). Do not link private repos.
- `publications` must match titles in `src/data/publications.ts` character for
  character; a typo silently drops the paper from the Papers section.
- Adding a project means regenerating the QR codes: `npm run deck:qr`.

### Project covers (`public/projects/`)

Still images: **16:9**, **1600x900 webp**, quality 82, named `<slug>.webp`.
Crop to 16:9 first, then resize. With no `cover`, the page and the card render
a placeholder (the AIMS mark on a hairline box) at the same aspect ratio, so
adding a real image later does not move the layout.

Video covers (`coverVideo`) are the same 16:9 box and autoplay muted on loop.
The rules that keep them from costing a visitor megabytes:

- **Ship a `-thumb` cut.** The cards on `/` and `/projects` render about 300px
  wide, and `Cover.astro` asks for `<name>-thumb.{webm,mp4}` at 640x360 when it
  has one. Without it, the card serves the full file. Aim for a few hundred KB.
- `Cover.astro` emits only the formats that exist on disk, so a cover can be
  mp4 only. Prefer both when both compress well; check the sizes before
  assuming webm wins, because vp9 is much worse than h264 on noisy content
  (point clouds, heat maps).
- A source that is not 16:9 is **padded**, not cropped, using the video's own
  background color. Cropping a walkthrough cuts off part of what it shows.
- `src` stays the poster frame and the reduced-motion fallback image, so give a
  video cover a `cover:` image too.
- The ffmpeg commands are in the header comment of `src/components/Cover.astro`.
  Keep them there and keep them current.

### Routes

Every homepage section has a full page behind it, and the header nav points at
the pages, not at homepage anchors:

```
/                 hero, 3 projects, People, 3 recent publications, news sidebar
/what-is-aims     what the lab is, and the research-loop figure
/projects         all projects, cards with covers
/projects/<slug>  one project: cover, claim, links, prose, its papers
/people           full roster, leadership card, alumni
/news             full archive, grouped by year
/publications     all papers, grouped by year
/slides/aims-lab  the overview deck (also downloadable as .pptx)
/seam/            SEAM-Bench demo and leaderboard (static, outside Astro)
/tiap/            TIAP walkthrough (static, outside Astro)
```

The homepage sections keep their `#projects`, `#people`, `#news` anchors, so
old links still land in the right place.

## The overview deck (`/slides/aims-lab`)

A presentable overview of the lab: research areas, people, projects, papers,
news. It is a normal Astro page, so it stays in sync with the site's data
files, and it exports to PowerPoint for anyone who needs to edit it elsewhere.

- Sheets are components in `src/components/deck/`, one file per sheet type.
  Styles are `src/styles/deck.css`, every rule namespaced under `.deck`,
  because the deck reuses words (card, face, tag, news) that the site also uses.
- Sizes inside a sheet are written in design pixels of a 1280x720 canvas and
  scaled with `--px`, so one number serves the page, a phone, and the export.
- Content the site already knows (people, publications, news, projects) is read
  from its own data file. `src/data/deck.ts` holds only what belongs to the
  deck: the research areas, the title tags, the leadership entries.
- `npm run deck:qr` writes every QR code under `public/slides/`. The naming
  rule lives in `src/data/qr.ts`, imported by both the script and the sheets so
  they cannot drift. Rerun it after adding a project or a paper.
- `npm run deck:pptx` renders the live page with Playwright and walks each
  `.slide-canvas` into native PowerPoint text boxes and shapes, then writes
  `public/slides/aims-lab.pptx` and the dark variant. It loads the page with
  reduced motion, so every sheet is at rest when measured. Rerun it after
  changing deck copy, and commit the .pptx.

## SEAM-Bench and TIAP pages (`public/seam/`, `public/tiap/`)

Hand-written static pages that deploy with the site. `public/seam/index.html`
is a GSAP walkthrough of one benchmark case and `leaderboard.html` ranks 20
models, expanding each row into that model's real outputs. `public/tiap/`
animates one real query rescored under three scoring targets.

- They are the documented exception to the no-JavaScript rule. Every other rule
  here still applies to them, em dashes and all.
- The walkthroughs measure their targets from the DOM and rebuild the timeline
  on resize, so they reflow on phones instead of scaling to nothing. Keep that
  property: never reintroduce a fixed-size canvas scaled by transform.
- `window.__tl` is the timeline. `tl.pause()`, `tl.seek(t, false)` (the `false`
  lets callbacks fire) and `tl.play()` are how you inspect a beat or capture a
  still. Step forward in small increments; captions and typed text come from
  callbacks, so one long jump lands mid-write.
- Numbers are generated, never retyped. SEAM's come from the benchmark's
  `results/statistics.json`; TIAP's come from `scripts/sync-tiap-data.py`,
  which reads the saved run artifacts in the paper repo and writes
  `public/tiap/data/`. Regenerate and re-embed.
- Full pipeline, repo map, and the figure-capture recipe:
  [`docs/DEMO.md`](https://github.com/aimsresearchlab/seam/blob/main/docs/DEMO.md)
  in `aimsresearchlab/seam`.

## Changelog

Every change set gets an entry in `changelog/`, one markdown file named
`YYYY-MM-DD-slug.md`. A change set is a coherent piece of work, usually one
push rather than one commit. Write it as part of the work: say what changed
and why, and list anything a successor still has to do by hand. The
conventions are in `changelog/README.md`.

## Commands

```
npm run dev        local dev server with hot reload
npm run build      static build to dist/
npm run preview    serve the built dist/ locally
npm run deck:qr    regenerate the deck's QR codes into public/slides/
npm run deck:pptx  render the deck to public/slides/aims-lab{,-dark}.pptx
```

## SEO

All of it lives in `src/layouts/Base.astro`; pages only pass `title`,
`description`, and optionally `socialTitle`, `image`, and `type`.

- Every page gets: canonical URL, description, Open Graph, Twitter card,
  theme-color, and a `ResearchOrganization` JSON-LD block. The JSON-LD is a
  data script (`type="application/ld+json"`), not executable JS, so it does
  not violate the no-client-JS rule.
- `@astrojs/sitemap` writes `sitemap-index.xml` at build time from every
  route; `public/robots.txt` references it. Nothing to maintain by hand.
- New pages: pass a specific `title` ("Thing AIMS Lab") and a one-sentence
  `description` under 160 characters. Do not reuse the homepage description,
  and do not ship a placeholder: `/projects` shipped `description="..."` for a
  week and that is what search engines and link previews showed.
- Social image: `public/og.jpg`, 1200x630, jpg (WhatsApp, LinkedIn, and
  iMessage do not reliably render webp previews). It is the lab photo under a
  navy gradient with the white mark, "AIMS", the expansion, and a USM line,
  composed with ImageMagick and Times New Roman. Regenerate if the banner or
  wording changes. Pages may pass `socialTitle` for a shorter preview title.
- After changing tags or the image, force Facebook/Messenger/LinkedIn to
  re-scrape: https://developers.facebook.com/tools/debug/ and
  https://www.linkedin.com/post-inspector/. They cache previews for weeks.
- After a domain change, update `site` in `astro.config.mjs`; every absolute
  URL above derives from it.

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
- Pages is free and fits: the limits are 1GB published, 1GB repo, and 100GB a
  month of bandwidth, against a 34MB site. No CDN in front of it, and note that
  Cloudflare's free plan restricts serving video it does not host, which the
  project covers are.
- Video in git history is the one number worth watching, since every upload is
  a permanent copy and replacing a file adds a second one rather than swapping.
- The old `rabdelfattahlab/webpage` name redirects here; `aimsusm` org is an
  orphaned earlier attempt and can be deleted.

## Brand assets

Logo variants live outside `src/` in `full/`, `small/`, `favicon/` (svg, png,
pdf each). LaTeX paper templates for AIMS are in `latex/` (aaai, arxiv, acl, iclr).
