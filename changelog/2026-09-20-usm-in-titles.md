# Every title ends in USM

A lab is searched for along with its university ("usm ai lab", "southern miss
machine learning"), and only the homepage title said USM. The inner pages said
"Projects AIMS Lab" and stopped there.

- `Base.astro` appends "USM" to the `<title>`, the `og:title`, and the Twitter
  title unless the text already says USM or Southern Miss. Pages keep passing
  their own name, so a new page cannot forget the suffix, and the homepage,
  which already ended in USM, is untouched.
- The three hand-written pages under `public/` are outside the layout, so
  `/seam/`, `/seam/leaderboard.html`, and `/tiap/` carry it in their own
  `<title>` and `og:title`. Those are the pages most likely to be linked from a
  paper, so the attribution matters most there.
- The deck page said "AIMS Lab overview deck AIMS Lab". It is "Overview deck"
  now, and the layout adds the rest.

Worth being honest about the limit: a keyword in a title inherits no authority
from the university. It helps a page match a query that names USM, and that is
all. The thing that would actually move rankings is a link from a `usm.edu`
page (the CSCE department listing, the faculty profile) to aimsresearchlab.com.
The JSON-LD in `Base.astro` already names USM as `parentOrganization`, which is
the machine readable half of the same claim, and it has been there since launch.
