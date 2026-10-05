// The /reel loop: one GSAP timeline that moves the camera through the lab
// (lab.ts) and hands over to each poster's scene (scenes.ts), then repeats.
//
// The page reads without this file. With it: tap space to pause, hold it for
// 2x, the arrow keys step between stops (paused, a bar of stops appears at the
// bottom; 1 to 0 jump straight to one), F toggles fullscreen, R restarts, S
// plays at 3x for review.
// ?at=<scene> starts at a stop (e.g. ?at=seam). window.__tl is the timeline.

import gsap from 'gsap';
import * as THREE from 'three';
import {
  Lab, PHOTO_POSE, BIRD_A, BIRD_B, TV_HOLD, TV_CLOSE, posterHold, posterClose, posterWall,
  type Pose, type PosterInfo,
} from './lab';
import { builders } from './scenes';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export async function initReel(body: HTMLElement) {
  const data = JSON.parse(document.getElementById('reel-data')!.textContent!) as { posters: PosterInfo[] };
  const canvas = body.querySelector<HTMLCanvasElement>('.r-gl')!;

  // No WebGL: leave the static page as it is.
  const probe = document.createElement('canvas');
  if (!probe.getContext('webgl2')) return;

  body.classList.add('is-live');
  const curtain = body.querySelector<HTMLElement>('.r-curtain')!;
  gsap.set(curtain, { autoAlpha: 1 });

  const lab = new Lab(canvas, {
    navy: token('--navy'), brand: token('--brand'), gold: token('--gold'), ink: token('--ink'),
    inkSoft: token('--ink-soft'), surface: token('--surface'), paper: token('--paper'),
  });
  await document.fonts.ready;
  await lab.init(data.posters);

  const scenes = new Map<string, HTMLElement>();
  body.querySelectorAll<HTMLElement>('.r-scene').forEach((s) => scenes.set(s.dataset.scene!, s));

  let master: gsap.core.Timeline;

  const build = () => {
    const tl = gsap.timeline({ repeat: -1, paused: true });
    let pose: Pose = { ...PHOTO_POSE };

    /** Moves the camera along a smooth curve through the given poses. */
    const move = (via: Pose[], at: number | string, dur: number, ease = 'power2.inOut') => {
      const pts = [pose, ...via];
      const pc = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y, p.z)), false, 'centripetal');
      const tc = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.tx, p.ty, p.tz)), false, 'centripetal');
      const a = pts[0];
      const b = pts[pts.length - 1];
      const o = { u: 0 };
      const v1 = new THREE.Vector3();
      const v2 = new THREE.Vector3();
      tl.fromTo(o, { u: 0 }, {
        u: 1,
        duration: dur,
        ease,
        onUpdate: () => {
          pc.getPoint(o.u, v1);
          tc.getPoint(o.u, v2);
          Object.assign(lab.pose, {
            x: v1.x, y: v1.y, z: v1.z, tx: v2.x, ty: v2.y, tz: v2.z,
            fov: lerp(a.fov, b.fov, o.u), shift: lerp(a.shift, b.shift, o.u),
            roll: lerp(a.roll ?? 0, b.roll ?? 0, o.u),
          });
        },
      }, at);
      pose = b;
    };

    const fx = lab.fx;
    const cap = (s: string) => body.querySelector<HTMLElement>(s)!;

    // ---- Intro: the room from above, then down into the photograph -------
    // Opens on an overhead model of the lab that builds itself, circles it,
    // and flies in through the missing front wall. The model look fades into
    // the photo on the way down and lands exactly on the photo's own view.
    tl.addLabel('intro', 0);
    pose = { ...BIRD_A };
    tl.call(() => lab.setTvTitle('AIMS Lab'), [], 0);
    tl.set(fx, { posters: 0, tv: 0, sway: 0, fade: 1, model: 1, build: 0 }, 0);
    tl.set(lab.pose, { ...BIRD_A }, 0);
    tl.set([...scenes.values()], { autoAlpha: 0 }, 0);
    tl.set(cap('.r-caption'), { autoAlpha: 1 }, 0);
    tl.set([cap('[data-cap-a]'), cap('[data-cap-b]'), cap('.r-cap-kicker'), cap('[data-lower]')], { autoAlpha: 0 }, 0);
    tl.fromTo(curtain, { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.4, ease: 'power1.inOut' }, 0);
    tl.to(fx, { build: 1, duration: 4.2, ease: 'power2.inOut' }, 0.6);
    move([BIRD_B], 0, 8.0, 'sine.inOut');
    tl.fromTo([cap('.r-cap-kicker'), cap('[data-cap-a]')], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 1.6);
    tl.to([cap('.r-cap-kicker'), cap('[data-cap-a]')], { autoAlpha: 0, y: -16, duration: 0.6 }, 6.8);
    // Down and in.
    move([
      { x: -3.2, y: 6.2, z: 6.4, tx: 0.1, ty: 1.0, tz: -5.0, fov: 36, shift: 0 },
      { x: -0.4, y: 2.5, z: 3.0, tx: 0.0, ty: 1.4, tz: -7.0, fov: 35, shift: 0.1 },
      PHOTO_POSE,
    ], 8.0, 6.2, 'power2.inOut');
    tl.to(fx, { model: 0, duration: 1.3, ease: 'power1.inOut' }, 12.7);
    // Landed: the photograph, held still for a beat.
    tl.fromTo(cap('[data-cap-b]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 14.4);
    tl.to(cap('[data-cap-b]'), { autoAlpha: 0, y: -16, duration: 0.6 }, 17.4);
    tl.to(fx, { sway: 1, duration: 2.5 }, 16.4);
    move([{ x: 0.45, y: 1.55, z: -1.7, tx: 0.55, ty: 1.3, tz: -9.0, fov: 42, shift: 0 }], 16.4, 6.0, 'power1.inOut');
    tl.to(fx, { posters: 1, duration: 3.6, ease: 'power1.inOut' }, 16.8);
    tl.to(fx, { tv: 1, duration: 0.8 }, 18.2);
    tl.fromTo(cap('[data-lower]'), { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out' }, 18.4);
    tl.to(cap('[data-lower]'), { autoAlpha: 0, x: -20, duration: 0.6 }, 23.0);
    let t = 21.6;

    // ---- One stop per poster -------------------------------------------------
    data.posters.forEach((p, i) => {
      const hold = posterHold(p);
      const close = posterClose(p);
      const { n } = posterWall(p);
      // Through the middle of the aisle, looking down the room, then turn to the wall.
      const aisle: Pose = {
        x: 0.3 - n * 0.25, y: 1.6, z: p.z + 0.9,
        tx: hold.tx * 0.5, ty: 1.7, tz: p.z - 1.2, fov: 38, shift: 0,
      };
      const approach = i === 0 ? 4.2 : 4.6;
      tl.addLabel(p.slug, t);
      move([aisle, hold], t, approach);
      t += approach;
      const nudge: Pose = { ...hold, x: lerp(hold.x, hold.tx, 0.12), z: hold.z - 0.12 };
      move([nudge], t, 2.4, 'sine.inOut');
      t += 2.4;
      move([close], t, 1.5, 'power2.in');
      const scene = scenes.get(p.slug)!;
      const st = builders[p.slug](scene);
      tl.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.in' }, t + 0.9);
      t += 1.5;
      tl.add(st, t - 0.4);
      t += st.duration() - 0.4;
      tl.to(scene, { autoAlpha: 0, duration: 0.7, ease: 'power1.inOut' }, t);
      t += 0.2;
    });

    // ---- Finale: into the TV, which opens onto the people -------------------
    tl.addLabel('people', t);
    tl.call(() => lab.setTvTitle('Meet the lab'), [], t);
    move([{ x: 0.35, y: 1.6, z: -5.2, tx: 0.2, ty: 1.45, tz: -8.6, fov: 38, shift: 0 }, TV_HOLD], t, 4.8);
    t += 4.8;
    move([TV_CLOSE], t, 2.0, 'power2.in');
    const peopleEl = scenes.get('people')!;
    tl.fromTo(peopleEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, t + 1.3);
    t += 2.0;
    const pt = builders.people(peopleEl);
    tl.add(pt, t - 0.5);
    t += pt.duration() - 0.5;

    tl.addLabel('close', t);
    const closeEl = scenes.get('close')!;
    tl.fromTo(closeEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, t);
    tl.to(peopleEl, { autoAlpha: 0, duration: 0.9 }, t);
    const ct = builders.close(closeEl);
    tl.add(ct, t);
    t += ct.duration();
    tl.to(curtain, { autoAlpha: 1, duration: 1.2 }, t);
    t += 1.3;
    tl.set(closeEl, { autoAlpha: 0 }, t);
    tl.call(() => {}, [], t + 0.05);
    return tl;
  };

  master = build();
  (window as any).__tl = master;

  // Start where ?at= says, else at the top.
  const at = new URLSearchParams(location.search).get('at');
  master.play(at && master.labels[at] !== undefined ? master.labels[at] : 0);

  // ---- Render loop ------------------------------------------------------------
  const sceneEls = [...scenes.values()];
  const tick = () => {
    const covered =
      Number(gsap.getProperty(curtain, 'opacity')) > 0.999 ||
      sceneEls.some((s) => Number(gsap.getProperty(s, 'opacity')) > 0.999);
    if (!covered) lab.render(lab.elapsed);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // ---- Resize: rebuild the timeline at the same moment ------------------------
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      lab.resize();
      const time = master.time();
      const paused = master.paused();
      master.kill();
      master = build();
      (window as any).__tl = master;
      master.seek(time, false);
      if (!paused) master.play();
    }, 250);
  });
  lab.resize();

  // ---- Keys, cursor, screen ------------------------------------------------
  const hud = body.querySelector<HTMLElement>('[data-hud]')!;
  const stops = () => Object.entries(master.labels).sort((a, b) => a[1] - b[1]);
  // While paused, a row of buttons along the bottom jumps to any stop.
  const names: Record<string, string> = { intro: 'Intro', people: 'People', close: 'Close' };
  data.posters.forEach((p) => { names[p.slug] = p.title; });
  const jump = document.createElement('nav');
  jump.className = 'r-jump';
  jump.setAttribute('aria-label', 'Jump to a stop');
  stops().forEach(([label], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.label = label;
    b.innerHTML = `<kbd>${(i + 1) % 10}</kbd>${names[label] ?? label}`;
    b.addEventListener('click', () => goTo(label));
    jump.appendChild(b);
  });
  body.appendChild(jump);
  const goTo = (label: string) => {
    master.seek(master.labels[label], false);
    master.play();
    body.classList.remove('paused');
  };
  const showHud = () => {
    const now = master.time();
    const here = stops().filter(([, v]) => v <= now + 0.01).pop()?.[0] ?? '';
    hud.textContent = `${now.toFixed(1)}s / ${master.duration().toFixed(0)}s`;
    jump.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.label === here));
  };
  let spaceTimer = 0;
  let fast = false;
  const setSpeed = (k: number) => {
    master.timeScale(k);
    body.querySelectorAll('video').forEach((v) => { v.playbackRate = k; });
  };
  window.addEventListener('keyup', (e) => {
    if (e.key !== ' ') return;
    clearTimeout(spaceTimer);
    spaceTimer = 0;
    if (fast) {
      fast = false;
      setSpeed(1);
    } else {
      master.paused(!master.paused());
      body.classList.toggle('paused', master.paused());
      if (master.paused()) body.classList.remove('hide-cursor');
      showHud();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      // Tap to pause or play; hold to run at 2x until released.
      e.preventDefault();
      if (e.repeat || spaceTimer) return;
      spaceTimer = window.setTimeout(() => {
        fast = true;
        if (master.paused()) { master.play(); body.classList.remove('paused'); }
        setSpeed(2);
      }, 220);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const now = master.time();
      const list = stops();
      const target = e.key === 'ArrowRight'
        ? list.find(([, v]) => v > now + 0.5)
        : list.filter(([, v]) => v < now - 1.5).pop();
      master.seek(target ? target[1] : 0, false);
      showHud();
    } else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    } else if (/^[0-9]$/.test(e.key)) {
      const list = stops();
      const i = e.key === '0' ? 9 : Number(e.key) - 1;
      if (list[i]) goTo(list[i][0]);
    } else if (e.key === 'r' || e.key === 'R') {
      master.restart();
    } else if (e.key === 's' || e.key === 'S') {
      setSpeed(master.timeScale() === 1 ? 3 : 1);
    }
  });

  let idle = 0;
  const wake = () => {
    body.classList.remove('hide-cursor');
    clearTimeout(idle);
    idle = window.setTimeout(() => { if (!master.paused()) body.classList.add('hide-cursor'); }, 2000);
  };
  window.addEventListener('mousemove', wake);
  wake();

  // Keep the TV from sleeping while the loop runs.
  const lock = async () => {
    try { await (navigator as any).wakeLock?.request('screen'); } catch { /* not granted; harmless */ }
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') lock(); });
  lock();
}
