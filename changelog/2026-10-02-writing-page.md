# Writing page for members' write-ups

Lab members publish plain-language posts about the lab's papers on their own
sites, and nothing on this site linked to them. A link from the lab site helps
readers find the write-up and helps search engines connect the post to the
lab and the paper.

- New route `/writing`, fed by `src/data/writing.ts`: each entry links out to
  the post on the member's site. Not added to the nav (the six links already
  fill one line); linked from the `/publications` lede and a small line
  under the homepage Recent list instead.
- Project pages show a "Write-ups" section for entries whose `project` matches
  the slug (SEAM, Outcome Monitors, Fixed RAG Compression, Same Ranking,
  Different Winner).
- New `src/components/WriteUp.astro`, styled like a publication row.
- Seeded with seven of Sugam Panthi's posts on spanthi.com. The two LAPSE
  posts have no project link because LAPSE has no project page yet.
- News: added the LAPSE preprint (arXiv:2609.36457, posted 2026-09-29).
- IndexNow: key file at the site root and `scripts/indexnow.py`, which sends
  every sitemap URL to Bing and the other IndexNow engines. Run it after a
  deploy that adds pages. Google is separate: the site is not in Search
  Console yet, so the director would need to verify it there.
