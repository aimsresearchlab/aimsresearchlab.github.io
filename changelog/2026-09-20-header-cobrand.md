# The header back on tokens, and the university band kept

The USM mark sits in its own band above the header on every page. That band
was hardcoded: a `#e8e5df` background, its own `max-width: 1180px`, and a
minified `is:global` block in `Base.astro`. The header under it was hardcoded
too, `background: #fff` and the same `1180px`.

Both are kept as they were visually. What changed is where the values come
from and how the nav reads:

- `--usm-band` (`#E8E5DF`) and `--header-width` (`min(94vw, 78rem)`) are new
  tokens in `global.css`. The band and the header both reference them, so they
  line up with each other and the color is editable from one place.
- The band's style block in `Base.astro` is expanded from one minified line to
  readable rules. The markup is unchanged.
- The topbar's `background: #fff` is `var(--paper)`.
- The header runs wider than the page column on purpose: `--content-wide`
  (64rem) made "What is AIMS?" and "Meet the Team" wrap to two lines. Nav
  labels are also `white-space: nowrap`.
- Nav links lost the box. The current page and hover are now an underline on
  the word itself, brand-colored for the current page. This replaces the
  `--rule` pill from the 2026-09-19 pass, which still read as a button.

An earlier version of this pass moved the USM mark into the header beside the
lab logo as an AIMS x USM lockup and deleted the band. That shipped in
`ea69717` and is reverted here: the band is the university's own chrome and
belongs above ours, not inside it. The lockup still exists on the slide deck's
title sheet, where there is no band.

Nothing to do by hand. `public/assets/usm-horizontal-logo.png` is unreferenced;
the band uses `usm1.png` and the deck uses `usm-logo.svg`.
