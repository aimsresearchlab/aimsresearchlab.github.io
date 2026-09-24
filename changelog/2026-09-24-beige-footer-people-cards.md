# Beige page, logo footer, and a sharper people page

A round of visual changes asked for while reviewing the site in the browser.

- The page background (`--paper`) is now the beige `#E8E5DF` the USM band
  used, instead of off-white `#FAFAF8`. The header and every `--paper` fill
  follow it.
- The USM band above the header is gone, along with `--usm-band`. USM's logo
  moved to the footer, next to a trimmed copy of the AIMS logo
  (`public/assets/aims-lab-logo-trim.png`; the header keeps the padded
  original). `usm1.png` was trimmed of its transparent margin.
- The footer is beige with a thin charcoal rule on top so it reads as a
  footer. Logos on the left; the director's email and the GitHub org on the
  right, one per line. The copyright and address lines were removed.
- Homepage: the charcoal band with the gold rule now runs full bleed behind
  the top 60% of the lab photo, which sits in an even beige frame with a
  shadow. The news feed is a gold panel with dividers, like the culture card
  on /people. The People roster is 15% larger (110px photos).
- Nav links are 25% larger. They now move to their own row below 1080px
  instead of 900px, because at the new size they overflow beside the logo
  below about 1040px.
- /people: the source photos are all 192x192 and no larger originals exist,
  so the cards were stretching them to about 326px and they looked soft.
  Cards now show the photo at 128px beside the name, two per row, on a warm
  off-white `--surface` instead of white, with a `--line` border that shows
  on beige. Section titles are smaller (36px) with a blue bar, card text is
  larger, the per-card role kicker is gone, and alumni are a compact list.
  The director's portrait is a 192px square and her name stays on one line.
- Ticauris Stokes moved to alumni (PhD, Spring 2026). Olanrewaju Muili has a
  new headshot. The "Lab website launched" news item was removed.

Still to do:

- On /people, the director's one-line name overflows its card at about
  961 to 1024px and 641 to 704px wide, and some card names overflow at about
  705px, where two cards per row are too narrow.
- At 320px wide a homepage project card is 3px wider than the screen. This
  predates these changes.
- Ticauris Stokes's alumni line still reads "Computer vision"; the other
  alumni show where they went.
