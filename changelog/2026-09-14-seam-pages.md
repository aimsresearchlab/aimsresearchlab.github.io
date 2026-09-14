# 2026-09-14: SEAM-Bench demo and leaderboard at /seam/

Two hand-written static pages that deploy with the site: `index.html`, a
walkthrough of one benchmark case, and `leaderboard.html`, which ranks 20
models and expands each row into that model's real outputs.

They are the documented exception to the no-JavaScript rule. Everything else
in `CLAUDE.md` still applies to them, em dashes and design tokens included.

The walkthrough measures its cursor targets from the DOM and rebuilds the
timeline on resize, so it reflows on a phone instead of scaling to nothing.
Keep that property: a fixed-size canvas scaled by transform is exactly what
this avoids. `window.__tl` is the timeline, and `tl.pause()`,
`tl.seek(t, false)` and `tl.play()` are how to inspect a beat or capture a
still; step forward in small increments, because captions and typed text come
from callbacks and one long jump lands mid-write.

Numbers come from the benchmark's `results/statistics.json`. Regenerate and
re-embed them, never retype.

The SEAM project card on the homepage links to the demo, which is what the
`demo` link kind is for.
