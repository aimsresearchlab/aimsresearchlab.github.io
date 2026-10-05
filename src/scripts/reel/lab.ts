// The lab room for /reel, rebuilt in 3D from a single photograph.
//
// How it works: the room is a handful of boxes and planes (floor, walls,
// ceiling, desks, monitors, the couch, the TV) placed where the photo says
// they are, and every one of them is painted by projecting
// public/reel/room.webp back out of the photo's own camera. Seen from that
// camera the render is the photograph; moved away from it, the geometry gives
// real parallax. Surfaces the photo never saw (behind a monitor, outside the
// frame) fall back to a colour averaged from the photo, and the posters are
// ordinary textured planes hung over the real ones on the side walls.
//
// Calibration, measured off the 1024x768 photo: three vanishing points (down
// the room, across it, and vertical) give a focal length of 742 px with the
// principal point at the centre, and the camera's turn: about 5.5 degrees to
// the right, 3 down, and 1.2 of roll. The 24 inch carpet tiles and the 65 inch
// TV both put the camera 1.45 m above the floor. The rest follows: back wall
// 9.3 m away, side walls at -1.85 and +2.9 m, ceiling 2.86 m, desks 0.74 m
// tall and 0.78 m deep.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { Arch, STATIONS, LOUNGE, furnitureMaterials, station, deskRun } from './arch';

const DEG = Math.PI / 180;

export const PHOTO = { src: '/reel/room.webp', w: 1024, h: 768, cx: 512, cy: 384, f: 742 };
/** The photo camera's view direction and up, in room coordinates. */
const PHOTO_FWD = new THREE.Vector3(0.09575, -0.04961, -0.99417);
const PHOTO_UP = new THREE.Vector3(-0.0168, 0.99853, -0.05145);
export const EYE = 1.45;
export const ROOM = {
  ceil: 2.86,
  back: -9.3,
  left: -1.85,
  right: 2.9,
  front: 1.2,
  deskTop: 0.74,
  deskDepth: 0.78,
  // Where each desk run ends down the room, and where the photo's view of it
  // starts; nearer than that the desks are modelled.
  deskEnd: { left: -5.65, right: -7.2 },
  deskStart: { left: -1.7, right: -2.4 },
};
// The TV's outline in the photo at the depth where it measures 65 inches.
export const TV = { x: 1.796, y: 1.396, z: -8.6, w: 1.41, h: 0.81 };
/** The posters cover the real ones in the photo, which are landscape. */
export const POSTER = { w: 1.3, h: 1.0, y: 2.03 };

/** Where the camera is, what it looks at, and its lens. */
export interface Pose {
  x: number; y: number; z: number;
  tx: number; ty: number; tz: number;
  fov: number;   // vertical field of view if the lens were not shifted
  shift: number; // lens shift, fraction of frame height; >0 puts the horizon above centre
  roll?: number; // radians about the view axis; only the photo's own view has any
}

/** The photo's own view, cropped to 16:9: rows 96 to 672 of the photo. */
export const PHOTO_POSE: Pose = {
  x: 0, y: EYE, z: 0,
  tx: PHOTO_FWD.x * 10, ty: EYE + PHOTO_FWD.y * 10, tz: PHOTO_FWD.z * 10,
  fov: 2 * Math.atan(288 / PHOTO.f) / DEG,
  shift: 0,
  roll: 0.02166,
};

export interface PosterInfo {
  slug: string;
  wall: 'left' | 'right';
  z: number;
  kicker: string;
  title: string;
  claim: string;
  cover?: string;
  qr?: string;
  venue: string;
}

/** The wall a poster hangs on: its plane x and the direction into the room. */
export function posterWall(p: { wall: 'left' | 'right'; z: number }) {
  if (p.wall === 'right') return { x: ROOM.right - 0.012, n: -1 };
  return { x: ROOM.left + 0.012, n: 1 };
}

/** Standing back from a poster, the whole sheet in frame. */
export function posterHold(p: { wall: 'left' | 'right'; z: number }): Pose {
  const { x, n } = posterWall(p);
  return { x: x + n * 2.0, y: 1.88, z: p.z + 0.32, tx: x, ty: POSTER.y, tz: p.z, fov: 36, shift: 0 };
}

/** Close on the figure, where the scene takes over. */
export function posterClose(p: { wall: 'left' | 'right'; z: number }): Pose {
  const { x, n } = posterWall(p);
  return { x: x + n * 0.42, y: 2.06, z: p.z + 0.02, tx: x, ty: 2.06, tz: p.z, fov: 36, shift: 0 };
}

/** High over the room, the ceiling cut away, and the far side of the orbit. */
export const BIRD_A: Pose = { x: 8.1, y: 12.5, z: 7.4, tx: 0.5, ty: 0.2, tz: -4.1, fov: 36, shift: 0 };
export const BIRD_B: Pose = { x: -6.1, y: 10.8, z: 6.7, tx: 0.5, ty: 0.3, tz: -4.1, fov: 36, shift: 0 };

// The TV stands to the right of the aisle, so the camera comes at it a little from the left.
export const TV_HOLD: Pose = { x: 1.2, y: 1.45, z: -5.9, tx: TV.x, ty: TV.y, tz: TV.z, fov: 36, shift: 0 };
export const TV_CLOSE: Pose = { x: TV.x, y: TV.y, z: TV.z + 0.75, tx: TV.x, ty: TV.y, tz: TV.z, fov: 36, shift: 0 };

// --------------------------------------------------------------------------
// Shaders

const projVert = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vN;
  varying vec2 vUv;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// Paints a surface from the photo when the photo's camera could see it, and
// with the surface's own average colour (plus a little grain) when it could not.
const projFrag = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform sampler2D uDepth;
  uniform mat4 uProjVP;
  uniform vec3 uBase;
  uniform float uNear;
  uniform float uFar;
  uniform float uKey;
  uniform float uBlock; // > 0: a side wall; its unseen parts get the photo's block courses
  uniform float uJoint; // z of a vertical joint in an even course
  varying vec3 vWorld;

  float lin(float d) {
    float z = d * 2.0 - 1.0;
    return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));
  }
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  // Painted block in running bond, lined up with the joints in the photo:
  // courses 0.195 m tall from y = 0.155, blocks 0.39 m long.
  vec3 blockWall(vec3 base) {
    float c = (vWorld.y - 0.155) / 0.195;
    float row = floor(c);
    float fy = fract(c);
    float s = (vWorld.z - uJoint) / 0.39 + (mod(row, 2.0) > 0.5 ? 0.5 : 0.0);
    float fx = fract(s);
    float joint = max(1.0 - smoothstep(0.0, 0.035, fy), 1.0 - smoothstep(0.0, 0.018, fx));
    float lip = smoothstep(0.035, 0.06, fy) * (1.0 - smoothstep(0.06, 0.09, fy));
    float pits = 0.96 + 0.08 * hash(floor(vWorld * 260.0));
    return base * pits * (1.0 - 0.16 * joint + 0.04 * lip);
  }

  void main() {
    vec3 col = uBase * (0.975 + 0.05 * hash(floor(vWorld * 90.0)));
    if (uBlock > 0.5) col = blockWall(uBase);
    vec4 pc = uProjVP * vec4(vWorld, 1.0);
    if (pc.w > 0.0) {
      vec3 ndc = pc.xyz / pc.w;
      vec2 uv = ndc.xy * 0.5 + 0.5;
      float e = 0.045;
      float inside = smoothstep(0.0, e, uv.x) * smoothstep(0.0, e, 1.0 - uv.x)
                   * smoothstep(0.0, e * 2.5, uv.y) * smoothstep(0.0, e * 2.5, 1.0 - uv.y);
      if (inside > 0.0) {
        float dScene = lin(texture2D(uDepth, uv).r);
        float dFrag = lin(ndc.z * 0.5 + 0.5);
        float vis = 1.0 - smoothstep(0.012, 0.045, (dFrag - dScene) / dFrag);
        vec3 ph = texture2D(uPhoto, uv).rgb;
        // A monitor card is cut to the monitor's box; the light wall and desk
        // around the dark monitor are keyed out so they do not float.
        if (uKey > 0.5 && vis * inside > 0.5 && dot(ph, vec3(0.2126, 0.7152, 0.0722)) > 0.36) discard;
        // Where something stood in front, the photo shows that thing instead;
        // half of it, dimmed, blends in better than a flat colour, since what
        // hides a surface is usually the furniture beside it.
        vec3 hidden = mix(col, ph * 0.85, 0.55);
        col = mix(col, mix(hidden, ph, vis), inside);
      }
    }
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

// Crossfades the photo view (tDiffuse) with the overhead model (tArch).
const mixShader = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, tArch: { value: null as THREE.Texture | null }, uMix: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse, tArch;
    uniform float uMix;
    varying vec2 vUv;
    void main() { gl_FragColor = mix(texture2D(tDiffuse, vUv), texture2D(tArch, vUv), uMix); }
  `,
};

// A poster sheet: lit a little brighter at the top like the ceiling lights
// would, with a faint sheen that moves with the camera, and a dissolve for
// the moment the posters appear.
const posterVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const posterFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uExposure;
  uniform vec3 uGlow;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying vec3 vNormal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    float n = noise(vUv * vec2(9.0, 12.0)) * 0.6 + noise(vUv * 40.0) * 0.4;
    float edge = uReveal * 1.25 - 0.1;
    if (n > edge) discard;
    vec3 c = texture2D(uMap, vUv).rgb * uExposure;
    c *= 0.9 + 0.12 * vUv.y;
    vec3 v = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(v, vNormal), 0.0), 3.0);
    float sweep = smoothstep(0.35, 0.0, abs(vUv.x + vUv.y * 0.45 - (v.z * 0.8 + 0.7)));
    c += vec3(0.05) * fres + vec3(0.025) * sweep;
    c += uGlow * smoothstep(edge - 0.06, edge, n) * 2.2;
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

const gradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1920, 1080) },
    uVignette: { value: 0.32 },
    uGrain: { value: 0.022 },
    uFade: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uGrain, uFade;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5;
      float r2 = dot(d, d);
      vec3 c;
      c.r = texture2D(tDiffuse, vUv - d * 0.0016).r;
      c.g = texture2D(tDiffuse, vUv).g;
      c.b = texture2D(tDiffuse, vUv + d * 0.0016).b;
      c *= 1.0 - uVignette * smoothstep(0.08, 0.5, r2);
      vec3 k = clamp(c, 0.0, 1.0);
      c += (k * k * (3.0 - 2.0 * k) - k) * 0.18;
      c += (hash(floor(vUv * uRes) + fract(uTime * 0.37) * 91.0) - 0.5) * uGrain;
      gl_FragColor = vec4(c * uFade, 1.0);
    }
  `,
};

// --------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

/** Average colour of a rectangle of the photo, as a linear THREE.Color. */
function sampler(img: HTMLImageElement) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  return (x: number, y: number, w: number, h: number) => {
    const d = g.getImageData(x, y, w, h).data;
    let r = 0, gg = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4;
    return new THREE.Color().setRGB(r / n / 255, gg / n / 255, b / n / 255, THREE.SRGBColorSpace);
  };
}

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Applies a pose's lens (field of view plus vertical shift) to a camera. */
export function applyLens(cam: THREE.PerspectiveCamera, fov: number, shift: number, aspect: number) {
  const f = 0.5 / Math.tan((fov * DEG) / 2);
  const yp = 0.5 - shift; // principal point, from the top, in frame heights
  const fh = 2 * Math.max(yp, 1 - yp);
  cam.fov = (2 * Math.atan(fh / 2 / f)) / DEG;
  cam.aspect = aspect / fh;
  cam.setViewOffset(aspect * 1000, fh * 1000, 0, (fh / 2 - yp) * 1000, aspect * 1000, 1000);
  cam.updateProjectionMatrix();
}

export interface LabColors {
  navy: string; brand: string; gold: string; ink: string; inkSoft: string; surface: string; paper: string;
}

export class Lab {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.03, 60);
  readonly pose: Pose = { ...PHOTO_POSE };
  /** 0 = posters absent, 1 = hung. Tweened by the timeline. */
  /** model: 1 shows the overhead model (arch.ts), 0 the photo room; build raises it. */
  readonly fx = { posters: 0, tv: 0, fade: 1, sway: 1, model: 0, build: 1 };
  private arch!: Arch;
  private archRT!: THREE.WebGLRenderTarget;
  private archComposer!: EffectComposer;
  private gtao!: GTAOPass;
  private projCam!: THREE.PerspectiveCamera;
  private projVP!: THREE.Matrix4;
  private renderPass!: RenderPass;
  private mixPass!: ShaderPass;
  private empty = new THREE.Scene();

  private composer!: EffectComposer;
  private grade!: ShaderPass;
  private bloom!: UnrealBloomPass;
  private room = new THREE.Group();
  private posters = new THREE.Group();
  private posterMats: THREE.ShaderMaterial[] = [];
  private dust!: THREE.Points;
  private tvCanvas = document.createElement('canvas');
  private tvTex!: THREE.CanvasTexture;
  private tvMat!: THREE.MeshBasicMaterial;
  private tvLogo?: HTMLImageElement;
  private tvTitle = '';
  private t0 = performance.now();
  private aspect = 16 / 9;

  constructor(private canvas: HTMLCanvasElement, private colors: LabColors) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.localClippingEnabled = true;
  }

  async init(posters: PosterInfo[]) {
    const [photo, logo] = await Promise.all([loadImage(PHOTO.src), loadImage('/logo-mark-light.svg')]);
    this.tvLogo = logo;
    const tex = new THREE.Texture(photo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.needsUpdate = true;

    const C = this.buildRoom(tex, sampler(photo));
    const tok = (c: string) => new THREE.Color(c);
    this.arch = new Arch(this.renderer, photo, ROOM,
      { floor: C.floor, wall: C.rightWall, desk: C.desk, couch: C.couch, paper: tok(this.colors.paper), ink: tok(this.colors.ink), brand: tok(this.colors.brand) },
      this.projVP, TV);
    this.buildTv();
    this.buildDust();
    await this.buildPosters(posters);

    this.scene.add(this.room, this.posters);
    this.scene.background = new THREE.Color(0x000000);
    this.archRT = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: 4 });
    // The overhead model has its own chain: the render, then ambient
    // occlusion, which is most of what makes a model read as solid. Its
    // result is mixed into the main chain below.
    this.archComposer = new EffectComposer(this.renderer, this.archRT);
    this.archComposer.renderToScreen = false;
    this.archComposer.addPass(new RenderPass(this.arch.scene, this.camera));
    this.gtao = new GTAOPass(this.arch.scene, this.camera, 16, 16);
    this.gtao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.2, thickness: 0.8, scale: 1.2, samples: 16 });
    this.gtao.updatePdMaterial({ radius: 6, rings: 2, samples: 16 });
    this.gtao.blendIntensity = 1.0;
    // The model is cut by a build plane; the occlusion pass must cut with it.
    this.gtao.normalMaterial.clippingPlanes = [this.arch.clip];
    this.archComposer.addPass(this.gtao);

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    this.mixPass = new ShaderPass(mixShader);
    this.composer.addPass(this.mixPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1920, 1080), 0.26, 0.55, 0.9);
    this.composer.addPass(this.bloom);
    this.grade = new ShaderPass(gradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
    this.resize();
  }

  // ---- room ---------------------------------------------------------------

  private buildRoom(photo: THREE.Texture, avg: ReturnType<typeof sampler>) {
    const R = ROOM;
    // The photo's camera: full frame, principal point at the centre.
    const proj = new THREE.PerspectiveCamera((2 * Math.atan(PHOTO.h / 2 / PHOTO.f)) / DEG, PHOTO.w / PHOTO.h, 0.05, 40);
    proj.position.set(0, EYE, 0);
    proj.up.copy(PHOTO_UP);
    proj.lookAt(PHOTO_FWD.clone().add(proj.position));
    proj.updateMatrixWorld();
    proj.updateProjectionMatrix();
    this.projCam = proj;

    /** Where the photo's ray through pixel (u, v) meets the plane `axis` = value. */
    const ray = (u: number, v: number) =>
      new THREE.Vector3((u / PHOTO.w) * 2 - 1, 1 - (v / PHOTO.h) * 2, 0.5).unproject(proj).sub(proj.position).normalize();
    const hit = (u: number, v: number, n: THREE.Vector3, p: THREE.Vector3) => {
      const d = ray(u, v);
      const t = n.dot(p.clone().sub(proj.position)) / n.dot(d);
      return proj.position.clone().addScaledVector(d, t);
    };
    const onY = (u: number, v: number, y: number) => hit(u, v, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, y, 0));

    const depthRT = new THREE.WebGLRenderTarget(PHOTO.w, PHOTO.h, {
      depthTexture: new THREE.DepthTexture(PHOTO.w, PHOTO.h, THREE.FloatType),
    });

    const projVP = new THREE.Matrix4().multiplyMatrices(proj.projectionMatrix, proj.matrixWorldInverse);
    this.projVP = projVP;
    const mat = (base: THREE.Color, key = false, joint?: number) =>
      new THREE.ShaderMaterial({
        vertexShader: projVert,
        fragmentShader: projFrag,
        uniforms: {
          uPhoto: { value: photo },
          uDepth: { value: depthRT.depthTexture },
          uProjVP: { value: projVP },
          uBase: { value: base },
          uNear: { value: proj.near },
          uFar: { value: proj.far },
          uKey: { value: key ? 1 : 0 },
          uBlock: { value: joint === undefined ? 0 : 1 },
          uJoint: { value: joint ?? 0 },
        },
        side: THREE.DoubleSide,
      });

    // Fallback colours, each averaged from a patch of the photo showing that surface.
    const C = {
      floor: avg(300, 600, 400, 160),
      ceiling: avg(400, 20, 250, 60),
      leftWall: avg(0, 370, 55, 80),
      rightWall: avg(852, 110, 150, 50),
      back: avg(600, 240, 50, 40),
      desk: avg(100, 512, 100, 25),
      under: avg(830, 520, 40, 60),
      monitor: avg(80, 420, 60, 60),
      tv: avg(560, 330, 80, 50),
      couch: avg(400, 440, 100, 25),
      ottoman: avg(360, 470, 60, 35),
    };

    const add = (geo: THREE.BufferGeometry, base: THREE.Color, at: [number, number, number], rotY = 0, rotX = 0, key = false) => {
      const m = new THREE.Mesh(geo, mat(base, key));
      m.position.set(...at);
      m.rotation.set(rotX, rotY, 0, 'YXZ');
      this.room.add(m);
      return m;
    };
    /** A box between two corners. */
    const block = (base: THREE.Color, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
      add(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), base, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]);
    const depthZ = R.front - R.back;
    const midZ = (R.front + R.back) / 2;
    const widthX = R.right - R.left;
    const midX = (R.right + R.left) / 2;

    // Shell
    add(new THREE.PlaneGeometry(widthX, depthZ), C.floor, [midX, 0, midZ], 0, -Math.PI / 2);
    add(new THREE.PlaneGeometry(widthX, depthZ), C.ceiling, [midX, R.ceil, midZ], 0, Math.PI / 2);
    add(new THREE.PlaneGeometry(widthX, R.ceil), C.back, [midX, R.ceil / 2, R.back]);
    // Side walls: where the photo does not reach, block courses lined up
    // with its own (the joint positions are measured off the photo).
    const wallPlane = (x: number, base: THREE.Color, joint: number, rotY: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(depthZ, R.ceil), mat(base, false, joint));
      m.position.set(x, R.ceil / 2, midZ);
      m.rotation.y = rotY;
      this.room.add(m);
    };
    wallPlane(R.left, C.leftWall, -3.379, Math.PI / 2);
    wallPlane(R.right, C.rightWall, -4.323 + 0.195, -Math.PI / 2);

    // Desks: a top slab along each side wall, and a plane where the chairs
    // and drawer units stand, which is what the photo shows under the desk.
    for (const side of [-1, 1] as const) {
      const key = side < 0 ? 'left' : 'right';
      const wallX = side < 0 ? R.left : R.right;
      const z0 = R.deskStart[key], z1 = R.deskEnd[key];
      const deskLen = z0 - z1;
      const deskZ = (z0 + z1) / 2;
      const topX = wallX - side * (R.deskDepth / 2);
      add(new THREE.BoxGeometry(R.deskDepth, 0.035, deskLen), C.desk, [topX, R.deskTop - 0.0175, deskZ]);
      const underX = wallX - side * (R.deskDepth + 0.24);
      add(new THREE.PlaneGeometry(deskLen, R.deskTop - 0.035), C.under,
        [underX, (R.deskTop - 0.035) / 2, deskZ], side < 0 ? Math.PI / 2 : -Math.PI / 2);
      add(new THREE.PlaneGeometry(R.deskDepth, R.deskTop), C.under,
        [wallX - side * R.deskDepth / 2, R.deskTop / 2, z1]);
    }

    // Monitors: each a flat card square to the photo's view, cut to the
    // monitor's box in the photo and stood where its foot meets the desk.
    // Facing the projector, a card shows the monitor itself from any nearby
    // view, and the wall behind it falls back to the wall colour.
    const monitors: Array<[number, number, number, number, number]> = [
      // u0, v0, u1, v1 (box in the photo), v of the foot on the desk
      [64, 402, 156, 500, 502],
      [200, 386, 236, 442, 446],
      [709, 385, 757, 427, 428],
      [796, 395, 865, 457, 458],
      [960, 420, 1040, 498, 500],
    ];
    for (const [u0, v0, u1, v1, vb] of monitors) {
      const foot = onY((u0 + u1) / 2, vb, R.deskTop);
      const n = PHOTO_FWD.clone().setY(0).normalize();
      const c = [hit(u0, v0, n, foot), hit(u1, v0, n, foot), hit(u0, v1, n, foot), hit(u1, v1, n, foot)];
      const geo = new THREE.BufferGeometry().setFromPoints([c[0], c[2], c[1], c[1], c[2], c[3]]);
      geo.computeVertexNormals();
      add(geo, C.monitor, [0, 0, 0], 0, 0, true).userData.card = true;
    }

    // The TV on its stand, in front of the back wall: the front face is
    // painted from the photo, the rest is the black of the set itself, since
    // the photo sees its edges only as a sliver of the blinds behind.
    const black = new THREE.MeshBasicMaterial({ color: C.tv.clone().multiplyScalar(0.5) });
    const tvBox = new THREE.Mesh(new THREE.BoxGeometry(TV.w, TV.h, 0.06),
      [black, black, black, black, mat(C.tv), black]);
    tvBox.position.set(TV.x, TV.y, TV.z);
    this.room.add(tvBox);
    for (const x of [1.68, 1.89]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.045, TV.y - TV.h / 2, 0.045), black);
      post.position.set(x, (TV.y - TV.h / 2) / 2, TV.z - 0.06);
      this.room.add(post);
    }

    // The lounge at the back: the L-shaped couch, two ottomans, the side table.
    const L = LOUNGE;
    block(C.couch, L.couch.x0, L.couch.x1, 0, L.couch.seat, L.couch.z0, L.couch.z1);
    block(C.couch, L.couch.x0, L.couch.x1, L.couch.seat, L.couch.top, L.couch.z0, L.couch.z0 + L.couch.backDepth);
    block(C.couch, L.chaise.x0, L.chaise.x1, 0, L.couch.seat, L.couch.z1, L.chaise.z1);
    block(C.couch, L.chaise.x0, L.chaise.x0 + L.couch.backDepth, L.couch.seat, L.couch.top, L.couch.z1, L.chaise.z1);
    for (const o of L.ottomans) block(C.ottoman, o.x - o.s / 2, o.x + o.s / 2, 0, o.h, o.z - o.s / 2, o.z + o.s / 2);
    const st = L.sideTable;
    block(C.couch, st.x - st.s / 2, st.x + st.s / 2, 0, st.h, st.z - st.s / 2, st.z + st.s / 2);

    // Depth of everything the photo saw, from the photo's camera, once.
    // A throwaway scene with a plain override material, so the pass does not
    // sample the depth texture it is writing. Monitor cards are left out, so
    // the wall behind keeps the photo where a card is keyed out.
    const depthScene = new THREE.Scene();
    depthScene.overrideMaterial = new THREE.MeshBasicMaterial();
    depthScene.add(this.room);
    const cards = this.room.children.filter((o) => o.userData.card);
    cards.forEach((o) => { o.visible = false; });
    this.renderer.setRenderTarget(depthRT);
    this.renderer.render(depthScene, proj);
    this.renderer.setRenderTarget(null);
    cards.forEach((o) => { o.visible = true; });
    depthScene.remove(this.room);

    // Nearer than the photo's frame the desks are modelled: the same
    // workstation as the overhead model, lit to sit with the photo's colours.
    const fm = furnitureMaterials(C.desk);
    for (const side of [-1, 1] as const) {
      const key = side < 0 ? 'left' : 'right';
      const wallX = side < 0 ? R.left : R.right;
      this.scene.add(deskRun(fm, side, wallX, R.front - 0.15, R.deskStart[key], R.deskTop, R.deskDepth));
      STATIONS[key].forEach((z, i) => {
        if (z > R.deskStart[key] + 0.3) this.scene.add(station(fm, side, wallX, z, R.deskTop, i + (side < 0 ? 0 : 10)));
      });
    }
    this.scene.add(new THREE.HemisphereLight(0xfffaf2, 0x6c665e, 1.5));
    const key = new THREE.DirectionalLight(0xfff3e2, 0.8);
    key.position.set(1, 6, 2);
    this.scene.add(key);
    return C;
  }

  // ---- TV -----------------------------------------------------------------

  private buildTv() {
    this.tvCanvas.width = 1280;
    this.tvCanvas.height = 688;
    this.tvTex = new THREE.CanvasTexture(this.tvCanvas);
    this.tvTex.colorSpace = THREE.SRGBColorSpace;
    this.tvMat = new THREE.MeshBasicMaterial({ map: this.tvTex, transparent: true, opacity: 0, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(TV.w - 0.04, TV.h - 0.04), this.tvMat);
    screen.position.set(TV.x, TV.y, TV.z + 0.032);
    this.scene.add(screen);
    this.drawTv(0);
  }

  /** What the TV in the room shows; the title changes for the finale. */
  setTvTitle(title: string) {
    if (title === this.tvTitle) return;
    this.tvTitle = title;
  }

  private drawTv(t: number) {
    const g = this.tvCanvas.getContext('2d')!;
    const { width: W, height: H } = this.tvCanvas;
    const bg = g.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.5, W * 0.7);
    bg.addColorStop(0, '#0c2a8a');
    bg.addColorStop(1, this.colors.navy);
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // slow drifting arcs, the logo's blues
    g.save();
    g.globalAlpha = 0.18;
    g.strokeStyle = this.colors.brand;
    g.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.arc(W * 0.5, H * 1.25, 380 + i * 70 + Math.sin(t * 0.6 + i) * 14, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
    }
    g.restore();
    if (this.tvLogo) {
      const s = 230;
      g.drawImage(this.tvLogo, W / 2 - s / 2, H * 0.17, s, s);
    }
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.font = `700 64px Tinos, 'Times New Roman', serif`;
    g.fillText(this.tvTitle || 'AIMS Lab', W / 2, H * 0.68);
    g.fillStyle = this.colors.gold;
    g.font = `500 30px system-ui, -apple-system, sans-serif`;
    g.fillText('aimsresearchlab.com', W / 2, H * 0.79);
    this.tvTex.needsUpdate = true;
  }

  // ---- dust ---------------------------------------------------------------

  private buildDust() {
    const N = 900;
    const pos = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = THREE.MathUtils.lerp(ROOM.left + 0.2, ROOM.right - 0.2, Math.random());
      pos[i * 3 + 1] = THREE.MathUtils.lerp(0.4, ROOM.ceil - 0.15, Math.random());
      pos[i * 3 + 2] = THREE.MathUtils.lerp(ROOM.back + 0.3, 0.6, Math.random());
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uScale: { value: 900 }, uAlpha: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float seed;
        uniform float uTime, uScale;
        varying float vA;
        void main() {
          vec3 p = position;
          float t = uTime * (0.05 + seed * 0.05);
          p.x += sin(t * 2.1 + seed * 40.0) * 0.18;
          p.y += sin(t * 1.3 + seed * 17.0) * 0.12 + fract(seed * 7.0 + uTime * 0.004) * 0.0;
          p.z += cos(t * 1.7 + seed * 23.0) * 0.18;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = -mv.z;
          gl_PointSize = uScale * (0.006 + seed * 0.008) / d;
          float nearWindow = smoothstep(-4.0, -8.6, p.z);
          vA = (0.15 + 0.55 * nearWindow) * smoothstep(0.25, 1.2, d) * (0.5 + 0.5 * sin(uTime * 0.4 + seed * 60.0));
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uAlpha;
        varying float vA;
        void main() {
          float r = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, r) * vA * uAlpha;
          gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * a, a);
        }
      `,
    });
    this.dust = new THREE.Points(geo, m);
    this.scene.add(this.dust);
  }

  // ---- posters ------------------------------------------------------------

  private async buildPosters(list: PosterInfo[]) {
    await Promise.all([
      document.fonts.load(`700 80px Tinos`),
      document.fonts.load(`400 40px Tinos`),
    ]);
    const shadowTex = this.softShadow();
    const frameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x1b1c20) });
    for (const info of list) {
      const tex = new THREE.CanvasTexture(await this.drawPoster(info));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const pm = new THREE.ShaderMaterial({
        vertexShader: posterVert,
        fragmentShader: posterFrag,
        uniforms: {
          uMap: { value: tex },
          uReveal: { value: 0 },
          uExposure: { value: 0.8 },
          uGlow: { value: new THREE.Color(this.colors.gold) },
        },
      });
      this.posterMats.push(pm);
      const { x, n } = posterWall(info);
      const g = new THREE.Group();
      g.position.set(x, POSTER.y, info.z);
      g.rotation.y = n > 0 ? Math.PI / 2 : -Math.PI / 2;
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(POSTER.w + 0.34, POSTER.h + 0.4),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 }),
      );
      shadow.position.set(0.015, -0.035, 0.002);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(POSTER.w + 0.04, POSTER.h + 0.04, 0.025), frameMat.clone());
      frame.position.z = 0.0125;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(POSTER.w, POSTER.h), pm);
      sheet.position.z = 0.0262;
      g.add(shadow, frame, sheet);
      g.userData = { shadow, frame };
      this.posters.add(g);
    }
  }

  private softShadow() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 320;
    const g = c.getContext('2d')!;
    g.filter = 'blur(18px)';
    g.fillStyle = 'rgba(30,24,16,0.55)';
    g.fillRect(48, 52, 160, 216);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /** A landscape sheet: the title across the top, the paper's figure large on the left, the claim beside it. */
  private async drawPoster(p: PosterInfo) {
    const W = 1560, H = 1200, M = 64;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    const C = this.colors;
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    // Header band
    g.fillStyle = C.navy;
    g.fillRect(0, 0, W, 130);
    g.fillStyle = C.gold;
    g.fillRect(0, 130, W, 9);
    if (this.tvLogo) g.drawImage(this.tvLogo, M - 6, 24, 82, 82);
    g.fillStyle = '#ffffff';
    g.font = `700 42px Tinos, serif`;
    g.textBaseline = 'middle';
    g.fillText('AIMS Lab', M + 94, 52);
    g.fillStyle = '#c9d2f2';
    g.font = `500 24px system-ui, -apple-system, sans-serif`;
    g.fillText('University of Southern Mississippi', M + 94, 92);
    g.textAlign = 'right';
    g.fillStyle = C.gold;
    g.font = `700 24px system-ui, -apple-system, sans-serif`;
    g.fillText(p.kicker.toUpperCase(), W - M, 66);
    g.textAlign = 'left';

    // Title across the sheet
    g.textBaseline = 'alphabetic';
    g.fillStyle = C.ink;
    g.font = `700 92px Tinos, serif`;
    let y = 262;
    for (const line of wrap(g, p.title, W - 2 * M).slice(0, 2)) {
      g.fillText(line, M, y);
      y += 96;
    }
    g.fillStyle = C.gold;
    g.fillRect(M, y - 50, 120, 7);

    // The figure, as large as it fits on the left; the claim beside it
    const top = y + 6, fw = 930, fh = H - 230 - top;
    let used = 0;
    if (p.cover) {
      try {
        const img = await loadImage(p.cover);
        const k = Math.min(fw / img.naturalWidth, fh / img.naturalHeight);
        const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        g.fillStyle = '#ffffff';
        g.fillRect(M, top, w + 20, h + 20);
        g.drawImage(img, M + 10, top + 10, w, h);
        g.strokeStyle = C.paper;
        g.lineWidth = 2;
        g.strokeRect(M, top, w + 20, h + 20);
        used = w + 20;
      } catch { /* the sheet still reads without its figure */ }
    }
    const cx = used ? M + used + 48 : M;
    g.fillStyle = C.ink;
    g.font = `400 44px Tinos, serif`;
    let cy = top + 40;
    for (const line of wrap(g, p.claim, W - M - cx).slice(0, 10)) {
      g.fillText(line, cx, cy);
      cy += 56;
    }

    // Foot: venue and QR
    g.fillStyle = C.paper;
    g.fillRect(M, H - 200, W - 2 * M, 2);
    g.fillStyle = C.inkSoft;
    g.font = `500 28px system-ui, -apple-system, sans-serif`;
    let fy2 = H - 140;
    for (const line of wrap(g, p.venue, W - 2 * M - 220).slice(0, 3)) {
      g.fillText(line, M, fy2);
      fy2 += 38;
    }
    if (p.qr) {
      try {
        const q = await loadImage(p.qr);
        g.fillStyle = '#ffffff';
        g.fillRect(W - M - 170, H - 180, 170, 170);
        g.drawImage(q, W - M - 162, H - 172, 154, 154);
      } catch { /* the poster still reads without its code */ }
    }
    return c;
  }

  // ---- frame --------------------------------------------------------------

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, (3840 * 2160) / (w * h), 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer?.setPixelRatio(dpr);
    this.composer?.setSize(w, h);
    this.archComposer?.setPixelRatio(dpr);
    this.archComposer?.setSize(w, h);
    // Occlusion is soft; half resolution is plenty and keeps a 4K TV smooth.
    this.gtao?.setSize(Math.round((w * dpr) / 2), Math.round((h * dpr) / 2));
    this.bloom?.resolution.set(w * dpr, h * dpr);
    (this.grade?.uniforms.uRes.value as THREE.Vector2 | undefined)?.set(w * dpr, h * dpr);
    this.aspect = w / h;
  }

  /** Draws one frame. Skipped by the caller while a scene covers the room. */
  render(time: number) {
    const p = this.pose;
    const s = this.fx.sway;
    // A small, slow drift so a held shot still breathes like a handheld one.
    const dx = (Math.sin(time * 0.31) * 0.012 + Math.sin(time * 0.71) * 0.005) * s;
    const dy = (Math.sin(time * 0.23 + 1.3) * 0.008 + Math.sin(time * 0.57) * 0.004) * s;
    this.camera.position.set(p.x + dx, p.y + dy, p.z);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(p.tx + dx * 0.4, p.ty + dy * 0.4, p.tz);
    this.camera.rotateZ(Math.sin(time * 0.17) * 0.0025 * s + (p.roll ?? 0));
    applyLens(this.camera, p.fov, p.shift, this.aspect);

    const pv = this.fx.posters;
    this.posterMats.forEach((m, i) => {
      const local = THREE.MathUtils.clamp(pv * (this.posterMats.length + 2) - i, 0, 1);
      m.uniforms.uReveal.value = local;
      const g = this.posters.children[i];
      (g.userData.shadow.material as THREE.MeshBasicMaterial).opacity = local;
      g.userData.frame.visible = local > 0.02;
      g.userData.frame.scale.setScalar(0.96 + 0.04 * local);
    });
    // The overhead model: drawn through its own chain and mixed in, or alone.
    const m = this.fx.model;
    const showArch = m > 0.001;
    if (showArch) {
      this.arch.update(this.camera, this.fx.build);
      this.archComposer.render();
    }
    this.renderPass.scene = m >= 0.999 ? this.empty : this.scene;
    this.mixPass.uniforms.tArch.value = this.archComposer.readBuffer.texture;
    this.mixPass.uniforms.uMix.value = showArch ? m : 0;
    (this.dust.material as THREE.ShaderMaterial).uniforms.uAlpha.value = 1 - this.fx.model;
    this.tvMat.opacity = this.fx.tv;
    if (this.fx.tv > 0) this.drawTv(time);
    (this.dust.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    this.grade.uniforms.uTime.value = time;
    this.grade.uniforms.uFade.value = this.fx.fade;
    this.composer.render();
  }

  get elapsed() {
    return (performance.now() - this.t0) / 1000;
  }
}
