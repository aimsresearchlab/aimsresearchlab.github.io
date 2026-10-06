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
  never does for this site. Three places may run script, all under the same
  condition, that the page is complete without it:
  - `/slides/aims-lab`, the overview deck. Its `<script>` bundles
    `src/scripts/deck-present.ts` and `deck-motion.ts` at build time (no CDN).
    Present mode and motion are enhancements on a page that already scrolls and
    reads. Keep them optional, and keep the import bundled.
  - `/reel`, the lab TV loop. Its `<script>` bundles `src/scripts/reel/`
    (three.js and GSAP from npm, no CDN). Without script the page is a stack
    of 16:9 frames, each scene at rest.
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
- `--navy` `#041A62`: deep sections and hover fills. The footer sits on `--paper`.

**Neutrals**

- `--paper` `#E8E5DF`: page background, warm beige. The
  header sits on it too.
- `--ink` `#0A1B4C`: body text, the logo navy.
- `--ink-soft` `#3A4266`: secondary text, captions, nav links at rest.
- `--rule` `#E4E4DE`: hairlines and borders.

**Accents, used sparingly**

- `--ochre` `#C8892A`: one-off highlights, a "new" badge, an award.
- `--gold` `#F5CE55`: USM gold. Filled panels (the culture card on `/people`, the news panel on the homepage)
  and the rule under the page header band.
- `--gold-ink` `#8A6A1F`: gold that reads as text on paper, for kickers and
  role lines.
- `--charcoal` `#302F2C`: the full-bleed page header band.
- `--on-charcoal` `#D6D5D0`: secondary text on that band. Headings stay white.

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
- `--header-width` `min(94vw, 78rem)`: the header only.
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
src/layouts/Base.astro         page shell: <head>, fonts, centered <main>, footer
src/components/Header.astro    logo + nav (edit the nav array at the top)
src/components/Footer.astro    logos left; director's email and GitHub stacked on the right
src/components/PageHeader.astro  the charcoal band every page below / opens with
src/components/Person.astro    one homepage roster entry (square photo, name, topic, link icons);
                               /people draws its own larger cards in people.astro
src/components/Publication.astro
src/components/WriteUp.astro   one write-up row (/writing + project pages)
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
src/data/writing.ts            members' blog write-ups (feeds /writing and project pages)
src/data/ur2phd.ts             UR2PhD cohorts on /ur2phd (one entry per term, names sorted by last name)
src/data/projects.ts           helpers over the projects collection + link icons
src/data/deck.ts               deck-only copy: areas, title tags, leadership
src/data/qr.ts                 the QR file naming rule, shared with the script
src/scripts/deck-present.ts    deck present mode (optional, bundled)
src/scripts/deck-motion.ts     deck motion (optional, bundled)
src/pages/reel.astro           the lab TV loop at /reel (noindex, not in the nav or sitemap)
src/scripts/reel/*.ts          the reel: main.ts timeline, lab.ts photo room, arch.ts overhead model, scenes.ts
src/styles/reel.css            the reel only, all under `.reel`
src/data/reel.ts               reel-only copy: poster order and spots, numbers quoted from arXiv abstracts
scripts/deck-pptx.mjs          renders the deck to .pptx with Playwright
scripts/deck-qr.mjs            writes every QR code under public/slides/
scripts/sync-tiap-data.py      pulls the TIAP demo's numbers from the paper repo
public/projects/*.webp         project covers, 1600x900 (16:9)
public/projects/*.{mp4,webm}   project cover videos, plus -thumb cuts
public/people/*.webp           headshots, 192x192, referenced from people.ts
public/lab.webp                homepage banner, 1600x640 (5:2), lab photo
public/assets/aims-lab-logo.png  the header logo
public/assets/usm1.png         USM logo in the footer (trimmed, no margins)
public/assets/aims-lab-logo-trim.png  AIMS logo for the footer (aims-lab-logo.png trimmed)
public/assets/cra-logo.png     CRA logo (their PNG from cra.org, no SVG exists), /ur2phd banner
public/usm-logo.svg            USM mark for the deck title sheet
public/slides/                 deck exports (.pptx) and QR codes
public/seam/                   SEAM-Bench demo + leaderboard, served at /seam/
public/tiap/                   TIAP walkthrough, served at /tiap/
public/reel/                   reel images: room.webp (the photo the 3D room is built from), poster figures, bg-*.webp scene backdrops
public/CNAME                   custom domain for GitHub Pages; do not delete
public/favicon.svg             copied from favicon/logo.svg
public/og.jpg                  social preview image, 1200x630 jpg (not webp)
public/robots.txt              allows all, points at the sitemap
public/9487d40c57ee4bfcb0a0c4e8dda6374d.txt  IndexNow key; do not rename or delete
scripts/indexnow.py            pings IndexNow (Bing, which backs ChatGPT search) with every sitemap URL; run after a deploy that adds pages
.github/workflows/deploy.yml   builds and publishes to GitHub Pages on push to main
```

## Page chrome

Two pieces stack above every page, in this order:

1. **The header** (`src/components/Header.astro`): the AIMS Lab logo and the
   nav. Edit the `nav` array at the top of the file to change the links; the
   current page is detected from the path and marked with a brand underline.
   Nav links are underlined, never boxed or pilled.
2. **The page header band** (`src/components/PageHeader.astro`): charcoal,
   full bleed, with a gold rule under it. Every route below the homepage opens
   with it. The homepage does not: it has the banner and hero instead, with
   the same charcoal band and gold rule drawn full bleed behind the top 60% of
   the lab photo (`.hero::before` in `src/pages/index.astro`).

```astro
<PageHeader title="People">
  <p class="lede">One line under the title.</p>
</PageHeader>
```

`width` picks the inner column so the title lines up with what follows:
`wide` (the default, `--content-wide`) on pages that open with a grid,
`prose` (`--content-width`) on pages that open with text. An optional
`slot="aside"` element sits to the right of the title (the CRA badge on
`/ur2phd`) and wraps below it on narrow screens. Do not hand-roll
another band; `/projects` carried its own copy for a while and they drifted.

## Content rules

### People (`src/data/people.ts`)

- One entry per person. Categories: `faculty`, `phd`, `masters`, `undergrad`,
  `collaborator`. `collaborator` is for an undergraduate who works with the
  lab but whose primary advisor is another professor; they get their own
  section after the undergraduates (on `/people`, the homepage, and the deck)
  so no one reads them as this lab's student.
  Section order and headings come from `categoryOrder` in the same file.
- Someone who has finished gets `graduated: 'Spring 2026'` (season plus year).
  That drops them from the roster on the homepage and moves them into the
  Alumni section at the foot of `/people`, grouped by category and term, most
  recent term first. Keep the entry where it is in the array; do not delete it.
- `role` and `bio` together promote a faculty member to the featured card at
  the top of `/people`. Set both or neither.
- `topic` is one short line (two to four words). It must fit on one line in a
  12.95rem card on the homepage; if it wraps, shorten it. Cards in a row must
  line up.
- On `/people` every current student is a card: the photo on the left, then
  name, topic (in blue), and text link pills, two cards per row. No role
  kicker; the section heading already says it. Each category gets its own
  heading with a short blue bar under it and a student count beside it.
  Alumni are a compact list (96px photo, name, topic), not cards.
- Names are forced onto one line (`white-space: nowrap`). If a name is too long
  for the card, widen `.people :global(.person)` in `src/pages/index.astro`
  rather than letting it wrap.
- Links: use the `links` array with a `type` from `LinkType`. No raw icons.

### Headshots (`public/people/`)

- Format: **webp only**, exactly **192x192** (about 1.75x the 110px homepage avatar), quality 85.
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
- Photos are never circles: 110px squares on the homepage, 128px rounded
  squares beside the name on `/people` cards (96px on phones), a 192px square
  on the director's card, and 96px squares in the alumni list. None of these
  draws the 192x192 file much above its real size, so do not reintroduce a
  layout that stretches it.
- No photo yet: point `image` at `/people/aims-placeholder.webp` (the AIMS
  mark in brand blue on a grey tile). Omitting `image` shows initials
  instead; either is fine, but do not use a stock placeholder image.
- The featured card renders its portrait as a 192px square (160px on phones).

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

### Writing (`src/data/writing.ts`)

- One entry per blog post a member has published about the lab's work. The
  post lives on the member's own site; this page only links to it, so search
  engines and readers can follow lab work to its plain-language write-up.
- `url` is the post's canonical URL, trailing slash included if the site uses
  one. `date` is the post's publish date. `summary` is one sentence in plain
  words, no trailing period. Avoid numbers unless they match the paper.
- `project` is a slug from `src/content/projects/`. When set, the post also
  appears under "Write-ups" on that project page. Omit it for work with no
  project page.
- Only posts about work done in or with the lab. Never name the venue of a
  paper under review in a title or summary.

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
- `links` use `kind`: `arxiv`, `github`, `paper`, `demo`, or `poster`. Each
  renders as an outlined pill with the matching icon. Only canonical records
  (arXiv, DOI, public GitHub repo, a demo on this site, a poster PDF under
  `public/projects/`). Do not link private repos.
- A poster also goes in the body as a `## Poster` section: a webp render of the
  PDF, 2000px wide, quality 85, linked to the PDF
  (`public/projects/<slug>-poster.{pdf,webp}`).
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
/news             full archive, grouped by year (not in the nav; linked from the homepage news panel)
/ur2phd           the CRA UR2PhD mentoring program at USM, and its participants
/publications     all papers, grouped by year
/writing          members' plain-language write-ups, linking out (not in the nav; linked from /publications and under the homepage Recent list)
/slides/aims-lab  the overview deck (also downloadable as .pptx)
/reel             the lab TV loop (noindex; not in the nav or the sitemap)
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

## The lab reel (`/reel`)

A loop for the lab TV. A camera opens on a 3D model of the room, flies down
into the photograph of it, visits one poster per line of work, and each poster
opens into a short animated scene of that paper's result. It ends on the
people and the address.

- **The room** is rebuilt from one photo, `public/reel/room.webp`. Its
  calibration is at the top of `src/scripts/reel/lab.ts`: focal length,
  view direction and roll from three vanishing points, the camera height from
  the carpet tiles and the TV, and every wall, desk, monitor and piece of
  furniture placed where the photo puts it. Simple boxes are painted by
  projecting the photo back out of its own camera. Replacing the photo with a
  different shot means measuring all of that again; a higher-resolution copy
  of the same shot is a drop-in swap.
- **The overhead model** (`arch.ts`) is a lit copy of the room on a paper
  backdrop, with ambient occlusion. Its furniture positions come from the same
  measurements (`STATIONS`, `LOUNGE`).
- **Posters** hang over the real posters in the photo; their order and wall
  positions are in `src/data/reel.ts`, their copy and covers come from the
  project files, except covers listed in `posterCovers` there (thin-object
  shows the survey figure on the wall and its project cover in the scene). The order is a priority order set by the lab's advisor, not
  by topic: keep it as given, put new projects where they are asked for, and
  do not reorder posters to alternate language and vision work. To change the
  order, reassign slugs to the existing spots rather than moving the spots.
  Eight spots: the five over real posters, two on bare wall near the back, and
  right wall z -2.3, added for the eighth poster. LAPSE has no project page,
  so its copy is an object in `src/data/reel.ts` (`lapse`). The smoke
  detection scene shows the lab's infographic
  (`public/reel/smoke-detection-infographic.webp`) beside its five steps.
- **Scenes** carry the AIMS mark top right, as the posters do, and a photo
  behind them under a navy gradient that keeps the left and top near solid,
  so the result stays the subject. Each photo shows the paper's own running
  example (the warehouse task, the driver, the pasted text); none is
  generated. They come from Pexels (key in the costumary repo's `be/.env`,
  never copied here), cropped to 1920x1080 webp at quality 72, and are listed
  with their photographer in `backdrops` in `src/data/reel.ts`; the scene
  footer credits them. Pick dark photos: a bright one lifts the whole frame
  and washes out the grey labels. The people scene shows current lab members
  only; collaborators are left out.
- **Logos and figures in scenes** are real: the RAG scene's 20 readers are
  their family logos (`public/reel/icons/`, from @lobehub/icons as listed in
  `research/icons.md`) in the paper's Table 4 order (`ragReaders`), and Same
  Ranking shows the paper's Figure 1 (`public/reel/srdw-fig1.webp`) in the
  space its query leaves.
- **Numbers** in the scenes are read at build time from the SEAM and TIAP demo
  data, or from `src/data/reel.ts`, which names the arXiv abstract each comes
  from.
- **Keys**: space pauses (a bar of stops appears; 1 to 0 jump), hold space for
  2x, arrows step between stops, F fullscreen, R restart, S 3x. `?at=<stop>`
  starts at a stop (`?at=seam`). `window.__tl` is the timeline, as in the
  demos below.

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
- Driving one of these pages from Playwright: every GSAP method returns the
  timeline, so `page.evaluate(() => window.__tl.pause())` hands Playwright a
  circular object to serialize and hangs with no error. Wrap the call so it
  returns nothing: `page.evaluate(() => { window.__tl.pause(); })`. Load with
  `waitUntil: 'load'`, not `networkidle`, which never settles while the page
  animates. To record a cut, open the context with `recordVideo` at the target
  size, seek to the first beat, note the wall clock, play for the length you
  want, close the context, then trim that pre-roll off the front with ffmpeg.
  Record at a viewport with room (1440x1100) and crop to the demo window
  afterwards, measured from the DOM. These pages are fixed layouts that fill
  the viewport, so recording straight at 1280x720 squeezes them and clips the
  window. Widen the crop to 16:9 around the window instead of padding it: the
  extra pixels are then the page's own background.
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
  route except `/reel` (noindex, filtered out in `astro.config.mjs`);
  `public/robots.txt` references it. Nothing to maintain by hand.
- New pages: pass a specific `title` ("Thing · AIMS Lab") and a one-sentence
  `description` under 160 characters. Do not reuse the homepage description,
  and do not ship a placeholder: `/projects` shipped `description="..."` for a
  week and that is what search engines and link previews showed.
- **Titles end in "USM".** `Base.astro` appends it to the `<title>` and the
  social titles unless the page already says USM or Southern Miss, so a page
  passes its own name and nothing else. People looking for a university lab
  search for the university along with the subject, and the title is where
  both names can meet. The hand-written demos under `public/` are outside the
  layout, so their `<title>` and `og:title` carry the suffix by hand.
- The title is the cheap half of the university connection. The half that
  actually moves rankings is a link from a `usm.edu` page (the CSCE department
  listing, the faculty profile) to aimsresearchlab.com. That is worth asking
  for; a keyword in a title inherits no authority on its own. The JSON-LD in
  `Base.astro` already names USM as `parentOrganization`, which is the machine
  readable half of the same claim.
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
