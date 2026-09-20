// Present mode for the overview deck: one sheet at a time, fullscreen, driven
// by the keyboard, a click, or a timer.
//
// The controller owns exactly one piece of state, the index of the sheet on
// screen, and publishes every change. Nothing else reads the DOM to work out
// which sheet is up.

export interface PresentController {
  /** Index of the sheet on screen. */
  readonly index: number;
  readonly count: number;
  readonly presenting: boolean;
  /** True while the timer is advancing sheets on its own. */
  readonly auto: boolean;
  show(index: number): void;
  step(delta: number): void;
  enter(): void;
  leave(): void;
  setAuto(on: boolean): void;
  /** Fires on every sheet change, including the first. Returns an unsubscribe. */
  onChange(fn: (index: number, frame: HTMLElement) => void): () => void;
  destroy(): void;
}

export interface PresentOptions {
  /** Milliseconds a sheet stays up while the timer runs. Default 14000. */
  dwellMs?: number;
  /** Start the timer on entering. Default true: the deck runs unattended. */
  autoOnEnter?: boolean;
}

const FULLSCREEN_KEYS = new Set(['f', 'F']);

export function initPresent(deck: HTMLElement, options: PresentOptions = {}): PresentController {
  const dwellMs = options.dwellMs ?? 14000;
  const autoOnEnter = options.autoOnEnter ?? true;

  const frames = [...deck.querySelectorAll<HTMLElement>('.slide-frame')];
  const bar = deck.querySelector<HTMLElement>('.stage-bar');
  const counter = deck.querySelector<HTMLElement>('[data-count]');
  const autoButton = deck.querySelector<HTMLButtonElement>('[data-auto]');
  const stage = deck.querySelector<HTMLElement>('.deck-sheets');

  const listeners = new Set<(index: number, frame: HTMLElement) => void>();
  const cleanups: (() => void)[] = [];

  let index = 0;
  let presenting = false;
  let timer: number | null = null;
  // True once this session actually reached fullscreen; see syncFullscreen.
  let wasFullscreen = false;

  const on = <K extends keyof WindowEventMap>(
    target: EventTarget,
    type: K | string,
    fn: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  // --- sheets -------------------------------------------------------------
  const paint = () => {
    frames.forEach((frame, n) => frame.toggleAttribute('data-active', n === index));
    if (counter) counter.textContent = `${index + 1} / ${frames.length}`;
    const frame = frames[index];
    if (frame) for (const fn of listeners) fn(index, frame);
  };

  const show = (next: number) => {
    if (!frames.length) return;
    index = ((next % frames.length) + frames.length) % frames.length; // wraps both ways
    paint();
  };

  // A manual move restarts the dwell, so a sheet someone just chose is not
  // taken away half a second later.
  const step = (delta: number) => {
    show(index + delta);
    if (timer !== null) startTimer();
  };

  // --- timer --------------------------------------------------------------
  const stopTimer = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  const startTimer = () => {
    stopTimer();
    timer = window.setInterval(() => show(index + 1), dwellMs);
  };
  const setAuto = (wanted: boolean) => {
    if (wanted) startTimer();
    else stopTimer();
    autoButton?.setAttribute('aria-pressed', String(wanted));
  };

  // --- fullscreen ---------------------------------------------------------
  // Safari still ships the prefixed calls, and a request rejects when the
  // gesture is not trusted. Present mode works either way; fullscreen is a
  // bonus on top of it.
  const requestFullscreen = () => {
    const el = deck as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    const request = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    request?.().catch(() => {});
  };
  const exitFullscreen = () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
    const exit = doc.exitFullscreen?.bind(doc) ?? doc.webkitExitFullscreen?.bind(doc);
    exit?.().catch(() => {});
  };

  // --- enter / leave ------------------------------------------------------
  const enter = () => {
    if (presenting) return;
    presenting = true;
    document.body.classList.add('presenting');
    if (bar) bar.hidden = false;
    show(0);
    setAuto(autoOnEnter);
    wasFullscreen = false;
    requestFullscreen();
    // Keys are read off the document, so focus must not sit on the button that
    // started the deck: a space there would re-trigger it instead of advancing.
    stage?.focus({ preventScroll: true });
  };

  const leave = () => {
    if (!presenting) return;
    presenting = false;
    document.body.classList.remove('presenting');
    if (bar) bar.hidden = true;
    setAuto(false);
    frames.forEach((frame) => frame.removeAttribute('data-active'));
    exitFullscreen();
  };

  // --- input --------------------------------------------------------------
  on(document, 'keydown', (event) => {
    const e = event as KeyboardEvent;
    if (!presenting) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Spacebar': // older Firefox
      case 'Enter':
        e.preventDefault();
        step(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault();
        step(-1);
        break;
      case 'Home':
        e.preventDefault();
        show(0);
        break;
      case 'End':
        e.preventDefault();
        show(frames.length - 1);
        break;
      case 'Escape':
        leave();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        setAuto(timer === null);
        break;
      default:
        if (FULLSCREEN_KEYS.has(e.key)) {
          e.preventDefault();
          if (document.fullscreenElement) exitFullscreen();
          else requestFullscreen();
        }
    }
  });

  // A click on the sheet advances. The listener sits on the stage rather than
  // on the deck, so the button that starts the deck cannot also advance it
  // with the same click, and the control bar keeps its own buttons.
  if (stage) {
    on(stage, 'click', (event) => {
      if (!presenting) return;
      const target = event.target as HTMLElement;
      if (target.closest('.stage-bar, a, button, label')) return;
      step(1);
    });
  }

  // Leaving fullscreen by any route (Esc in the browser chrome, the window
  // manager) leaves present mode with it, so the two never disagree. Only a
  // session that actually reached fullscreen can be ended this way: a browser
  // that refuses the request, or a late event from the previous session, must
  // not close a deck that is running happily without it.
  const syncFullscreen = () => {
    const doc = document as Document & { webkitFullscreenElement?: Element };
    const element = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
    const ours = element === deck;
    if (ours) {
      wasFullscreen = true;
      return;
    }
    if (wasFullscreen && presenting) leave();
    wasFullscreen = false;
  };
  on(document, 'fullscreenchange', syncFullscreen);
  on(document, 'webkitfullscreenchange', syncFullscreen);

  // A deck left running on a second screen should not pile up ticks while the
  // tab is hidden.
  on(document, 'visibilitychange', () => {
    if (!presenting) return;
    if (document.hidden) stopTimer();
    else if (autoButton?.getAttribute('aria-pressed') === 'true') startTimer();
  });

  deck.querySelector('[data-present]')?.addEventListener('click', enter);
  deck.querySelector('[data-exit]')?.addEventListener('click', leave);
  deck.querySelector('[data-prev]')?.addEventListener('click', () => step(-1));
  deck.querySelector('[data-next]')?.addEventListener('click', () => step(1));
  autoButton?.addEventListener('click', () => setAuto(timer === null));

  return {
    get index() {
      return index;
    },
    get count() {
      return frames.length;
    },
    get presenting() {
      return presenting;
    },
    get auto() {
      return timer !== null;
    },
    show,
    step,
    enter,
    leave,
    setAuto,
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    destroy() {
      stopTimer();
      leave();
      for (const off of cleanups) off();
      listeners.clear();
    },
  };
}
