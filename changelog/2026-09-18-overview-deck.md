# Lab overview deck, on the site and as PowerPoint

The lab had one overview deck, exported from PowerPoint by hand: a designed
title graphic followed by pages of headshots with labels that read "Our
Projects:" over photos of the director, truncated section headings, and two
empty slides. The content it wanted (projects, people, news) is already in
this repo as data, so the deck is now built from that data instead of being
maintained separately.

The deck is meant to run on the screen in the lab, so it is sized for a room:
display type, one idea per sheet, and a QR on the first and last sheet as the
only thing a visitor standing in front of it can act on.

## What changed

- The deck lives at `/slides/aims-lab/` and reads `src/data/people.ts`,
  `publications.ts`, `news.ts` and the projects collection, so the roster, the
  paper list and the news feed cannot drift from the rest of the site. Each
  sheet is a `.slide-canvas` of 1280 x 720 design pixels; sizes are written in
  those pixels and scaled with container query units, so one set of numbers
  serves the page, a phone and the exported slide.
- Split into parts that each do one thing, rather than one long page:
  `src/components/deck/` one file per sheet (`TitleSheet`, `WorkSheet`,
  `SpotlightSheet`, `CardsSheet`, `DirectionSheet`, `RosterSheet`,
  `PapersSheet`, `NewsSheet`) plus the shared `Sheet`, `Lockup`, `QrCard`,
  `Backdrop` and `StageBar`; `src/data/deck.ts` for deck-only content;
  `src/styles/deck.css` for every sheet style, each rule namespaced under
  `.deck` because the deck uses names (card, face, tag, news) the rest of the
  site also uses; `src/scripts/deck-present.ts` and `deck-motion.ts` for
  behaviour. `src/pages/slides/aims-lab.astro` now only orders the sheets.
  `Sheet.astro` is where the two contracts live: the frame the present
  controller shows, and the canvas the exporter walks.
- The sheets: title, what we do, three project spotlights, the other projects,
  direction, the roster, selected papers, news. Each paper carries a
  destination: its project page on this site when it has one (the mapping comes
  from the `publications:` field of each project), otherwise its own canonical
  record, and nothing at all when it has neither. Titles are 58 design pixels and
  body text 18 to 22, which is what a deck on a wall needs; the density of each
  sheet was cut to match (five research areas in short form, four papers, names
  without topic lines).
- Light and dark sheets from one source, switched by a checkbox.
- Present mode (`deck-present.ts`): a Present button puts the deck fullscreen,
  one sheet at a time. Space, Enter, the arrows, PageUp/PageDown, Home, End and
  a click on the sheet all move; `p` toggles the timer, `f` toggles fullscreen,
  Escape leaves; the ends wrap. The controller owns one piece of state, the
  index on screen, and publishes changes, so nothing else reads the DOM to work
  out which sheet is up. Four things it handles that the first version did not:
  focus moves to the stage on entering, or a space would re-trigger the button
  that started it; the advance-click listener sits on the stage, not the deck,
  so the same click cannot both start and advance; a refused or late fullscreen
  event cannot close a deck that is running without it; and the timer stops
  while the tab is hidden.
- Motion, on the live page only (`motion`, bundled at build time, no CDN):
  sheets rise into place as they scroll in, the sheet arriving in present mode
  animates its blocks in sequence, and a slow field of colour pools and rings
  drifts behind the column. All of it is decoration: the page is complete
  without it, and `prefers-reduced-motion` turns it off. This is a deliberate
  exception to the no-JavaScript and no-decorative-chrome rules in `CLAUDE.md`,
  scoped to this page, asked for so the deck feels alive on a screen in a room.
  Two rules the module follows, both learned the hard way: visibility of a
  sheet belongs to the stylesheet, never to Motion (it writes inline styles and
  keeps them, and an inline `opacity: 1` left every visited sheet stacked on
  the others), and transforms are given as Motion's own `scale`, `x` and `y`
  properties, never as a `transform` string (it cannot interpolate the `none`
  keyword and lands on `scale(0)`, which blanks the sheet).
- The stage behind a presented sheet is lit rather than flat: a deep base,
  three brand-coloured pools drifting across it, and a faint grid. It is
  painted by the backdrop element under the transparent stage, because
  z-index orders siblings and a sheet is a child of the stage: the earlier
  arrangement put the backdrop over the sheets. Under reduced motion the
  backdrop stays (it is the floor the sheet sits on) and only the drift stops.
- Small screens: below 52rem a sheet on the page stops holding 16:9, the design
  pixel is measured against a 640 px canvas, grids stack, and figures show at
  full width and their own height rather than cropped to a band. Present mode
  always renders the 16:9 sheet.
- `scripts/deck-pptx.mjs` plus `npm run deck:pptx`: renders the page headlessly
  and walks each canvas, turning every block of text into a native text box,
  every filled or bordered box into a shape, and every image into a picture.
  Output is `public/slides/aims-lab.pptx` and `aims-lab-dark.pptx`, checked in
  so the download works without a build step. Text, layout and colour are
  editable in PowerPoint; figures and photos are pictures.
  Ported from `scripts/poster-pptx.mjs` on spanthi.com, which does the same for
  the printed posters. Four changes it needed: a fully rounded wide box is a
  pill, not an ellipse; a fully rounded image is cropped to a circle; a run of
  inline content that carries no text still has to give up its figures, or a
  card holding only images (the QR) is dropped from the slide; and the export
  runs the page with reduced motion, so nothing is captured mid-animation.
- Fonts map to their metric-compatible Office equivalents on the way out
  (Tinos to Times New Roman, the UI stack to Arial), so the file opens
  correctly with nothing to install.
- Project covers built from the papers' own figures, added to the project pages
  as well, so the figure a visitor sees on the project page is the figure on
  the slide: `same-ranking-different-winner.webp` and
  `fixed-rag-compression.webp` from `research/figures/` (`cmem-fig1-v2` and
  `reader-replay`), `seam.webp` from the SEAM paper's own
  `fig2_main_results.pdf` (absorption rate across twenty models), and
  `gaussian-streaming.webp` cropped from Figure 1 of arXiv:2603.17227, the
  five-selector render grid.
  Three projects are spotlights, in order: SEAM, Same Ranking, 4D Gaussian
  Streaming. A project earns a spotlight when it has a figure that holds up at
  display size; the other three run as cards. Fixed RAG Compression keeps its
  cover on its project page but runs as a card.
- `scripts/deck-qr.mjs` plus `npm run deck:qr`: writes one H-level code for the
  site and one per project (`public/slides/qr-<slug>.svg`), on a transparent
  background. Sheets draw them on a white card with the AIMS mark in the
  middle: a large one on the title and closing sheets, a small one on each
  project spotlight pointing at that project's page. Every size was decoded
  from a render to confirm the mark does not break the code. Re-run it after
  adding a project or changing the domain.
- `public/logo-mark-light.svg`: the mark's right half is deep navy and
  disappears on the dark sheets, so that variant lightens those two gradient
  stops. Used only by the deck.
- The title sheet pairs the AIMS mark with `public/usm-logo.svg` on a white
  card. That file is the line-art dome with gold windows and black type, which
  is right on white and invisible on navy, so the card is what lets one file
  serve both themes.
- `public/people/sarah-lee.webp`: from the USM faculty directory, cropped and
  resized to the 192 x 192 the site uses.
- `playwright`, `pptxgenjs` and `qrcode` as dev dependencies, `motion` as a
  dependency. The site build uses only `motion`.

## By hand

- Regenerate after editing the deck: `npm run dev`, then
  `DECK_BASE=http://localhost:<port> npm run deck:pptx`, and commit the two
  `.pptx` files. The script does not run in CI, so a page edit without a
  regeneration leaves the downloads stale.
- Dr. Sarah Lee is on the Direction sheet because she directs the school the
  lab sits in. She is deliberately not in `src/data/people.ts`: she is not a
  member of the lab, and adding her there would put her on `/people`. Her name,
  title and photo come from her USM faculty profile.
- The header nav does not link the deck yet. It is reachable at
  `/slides/aims-lab/` and through the sitemap.
- The five research areas on the second sheet are written in the deck page, not
  in a data file, and are shortened for the sheet. If the lab's stated areas
  change, edit the `areas` array at the top of the page.
- Outcome Monitors and Thin-Object Segmentation have no cover: `recovery-gap`
  has no built figures yet, and the thin-object paper is not checked out here.
  When a figure exists, build a 1600 x 900 cover from it, set `cover:` in the
  project's markdown, and add the slug to `spotlights` at the top of the deck
  page.
- The Gaussian streaming cover was cropped from the arXiv PDF because that
  paper is not checked out on this machine. If the source figure lands in
  `research/figures/`, rebuild the cover from it rather than from the PDF.
- arXiv v3 of that paper is titled "Does Anchor Selection Matter in 4D Gaussian
  Streaming?" while `src/data/publications.ts` still carries the earlier title,
  "Does It Matter Which Gaussians You Pick in 4D Gaussian Streaming?". Left
  alone deliberately: changing it means changing the matching entry under
  `publications:` in the project markdown and the news item that quotes it.
