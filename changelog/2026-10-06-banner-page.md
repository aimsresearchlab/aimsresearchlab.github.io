# /banner: a full-screen title slide for group photos

A projector slide for the screen behind a group photo, in the shape of an
event title slide: the full AIMS Lab logo on a paper panel with "The
University of Southern Mississippi" spaced under it, a gold rule, and a navy
band with the website's QR code (`public/slides/qr-aimsresearchlab.svg`,
made by `npm run deck:qr`) beside the lab name, room and address.

- `src/pages/banner.astro` and `src/styles/banner.css`. No script: the slide
  is a 16:9 frame letterboxed in the window, sized in container units, so it
  fills a projector at any resolution. Press F11 (or the browser's full-screen
  key) when presenting.
- The logo is a copy of `full/logo.svg` at `public/aims-logo-full.svg`.
- noindex, and filtered out of the sitemap in `astro.config.mjs`.
- The QR code stands in for an event line ("Welcome", an orientation title)
  for now; swap it per event.
