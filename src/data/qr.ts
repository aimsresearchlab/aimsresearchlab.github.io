// The naming rule for the deck's QR codes, in its own file with no imports so
// that `scripts/deck-qr.mjs` can import it under plain Node as well as Astro.
// The codes the script writes and the codes the sheets ask for come from this
// one function, so they cannot drift apart.

/** The file name of the QR code for a URL, under public/slides/. */
export const qrFile = (url: string) =>
  'qr-' +
  url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() +
  '.svg';
