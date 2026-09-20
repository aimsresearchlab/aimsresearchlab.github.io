# Overview deck: images on the work sheet, QR codes on the papers sheet

The second sheet of the overview deck was five identical icon bars stacked in
the right half of the canvas, with the bottom of the frame empty. It read as a
list, not as a slide.

## What changed

- `src/components/deck/WorkSheet.astro` is now a header band (kicker, title,
  question on the left, the three numbers on the right) over a row of five
  cards, one per line of work. Each card is an image, a brand-blue icon badge
  overlapping its lower-left corner, the area title and the one-line
  description. The cards stretch to equal height and the row fills the frame.
- `src/data/deck.ts`: `Area` gained an `image` field pointing at the card
  image. The Phosphor `icon` stays; it is the badge on the photo now.
- `src/styles/deck.css`: `.work-grid` is gone, replaced by `.work-head` and a
  five-column `.work-list`. `.area-icon` moved from a 52px circle in the bar to
  a 40px absolutely positioned badge on the image.
- The standfirst on that sheet, "One question underneath: can a system
  perceive, act, and be measured honestly?", is gone. It read as a thesis over
  all five lines of work and was only true of some of them. Nothing replaces it:
  any substitute would be another invented claim, and the cards say what each
  line is. `.work-question` went with it.
- `src/components/deck/Lockup.astro` gained a `bare` prop that drops the mark,
  and the title sheet uses it. The mark was appearing twice within a few inches
  of each other there, once in the AIMS x USM cobrand row and again in the
  lockup below it. The cobrand row keeps its copy, since that one also carries
  the university. `NewsSheet` still gets the mark.

## Order, QR codes, contact icons

- `spotlightSlugs` in `src/data/deck.ts` puts 4D Gaussian Streaming second, so
  the deck runs SEAM, Gaussian, Same Ranking. The homepage `featured:` order is
  a separate list and is unchanged.
- The papers sheet printed the address under each paper as text. Nobody in a
  room types a DOI off a slide, so each paper now carries a QR instead.
  `paperDestination` returns `{ text, qr }`; the text survives as the code's
  alt text. A paper with no canonical record yet (in press, no preprint) still
  gets nothing rather than a code back to the list it is already on, which is
  why the Gaussian Splatting survey shows no code.
- `scripts/deck-qr.mjs` now also writes one code per publication URL, using the
  npm `qrcode` library it already used for the site and project codes. Papers
  that belong to a project reuse that project's existing code.
- The naming rule for those files moved to `src/data/qr.ts`, a module with no
  imports, so the generator script and the Astro sheets derive file names from
  one function. It has to stay import-free: `scripts/deck-qr.mjs` loads it
  under plain Node, which cannot resolve the extensionless imports that the
  rest of `src/data/` uses.
- `Sheet.astro` carries the mark and the AIMS wordmark in the top right corner,
  so a sheet cannot forget them. They are on by default; the title and closing
  sheets brand themselves already and pass `mark={false}`. That puts the corner
  on sheets two through nine. Both the navy and the light variant of the mark
  are in the markup and CSS picks one, the same way `Lockup` does, so the
  corner stays themable without script.
- The contact block on the closing sheet gained icons: `ph:globe-simple`,
  `simple-icons:github` for the brand mark, and `ph:map-pin`.
- The title sheet footer uses the same icons, and gained the GitHub org, which
  it did not carry before. The director line takes `ph:user`, since there is no
  brand mark for a person. The footer is one flex row of `white-space: nowrap`
  items at 18px: four items at the old 20px wrapped to a second line and pushed
  the rule up through the research-area pills. Anything added to it has to be
  checked at 1280px wide or it will wrap again. The `.dot` separator went with
  the change and has no users left.

- The "Also running" sheet was three short cards floating in the middle of an
  empty frame, because `.card-grid` was `align-content: center`. The grid
  stretches now, and the card carries what these projects actually have:
  the tags, the title, the claim, the paper behind it, the link pills, and a QR
  for the project page, the same vocabulary the spotlight sheets use. The foot
  pins to the bottom with `margin-top: auto`, so uneven claims still line up.
  The card leads with the project cover as a band; a project with no cover
  simply has no band. The "Also running" heading is gone: the kicker labels the
  sheet on its own and the height it freed went to the covers and the codes.
- Outcome Monitors and Thin-Object Segmentation had no cover and no figure
  anywhere in `figures/`, so they got one. These two are generated photographs,
  not method figures, and that distinction is the point: a generated diagram
  would assert an architecture the papers do not have, while a photograph of a
  thin branching structure or of one quietly cracked tile among many is an
  illustration and reads as one. Do not replace them with anything that looks
  like a pipeline. If the real figures turn up, they win.
  Sources are in `changelog/` history only; the crops came from a 3.6:1
  panorama, so each cover keeps a little over half the original width.
- The card metrics are tight by design: the four-line paper title on
  Thin-Object Segmentation is the tallest card content on the sheet and sets
  the budget. A longer claim or a fifth line will push the QR off the bottom
  edge. Check this sheet at 1280px after editing any of the three projects.

## The images

`public/slides/areas/*.webp`, 640x400, quality 82. Sources are CC0 or public
domain photographs found through the Openverse API (stocksnap.io,
pd.w.org), so nothing here carries an attribution requirement. The subjects
are concrete instruments rather than AI stock imagery: a camera lens, typewriter
keys, a mixing console, an instrument panel of dials, hands writing beside a
laptop.

The two project covers under `public/projects/` go through the same duotone at
1600x900, the project-cover size. The Outcome Monitors tiles needed
`-level 22%,96%` rather than the usual `5%,95%`: the source is almost all
highlight, and at the default the crack in the one broken tile disappeared at
card size.

Each one is flattened to greyscale and mapped to a duotone between `#0A1B4D`
and `#E9EEFC` with ImageMagick:

```
magick in.jpg -auto-orient -resize 640x400^ -gravity center -extent 640x400 \
  -colorspace Gray -level 5%,95% +level-colors '#0A1B4D,#E9EEFC' \
  -quality 82 public/slides/areas/<slug>.webp
```

The duotone is what makes five photographs from five different sources read as
one set, and it keeps them legible on both the white sheet and the navy one.
Any replacement image should go through the same command.

## Still to do by hand

Nothing. Both `.pptx` files under `public/slides/` were regenerated after every
change above: 10 slides, 148 text boxes, 72 pictures, against 133 and 38
before. The area images, the paper QR codes, the corner lockups and the
contact icons are the gain; the removed standfirst, the removed duplicate mark
and the four printed addresses are the losses.

Note for whoever runs the export next: `npm run deck:pptx` expects a server at
`http://127.0.0.1:4321` and silently writes an empty deck if nothing answers
there. Point it somewhere else with `DECK_BASE`.
