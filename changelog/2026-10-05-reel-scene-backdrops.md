# Reel scenes: photo backdrops, the AIMS mark, real logos and figures, new order

The reel's scenes were navy with text and bars, and had no lab mark. Each now
carries the AIMS mark top right, as the posters do, and a photo of the
paper's own running example behind it, under a navy gradient that keeps the
title and numbers on near solid colour.

- Photos from Pexels, one per scene: night stadium (Same Ranking, Different
  Winner), hands on a laptop (SEAM), bookshelves (Fixed RAG Compression), a
  warehouse aisle (Outcome Monitors), a night car dashboard (LAPSE), an
  aerial pylon (Thin-Object Segmentation). 4D Gaussian Streaming keeps only
  its own capture frames. The people scene sits over the lab's own
  `room.webp`. Files are `public/reel/bg-<slug>.webp`, 1920x1080, about 40
  to 260 KB each; credits are in `src/data/reel.ts` and in each scene footer.
- A pastel medals photo was tried for Same Ranking and dropped: a bright
  photo lifts the frame and the grey chips lose contrast.
- The people scene leaves out collaborators (Ashim Dahal, Rashika
  Karmacharya), who are advised in another lab. The site's /people page is
  unchanged.
- Fixed RAG Compression: the 20 robot icons are now the 20 readers' family
  logos on light tiles, weakest baseline first, copied from Table 4 of
  arXiv 2606.21807 (`ragReaders` in `src/data/reel.ts`). Logos are in
  `public/reel/icons/`; five (Cohere, Zhipu, Microsoft, Grok, ByteDance) are
  new from @lobehub/icons, the rest are copies of the SEAM demo's.
- Same Ranking, Different Winner: the paper's Figure 1 fades in where the
  query was, once the query leaves. Without script the query is hidden, so
  the frame matches the scene's end state. The figure text contains one em
  dash (inside a quoted user turn); it is the paper's own raster.
- Poster order alternates language and vision work: Same Ranking, 4D Gaussian
  Streaming, SEAM, Outcome Monitors, Thin-Object Segmentation, Fixed RAG
  Compression, LAPSE. The camera route and wall spots are unchanged; only the
  slug at each spot moved. Scene sections in `reel.astro` follow the same
  order for the no-script page.
