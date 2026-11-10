# Publications: format fixes after the 2026-11-08 web edits

The 2026-11-08 edits to `src/data/publications.ts` changed the smoke detection
paper's title to sentence case. The UAV Smoke Detection project page matches
titles character for character, so the paper dropped off that page. The title
is back in the form the project page uses, which is also the Crossref title.

The same entry returned to initials plus surname and to its DOI link. The new
ICT Express survey now links to its DOI and spells K. Abdelfatah and M. Fouda
as Crossref does. It also moved above the 2025 papers, since the list is
newest first.

Added a news item for the Gaussian Splatting paper's acceptance in Pattern
Recognition. Its date, 2026-11-10, is the day the item was added, not the
acceptance date.

Regenerated the deck's QR codes for the new paper.

By hand: the exported `.pptx` files are stale until `npm run deck:pptx` is
rerun.
