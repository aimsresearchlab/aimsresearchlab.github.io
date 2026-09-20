// Motion for the overview deck, live page only.
//
// Everything here is decoration. The page is complete and readable if this
// module never runs, which is also how the PowerPoint exporter renders it: it
// loads the page with reduced motion, so `enabled` is false and every sheet is
// at rest when it is measured.

import { animate, inView, stagger } from 'motion';
import type { PresentController } from './deck-present';

const REDUCED = '(prefers-reduced-motion: reduce)';

export function motionEnabled(): boolean {
  return typeof matchMedia === 'function' && !matchMedia(REDUCED).matches;
}

/**
 * Sheets rise into place the first time they scroll into view.
 *
 * The animation itself is a CSS transition on the `.motion` class, and this
 * only decides when to drop the class. Motion is deliberately not used on the
 * frame: it writes what it animates as inline styles and keeps them, and an
 * inline `opacity: 1` outranks the rule that hides a sheet that is not on
 * screen, which left every visited sheet stacked on top of the others in
 * present mode. Visibility of a frame belongs to the stylesheet alone.
 */
export function revealSheets(deck: HTMLElement): void {
  const frames = [...deck.querySelectorAll<HTMLElement>('.slide-frame')];
  for (const frame of frames) frame.classList.add('motion');

  inView(frames, (target) => (target as HTMLElement).classList.remove('motion'), { amount: 0.2 });
}

/**
 * The sheet arriving in present mode animates, then its blocks follow. Both
 * target content inside the frame, never the frame, for the reason above.
 */
export function animateSheetChange(present: PresentController): () => void {
  return present.onChange((_index, frame) => {
    if (!present.presenting) return;
    const canvas = frame.querySelector<HTMLElement>('.slide-canvas');
    if (!canvas) return;

    // Motion's own transform properties, not a `transform` string: it cannot
    // interpolate the `none` keyword, and a keyframe of `['scale(0.992)',
    // 'none']` lands on `scale(0)`, which leaves the sheet invisible.
    animate(canvas, { scale: [0.992, 1] }, { duration: 0.4 });

    const blocks = [...canvas.children];
    if (!blocks.length) return;
    animate(
      blocks,
      { opacity: [0, 1], y: [14, 0] },
      { duration: 0.45, delay: stagger(0.06, { start: 0.08 }) },
    );
  });
}

/**
 * The backdrop: three colour fields and two rings drifting behind everything.
 * Small and slow on purpose, so it reads as depth rather than as something
 * moving while you are trying to read a sheet.
 */
export function driftBackdrop(deck: HTMLElement): void {
  const field = deck.querySelector<HTMLElement>('.deck-field');
  if (!field) return;

  const drift = (selector: string, x: number, y: number, seconds: number) => {
    const el = field.querySelector<HTMLElement>(selector);
    if (!el) return;
    animate(
      el,
      { x: [0, x, 0], y: [0, y, 0] },
      { duration: seconds, repeat: Infinity, easing: 'ease-in-out' },
    );
  };

  drift('.b1', 26, -18, 42);
  drift('.b2', -20, 18, 48);
  drift('.b3', 16, -14, 54);
  drift('.r1', -14, 14, 38);
  drift('.r2', 18, -12, 46);
}

/** Wires up every piece of motion the deck uses. Safe to call unconditionally. */
export function initMotion(deck: HTMLElement, present: PresentController): void {
  if (!motionEnabled()) return;
  revealSheets(deck);
  driftBackdrop(deck);
  animateSheetChange(present);
}
