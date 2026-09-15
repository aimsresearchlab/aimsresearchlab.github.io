# Four more undergraduates

Added Rashika Karmacharya, Bishesta Bohara, Shrabya Bhattarai, and Joshua
Johnston to `src/data/people.ts` as undergraduates.

Topic lines were also reworked: they had been job titles ("Research assistant")
rather than fields. Rabab supplied them: Nhoojah Maharjan is "Trustworthy AI",
Muhaiminul Yeamin "NLP", and Sakshyam Sigdel and Shrabya Bhattarai "Applied
computer vision". "Computer
vision applications" was the phrase asked for, but it wrapped to two lines in
the card, so it was shortened per the one-line rule in `CLAUDE.md`.

Rashika Karmacharya, Bishesta Bohara, and Joshua Johnston are "Computer vision",
also from Rabab. Siyan Luo still carries a placeholder line ("PhD student");
replace it with a real field when it is known.

## Alumni

Two Spring 2026 Master's graduates were added from a screenshot Rabab supplied:
Akram Hossain and Murad Hasan. Ticauris Stokes came from the same screenshot but
is a PhD student now, so he sits in the current roster under PhD Students with
no `graduated` field, not in Alumni. Their headshots
were cropped out of that screenshot (192x192 webp, quality 85); they are
readable but low resolution, so replace them if better originals turn up.

The source listed where Hossain and Hasan went next. The `Person` model has no
field for that, so it went in `topic`, abbreviated to "RA at U. of Arkansas"
and "TA at U. of Arkansas" because the full phrasing wrapped to two lines.
Stokes reads "Computer vision". Siyan Luo still carries the "PhD student"
placeholder; replace it when her field is known.

Headshots for Rashika, Bishesta, and Joshua were cropped from a screenshot
Rabab supplied (192x192 webp, quality 85). They are readable but low
resolution, since the source was a screen capture rather than the original
files; replace them if the originals turn up. Nhoojah's existing photo was
kept, on Rabab's instruction, rather than taking the newer one from the same
screenshot. Shrabya Bhattarai's came from a full-resolution 800x800 original, so
it is the sharpest of the batch.

Siyan Luo's photo carries a heavy red cast: raw pixels read (211,66,71) on the
cheek against a clean (255,255,255) background and (13,8,10) hair, so only the
midtones lost their green and blue. Rabab said to ship it as it is. Do not try
to fix it with a per-channel gamma; that restores the skin but turns her hair
green, because it amplifies noise in the near-zero darks. Replace the file if a
clean copy turns up. It was flattened onto white (the source PNG has alpha) and
cropped like the rest.

The screenshot labelled Joshua "Honor Student", not a research field. His topic
line reads "Computer vision" because that is what Rabab said afterwards.

Links: only Rashika has one, a LinkedIn profile that two independent sources
agree on (the profile headline reads "CS @ USM", and a 2024 USM news release
names her as a computer science major on the robotics team). The other three
could not be pinned down. A `Shrabya35` GitHub account and a
`bishesta-bohara-85aa78209` LinkedIn profile both turned up in search but
neither states a USM affiliation, so neither was used. Nothing plausible was
found for Joshua Johnston. Ask them for their own links rather than guessing.

"Rashika Karmacharya" renders 176px wide at the card's bold body font, which
overflowed the 168px (10.5rem) card and left that one card wider than its
neighbours. Per the rule in `CLAUDE.md`, the card was widened rather than
letting the name wrap: `.people :global(.person)` is now `11.25rem` (180px) in
both `src/pages/index.astro` and `src/pages/people.astro`. Measured in the
built site: all 12 cards are 180px, and the longest name fits.
