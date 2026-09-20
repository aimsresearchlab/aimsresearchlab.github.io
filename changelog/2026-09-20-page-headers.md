# The charcoal band opens every page below the homepage

`/projects` had a full-bleed charcoal header with a gold rule; the other
routes opened with a bare `<h1>` on the page background, so the site changed
character depending on where you landed.

- `src/components/PageHeader.astro` is that band, extracted from
  `projects/index.astro` verbatim. It takes a `title` and renders whatever is
  in its slot under it, normally a `<p class="lede">`.
- `width` picks the inner column so the title lines up with what follows:
  `wide` (`--content-wide`) on `/projects` and `/people`, which open with a
  grid, `prose` (`--content-width`) on `/news`, `/publications`, and
  `/what-is-aims`, which open with text.
- `/news` and `/publications` had no lede at all and now carry one line each.

The homepage keeps its banner and hero: the band is for the pages under it.
Project detail pages (`/projects/<slug>`) are also left alone, since they open
with the cover image and carry the title under it.

Follow-up, not touched here: `/projects` passes `description="..."` to `Base`,
so its meta description and Open Graph description are literally three dots.
It needs a real sentence under 160 characters.
