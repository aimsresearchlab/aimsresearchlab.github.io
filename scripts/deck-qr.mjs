#!/usr/bin/env node
// The QR codes the deck shows: one for the site, one per project page, and one
// per published paper so the papers sheet can be scanned instead of typed out.
// Regenerate after adding a project or a paper, or changing the domain:
//   node scripts/deck-qr.mjs
// Transparent background on purpose: the sheet draws the white card behind it,
// so one file serves the light and the dark sheets.
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { publications } from '../src/data/publications.ts';
import { qrFile } from '../src/data/qr.ts';

const SITE = process.env.DECK_QR_SITE ?? 'https://aimsresearchlab.com';
const OUT = 'public/slides';
const SRC = 'src/content/projects';

const write = async (url, file) => {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H', // the AIMS mark sits in the middle
    margin: 1,
    color: { dark: '#0A1B4C', light: '#00000000' },
  });
  fs.writeFileSync(path.join(OUT, file), svg);
  console.log(`${path.join(OUT, file)}: ${url}`);
};

fs.mkdirSync(OUT, { recursive: true });
await write(SITE, 'qr-aimsresearchlab.svg');
for (const f of fs.readdirSync(SRC).filter((n) => n.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, '');
  await write(`${SITE}/projects/${slug}/`, `qr-${slug}.svg`);
}

// The TIAP film has its own code, shown large on the end card so a room can
// scan it off a projector. It lives beside that page rather than under
// public/slides, but it is generated here so every QR on the site comes from
// one place with one set of colours.
fs.mkdirSync('public/tiap', { recursive: true });
{
  const url = `${SITE}/tiap/`;
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: { dark: '#0A1B4C', light: '#00000000' },
  });
  fs.writeFileSync('public/tiap/qr-tiap.svg', svg);
  console.log(`public/tiap/qr-tiap.svg: ${url}`);
}

// A paper that belongs to a project is scanned through the project page, which
// already has a code above. This covers the rest: DOIs, arXiv, the Aquila
// records. A paper with no canonical record yet gets nothing.
for (const url of new Set(publications.map((p) => p.url).filter(Boolean))) {
  await write(url, qrFile(url));
}
