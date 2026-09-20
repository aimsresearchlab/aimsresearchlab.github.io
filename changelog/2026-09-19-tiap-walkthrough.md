# TIAP walkthrough at /tiap

A GSAP walkthrough for the EMNLP 2026 Findings paper "Same Ranking, Different
Winner", served at `/tiap/` alongside the SEAM pages and built the same way:
hand-written static HTML under `public/`, outside the Astro pipeline, which is
the documented exception to the no-client-JS rule. Every other house rule still
applies to it.

## What it shows

Five scenes in one continuous film, cross-fading inside a single 16:9 frame,
with the act named in the title bar:

1. **Problem.** One source turn fans out into the raw turn, a fact, a summary
   and an event. All four sit in the same index; only some may earn credit.
2. **Three ways.** The audit console, on one real query: Raw, then Source, then
   Canonical, each clicked in turn, then the trouble with all three.
3. **Method.** The paper's framework figure rebuilt as a live scene, Stage I to
   Stage II to Stage III, in the figure's own three tints.
4. **At scale.** The same audit over two whole runs, showing that the one query
   was not a fluke and that the targets do not even cover the same queries.
5. **Release.** The end card.

Scene 2 is the heart of it. The exemplar is LongMemEval-S query 380, "How many
issues of National Geographic have I finished reading?", answer "Five". It was
picked because the whole argument lands on that single query without needing a
second example:

- **Raw scores 0.000.** The original source turn is nowhere in the top 60, so
  the strictest target credits nothing.
- **Source and Canonical both credit rank 13**, the same row, for 0.210 and
  0.275. The ranking never moves; only the eligible set changes, and with it
  the ideal ranking the score is normalised against.
- **The winner flips.** all-MiniLM beats BGE-M3 by 0.069 under Source; BGE-M3
  beats all-MiniLM by 0.026 under Canonical, on identical saved outputs.
- **The credit is indefensible.** The credited memory is about newspapers, and
  all five judge models label it `does_not_support`.

The film also stops on rank 1, which states the answer outright and earns
nothing under any of the three targets because it is not in the query's
eligible set. That is a property of the lineage contract rather than of the
target choice, and the page says only what the artifacts show: the row is
there, it is not eligible, no target reaches it. We did not chase down why it
is excluded, and the page does not speculate.

## Where the numbers come from

`scripts/sync-tiap-data.py` reads the paper repo and writes
`public/tiap/data/tiap-case.json`. It pulls the ranked traces from
`MTEL-Mem/artifacts/runs/longmemeval/<run>/trace.jsonl.gz`, the per-run
aggregates from each run's `target_rescore.json`, the per-target scores from
`data/all_audit_cases.csv`, and the judge labels from the five
`data/full_audit_*/judged_cases.csv` files.

Run with `--check` it enforces two things: every number inside the
`DATA:BEGIN`/`DATA:END` block traces back to that JSON, and the 23 figures
written by hand into the scene markup still equal the artifact values they
claim to report. It also refuses to run if the chosen pair stops flipping,
which would mean the exemplar no longer demonstrates the claim. The page
therefore cannot quietly drift from the results.

Three things a successor should know:

- The run count on the release card is **16**, counted from the artifact tree.
  The upstream MTEL-Mem README's prose says 8 native runs and an f1/f5/f8
  density sweep, but the bundle ships 7 native runs and f1/f8 only. The JSON
  records the per-family listing under `bundle`, so the count is checkable
  rather than asserted. Worth reconciling in the paper repo's README.
- The short trace in the method scene (m7 0.73, m3 0.62, m9 0.21) is the
  framework figure's own illustration, not a row of any saved run. The
  provenance check flagged it the first time, which is how it got caught. The
  page carries no footnotes (it is deliberately one clean screen), so that
  distinction lives here and in `figure.illustrative_trace` in the JSON. If the
  method scene ever grows a caption, say it there.

- The page quotes the paper's published audit figures (29.2 / 39.6 / 31.2 over
  n=1876). Recomputing the majority vote from the five judge files here gives
  29.1 / 39.7 / 31.1 over n=1891. The 15-case gap is in which cases qualify for
  a majority, not in the labels. Both numbers are recorded in the JSON under
  `audit.published` and `audit.recomputed`.
- There is no saved trace for the LongMemEval mxbai run in the paper repo, so
  that system is quoted from its audit rows only. The sync script tolerates a
  missing trace for the contrast system but fails loudly if the trace for the
  system whose ranking is drawn goes missing.

## Icons and the QR code

The five judge chips use the vendor marks already in the repo, copied from
`public/seam/icons/` into `public/tiap/icons/`: `claude-color.svg` (both
Sonnet 4 and Opus 4.7), `gemini-color.svg`, `openai.svg` and
`deepseek-color.svg`. The end card's two links use `simple-icons:arxiv` and
`simple-icons:github`, fetched from Iconify the same way `figures/get-icon.sh`
does and inlined so they take the link colour. Same convention as the SEAM
leaderboard. Do not substitute an icon font or a raster mark.

The end card's QR points at `https://aimsresearchlab.com/tiap/` and is
generated by `scripts/deck-qr.mjs` into `public/tiap/qr-tiap.svg`, so every QR
on the site comes from one generator with one set of colours (navy on
transparent, error correction H). Rerun `node scripts/deck-qr.mjs` after a
domain change.

## Navigating the film

The scene chips in the title bar are buttons: clicking one jumps to that
scene and resumes. Because captions and row states are written by GSAP
callbacks, a plain backwards seek would strand the previous scene's text on
screen, so `goTo()` rewinds to zero and steps forward before playing. Keep
that if you add scenes.

## Recording

The frame is locked to 16:9 above 880px so a screen capture needs no cropping,
and the type is sized to survive that capture. Below 880px the aspect lock is
released and the columns stack, so the film still reflows on a phone. Nothing
is transform-scaled: cursor targets are still measured from the live DOM and
the timeline is rebuilt on resize, the same property the SEAM walkthrough has.

`window.__tl` is the timeline, about 67 seconds long. `tl.pause()`,
`tl.seek(t, false)` and `tl.play()` work as they do on the SEAM page; the
labels are `problem`, `ways`, `raw`, `source`, `canon`, `answer`, `flip`,
`judge`, `method`, `scale` and `outro`.

Seek forward in small steps. Captions and row states come from callbacks, so
seeking backwards leaves stale text on screen: jump to 0 and step forward to
inspect a beat.

## Still to do by hand

- `public/tiap/og-tiap.jpg` does not exist yet. The meta tags already point at
  it, so social previews will 404 until someone composes it, 1200x630 jpg, the
  same treatment as `og-seam.jpg`.
- The project page for this work still links only to arXiv and GitHub. It
  should get a `demo` link to `/tiap/` once the page is live.
