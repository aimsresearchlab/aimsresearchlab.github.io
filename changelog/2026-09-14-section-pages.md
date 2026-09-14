# 2026-09-14: a page per section, projects as content, link previews

## Every homepage section has a real page

Projects, People, and News each got a route, matching what /publications
already did, and the header nav points at those pages instead of homepage
anchors. The homepage sections keep their `#projects`, `#people`, and `#news`
anchors, so existing links still land in the right place, and each section
gained a link to its full page.

The homepage shows three projects, the roster, five news items, and three
recent publications. Everything else lives one click away.

## Projects are markdown, not a TypeScript array

`src/data/projects.ts` was a list of cards. It is now a content collection:
one markdown file per line of work under `src/content/projects/`, with the
filename as the slug and the URL. Frontmatter is validated by
`src/content.config.ts`, so a bad field fails the build instead of rendering a
broken card. `src/data/projects.ts` survives as helpers over the collection
and the link icon table.

Each project now has a page: a 16:9 cover, the claim, tags and links, prose,
and the papers it produced, matched to `publications.ts` by exact title.

Covers are optional. Until an image exists, the card and the page render a
placeholder at the same aspect ratio, so dropping in a real cover later moves
nothing on the page.

## Publications say when they are clickable

A linked publication entry now ends with a small `[LINK]` cue. The whole
entry was already a link, but nothing on the page said so. Entries without a
URL show nothing.

## Alumni

A person with `graduated` set (`"Spring 2026"`) leaves the current roster and
appears in an Alumni section at the foot of /people, grouped by category and
term, most recent term first. The entry stays in the array: nobody has to be
deleted to be marked as finished.

## The SEAM pages had no link previews

Both pages carried a charset tag and a viewport tag and nothing else, so
pasting either link anywhere produced a bare card with no image and no
description. Both now have canonical, description, Open Graph, and Twitter
tags, plus a 1200x630 preview captured from the page itself: the leaderboard
shows the actual table, the walkthrough shows a comment absorbed into the
artifact the model returned.

## Still to do

- Re-scrape both SEAM URLs at the Facebook and LinkedIn debug tools. They
  cache previews for weeks, so anywhere the links were already shared keeps
  showing the old blank card until then.
- The two Master's students who graduated in Spring 2026 are not listed. The
  source deck has their photos but no names, so the Alumni section renders
  empty. There is a commented template at the end of `people.ts`.
- Project covers. No project has a real one yet.
- The prose on the project pages is placeholder text derived from each card's
  one-line claim. It states nothing the claim did not, but it needs a pass
  from someone who did the work.
- A layout bug visible in the leaderboard preview image: at 1200px wide, the
  Mistral-Small-3.2-24B row runs its family label under the bar. Left alone
  deliberately; it is not noticeable at preview size.
