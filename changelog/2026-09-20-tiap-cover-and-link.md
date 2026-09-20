# The TIAP walkthrough is reachable, and its cover shows the finding

`/tiap/` shipped with the site and nothing linked to it. `seam.md` carries a
`demo` link and a prose link to `/seam/`; `same-ranking-different-winner.md`
carried only the cover video, so the page was live, indexed by nobody, and
reachable only by typing the URL.

- That project now has `{ kind: demo, url: '/tiap/' }` and a short
  "Walkthrough" section in the body linking it, matching how SEAM does it.
- It also had `coverVideo` and no `cover:`, so it had no poster frame and no
  reduced-motion fallback, and the deck's spotlight sheet, which renders
  `cover` for this slug, was emitting an `<img>` with no `src`. Both fixed by
  the new still.
- The still is a Playwright capture of the live page at timeline t=36, the beat
  where the same saved outputs give two systems opposite winners, which is the
  project's claim. Captured at 2x (3200x1800) and downsampled to 1600x900 webp
  for sharper text. It replaces the paper's framework figure that sat at that
  path unreferenced; that file is in git history at `8564ade` if it is wanted.
- The cover video is re-recorded from the current page, since the old cut
  predates the page's latest state. Same file names, so nothing else changes:
  1280x720, 27 seconds (was 21), running from the start of rescoring to the
  completed three-stage diagram, which gives the loop a clean end. Every cut
  came out smaller than the one it replaces: 971KB webm and 535KB mp4 for the
  full size (was 1022KB and 816KB), 214KB and 135KB for the 640x360 thumbs.

Corrected in a second pass: the first recording was made at a 1280x720
viewport, and `/tiap/` is a fixed layout that fills whatever viewport it gets,
so the demo window was squeezed and its lower half fell outside the frame. It
is now recorded at 1440x1100 and cropped to the window plus its caption line.
The crop is widened to exactly 16:9 around the window rather than padded, so
the bars at the sides are the page's own background. The poster still is cut
from the same box at 2x, so the two match.

The recipe, including the Playwright trap that eats an afternoon (GSAP methods
return the timeline, so `page.evaluate(() => tl.pause())` hangs while Playwright
tries to serialize a circular object), is in `AGENTS.md` under the demo pages.
