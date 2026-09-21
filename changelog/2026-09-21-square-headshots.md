# People page roster as photo cards

The roster on /people showed every student as a small circular headshot
(`border-radius: 50%` on `.avatar` in `Person.astro`). The lab wanted large
rectangular photos in cards instead, the layout the earlier hand-written
people page used.

- `people.astro` renders each current student and alum as a card: 4:3 photo,
  gold role kicker (PhD Researcher, Undergraduate Researcher, Master's
  Researcher), name, topic, and the same text link pills as the director's
  card. Three cards per row, two below 60rem, one below 40rem.
- Each category has a large section heading with a count ("3 PhD students",
  "9 students"), matching the Leadership heading.
- `Person.astro` is now only the homepage roster. Its photos are 96px squares
  instead of circles.
- Headshot files are still 192x192. The cards draw them at about 360px wide,
  so they are soft; re-cropping from larger sources would sharpen them.
