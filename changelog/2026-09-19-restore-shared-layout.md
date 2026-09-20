# Put the main pages back on the shared layout

`/people`, `/news`, `/publications`, `/projects`, and `/what-is-aims` had been
rewritten as standalone HTML documents: each carried its own `<head>`, its own
copy of the header, USM bar, and footer, and roughly 200 lines of inlined CSS
built on a second set of color variables. The visible symptom was the favicon,
since all five shipped a hand-drawn navy and gold "A" as a data URI instead of
the real mark.

What changed:

- All five pages point at `/favicon.svg` again. Every main route now serves the
  real logo, and `/slides/aims-lab` already did.
- `people.astro`, `publications.astro`, `news.astro`, and `projects/index.astro`
  are restored from their last commits that used `Base.astro`, so they are back
  on the design tokens, the self-hosted fonts, and the shared header and footer.
  That also restores canonical URLs, Open Graph, Twitter cards, and JSON-LD on
  those pages, all of which live in `Base.astro`.
- `what-is-aims.astro` never had a version on `Base.astro`, so it was rewritten
  onto it, keeping the advisor's copy and the research-areas figure.
- The Leadership block on `/people` is kept: a featured card for the director
  (portrait, role, blurb, pill links) beside the gold "Our culture" panel. It
  reads from `src/data/people.ts` through two new optional fields, `role` and
  `bio`, rather than hardcoded markup, so the roster has one source of truth
  again.
- `--gold` and `--gold-ink` are new tokens in `src/styles/global.css`, for the
  culture panel and the small uppercase role line. `--charcoal` and
  `--on-charcoal` join them for the full-bleed page header on `/projects`.
- The `/projects` header keeps the charcoal band and gold rule, but its inner
  column is now `--content-wide`, so the heading lines up with the card grid,
  and its negative top margin is gone: that margin was pulling the band up over
  the nav and clipping the links. Its lede is rewritten in the first person.
- Dropped the Google Fonts CDN links (Manrope, Source Serif 4) those pages had
  added, and the remaining em dashes in `Header.astro` and `publications.ts`.

Still to do by hand:

- `public/people/rabab-abdelfattah.webp` is 192x192, the roster avatar size. The
  featured card renders it near 285x370, so it looks soft. It needs a larger
  source, roughly 800x1040, cropped to the same face framing.
- `public/seam/index.html` and `public/seam/leaderboard.html` have no favicon
  link at all and fall back to the browser default.
- The advisor's version listed Ticauris Stokes both as a current PhD researcher
  and as an alum. `people.ts` keeps him on the roster only; confirm that is
  right.

## Follow-ups in the same pass

- Project detail pages (`/projects/<slug>`) had the cover butting straight
  against the header, since `main` has no top padding and the cover is the
  page's first element. Added a 3rem gap above it, and gave the Papers section
  room around its rule instead of 0.5rem.
- Nav states: the current page was a hardcoded black pill, and hovering it
  turned the text dark navy on black, so it disappeared. The current page is
  now marked with a 2px brand underline, and hover is a soft `--rule` pill with
  ink text. Both readable, both on tokens.
- Video covers now ship in two cuts. The cards on `/` and `/projects` render
  about 300px wide, so they get a `-thumb` sibling at 640x360 (140KB mp4 /
  216KB webm, down from 797KB / 998KB); the detail page keeps the full 1280x720
  file. `Cover.astro` takes a `compact` prop and falls back to the full file
  when no `-thumb` exists, so a project without one still works. The ffmpeg
  commands that make a thumb are in the component's header comment.
- `/what-is-aims`: the research-areas diagram was floated right at 40% width,
  which made a dense 1845x1340 figure unreadable and broke the paragraph rag
  around it. It is now its own full-width figure below the prose, in a bordered
  card with padding and a caption. The prose keeps the narrow column, matching
  `/news` and `/publications`.
- That diagram is now drawn, not photographed: `src/components/ResearchLoop.astro`
  redraws it as one inline SVG on a 1200x760 viewBox, so it scales to whatever
  column it sits in and stays sharp at any size. The whole page is 24KB, where
  the raster alone was 192KB. Its six icons are Phosphor through `astro-icon`,
  like the rest of the site, and its six hues are new `--area-*` tokens in
  `global.css` under a "figure palette" heading: they are for figures that have
  to tell six things apart, not for page chrome.
  `public/assets/what-is-aims.{jpg,webp}` are now unreferenced.
- SEAM gets the demo recording as its cover video, in the same two cuts
  (`seam-demo.{webm,mp4}` at 1600x900, `seam-demo-thumb.*` at 640x360). The
  source is 1920x1428, so it is padded to 16:9 with its own background,
  `#ECEAE6`, rather than cropped: cropping a 1.34 ratio capture to 16:9 would
  cut a quarter of the walkthrough off. `seam.webp` stays as the poster frame.
- The homepage three are now Same Ranking, Different Winner, SEAM, and 4D
  Gaussian Streaming. SEAM takes `featured: 2` since it is the project with a
  live demo, Gaussian Streaming moves to 3, and Outcome Monitors to 4. Fixed
  RAG Compression loses its `featured` value. All four keep their cards on
  /projects; `featured` only decides the homepage.
- The cover video keeps the browser's native control bar. Theming it would
  need client-side JavaScript, which the Astro pages do not allow.
