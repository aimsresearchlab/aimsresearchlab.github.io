// One timeline per scene of /reel. Each builder reads its numbers from the
// markup that reel.astro rendered, so nothing here is retyped, and uses only
// fromTo/set tweens so any point of the loop can be sought to and redrawn the
// same way (the master timeline repeats forever and is rebuilt on resize).

import gsap from 'gsap';

type TL = gsap.core.Timeline;

const q = <T extends Element = HTMLElement>(root: Element, sel: string) => root.querySelector(sel) as T;
const qa = <T extends Element = HTMLElement>(root: Element, sel: string) => [...root.querySelectorAll(sel)] as T[];

/** Types out an element's data-type text. */
function type(tl: TL, el: HTMLElement, at: number | string, dur: number) {
  const text = el.dataset.type ?? '';
  const o = { n: 0 };
  tl.fromTo(o, { n: 0 }, {
    n: text.length,
    duration: dur,
    ease: 'none',
    onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)); },
  }, at);
}

/** Counts a number up in an element's text. */
function count(tl: TL, el: HTMLElement, from: number, to: number, at: number | string, dur: number, fmt: (n: number) => string) {
  const o = { n: from };
  tl.fromTo(o, { n: from }, {
    n: to,
    duration: dur,
    ease: 'power2.out',
    onUpdate: () => { el.textContent = fmt(o.n); },
  }, at);
}

/** Title block in: kicker, title, subtitle rise into place. */
function head(tl: TL, root: Element, at = 0) {
  const parts = qa(root, '.r-head > *');
  tl.fromTo(parts, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, at);
  const foot = q(root, '.r-foot');
  if (foot) tl.fromTo(foot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, at + 0.6);
}

function fadeIn(tl: TL, el: Element | Element[], at: number | string, dur = 0.8, y = 26) {
  tl.fromTo(el, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: dur, ease: 'power3.out' }, at);
}

/** A dark-stage token resolved to rgb(), which GSAP can tween (color-mix() it cannot). */
function cssColor(root: Element, name: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  root.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

/** Position of an element's box relative to a frame, ignoring transforms set later. */
function rel(el: Element, frame: Element) {
  const a = el.getBoundingClientRect();
  const f = frame.getBoundingClientRect();
  return { x: a.left - f.left, y: a.top - f.top, w: a.width, h: a.height };
}

// ---------------------------------------------------------------------------

export function sameRanking(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root);
  const query = q(root, '[data-anim="query"]');
  const board = q(root, '[data-anim="board"]');
  const big = q(root, '[data-anim="big"]');
  const fig = q(root, '[data-anim="fig"]');
  const chips = Object.fromEntries(qa(root, '.tiap-chip').map((c) => [c.dataset.target!, c]));
  const bars = qa(root, '.tiap-bar');
  const vals = qa(root, '[data-val]');
  const crowns = qa(root, '[data-crown]');
  const notes = Object.fromEntries(qa(root, '.tiap-note').map((n) => [n.dataset.note!, n]));
  const accent = cssColor(root, '--r-accent');
  const ink = cssColor(root, '--r-bg');
  const soft = cssColor(root, '--r-soft');

  tl.set(Object.values(chips), { backgroundColor: 'rgba(0,0,0,0)', color: soft }, 0);
  tl.set(crowns, { autoAlpha: 0 }, 0);
  tl.set(Object.values(notes), { autoAlpha: 0 }, 0);
  tl.set([big, fig], { autoAlpha: 0 }, 0);
  tl.set(bars, { '--v': 0 }, 0);

  fadeIn(tl, query, 0.6);
  type(tl, q(root, '.tiap-q [data-type]'), 0.9, 1.7);
  fadeIn(tl, board, 2.3);

  const target = (t: 'raw' | 'source' | 'canonical', at: number) => {
    for (const [k, c] of Object.entries(chips)) {
      const on = k === t;
      tl.to(c, { backgroundColor: on ? accent : 'rgba(0,0,0,0)', color: on ? ink : soft, duration: 0.35 }, at);
    }
    bars.forEach((b, i) => {
      const v = Number(b.dataset[t]);
      tl.to(b, { '--v': v, duration: 1.0, ease: 'power3.inOut' }, at + 0.1);
      const prev = { raw: 0, source: Number(b.dataset.raw), canonical: Number(b.dataset.source) }[t];
      count(tl, vals[i], prev, v, at + 0.1, 1.0, (n) => n.toFixed(3));
    });
  };
  target('raw', 3.0);
  target('source', 4.6);
  tl.to(crowns[0], { autoAlpha: 1, duration: 0.6 }, 5.6);
  tl.to(notes.source, { autoAlpha: 1, duration: 0.6 }, 5.7);
  target('canonical', 8.2);
  tl.to([notes.source, crowns[0]], { autoAlpha: 0, duration: 0.4 }, 8.2);
  tl.to(crowns[1], { autoAlpha: 1, duration: 0.6 }, 9.2);
  tl.to(notes.canonical, { autoAlpha: 1, duration: 0.6 }, 9.3);
  tl.to(query, { autoAlpha: 0, duration: 0.6 }, 12.0);
  fadeIn(tl, fig, 12.5, 0.9);
  fadeIn(tl, big, 12.3, 0.9);
  tl.to({}, { duration: 0.01 }, 17.5);
  return tl;
}

export function seam(root: HTMLElement): TL {
  const tl = gsap.timeline();
  const frame = q(root, '.r-frame');
  root.querySelectorAll('.seam-fly').forEach((n) => n.remove());
  const caseEl = q(root, '[data-anim="case"]');
  const chart = q(root, '[data-anim="chart"]');
  const src = qa(root, '[data-after] .seam-ch');
  const dst = qa(root, '[data-ghost] .seam-ch');

  // Measure before any tween moves things.
  gsap.set([caseEl, chart], { clearProps: 'transform' });
  const from = src.map((e) => rel(e, frame));
  const to = dst.map((e) => rel(e, frame));
  const gold = cssColor(root, '--gold');
  const bad = cssColor(root, '--r-bad');
  // The afterthought travels as one phrase, from the prompt into the artifact.
  const fly = document.createElement('span');
  fly.className = 'seam-fly';
  fly.textContent = src.map((e) => e.textContent).join('');
  fly.style.left = `${from[0].x}px`;
  fly.style.top = `${from[0].y}px`;
  frame.appendChild(fly);

  head(tl, root);
  tl.set(chart, { autoAlpha: 0 }, 0);
  fadeIn(tl, caseEl, 0.7);
  type(tl, q(root, '.seam-instr [data-type]'), 1.0, 1.3);
  const art = q(root, '.seam-art');
  tl.fromTo(art, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 2.5);
  const artText = q(root, '.seam-art [data-type]');
  tl.fromTo(artText, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 2.55);
  tl.fromTo(src, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.055 }, 3.3);
  // The seam itself: one newline, nothing marking where the paste ends.
  const line = q(root, '[data-seamline]');
  tl.fromTo(line, { autoAlpha: 0, scaleX: 0, transformOrigin: 'left' }, { autoAlpha: 1, scaleX: 1, duration: 0.6, ease: 'power2.out' }, 4.6);
  const send = q(root, '[data-send]');
  tl.fromTo(send, { scale: 1 }, { scale: 0.82, duration: 0.12, yoyo: true, repeat: 1 }, 5.0);
  const arrow = q(root, '[data-arrow]');
  tl.fromTo(arrow, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 5.0);
  const out = q(root, '.seam-out');
  tl.fromTo(out, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 5.2);
  type(tl, q(root, '.seam-clean [data-type]'), 5.4, 1.5);

  // The afterthought leaves the prompt and settles into the artifact.
  tl.set(fly, { autoAlpha: 0, x: 0, y: 0, color: gold }, 0);
  tl.set(dst, { autoAlpha: 0 }, 0);
  tl.set(fly, { autoAlpha: 1 }, 7.2);
  tl.to(src, { autoAlpha: 0.15, duration: 0.3 }, 7.2);
  tl.to(fly, { x: to[0].x - from[0].x, y: to[0].y - from[0].y, duration: 1.3, ease: 'power2.inOut' }, 7.2);
  tl.to(fly, { color: bad, duration: 0.8 }, 7.6);
  tl.set(dst, { autoAlpha: 1 }, 8.5);
  tl.set(fly, { autoAlpha: 0 }, 8.5);
  fadeIn(tl, q(root, '[data-verdict]'), 9.6, 0.6, 12);

  // Then all twenty models.
  tl.to(caseEl, { autoAlpha: 0, y: -30, duration: 0.6, ease: 'power2.in' }, 12.6);
  const capN = q(root, '[data-cap="newline"]');
  const capB = q(root, '[data-cap="boundary"]');
  const bars = qa(root, '.seam-bar');
  const vals = qa(root, '.seam-val');
  tl.set(capB, { autoAlpha: 0 }, 0);
  tl.set(bars, { '--v': 0 }, 0);
  tl.fromTo(chart, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 13.0);
  bars.forEach((b, i) => {
    const at = 13.3 + i * 0.04;
    tl.to(b, { '--v': Number(b.dataset.newline) / 75, duration: 1.2, ease: 'power3.out' }, at);
    count(tl, vals[i], 0, Number(vals[i].dataset.newline), at, 1.2, (n) => `${n.toFixed(1)}%`);
  });
  tl.to(capN, { autoAlpha: 0, duration: 0.4 }, 18.0);
  tl.to(capB, { autoAlpha: 1, duration: 0.4 }, 18.3);
  bars.forEach((b, i) => {
    const at = 18.4 + i * 0.03;
    tl.to(b, { '--v': Number(b.dataset.boundary) / 75, duration: 1.4, ease: 'power3.inOut' }, at);
    count(tl, vals[i], Number(vals[i].dataset.newline), Number(vals[i].dataset.boundary), at, 1.4, (n) => `${n.toFixed(1)}%`);
  });
  tl.to({}, { duration: 0.01 }, 24.5);
  return tl;
}

export function fixedRag(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root);
  const docs = qa(root, '.rag-doc');
  const readers = qa(root, '.rag-reader');
  tl.fromTo(docs, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }, 0.9);
  tl.fromTo(q(root, '.rag-funnel'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 1.5);
  tl.fromTo(readers, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, 2.0);
  tl.to(docs, { x: 60, autoAlpha: 0.25, duration: 0.8, stagger: 0.05, ease: 'power2.in' }, 3.4);
  tl.fromTo(q(root, '.rag-readers-l'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 3.6);
  const stats = qa(root, '.rag-stat');
  const n80 = q(stats[0], '.r-big-n');
  const n31 = q(stats[1], '.r-big-n');
  fadeIn(tl, stats[0], 6.0);
  count(tl, n80, 0, Number(n80.dataset.n), 6.2, 1.4, (n) => `${Math.round(n)}%`);
  const ups = qa(root, '.rag-upbar');
  tl.fromTo(ups[0], { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1.0, ease: 'power3.out' }, 6.6);
  tl.fromTo(ups[1], { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1.0, ease: 'power3.out' }, 7.4);
  fadeIn(tl, stats[1], 9.6);
  count(tl, n31, 0, Number(n31.dataset.n), 9.8, 1.4, (n) => `${Math.round(n)}%`);
  tl.to({}, { duration: 0.01 }, 16.5);
  return tl;
}

export function outcomeMonitors(root: HTMLElement): TL {
  const tl = gsap.timeline();
  const pipe = q(root, '[data-anim="pipe"]');
  const node = (k: string) => q(root, `[data-node="${k}"]`);
  const packet = q(root, '[data-packet]');
  const centre = (el: HTMLElement) => {
    const r = rel(el, pipe);
    return r.x + r.w / 2;
  };
  gsap.set(pipe, { clearProps: 'transform' });
  const X = { agent: centre(node('agent')), tool: centre(node('tool')), result: centre(node('result')), monitor: centre(node('monitor')), next: centre(node('next')) };
  const good = cssColor(root, '--r-good');
  const bad = cssColor(root, '--r-bad');
  const gold = cssColor(root, '--gold');

  head(tl, root);
  const monitor = node('monitor');
  const nodes = qa(root, '.om-node').filter((n) => n !== monitor);
  tl.set(monitor, { autoAlpha: 0, scale: 0.94 }, 0);
  tl.fromTo([...nodes, ...qa(root, '.om-link')], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }, 0.8);
  tl.set(q(root, '.om-ok'), { autoAlpha: 0 }, 0);
  tl.set(packet, { autoAlpha: 0, x: X.agent, backgroundColor: good, boxShadow: `0 0 24px ${good}` }, 0);
  tl.set([q(root, '[data-silent]'), q(root, '[data-receipt]'), q(root, '[data-anim="stat"]')], { autoAlpha: 0 }, 0);

  // First run: no monitor, the bad value sails through.
  tl.to(packet, { autoAlpha: 1, duration: 0.2 }, 2.0);
  tl.to(packet, { x: X.tool, duration: 0.7, ease: 'power1.inOut' }, 2.1);
  tl.to(packet, { x: X.result, duration: 0.7, ease: 'power1.inOut' }, 2.9);
  tl.fromTo(node('result'), { scale: 1 }, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 }, 3.6);
  tl.to(q(root, '.om-ok'), { autoAlpha: 1, duration: 0.3 }, 3.6);
  tl.to(packet, { x: X.next, duration: 1.4, ease: 'power1.inOut' }, 4.1);
  tl.to(packet, { backgroundColor: bad, boxShadow: `0 0 24px ${bad}`, duration: 1.0 }, 4.5);
  tl.to(node('next'), { borderColor: bad, duration: 0.5 }, 5.3);
  fadeIn(tl, q(root, '[data-silent]'), 5.4, 0.6, 12);

  // Second run: the monitor catches it and hands back a receipt.
  tl.to(q(root, '[data-silent]'), { autoAlpha: 0, duration: 0.4 }, 8.4);
  tl.to(packet, { autoAlpha: 0, duration: 0.3 }, 8.4);
  tl.to(node('next'), { borderColor: 'rgba(255,255,255,0.16)', duration: 0.4 }, 8.4);
  tl.to(monitor, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 8.8);
  tl.set(packet, { x: X.agent, backgroundColor: good, boxShadow: `0 0 24px ${good}` }, 9.4);
  tl.to(packet, { autoAlpha: 1, duration: 0.2 }, 9.4);
  tl.to(packet, { x: X.result, duration: 1.1, ease: 'power1.inOut' }, 9.5);
  tl.to(packet, { x: X.monitor, duration: 0.6, ease: 'power2.out' }, 10.6);
  tl.to(packet, { backgroundColor: gold, boxShadow: `0 0 30px ${gold}`, duration: 0.3 }, 11.0);
  tl.fromTo(monitor, { scale: 1 }, { scale: 1.1, duration: 0.18, yoyo: true, repeat: 1 }, 11.1);
  fadeIn(tl, q(root, '[data-receipt]'), 11.3, 0.6, 16);
  tl.to(packet, { x: X.agent, duration: 1.2, ease: 'power2.inOut' }, 12.2);
  tl.to(packet, { autoAlpha: 0, duration: 0.3 }, 13.4);

  const stat = q(root, '[data-anim="stat"]');
  fadeIn(tl, stat, 13.4);
  const bars = qa(stat, '.om-bar');
  const ns = qa(stat, '.om-n');
  bars.forEach((b, i) => {
    tl.fromTo(b, { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'power3.out' }, 13.7 + i * 0.5);
    const v = Number(ns[i].dataset.n);
    count(tl, ns[i], 0, v, 13.7 + i * 0.5, 1.1, (n) => `${n.toFixed(1)}%`);
  });
  tl.to({}, { duration: 0.01 }, 19.5);
  return tl;
}

export function gaussian(root: HTMLElement): TL {
  const tl = gsap.timeline();
  const video = q<HTMLVideoElement>(root, 'video');
  head(tl, root);
  const vid = q(root, '[data-anim="video"]');
  tl.fromTo(vid, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, 0.5);
  tl.call(() => { video.currentTime = 0; video.play().catch(() => {}); }, [], 0.4);
  const n = q(root, '[data-count]');
  const text = q(root, '[data-anim="text"]');
  tl.set(qa(text, ':scope > *'), { autoAlpha: 0 }, 0);
  tl.to(n, { autoAlpha: 1, duration: 0.3 }, 1.0);
  count(tl, n, 0, Number(n.dataset.count), 1.0, 1.8, (v) => Math.round(v).toLocaleString('en-US'));
  fadeIn(tl, q(text, '.r-big-l'), 2.6);
  fadeIn(tl, q(text, '.gs-claim'), 4.2);
  tl.to({}, { duration: 0.01 }, 15.5);
  tl.call(() => video.pause(), [], 15.5);
  return tl;
}

export function lapse(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root);
  const said = q(root, '.lp-said');
  const writer = q(root, '.lp-writer');
  const stored = q(root, '.lp-stored');
  fadeIn(tl, said, 0.8);
  tl.fromTo(q(root, '[data-cue]'), { textShadow: '0 0 0px rgba(245,206,85,0)' }, { textShadow: '0 0 18px rgba(245,206,85,0.9)', duration: 0.6, yoyo: true, repeat: 1 }, 1.8);
  tl.fromTo(writer, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 2.6);
  fadeIn(tl, stored, 3.8);
  tl.set(q(root, '[data-lost]'), { autoAlpha: 0 }, 0);
  tl.fromTo(q(root, '[data-flat]'), { scale: 1 }, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1, display: 'inline-block' }, 4.8);
  fadeIn(tl, q(root, '[data-lost]'), 5.2, 0.6, 10);
  const stats = qa(root, '.lp-stats > div');
  fadeIn(tl, stats[0], 7.4);
  fadeIn(tl, stats[1], 9.2);
  tl.to({}, { duration: 0.01 }, 16);
  return tl;
}

export function thin(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root);
  tl.fromTo(q(root, '[data-anim="fig"]'), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, 0.8);
  tl.to({}, { duration: 0.01 }, 13);
  return tl;
}

export function smoke(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root);
  tl.fromTo(q(root, '[data-anim="fig"]'), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, 0.6);
  qa(root, '[data-step]').forEach((el, i) => fadeIn(tl, el, 1.6 + i * 1.3, 0.7, 20));
  tl.to({}, { duration: 0.01 }, 11.5);
  return tl;
}

export function people(root: HTMLElement): TL {
  const tl = gsap.timeline();
  head(tl, root, 0.2);
  tl.fromTo(qa(root, '.pp-card'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, 1.0);
  tl.to({}, { duration: 0.01 }, 14);
  return tl;
}

export function closing(root: HTMLElement): TL {
  const tl = gsap.timeline();
  tl.fromTo(q(root, '.cl-mark'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0.2);
  fadeIn(tl, q(root, '.cl-name'), 0.9);
  fadeIn(tl, q(root, '.cl-where'), 1.3);
  fadeIn(tl, q(root, '.cl-url'), 1.9);
  tl.to({}, { duration: 0.01 }, 9);
  return tl;
}

export const builders: Record<string, (root: HTMLElement) => TL> = {
  'same-ranking-different-winner': sameRanking,
  seam,
  'fixed-rag-compression': fixedRag,
  'outcome-monitors': outcomeMonitors,
  'gaussian-streaming': gaussian,
  lapse,
  'thin-object-segmentation': thin,
  'smoke-detection': smoke,
  people,
  close: closing,
};
