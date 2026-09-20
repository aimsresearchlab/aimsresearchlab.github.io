# The 4D Gaussian Streaming cover stops costing the homepage 14MB

`anchor_policies.mp4` landed as the cover video for 4D Gaussian Streaming
(commits 503dfda and 82a3959). The project is `featured: 3`, so that file was
served to every visitor of `/` and `/projects`, where the card renders about
300px wide, and it is 14.4MB.

- `public/projects/anchor_policies-thumb.mp4` is the card cut: 640x360, 12fps,
  crf 38, 597KB. `Cover.astro` picks it up through the existing `-thumb`
  convention, so the cards now cost 4 percent of what they did. The detail
  page still serves the full file, which is the page where the video is the
  content.
- The source is 960x574, not 16:9, so the thumb is padded to 640x360 with the
  video's own background, `#06090F`, rather than cropped. Same choice as the
  SEAM cover.
- `Cover.astro` now emits only the `<source>` files that exist on disk. It
  always wrote both a webm and an mp4 source, so a project with one format had
  every browser request the missing sibling and take a 404 before falling back.
  `anchor_policies` is mp4 only, so the 404 was live on the homepage.
- No webm for this one. vp9 is bad at this content: the best webm thumb was
  2.7MB against the mp4's 597KB, and browsers take the first source they can
  play, so shipping it would have made things worse. h264 plays everywhere.

The full file is left as it is. It is 36 seconds of dense point cloud and heat
map, which is close to noise, and noise does not compress. A visually lossless
re-encode (crf 20, padded to 1024x576) came out at 18.7MB, larger than the
source; crf 28 reached 8MB but softened the Gaussians. The 14.4MB is what that
quality costs, and it is now paid only on `/projects/gaussian-streaming/`.
