# Project pages for LAPSE and UAV smoke detection

- New project `/projects/lapse/`. Its cover video is the LAPSE launch video
  (`motion-video/aspect-persistence/build/aspect-persistence.mp4`), copied
  byte for byte as `public/projects/lapse-video.mp4` (1920x1080, 60 fps, with
  sound, 28.8 MB), so the page shows it at full quality. The cards use a
  640x360 cut, `lapse-video-thumb.mp4` (615 KB). The poster frame
  `lapse.webp` is the video's end card.
- The LAPSE preprint (arXiv 2609.36457) is now in `publications.ts`, authors
  copied from the arXiv API, and the two LAPSE write-ups in `writing.ts` point
  at the project.
- New project `/projects/smoke-detection/`, using the cover and demo video
  already uploaded in September (`smoke-detection.webp`,
  `smoke-detection-demo.webm`), and the poster as a PDF plus a webp render in
  a `## Poster` section.
- New link kind `poster` (schema, `linkMeta`, AGENTS.md).
- Deck QR codes regenerated.

Still to do by hand:

- The reel still carries LAPSE as a special case in `src/data/reel.ts`; it
  can now read the project file. The smoke project has no reel poster yet.
- The smoke demo is webm only; older Safari shows the poster image instead.
- Neither project has `featured`, so neither is on the homepage.
