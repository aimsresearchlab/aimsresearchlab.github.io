#!/usr/bin/env node
// Convert the lab overview deck at /slides/aims-lab/ into an editable .pptx.
//
// The deck copy lives in Astro markup, not in a data file, so rather than
// re-author every slide this renders the page headlessly and walks each
// .slide-canvas: every leaf block of text becomes a native text box (with
// per-run font, size, weight, colour), every element with a visible background
// or border becomes a rectangle, and every <svg> / <img> becomes a picture.
// Coordinates map from the 1280 x 720 design canvas onto a 13.333 x 7.5 in
// slide, so the deck matches the page.
//
// Ported from scripts/poster-pptx.mjs on spanthi.com, which does the same for
// the printed posters.
//
// Editable: all text, layout, colours. Figures and photos are pictures; edit
// the Astro source and re-run to regenerate them.
//
// Usage:
//   node scripts/deck-pptx.mjs                (both themes)
//   node scripts/deck-pptx.mjs light          (one theme)
//   env: DECK_BASE=http://127.0.0.1:4321  OUT_DIR=public/slides  FIGURE_DPI=200
import { chromium } from 'playwright';
import pptxgen from 'pptxgenjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.DECK_BASE ?? 'http://127.0.0.1:4321';
const OUT = process.env.OUT_DIR ?? 'public/slides';
const FIGURE_DPI = Number(process.env.FIGURE_DPI ?? 200);
const SHEET_W_IN = 13.333;
const SHEET_H_IN = 7.5;
const PATH = '/slides/aims-lab/';
const TITLE = 'AIMS Lab overview';
const AUTHOR = 'AIMS Lab, University of Southern Mississippi';

const themes = process.argv.slice(2).length ? process.argv.slice(2) : ['light', 'dark'];

// Runs in the page. Returns shapes, images (with element handles by index) and
// text blocks, all in canvas-relative CSS px at natural (unscaled) size.
const extract = (idx) => {
  const canvas = document.querySelectorAll('.slide-canvas')[idx];
  const cr = canvas.getBoundingClientRect();
  const scale = cr.width / (parseFloat(getComputedStyle(canvas).width)); // transform scale
  const rel = (r) => ({
    x: (r.left - cr.left) / scale,
    y: (r.top - cr.top) / scale,
    w: r.width / scale,
    h: r.height / scale,
  });
  const rgb = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(/[\s,\/]+/).map(Number);
    if (a === 0) return null;
    const hex = (n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
    return { hex: hex(r) + hex(g) + hex(b), alpha: a };
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const INLINE = new Set(['inline', 'inline-block', 'contents']);
  const isFigure = (el) => el.tagName === 'svg' || el.tagName === 'IMG';

  const shapes = [];
  const images = [];
  const texts = [];
  let imgIndex = 0;
  const figureEls = [];

  // A figure is placed as a picture. A fully rounded avatar is marked so the
  // slide crops it to a circle instead of showing the square source image.
  const addFigure = (el) => {
    const r = el.getBoundingClientRect();
    const rad = getComputedStyle(el).borderTopLeftRadius;
    const round = rad.endsWith('%')
      ? parseFloat(rad) >= 50
      : parseFloat(rad) >= Math.min(r.width, r.height) / 2 - 1;
    figureEls.push(el);
    images.push({ ...rel(r), idx: imgIndex++, round });
  };

  // Emit one text box from a run of sibling nodes (text nodes and inline
  // elements) that share a containing block `el`.
  const emitText = (el, nodes) => {
    const cs = getComputedStyle(el);
    const runs = [];
    let lineTop = null;
    const collect = (node, style) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) {
          const raw = n.textContent;
          if (!raw.trim()) { if (runs.length && !/\s$/.test(runs[runs.length - 1].text) && /\s/.test(raw)) runs[runs.length - 1].text += ' '; continue; }
          // words split after hyphens too, since Chrome may break there
          const re = /[^\s-]+-*|-+|\s+/g; let m;
          while ((m = re.exec(raw))) {
            if (/^\s+$/.test(m[0])) { if (runs.length && !/\s$/.test(runs[runs.length - 1].text) && runs[runs.length - 1].text !== '\n') runs[runs.length - 1].text += ' '; continue; }
            const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            const rect = rg.getClientRects()[0] ?? rg.getBoundingClientRect();
            if (lineTop !== null && rect.top > lineTop + rect.height * 0.5) {
              if (runs.length && /\s$/.test(runs[runs.length - 1].text)) runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '');
              runs.push({ text: '\n', ...style });
            }
            if (lineTop === null || rect.top > lineTop + rect.height * 0.5) lineTop = rect.top;
            const last = runs[runs.length - 1];
            if (last && last.text !== '\n' && last.size === style.size && last.weight === style.weight && last.italic === style.italic && last.color === style.color && last.font === style.font && last.upper === style.upper) last.text += m[0];
            else runs.push({ text: m[0], ...style });
          }
        } else if (n.nodeType === 1) {
          if (isFigure(n)) { if (visible(n)) addFigure(n); continue; }
          if (n.tagName === 'BR') { runs.push({ text: '\n', ...style }); continue; }
          if (!visible(n)) continue;
          const st = getComputedStyle(n);
          collect(n, styleOf(st));
        }
      }
    };
    const styleOf = (st) => ({
      font: st.fontFamily, size: parseFloat(st.fontSize), weight: Number(st.fontWeight),
      italic: st.fontStyle === 'italic', color: rgb(st.color)?.hex ?? '000000',
      upper: st.textTransform === 'uppercase', spacing: parseFloat(st.letterSpacing) || 0,
      mono: /mono/i.test(st.fontFamily),
    });
    collect({ childNodes: nodes }, styleOf(cs));
    if (!runs.length) return;
    const range = document.createRange(); range.setStartBefore(nodes[0]); range.setEndAfter(nodes[nodes.length - 1]);
    const rr = range.getBoundingClientRect();
    const box = rr.width ? rel(rr) : rel(el.getBoundingClientRect());
    const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
    texts.push({
      ...box, runs, lineHeight: lh, align: cs.textAlign,
      bullet: cs.display === 'list-item' && cs.listStyleType !== 'none',
      padLeft: parseFloat(cs.paddingLeft) || 0,
    });
  };

  const walk = (el) => {
    if (!visible(el)) return;
    if (isFigure(el)) { addFigure(el); return; }
    const cs = getComputedStyle(el);
    // background / border → rectangle
    if (el !== canvas) {
      // computed style lengths are in untransformed px already; only
      // getBoundingClientRect values need the /scale
      const bg = rgb(cs.backgroundColor);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const bc = bw ? rgb(cs.borderTopColor) : null;
      const bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0;
      const bl = parseFloat(cs.borderLeftWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0;
      const uniform = bt === bb && bt === bl && bt === br;
      if (bg || (bc && uniform)) {
        const box = rel(el.getBoundingClientRect());
        const rad = cs.borderTopLeftRadius;
        const radius = rad.endsWith('%') ? (parseFloat(rad) / 100) * Math.min(box.w, box.h) : parseFloat(rad) || 0;
        shapes.push({
          ...box,
          fill: bg,
          line: bc && uniform ? { hex: bc.hex, w: bw } : null,
          radius,
          // absolutely positioned boxes paint above in-flow siblings
          layer: cs.position === 'absolute' || cs.position === 'fixed' ? 1 : 0,
        });
      } else if (bt || bb || bl || br) {
        // partial borders → thin rectangles per side
        const r = rel(el.getBoundingClientRect());
        const side = (x, y, w, h, wpx, col) => {
          const c = rgb(col);
          if (c && wpx) shapes.push({ x, y, w, h, fill: c, line: null, radius: 0, layer: 0 });
        };
        side(r.x, r.y, r.w, bt, bt, cs.borderTopColor);
        side(r.x, r.y + r.h - bb, r.w, bb, bb, cs.borderBottomColor);
        side(r.x, r.y, bl, r.h, bl, cs.borderLeftColor);
        side(r.x + r.w - br, r.y, br, r.h, br, cs.borderRightColor);
      }
    }
    // ::before / ::after generated content. No DOM node, so its box is read
    // off the pseudo-element's computed style, for the absolutely positioned
    // form used here.
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.display === 'none' || ps.content === 'none' || ps.content === 'normal') continue;
      let text = null;
      const mStr = ps.content.match(/^"(.*)"$/);
      if (mStr) text = mStr[1];
      else if (/counter\(/.test(ps.content)) {
        const sibs = [...el.parentElement.children].filter((c) => c.tagName === el.tagName);
        text = String(sibs.indexOf(el) + 1);
      }
      if (text === null || !text.trim()) continue;
      const host = el.getBoundingClientRect();
      const w = parseFloat(ps.width), h = parseFloat(ps.height);
      if (!(w > 0 && h > 0)) continue;
      const left = parseFloat(ps.left) || 0, top = parseFloat(ps.top) || 0;
      const box = { x: (host.left - cr.left) / scale + left, y: (host.top - cr.top) / scale + top, w, h };
      const bg = rgb(ps.backgroundColor), bw = parseFloat(ps.borderTopWidth) || 0, bc = bw ? rgb(ps.borderTopColor) : null;
      if (bg || bc) shapes.push({ ...box, fill: bg, line: bc ? { hex: bc.hex, w: bw } : null, radius: parseFloat(ps.borderTopLeftRadius) || 0, layer: 1 });
      const size = parseFloat(ps.fontSize);
      texts.push({
        x: box.x, y: box.y + (h - size * 1.2) / 2, w, h: size * 1.2, align: 'center', lineHeight: 1.2, bullet: false, padLeft: 0,
        runs: [{ text, font: ps.fontFamily, size, weight: Number(ps.fontWeight), italic: false, color: rgb(ps.color)?.hex ?? '000000', upper: false, spacing: 0, mono: false }],
      });
    }
    const kids = [...el.childNodes];
    // Group the children into runs of inline content between block-level
    // children. A block with no block children is one group (the common
    // case); a paragraph holding a display:block span yields the span as
    // its own block plus the surrounding text as anonymous boxes.
    const isBlock = (n) => n.nodeType === 1 && !isFigure(n) && visible(n) && !INLINE.has(getComputedStyle(n).display);
    let group = [];
    // A run of inline content becomes one text box. A run that carries no text
    // at all (an inline-block card holding only images, say) still has to give
    // up its figures, or they are dropped from the slide.
    const flush = () => {
      if (group.some((n) => n.textContent.trim())) emitText(el, group);
      else {
        for (const n of group) {
          if (n.nodeType !== 1 || !visible(n)) continue;
          if (isFigure(n)) addFigure(n);
          else for (const f of n.querySelectorAll('img, svg')) if (visible(f)) addFigure(f);
        }
      }
      group = [];
    };
    for (const n of kids) {
      if (isBlock(n)) { flush(); walk(n); }
      else if (n.nodeType === 1 && isFigure(n)) { if (visible(n)) addFigure(n); }
      else if (n.nodeType === 3 || n.nodeType === 1) group.push(n);
    }
    flush();
  };
  walk(canvas);
  window.__figureEls = figureEls;
  const bg = rgb(getComputedStyle(canvas).backgroundColor)?.hex ?? 'FFFFFF';
  return { shapes, images, texts, bg, natW: parseFloat(getComputedStyle(canvas).width), natH: parseFloat(getComputedStyle(canvas).height) };
};

// PowerPoint renders whatever face is named, so the two web faces are mapped
// onto their metric-compatible Office equivalents: Tinos is Times New Roman's
// metrics, and the UI stack is Arial. Nothing to install before opening.
const fontName = (family, mono) => {
  if (mono) return 'Courier New';
  const first = family.split(',')[0].replace(/["']/g, '').trim();
  if (/^tinos$/i.test(first)) return 'Times New Roman';
  if (/^(system-ui|-apple-system|ui-sans-serif|sans-serif)$/i.test(first)) return 'Arial';
  return first || 'Arial';
};

// One deck per theme. The page's light/dark switch is a checkbox, so the dark
// sheets are the same DOM with the box ticked.
const build = async (browser, theme) => {
  const url = `${BASE}${PATH}`;
  const dark = theme === 'dark';
  // A wide viewport plus a pinned frame width renders every canvas at exactly
  // its design size (1280 px = 13.333 in at 96 dpi), so one design pixel is
  // one slide pixel and nothing has to be scaled back.
  const open = async (deviceScaleFactor) => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor });
    // The page animates its sheets in on scroll. Reduced motion is the page's
    // own opt-out, so the exporter renders every sheet at rest and no figure
    // is ever screenshotted mid-fade.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '.deck, .deck-sheets, .slide-frame { width: 1280px !important; margin-inline: 0 !important; } astro-dev-toolbar { display: none !important; }' });
    if (dark) await page.evaluate(() => { document.getElementById('deck-dark').checked = true; });
    await page.evaluate(() => document.fonts.ready);
    return page;
  };

  const page = await open(1);
  const count = await page.evaluate(() => document.querySelectorAll('.slide-canvas').length);
  const figPage = await open(Math.min(4, Math.max(1, FIGURE_DPI / 96)));

  const pres = new pptxgen();
  pres.defineLayout({ name: 'DECK', width: SHEET_W_IN, height: SHEET_H_IN });
  pres.layout = 'DECK';
  pres.title = TITLE;
  pres.author = AUTHOR;
  pres.company = 'University of Southern Mississippi';

  let totals = { texts: 0, shapes: 0, images: 0 };
  for (let i = 0; i < count; i++) {
    const data = await page.evaluate(extract, i);
    const pxToIn = SHEET_W_IN / data.natW;
    const ptOf = (px) => px * 0.75; // 96px/in → 72pt/in

    // figures: screenshot each at FIGURE_DPI off the high-DPI copy of the page
    await figPage.evaluate(extract, i);
    const n = await figPage.evaluate(() => window.__figureEls.length);
    const figPngs = [];
    for (let k = 0; k < n; k++) {
      const handle = await figPage.evaluateHandle((k) => window.__figureEls[k], k);
      const el = handle.asElement();
      await el.scrollIntoViewIfNeeded();
      figPngs.push(await el.screenshot({ type: 'png', omitBackground: true }));
    }

    const slide = pres.addSlide();
    slide.background = { color: data.bg };
    for (const s of [...data.shapes].sort((a, b) => a.layer - b.layer)) {
      const opts = {
        x: s.x * pxToIn, y: s.y * pxToIn, w: s.w * pxToIn, h: s.h * pxToIn,
        fill: s.fill ? { color: s.fill.hex, transparency: Math.round((1 - s.fill.alpha) * 100) } : { type: 'none' },
        line: s.line ? { color: s.line.hex, width: ptOf(s.line.w) } : { type: 'none' },
      };
      const minSide = Math.min(s.w, s.h);
      const full = s.radius >= minSide / 2 - 0.01;
      // A fully rounded box is a circle only when it is square. A wide one is
      // a pill and has to stay a rounded rectangle, or PowerPoint draws an
      // ellipse where the page draws a tag.
      if (full && Math.abs(s.w - s.h) <= s.w * 0.02) slide.addShape(pres.ShapeType.ellipse, opts);
      else if (s.radius > 0) {
        opts.rectRadius = Math.min(s.radius, minSide / 2) * pxToIn;
        slide.addShape(pres.ShapeType.roundRect, opts);
      } else slide.addShape(pres.ShapeType.rect, opts);
    }
    data.images.forEach((im) => {
      slide.addImage({
        data: 'image/png;base64,' + figPngs[im.idx].toString('base64'),
        x: im.x * pxToIn, y: im.y * pxToIn, w: im.w * pxToIn, h: im.h * pxToIn,
        rounding: im.round || undefined,
      });
    });
    for (const t of data.texts) {
      const runs = t.runs.map((r, i) => ({
        text: (r.upper ? r.text.toUpperCase() : r.text).replace(/^\s+/, i === 0 ? '' : '$&'),
        options: {
          fontFace: fontName(r.font, r.mono), fontSize: ptOf(r.size), bold: r.weight >= 600,
          italic: r.italic, color: r.color, charSpacing: r.spacing ? ptOf(r.spacing) : undefined,
          breakLine: r.text === '\n',
        },
      })).filter((r) => r.text !== '\n' || true);
      // merge explicit newlines into breakLine on the previous run
      const merged = [];
      for (const r of runs) {
        if (r.text === '\n') { if (merged.length) merged[merged.length - 1].options.breakLine = true; continue; }
        merged.push(r);
      }
      // Lines are already broken where the browser broke them, so wrapping is
      // off and every box gets a little width slack. A face that measures
      // wider in PowerPoint then lets a line extend slightly to the right
      // rather than adding a line that collides with the block below.
      const maxSize = Math.max(...t.runs.map((r) => r.size));
      const align = t.align === 'center' ? 'center' : t.align === 'right' || t.align === 'end' ? 'right' : 'left';
      // generous box: a viewer that ignores wrap="none" still finds every
      // pre-broken line fits on one line
      const wIn = t.w * pxToIn * 1.15 + 0.1;
      slide.addText(merged, {
        x: t.x * pxToIn - (align === 'center' ? (wIn - t.w * pxToIn) / 2 : align === 'right' ? wIn - t.w * pxToIn : 0),
        y: t.y * pxToIn, w: wIn, h: t.h * pxToIn,
        margin: 0, isTextBox: true, valign: 'top', wrap: false, align,
        // exact spacing in points, so a substituted face cannot restretch it
        lineSpacing: ptOf(t.lineHeight * maxSize), bullet: t.bullet ? { indent: ptOf(t.padLeft) || 18 } : false,
      });
    }
    totals = {
      texts: totals.texts + data.texts.length,
      shapes: totals.shapes + data.shapes.length,
      images: totals.images + data.images.length,
    };
  }

  await page.close();
  await figPage.close();
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, dark ? 'aims-lab-dark.pptx' : 'aims-lab.pptx');
  await pres.writeFile({ fileName: file });
  console.log(`${file}: ${count} slides, ${totals.texts} text boxes, ${totals.shapes} shapes, ${totals.images} pictures`);
};

const browser = await chromium.launch();
try {
  for (const theme of themes) await build(browser, theme);
} finally {
  await browser.close();
}
