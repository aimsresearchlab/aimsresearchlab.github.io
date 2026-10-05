// The lab as a lit 3D model, for the overhead shot that opens /reel.
//
// From above, the photo has nothing to say (it was taken from eye height at
// the door), so this is a modelled copy of the same room: the dimensions from
// the photo's calibration in lab.ts, the back wall painted by projecting the
// photo onto it (with the things in front of it filled out first), the block
// walls, striped carpet tiles and ceiling lights drawn to match, colours
// sampled from the photo, the lounge (an L-shaped couch, two ottomans, a side
// table), and one workstation (desk, drawer unit, chair, monitor, keyboard)
// at each monitor the photo shows, continued to the front of the room. It
// sits on a light studio ground like an architect's model. The reel
// crossfades from this to the photo view on the way down.
//
// Walls between the camera and the room are cut down to a low stub with a
// dark section on top (a dollhouse cut), so the outline of the room never
// breaks. Furniture is built from boxes merged by material, one mesh per
// material per workstation, to keep the draw count low.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export interface ArchRoom {
  ceil: number; back: number; left: number; right: number;
  front: number; deskTop: number; deskDepth: number; deskEnd: { left: number; right: number };
}
export interface ArchColors {
  floor: THREE.Color; wall: THREE.Color; desk: THREE.Color; couch: THREE.Color;
  paper: THREE.Color; ink: THREE.Color; brand: THREE.Color;
}

/** Workstation positions along each wall: the monitors in the photo, continued to the front. */
export const STATIONS = {
  left: [-5.15, -3.35, -1.55, 0.25],
  right: [-6.68, -4.81, -3.43, -1.85, -0.3],
};

/** The lounge at the back of the room, measured off the photo (metres). */
export const LOUNGE = {
  // The couch along the back wall, z0 at its back, z1 at its seat front.
  couch: { x0: -1.78, x1: 0.95, z0: -9.25, z1: -8.35, seat: 0.45, top: 0.77, backDepth: 0.24 },
  // Its return along the left wall, out to z1.
  chaise: { x0: -1.78, x1: -0.88, z1: -6.8 },
  ottomans: [{ x: -0.42, z: -6.61, s: 0.7, h: 0.48 }, { x: 0.415, z: -6.61, s: 0.7, h: 0.48 }],
  sideTable: { x: 1.175, z: -8.54, s: 0.42, h: 0.46 },
};

const DEG = Math.PI / 180;
type V3 = [number, number, number];

/** Materials for the furniture, shared by both scenes that use it. */
export function furnitureMaterials(desk: THREE.Color) {
  const std = (color: THREE.ColorRepresentation, roughness: number, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    // The photo's desk top reads cream under its lights; the sample is a little dull.
    desk: std(desk.clone().lerp(new THREE.Color(0xe3d8c2), 0.3), 0.55),
    edge: std(desk.clone().lerp(new THREE.Color(0xe3d8c2), 0.3).multiplyScalar(0.82), 0.5),
    metal: std(0xb8babd, 0.42, 0.45),
    steel: std(0x8b8e94, 0.38, 0.6),
    groove: std(0x55585e, 0.6),
    chair: std(0x1b1c1f, 0.78),
    mesh: std(0x2b2d33, 1),
    frame: std(0x1d1e22, 0.45, 0.3), // the lab's monitors are black
    screen: new THREE.MeshStandardMaterial({ color: 0x10151c, roughness: 0.1, metalness: 0.2, emissive: 0x04070c }),
    bezel: std(0x0c0d10, 0.5),
    keys: std(0x2b2c30, 0.7),
    keycap: std(0x15161a, 0.6),
  };
}
type Mats = ReturnType<typeof furnitureMaterials>;

// --------------------------------------------------------------------------
// Merged parts

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
function compose(p: V3, r: V3 = [0, 0, 0], s: V3 = [1, 1, 1]) {
  _e.set(r[0], r[1], r[2], 'YXZ');
  return new THREE.Matrix4().compose(new THREE.Vector3(...p), _q.setFromEuler(_e), new THREE.Vector3(...s));
}

/** Collects geometry placed in a frame, then merges it into one mesh per material. */
class Kit {
  constructor(
    private parts = new Map<THREE.Material, THREE.BufferGeometry[]>(),
    private base = new THREE.Matrix4(),
  ) {}

  /** A child frame sharing this kit's parts. */
  at(p: V3, r: V3 = [0, 0, 0]) {
    return new Kit(this.parts, this.base.clone().multiply(compose(p, r)));
  }

  add(mat: THREE.Material, geo: THREE.BufferGeometry, p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s?: V3) {
    let g = geo;
    if (g.index) { g = geo.toNonIndexed(); geo.dispose(); }
    g.applyMatrix4(this.base.clone().multiply(compose(p, r, s)));
    const list = this.parts.get(mat);
    if (list) list.push(g); else this.parts.set(mat, [g]);
  }

  box(mat: THREE.Material, w: number, h: number, d: number, p: V3, r: V3 = [0, 0, 0], round = 0) {
    const geo = round > 0
      ? new RoundedBoxGeometry(w, h, d, 2, Math.min(round, Math.min(w, h, d) / 2 - 1e-3))
      : new THREE.BoxGeometry(w, h, d);
    this.add(mat, geo, p, r);
  }

  group(shadows = true) {
    const g = new THREE.Group();
    this.parts.forEach((list, mat) => {
      const mesh = new THREE.Mesh(mergeGeometries(list)!, mat);
      mesh.castShadow = shadows;
      mesh.receiveShadow = true;
      g.add(mesh);
    });
    return g;
  }
}

// --------------------------------------------------------------------------
// Furniture

function chair(k: Kit, m: Mats) {
  // Seat and the plate under it.
  k.box(m.chair, 0.5, 0.07, 0.47, [0, 0.46, 0.02], [0, 0, 0], 0.03);
  k.box(m.mesh, 0.42, 0.014, 0.39, [0, 0.497, 0.03], [0, 0, 0], 0.006);
  k.box(m.chair, 0.26, 0.035, 0.26, [0, 0.405, 0], [0, 0, 0], 0.01);
  // Backrest: a black frame around a lighter mesh panel, leaning back a little.
  const tilt: V3 = [-0.13, 0, 0];
  const b = k.at([0, 0.85, -0.25], tilt);
  b.box(m.chair, 0.46, 0.56, 0.034, [0, 0, 0], [0, 0, 0], 0.02);
  b.box(m.mesh, 0.37, 0.45, 0.046, [0, 0.015, 0], [0, 0, 0], 0.01);
  b.box(m.chair, 0.3, 0.07, 0.06, [0, -0.19, -0.035], [0, 0, 0], 0.02);
  k.at([0, 0.57, -0.245], tilt).box(m.chair, 0.05, 0.26, 0.03, [0, 0, 0]);
  // Arms: post, bracket, pad.
  for (const sx of [-1, 1]) {
    k.box(m.chair, 0.028, 0.2, 0.028, [sx * 0.265, 0.58, -0.04]);
    k.box(m.chair, 0.03, 0.03, 0.12, [sx * 0.25, 0.5, -0.06], [0, 0, 0], 0.01);
    k.box(m.chair, 0.065, 0.032, 0.26, [sx * 0.265, 0.695, -0.03], [0, 0, 0], 0.014);
  }
  // Gas lift, its cover, hub, five legs with casters.
  k.add(m.chair, new THREE.CylinderGeometry(0.025, 0.03, 0.22, 12), [0, 0.24, 0]);
  k.add(m.chair, new THREE.CylinderGeometry(0.036, 0.05, 0.1, 12), [0, 0.35, 0]);
  k.add(m.chair, new THREE.CylinderGeometry(0.055, 0.06, 0.05, 12), [0, 0.105, 0]);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    k.box(m.chair, 0.05, 0.03, 0.3, [Math.sin(a) * 0.16, 0.08, Math.cos(a) * 0.16], [0, a, 0], 0.012);
    k.add(m.chair, new THREE.SphereGeometry(0.03, 10, 8), [Math.sin(a) * 0.3, 0.03, Math.cos(a) * 0.3]);
  }
}

function monitor(k: Kit, m: Mats) {
  // Silver all-in-one style: a flat foot, a short neck, a thin frame leaning back.
  k.box(m.frame, 0.24, 0.012, 0.18, [0, 0.006, -0.03], [0, 0, 0], 0.005);
  k.box(m.frame, 0.07, 0.2, 0.022, [0, 0.11, -0.05], [-0.1, 0, 0], 0.006);
  const f = k.at([0, 0.34, -0.012], [-0.07, 0, 0]);
  f.box(m.frame, 0.57, 0.37, 0.034, [0, 0, 0], [0, 0, 0], 0.01);
  f.box(m.frame, 0.4, 0.24, 0.05, [0, -0.01, -0.035], [0, 0, 0], 0.03);
  f.box(m.bezel, 0.55, 0.35, 0.006, [0, 0, 0.0155]);
  f.add(m.screen, new THREE.PlaneGeometry(0.53, 0.32), [0, 0.003, 0.0192]);
}

function keyboard(k: Kit, m: Mats) {
  k.box(m.keys, 0.44, 0.014, 0.14, [0, 0.007, 0], [0, 0, 0], 0.005);
  k.box(m.keycap, 0.4, 0.006, 0.1, [0, 0.016, 0.004], [0, 0, 0], 0.002);
}

function pedestal(k: Kit, m: Mats) {
  // Light grey steel unit, drawers on the aisle face (+X locally).
  k.box(m.metal, 0.42, 0.66, 0.55, [0, 0.36, 0]);
  k.box(m.groove, 0.36, 0.03, 0.48, [0, 0.015, 0]);
  for (const y of [0.14, 0.36, 0.58]) {
    k.box(m.metal, 0.01, 0.205, 0.53, [0.213, y, 0]);
    k.box(m.frame, 0.016, 0.014, 0.3, [0.222, y + 0.075, 0]);
  }
  for (const y of [0.25, 0.47]) k.box(m.groove, 0.004, 0.006, 0.53, [0.216, y, 0]);
}

/** The chair's place and turn at a workstation; `seed` varies it a little. */
function chairSpot(side: -1 | 1, wallX: number, z: number, seed: number) {
  const j = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return {
    x: wallX + -side * (0.98 + j * 0.08),
    z: z + 0.12 + j * 0.1,
    ry: (side < 0 ? -90 : 90) * DEG + j * 14 * DEG,
  };
}

/**
 * One workstation against a side wall: monitor, keyboard and mouse on the
 * desk, the drawer unit under it, the chair pulled up. `side` is -1 for the
 * left wall and +1 for the right; `seed` varies the chair a little.
 */
export function station(m: Mats, side: -1 | 1, wallX: number, z: number, deskTop: number, seed: number) {
  const k = new Kit();
  const d = -side; // into the room
  monitor(k.at([wallX + d * 0.26, deskTop, z], [0, (side < 0 ? 65 : -65) * DEG, 0]), m);
  keyboard(k.at([wallX + d * 0.52, deskTop, z + 0.05], [0, (side < 0 ? 70 : -70) * DEG, 0]), m);
  k.add(m.keys, new THREE.SphereGeometry(0.03, 12, 8), [wallX + d * 0.55, deskTop + 0.012, z + 0.36], [0, 0, 0], [1, 0.45, 1.6]);
  pedestal(k.at([wallX + d * 0.47, 0, z - 0.45], [0, side < 0 ? 0 : Math.PI, 0]), m);
  const c = chairSpot(side, wallX, z, seed);
  chair(k.at([c.x, 0, c.z], [0, c.ry, 0]), m);
  return k.group();
}

/** A desk top run along a wall, with end panels, a rail and a modesty panel, from z0 to z1. */
export function deskRun(m: Mats, side: -1 | 1, wallX: number, z0: number, z1: number, top: number, depth: number) {
  const k = new Kit();
  const d = -side;
  const len = z0 - z1;
  const mid = (z0 + z1) / 2;
  const x = (t: number) => wallX + d * t;
  k.box(m.desk, depth, 0.035, len, [x(depth / 2), top - 0.0175, mid], [0, 0, 0], 0.006);
  // A darker front edge band, so the top reads as a thick laminate board.
  k.box(m.edge, 0.016, 0.037, len - 0.004, [x(depth - 0.008), top - 0.0175, mid], [0, 0, 0], 0.004);
  // Steel front rail under the lip, and a low panel at the wall side.
  k.box(m.steel, 0.02, 0.07, len - 0.06, [x(depth - 0.07), top - 0.07, mid]);
  k.box(m.metal, 0.018, 0.34, len - 0.06, [x(0.04), top - 0.2, mid]);
  for (const z of [z0 - 0.02, z1 + 0.02]) {
    k.box(m.metal, depth - 0.08, top - 0.035, 0.03, [x(depth / 2), (top - 0.035) / 2, z]);
  }
  return k.group();
}

function tv(k: Kit, m: Mats, t: { x: number; y: number; z: number; w: number; h: number }) {
  const glass = new THREE.MeshStandardMaterial({ color: 0x08090c, roughness: 0.1, metalness: 0.3 });
  const bezel = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.3, metalness: 0.3 });
  k.box(bezel, t.w, t.h, 0.045, [t.x, t.y, t.z], [0, 0, 0], 0.008);
  k.add(glass, new THREE.PlaneGeometry(t.w - 0.03, t.h - 0.03), [t.x, t.y, t.z + 0.0235]);
  k.box(bezel, t.w * 0.7, t.h * 0.6, 0.04, [t.x, t.y, t.z - 0.04], [0, 0, 0], 0.01);
  // Stand: two uprights, a cross brace, a base bar, feet, casters.
  for (const dx of [-0.14, 0.07]) {
    k.box(m.chair, 0.05, t.y - 0.05, 0.05, [t.x + dx, (t.y - 0.05) / 2, t.z - 0.07]);
  }
  k.box(m.chair, 0.26, 0.04, 0.03, [t.x - 0.035, t.y + 0.1, t.z - 0.07]);
  k.box(m.chair, 0.26, 0.03, 0.03, [t.x - 0.035, 0.7, t.z - 0.07]);
  k.box(m.chair, 0.9, 0.05, 0.08, [t.x - 0.035, 0.08, t.z - 0.07], [0, 0, 0], 0.01);
  for (const dx of [-0.45, 0.38]) {
    k.box(m.chair, 0.06, 0.04, 0.6, [t.x + dx, 0.07, t.z - 0.07], [0, 0, 0], 0.01);
    for (const dz of [-0.26, 0.26]) k.add(m.chair, new THREE.SphereGeometry(0.035, 10, 8), [t.x + dx, 0.035, t.z - 0.07 + dz]);
  }
}

/** The whiteboard on its wheeled stand in the back right corner, as in the photo. */
export const WHITEBOARD = { x: 2.42, z: -8.95, w: 0.95, h: 0.76, y: 0.85, ry: -0.35 };

function whiteboard(k: Kit, m: Mats) {
  const W = WHITEBOARD;
  const board = new THREE.MeshStandardMaterial({ color: 0xf0f1ef, roughness: 0.35 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe4e6e8, roughness: 0.4, metalness: 0.3 });
  const cy = W.y + W.h / 2;
  const f = k.at([W.x, 0, W.z], [0, W.ry, 0]);
  f.box(board, W.w, W.h, 0.02, [0, cy, 0]);
  f.box(white, W.w + 0.03, 0.025, 0.03, [0, W.y + W.h + 0.006, 0]);
  f.box(white, W.w + 0.03, 0.025, 0.03, [0, W.y - 0.006, 0]);
  for (const sx of [-1, 1]) {
    f.box(white, 0.025, W.h + 0.04, 0.03, [sx * (W.w / 2 + 0.006), cy, 0]);
    // Upright and T-foot on casters.
    f.box(white, 0.03, 0.78 + W.h * 0.25, 0.03, [sx * (W.w / 2 + 0.03), (0.78 + W.h * 0.25) / 2 + 0.06, -0.01]);
    f.box(white, 0.03, 0.03, 0.55, [sx * (W.w / 2 + 0.03), 0.075, -0.01]);
    for (const dz of [-0.26, 0.24]) {
      f.add(m.chair, new THREE.SphereGeometry(0.035, 10, 8), [sx * (W.w / 2 + 0.03), 0.035, -0.01 + dz]);
    }
  }
  f.box(white, W.w, 0.03, 0.07, [0, W.y + 0.015, 0.04]);
  f.box(m.chair, 0.1, 0.12, 0.03, [0.34, W.y + W.h - 0.12, 0.03], [0, 0, 0], 0.01);
}

/** The L-shaped couch, the ottomans and the side table: soft grey fabric blocks. */
function lounge(k: Kit, fabric: THREE.Material, seam: THREE.Material, dark: THREE.Material) {
  const { couch: c, chaise: ch, ottomans, sideTable: t } = LOUNGE;
  const base = 0.3;
  // Main run: plinth, three seat cushions, three back cushions, an arm at the open end.
  const seatZ0 = c.z0 + c.backDepth, seatD = c.z1 - seatZ0;
  k.box(fabric, c.x1 - ch.x1 - 0.02, base, seatD, [(ch.x1 + c.x1) / 2, base / 2, seatZ0 + seatD / 2], [0, 0, 0], 0.03);
  const runW = c.x1 - 0.16 - ch.x1;
  for (let i = 0; i < 3; i++) {
    const w = runW / 3;
    const x = ch.x1 + w * (i + 0.5);
    k.box(fabric, w - 0.012, c.seat - base, seatD - 0.02, [x, (base + c.seat) / 2, seatZ0 + seatD / 2 + 0.01], [0, 0, 0], 0.05);
    k.box(fabric, w - 0.012, c.top - c.seat + 0.02, c.backDepth, [x, (c.seat + c.top) / 2, c.z0 + c.backDepth / 2], [-0.06, 0, 0], 0.05);
  }
  k.box(fabric, 0.16, 0.6, seatD + c.backDepth, [c.x1 - 0.08, 0.3, c.z0 + (seatD + c.backDepth) / 2], [0, 0, 0], 0.04);
  // The return along the left wall: corner seat, then two seats out to the chaise end.
  const rx0 = ch.x0 + c.backDepth, rw = ch.x1 - rx0;
  k.box(fabric, ch.x1 - ch.x0, base, ch.z1 - c.z0, [(ch.x0 + ch.x1) / 2, base / 2, (c.z0 + ch.z1) / 2], [0, 0, 0], 0.03);
  const runD = ch.z1 - seatZ0;
  for (let i = 0; i < 3; i++) {
    const d = runD / 3;
    const z = seatZ0 + d * (i + 0.5);
    k.box(fabric, rw - 0.02, c.seat - base, d - 0.012, [rx0 + rw / 2 + 0.01, (base + c.seat) / 2, z], [0, 0, 0], 0.05);
  }
  for (let i = 0; i < 3; i++) {
    const d = (ch.z1 - c.z0) / 3;
    const z = c.z0 + d * (i + 0.5);
    k.box(fabric, c.backDepth, c.top - c.seat + 0.02, d - 0.012, [ch.x0 + c.backDepth / 2, (c.seat + c.top) / 2, z], [0, 0, 0.06], 0.05);
  }
  k.box(seam, c.x1 - ch.x0 - 0.04, 0.02, 0.02, [(ch.x0 + c.x1) / 2, 0.012, c.z1 - 0.012]);
  // Ottomans: a cube with a slightly domed top cushion.
  for (const o of ottomans) {
    k.box(fabric, o.s, o.h - 0.08, o.s, [o.x, (o.h - 0.08) / 2, o.z], [0, 0, 0], 0.04);
    k.box(fabric, o.s - 0.01, 0.1, o.s - 0.01, [o.x, o.h - 0.05, o.z], [0, 0, 0], 0.045);
  }
  k.box(dark, t.s, t.h, t.s, [t.x, t.h / 2, t.z], [0, 0, 0], 0.01);
}

// --------------------------------------------------------------------------
// Textures

const hex = (c: THREE.Color) => `#${c.getHexString()}`;

/** Carpet tiles as in the photo: charcoal, 24 inch, each with bands of pale stripes running across the last. */
function carpet() {
  const N = 2048;
  const T = N / 4;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d')!;
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const tone = (v: number) => `rgb(${Math.round(v)},${Math.round(v * 0.96)},${Math.round(v * 1.0)})`;
  for (let ty = 0; ty < 4; ty++) {
    for (let tx = 0; tx < 4; tx++) {
      const x0 = tx * T, y0 = ty * T;
      const across = (tx + ty) % 2 === 0;
      const base = 64 + (rnd() - 0.5) * 8;
      g.fillStyle = tone(base);
      g.fillRect(x0, y0, T, T);
      g.save();
      g.beginPath();
      g.rect(x0, y0, T, T);
      g.clip();
      // Fine pile texture first, then bands of two to five pale stripes.
      for (let i = 0; i < 900; i++) {
        g.fillStyle = tone(base + (rnd() - 0.5) * 26);
        g.globalAlpha = 0.35;
        const p = rnd() * T, q = rnd() * T, len = 6 + rnd() * 30;
        if (across) g.fillRect(x0 + q, y0 + p, len, 1.5); else g.fillRect(x0 + p, y0 + q, 1.5, len);
      }
      let p = rnd() * 30;
      while (p < T) {
        const n = 2 + Math.floor(rnd() * 4);
        for (let k = 0; k < n; k++) {
          const w = 2 + rnd() * 3;
          g.fillStyle = tone(150 + rnd() * 30);
          g.globalAlpha = 0.55 + rnd() * 0.3;
          // Stripes run the length of the tile with the odd break.
          let q = 0;
          while (q < T) {
            const seg = 60 + rnd() * T;
            if (across) g.fillRect(x0 + q, y0 + p, seg, w); else g.fillRect(x0 + p, y0 + q, w, seg);
            q += seg + (rnd() < 0.3 ? 10 + rnd() * 40 : 0);
          }
          p += w + 3 + rnd() * 5;
        }
        p += 18 + rnd() * 45;
      }
      g.restore();
      // Tile joint.
      g.globalAlpha = 0.5;
      g.fillStyle = tone(38);
      g.fillRect(x0, y0, T, 2);
      g.fillRect(x0, y0, 2, T);
      g.globalAlpha = 1;
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Painted concrete block, 16 x 8 inch in running bond: two blocks by four courses, tiling. */
function blockTex(paint: THREE.Color) {
  const W = 1024, H = 1024; // 0.813 m square
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const col = (k: number) => `#${paint.clone().multiplyScalar(k).getHexString()}`;
  g.fillStyle = col(1);
  g.fillRect(0, 0, W, H);
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // Paint over block: the pitted face shows as faint speckle.
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = col(rnd() < 0.5 ? 0.9 : 1.06);
    g.globalAlpha = 0.25;
    g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
  g.globalAlpha = 1;
  const bw = W / 2, bh = H / 4, m = 7;
  for (let r = 0; r < 4; r++) {
    const y = r * bh;
    // Recessed joint: a shadowed line with a lit lower lip.
    g.fillStyle = col(0.78);
    g.fillRect(0, y, W, m);
    g.fillStyle = col(1.07);
    g.fillRect(0, y + m, W, 2);
    const off = r % 2 ? bw / 2 : 0;
    for (let x = off; x < W + bw; x += bw) {
      for (const xx of [x % W, (x % W) - W]) {
        g.fillStyle = col(0.8);
        g.fillRect(xx, y, m, bh);
        g.fillStyle = col(1.06);
        g.fillRect(xx + m, y, 2, bh);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/**
 * Maps a material's texture by world position instead of UVs, so the block
 * pattern stays the same size on every wall and does not squash when a wall
 * is lowered to its stub. `axis` is the wall's horizontal axis.
 */
function worldMapped(mat: THREE.MeshStandardMaterial, axis: 'x' | 'z', size: number) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <map_fragment>', `diffuseColor *= texture2D(map, vec2(vWPos.${axis}, vWPos.y) / ${size.toFixed(4)});`);
  };
  mat.customProgramCacheKey = () => `world-${axis}`;
  return mat;
}

/** Acoustic ceiling tiles, 2 x 4 ft, with the six light panels where the photo has them. */
function ceilingTex(R: ArchRoom) {
  const K = 100;
  const W = Math.ceil((R.right - R.left) * K), H = Math.ceil((R.front - R.back) * K);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ddd9d2';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(120,116,108,0.45)';
  g.lineWidth = 2;
  const X = (x: number) => (x - R.left) * K;
  const Z = (z: number) => (z - R.back) * K;
  for (let x = -1.505; x <= R.right; x += 0.61) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), H); g.stroke(); }
  for (let z = R.back; z <= R.front; z += 1.22) { g.beginPath(); g.moveTo(0, Z(z)); g.lineTo(W, Z(z)); g.stroke(); }
  for (const [x, z] of LIGHTS) {
    g.fillStyle = '#c9c6bf';
    g.fillRect(X(x - 0.305) - 3, Z(z - 0.61) - 3, 0.61 * K + 6, 1.22 * K + 6);
    g.fillStyle = '#fbfbf8';
    g.fillRect(X(x - 0.305) + 4, Z(z - 0.61) + 4, 0.61 * K - 8, 1.22 * K - 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Ceiling light panels (centre x, z), 2 x 4 ft, measured off the photo. */
const LIGHTS: Array<[number, number]> = [[-1.2, -3.5], [-1.2, -5.5], [-1.2, -8.0], [2.35, -3.3], [2.4, -5.5], [2.4, -8.0]];

/**
 * Soft darkening on the floor where things stand and where walls meet it:
 * ambient occlusion baked into a transparent overlay, which the shadow map
 * (one light, hard cutoff) does not give.
 */
function contactTex(R: ArchRoom, tvX: number, tvZ: number) {
  const K = 150;
  const W = Math.ceil((R.right - R.left) * K), H = Math.ceil((R.front - R.back) * K);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const X = (x: number) => (x - R.left) * K;
  const Z = (z: number) => (z - R.back) * K;
  const OFF = 6000;
  const rect = (x0: number, x1: number, z0: number, z1: number, a: number, blur: number) => {
    g.save();
    g.shadowColor = `rgba(0,0,0,${a})`;
    g.shadowBlur = blur * K;
    g.shadowOffsetX = OFF;
    g.fillStyle = '#000';
    g.fillRect(X(x0) - OFF, Z(z0), (x1 - x0) * K, (z1 - z0) * K);
    g.restore();
  };
  const blob = (x: number, z: number, rx: number, rz: number, a: number) => {
    g.save();
    g.translate(X(x), Z(z));
    g.scale(rx * K, rz * K);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    gr.addColorStop(0, `rgba(0,0,0,${a})`);
    gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.45})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  };
  // Wall bases: a band of 0.35 m fading out from each wall.
  const edge = (x0: number, z0: number, x1: number, z1: number, gx: number, gz: number) => {
    const w = Math.abs(gx) > 0 ? 0.35 * K * Math.sign(gx) : 0;
    const h = Math.abs(gz) > 0 ? 0.35 * K * Math.sign(gz) : 0;
    const gr = g.createLinearGradient(X(gx > 0 ? x0 : x1), Z(gz > 0 ? z0 : z1), X(gx > 0 ? x0 : x1) + w, Z(gz > 0 ? z0 : z1) + h);
    gr.addColorStop(0, 'rgba(0,0,0,0.3)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(X(x0), Z(z0), (x1 - x0) * K, (z1 - z0) * K);
  };
  edge(R.left, R.back, R.left + 0.35, R.front, 1, 0);
  edge(R.right - 0.35, R.back, R.right, R.front, -1, 0);
  edge(R.left, R.back, R.right, R.back + 0.35, 0, 1);
  edge(R.left, R.front - 0.35, R.right, R.front, 0, -1);
  // Under the desks, then deeper under the drawer units and chairs.
  for (const side of [-1, 1] as const) {
    const key = side < 0 ? 'left' : 'right';
    const wallX = side < 0 ? R.left : R.right;
    const x0 = side < 0 ? wallX : wallX - R.deskDepth;
    rect(x0, x0 + R.deskDepth, R.deskEnd[key], R.front - 0.15, 0.32, 0.1);
    STATIONS[key].forEach((z, i) => {
      const px = wallX - side * 0.47;
      rect(px - 0.24, px + 0.24, z - 0.45 - 0.3, z - 0.45 + 0.3, 0.38, 0.05);
      const cs = chairSpot(side, wallX, z, i + (side < 0 ? 0 : 10));
      blob(cs.x, cs.z, 0.42, 0.42, 0.42);
    });
  }
  // The lounge, the TV stand and the whiteboard stand.
  const L = LOUNGE;
  rect(L.couch.x0, L.couch.x1, L.couch.z0, L.couch.z1, 0.45, 0.06);
  rect(L.chaise.x0, L.chaise.x1, L.couch.z1, L.chaise.z1, 0.45, 0.06);
  for (const o of L.ottomans) rect(o.x - o.s / 2, o.x + o.s / 2, o.z - o.s / 2, o.z + o.s / 2, 0.45, 0.05);
  rect(L.sideTable.x - 0.21, L.sideTable.x + 0.21, L.sideTable.z - 0.21, L.sideTable.z + 0.21, 0.4, 0.04);
  rect(tvX - 0.5, tvX + 0.43, tvZ - 0.38, tvZ + 0.2, 0.35, 0.05);
  rect(WHITEBOARD.x - 0.55, WHITEBOARD.x + 0.55, WHITEBOARD.z - 0.3, WHITEBOARD.z + 0.25, 0.25, 0.05);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A soft dark pad under the whole model, so it sits on its ground. */
function padTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.shadowColor = 'rgba(0,0,0,1)';
  g.shadowBlur = 60;
  g.shadowOffsetX = 5000;
  g.fillStyle = '#000';
  g.fillRect(150 - 5000, 120, 212, 272);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** The studio backdrop: paper, a little brighter in the middle. */
function backdrop(paper: THREE.Color) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 576;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(512, 250, 40, 512, 300, 720);
  gr.addColorStop(0, `#${paper.clone().lerp(new THREE.Color(0xffffff), 0.45).getHexString()}`);
  gr.addColorStop(1, `#${paper.clone().multiplyScalar(0.8).getHexString()}`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 1024, 576);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The photo with the things that stand in front of the back wall filled out
 * (couch, side table, TV, whiteboard), so the modelled ones are not doubled
 * when it is projected onto the wall. The wall is horizontal bands (blinds,
 * block courses), so each hole is filled by stretching a clean column beside
 * it across, row by row.
 */
function cleanPhoto(photo: HTMLImageElement) {
  const P = document.createElement('canvas');
  P.width = photo.naturalWidth;
  P.height = photo.naturalHeight;
  const p = P.getContext('2d')!;
  p.drawImage(photo, 0, 0);
  const fill = (x0: number, x1: number, y0: number, y1: number, lx: number) =>
    p.drawImage(P, lx, y0, 3, y1 - y0, x0, y0, x1 - x0, y1 - y0);
  fill(286, 566, 394, 482, 567); // the couch, side table and the chair at the left corner
  fill(529, 668, 310, 482, 526); // the TV and its stand, and the whiteboard
  const t = new THREE.CanvasTexture(P);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Paints a surface by projecting a texture out of the photo's camera. */
function projected(map: THREE.Texture, projVP: THREE.Matrix4, tint: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, uProjVP: { value: projVP }, uTint: { value: tint } },
    clipping: true,
    vertexShader: /* glsl */ `
      #include <clipping_planes_pars_vertex>
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <clipping_planes_pars_fragment>
      uniform sampler2D uMap;
      uniform mat4 uProjVP;
      uniform float uTint;
      varying vec3 vWorld;
      void main() {
        #include <clipping_planes_fragment>
        vec4 pc = uProjVP * vec4(vWorld, 1.0);
        vec2 uv = clamp(pc.xy / pc.w * 0.5 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(texture2D(uMap, uv).rgb * uTint, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

// --------------------------------------------------------------------------

/** Height a cut wall is lowered to, and the camera distance over which it rises again. */
const STUB = 0.42;
const RISE = 2.2;

export class Arch {
  readonly scene = new THREE.Scene();
  /** The build plane: everything above it is cut away while the room builds. */
  readonly clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
  private walls: Array<{ mesh: THREE.Mesh; n: THREE.Vector3; p: THREE.Vector3 }> = [];
  private ring = new THREE.Group();
  private ceil: number;

  constructor(
    renderer: THREE.WebGLRenderer,
    photo: HTMLImageElement,
    room: ArchRoom,
    colors: ArchColors,
    projVP: THREE.Matrix4,
    tvBox: { x: number; y: number; z: number; w: number; h: number },
  ) {
    const R = room;
    const S = this.scene;
    this.ceil = R.ceil;
    const pm = new THREE.PMREMGenerator(renderer);
    S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    S.environmentIntensity = 0.45;
    pm.dispose();
    S.background = backdrop(colors.paper);

    const m = furnitureMaterials(colors.desk);
    const section = new THREE.MeshStandardMaterial({ color: 0x2c2d32, roughness: 0.9 });
    // The photo's wall sample sits in the ceiling's shadow; the paint itself is a light cream.
    const paint = colors.wall.clone().lerp(new THREE.Color(0xf1e8d8), 0.45);
    const blocks = blockTex(paint);
    const wallMat = (axis: 'x' | 'z') =>
      worldMapped(new THREE.MeshStandardMaterial({ map: blocks, roughness: 0.92 }), axis, 0.813);
    const floorMat = new THREE.MeshStandardMaterial({ map: carpet(), roughness: 0.97 });
    const width = R.right - R.left + 0.24;
    const depth = R.front - R.back + 0.24;
    floorMat.map!.repeat.set(width / 2.4384, depth / 2.4384);

    const midX = (R.right + R.left) / 2;
    const midZ = (R.front + R.back) / 2;
    // Box face order: +x, -x, +y, -y, +z, -z.
    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 0.14, depth),
      [section, section, floorMat, section, section, section]);
    slab.position.set(midX, -0.07, midZ);
    slab.receiveShadow = true;
    S.add(slab);

    // Shadow-like dark patches on the carpet (contact darkening), just above it.
    const patch = new THREE.Mesh(
      new THREE.PlaneGeometry(R.right - R.left, R.front - R.back),
      new THREE.MeshBasicMaterial({ map: contactTex(R, tvBox.x, tvBox.z), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(midX, 0.003, midZ);
    patch.renderOrder = 1;
    S.add(patch);

    // The ceiling faces down, so it shows only once the camera is inside the room.
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(R.right - R.left, R.front - R.back),
      new THREE.MeshBasicMaterial({ map: ceilingTex(R), color: new THREE.Color(0.8, 0.8, 0.8) }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(midX, R.ceil, midZ);
    S.add(ceiling);

    // Walls: boxes from the floor up, lowered to a stub by update() when the
    // camera is outside them. `inner` is the box face that looks into the room.
    const T = 0.12;
    const wall = (x0: number, x1: number, z0: number, z1: number, n: V3, at: V3) => {
      const face = wallMat(n[0] !== 0 ? 'z' : 'x');
      const mats: THREE.Material[] = [face, face, section, section, face, face];
      const geo = new THREE.BoxGeometry(x1 - x0, R.ceil, z1 - z0);
      geo.translate(0, R.ceil / 2, 0);
      const mesh = new THREE.Mesh(geo, mats);
      mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      S.add(mesh);
      this.walls.push({ mesh, n: new THREE.Vector3(...n), p: new THREE.Vector3(...at) });
      return mesh;
    };
    const xa = R.left - T, xb = R.right + T;
    const back = wall(xa, xb, R.back - T, R.back, [0, 0, 1], [0, 0, R.back]);
    wall(xa, xb, R.front, R.front + T, [0, 0, -1], [0, 0, R.front]);
    wall(R.left - T, R.left, R.back, R.front, [1, 0, 0], [R.left, 0, 0]);
    wall(R.right, R.right + T, R.back, R.front, [-1, 0, 0], [R.right, 0, 0]);

    // The photo, projected onto the back wall's inner face (blinds, sign, the
    // wall below them), with what stands in front of the wall filled out.
    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(R.right - R.left, R.ceil), projected(cleanPhoto(photo), projVP, 0.97));
    backPlane.position.set(midX - back.position.x, R.ceil / 2, T / 2 + 0.002);
    back.add(backPlane);

    // Baseboards along the inner faces (the back wall's is in the photo).
    const bk = new Kit();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x46474b, roughness: 0.7 });
    const bh = 0.08;
    bk.box(baseMat, 0.01, bh, R.front - R.back, [R.left + 0.005, bh / 2, midZ]);
    bk.box(baseMat, 0.01, bh, R.front - R.back, [R.right - 0.005, bh / 2, midZ]);
    bk.box(baseMat, R.right - R.left, bh, 0.01, [midX, bh / 2, R.front - 0.005]);
    S.add(bk.group(false));

    // Desks and the workstations along them.
    for (const side of [-1, 1] as const) {
      const key = side < 0 ? 'left' : 'right';
      const wallX = side < 0 ? R.left : R.right;
      S.add(deskRun(m, side, wallX, R.front - 0.15, R.deskEnd[key], R.deskTop, R.deskDepth));
      STATIONS[key].forEach((z, i) => S.add(station(m, side, wallX, z, R.deskTop, i + (side < 0 ? 0 : 10))));
    }

    // The TV on its stand, the whiteboard, and the lounge.
    const props = new Kit();
    tv(props, m, tvBox);
    whiteboard(props, m);
    const fabric = new THREE.MeshStandardMaterial({ color: colors.couch.clone().multiplyScalar(1.12), roughness: 1 });
    const seam = new THREE.MeshStandardMaterial({ color: colors.couch.clone().multiplyScalar(0.6), roughness: 1 });
    lounge(props, fabric, seam, m.chair);
    S.add(props.group());

    // Ceiling light panels, seen from below on the way in.
    const glowPanel = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const [x, z] of LIGHTS) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 1.18), glowPanel);
      panel.rotation.x = Math.PI / 2;
      panel.position.set(x, R.ceil - 0.004, z);
      S.add(panel);
    }

    // The ground the model stands on: a faint grid in ink fading into the
    // paper backdrop, and a soft pad of shadow under the room.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uInk: { value: colors.ink } },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk;
        varying vec3 vWorld;
        void main() {
          vec2 gc = vWorld.xz;
          vec2 g = abs(fract(gc - 0.5) - 0.5) / fwidth(gc);
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          float r = length(vWorld.xz - vec2(0.5, -4.0));
          float a = line * 0.09 * smoothstep(16.0, 5.0, r);
          gl_FragColor = vec4(uInk, a);
        }
      `,
    }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0.5, -0.141, -4.0);
    ground.renderOrder = -2;
    S.add(ground);
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 2.1, depth * 1.7),
      new THREE.MeshBasicMaterial({ map: padTex(), color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(midX, -0.139, midZ);
    pad.renderOrder = -1;
    S.add(pad);

    // The line that sweeps up the walls as the room builds, in the brand blue.
    const glow = new THREE.MeshBasicMaterial({ color: colors.brand, toneMapped: false });
    const x0 = R.left - T, x1 = R.right + T, z0 = R.back - T, z1 = R.front + T;
    for (const [w, d, x, z] of [
      [x1 - x0, 0.03, (x0 + x1) / 2, z0], [x1 - x0, 0.03, (x0 + x1) / 2, z1],
      [0.03, z1 - z0, x0, (z0 + z1) / 2], [0.03, z1 - z0, x1, (z0 + z1) / 2],
    ]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), glow);
      bar.position.set(x, 0, z);
      this.ring.add(bar);
    }
    S.add(this.ring);

    // Light: sky from above, one sun-like key for soft shadows, and daylight
    // through the blinds on the back wall.
    S.add(new THREE.HemisphereLight(0xfffaf2, 0x6c665e, 1.0));
    const key = new THREE.DirectionalLight(0xfff3e2, 1.5);
    key.position.set(2.8, 10, 3.5);
    key.target.position.set(0.5, 0, -4.0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 5;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    S.add(key, key.target);
    RectAreaLightUniformsLib.init();
    const window = new THREE.RectAreaLight(0xfff6ea, 3.2, 4.4, 1.2);
    window.position.set(0.48, 1.55, R.back + 0.05);
    window.lookAt(0.48, 1.2, 0);
    S.add(window);

    // Everything is clipped by the build plane.
    S.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || o === ground || o === pad || this.ring.children.includes(o)) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      list.forEach((mt) => { mt.clippingPlanes = [this.clip]; });
    });
  }

  /**
   * Raises the room to `build` (0 to 1) and lowers the walls between the
   * camera and the room to a stub. How far each wall stands depends smoothly
   * on how far the camera is inside its plane, so nothing pops mid-orbit.
   */
  update(camera: THREE.Camera, build: number) {
    const h = build * 3.25 - 0.05;
    this.clip.constant = build >= 0.999 ? 100 : h;
    this.ring.position.y = h;
    this.ring.visible = build > 0.001 && build < 0.999;
    const cp = camera.position;
    const d = new THREE.Vector3();
    for (const w of this.walls) {
      const s = w.n.dot(d.subVectors(cp, w.p));
      const f = THREE.MathUtils.smoothstep(s, 0, RISE);
      w.mesh.scale.y = THREE.MathUtils.lerp(STUB, this.ceil, f) / this.ceil;
    }
  }
}
