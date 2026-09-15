# Lab director title

The faculty entry now reads "Dr. Rabab Abdelfattah" with the line
"AIMS Lab Director" under it, replacing "Principal Investigator".

At 175px the name is the widest on the page and the card is 180px, so there
are 5px of slack. Any longer name will need `.people :global(.person)` widened
again in both `src/pages/index.astro` and `src/pages/people.astro`.
