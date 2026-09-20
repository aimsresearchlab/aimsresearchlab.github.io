# AIMS x USM in one header, and the header back on tokens

The USM mark had been sitting in its own band above the header: a full-width
strip with a hardcoded `#e8e5df` background, its own `max-width: 1180px`, and
a minified `is:global` style block in `Base.astro`. It read as a second site
chrome stacked on ours, and none of it went through the design tokens.

What changed:

- `Header.astro` carries both marks side by side, AIMS x USM: the lab logo, a
  muted multiplication sign, then `/usm-logo.svg` linking to usm.edu. Same
  lockup the title sheet of the slide deck already used. The USM mark is 52px
  tall against the lab logo's 70px, 36px against 49px on phones.
- The `.usm-bar` div and its style block are gone from `Base.astro`.
- The topbar's `background: #fff` is `var(--paper)`, and its `max-width:
  1180px` is a new `--header-width` token, `min(94vw, 78rem)`. The header is
  meant to run wider than the page columns so the nav clears the wider lockup
  on one line; `--content-wide` (64rem) was too narrow for that and made
  "What is AIMS?" and "Meet the Team" wrap.
- Nav links lost the box: the current page and hover are now an underline on
  the word itself, brand-colored for the current page, and the labels are
  `white-space: nowrap`. This replaces the `--rule` pill from the 2026-09-19
  pass, which still read as a button.

Nothing to do by hand. `public/assets/usm1.png` and
`public/assets/usm-horizontal-logo.png` are now unreferenced; the vector
`public/usm-logo.svg` serves both the site header and the deck.
