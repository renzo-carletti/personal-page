// Title screen diorama: the same ridges as the flat SVG scene, extruded into slabs at real depth,
// with pine pyramids, a glowing sun and fireflies. At rest the front layer lines up with the SVG
// it replaces; moving the pointer or scrolling moves the camera, and the far layers drift.
import * as THREE from 'three';
import { farRidge, midRidge, hill3, hill4 } from '../../components/scene.js';
import { toon } from './voxel.js';
import { approach, pointer, view } from './stage.js';

const FOV = 35;
const root = document.documentElement;

// Points of an "M x y L x y …" line, or samples of a hill function, padded past both edges.
const parse = (line) => line.slice(1).split('L').map((p) => p.trim().split(/\s+/).map(Number));
const sample = (fn) => Array.from({ length: 49 }, (_, i) => [i * 30, fn(i * 30)]);
const pad = (pts) => [[-400, pts[0][1]], ...pts, [1840, pts.at(-1)[1]]];

// Far to near. `d` is the distance behind the front plane, in screen pixels at rest.
const LAYERS = [
  { pts: parse(farRidge), color: '#d9531e', d: 620, depth: 90 },
  { pts: parse(midRidge), color: '#8e2b1a', d: 400, depth: 80 },
  { pts: sample(hill3), color: '#4a1620', d: 220, depth: 70, trees: { count: 26, seed: 7, fn: hill3, size: [26, 48], color: '#5e1d2a' } },
  { pts: sample(hill4), color: '#1e0f22', d: 100, depth: 60, trees: { count: 18, seed: 42, fn: hill4, size: [40, 72], color: '#2c1631' } },
  { pts: [[0, 400], [360, 392], [720, 398], [1080, 400], [1440, 396]], color: '#0b0f1e', d: 0, depth: 40 },
];

function slab({ pts, color, depth }) {
  const shape = new THREE.Shape();
  const all = pad(pts);
  shape.moveTo(all[0][0], -200);
  all.forEach(([x, y]) => shape.lineTo(x, 420 - y));
  shape.lineTo(all.at(-1)[0], -200);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 5, bevelSize: 4, bevelSegments: 1, curveSegments: 1 });
  geo.translate(0, 0, -depth);
  return new THREE.Mesh(geo, toon(color));
}

// Same seeded positions as the SVG pines, plus a random depth inside the slab.
function forest({ count, seed, fn, size: [minH, maxH], color }, depth) {
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand() * 1440);
    const height = minH + rand() * (maxH - minH);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(height * 0.28 * Math.SQRT2, height, 4), toon(color));
    cone.rotation.y = Math.PI / 4;
    cone.position.set(x, 420 - fn(x) - 4 + height / 2, -depth * (0.15 + 0.7 * ((i * 0.618) % 1)));
    cone.userData.sway = rand() * 6;
    group.add(cone);
  }
  return group;
}

// ---------- Sun: a churning pixel ball in a pixel corona ----------
// One flat disk, drawn on a coarse pixel grid so it reads as pixel art next to the hills. Inside
// the sun's radius it shades a ball: posterized colors (pale core, gold, orange, deep orange at
// the limb), slow cells churning across the turning surface and a dark pixel rim. Outside it, a
// stepped halo and two sets of rays turning slowly in opposite directions. `uHeat` (0..1)
// bleaches it toward white for the black hole pokes; `uSpin` turns the surface.
const SUN_D = 11; // diameter of the (invisible) anchor in model units; the caller scales it

const sunMaterial = (uniforms) =>
  new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uHeat;
      uniform float uRatio;
      uniform float uSpin;
      varying vec2 vUv;
      // Soft moving cells from nested sines: cheap, smooth, never repeats on screen.
      float churn(vec3 p) {
        return sin(p.x * 3.1 + sin(p.y * 2.3 + uTime * 0.6) * 1.4)
             * sin(p.y * 2.7 + sin(p.z * 3.3 - uTime * 0.5) * 1.4)
             * sin(p.z * 2.9 + sin(p.x * 2.1 + uTime * 0.4) * 1.4);
      }
      void main() {
        vec2 q = (floor(vUv * 120.0) + 0.5) / 120.0 - 0.5;
        float r = length(q) * 2.0;
        float rr = r / uRatio;
        vec3 col;
        float alpha;
        if (rr < 1.0) {
          // The ball: a sphere normal from the disk, turned around the vertical axis.
          vec2 xy = q * 2.0 / uRatio;
          float nz = sqrt(1.0 - rr * rr);
          float c = cos(uSpin);
          float s = sin(uSpin);
          vec3 p = vec3(c * xy.x + s * nz, xy.y, -s * xy.x + c * nz);
          float v = pow(nz, 1.1) * 0.62 + churn(p * 2.4) * 0.17 + 0.16;
          float k = floor(clamp(v, 0.0, 0.999) * 5.0);
          col = rr > 0.94 ? vec3(0.75, 0.25, 0.10)
              : k < 1.0 ? vec3(0.91, 0.39, 0.12)
              : k < 2.0 ? vec3(0.96, 0.55, 0.10)
              : k < 3.0 ? vec3(0.99, 0.72, 0.07)
              : k < 4.0 ? vec3(1.0, 0.85, 0.35)
              : vec3(1.0, 0.96, 0.84);
          col = mix(col, vec3(1.0), uHeat);
          alpha = 1.0;
        } else {
          // The corona: 0 at the sun's edge, 1 at the edge of the disk.
          float d = clamp((r - uRatio) / (1.0 - uRatio), 0.0, 1.0);
          float a = atan(q.y, q.x);
          float halo = pow(1.0 - d, 2.4);
          float rays = pow(abs(cos(a * 6.0 + uTime * 0.12)), 16.0) * (1.0 - smoothstep(0.0, 0.8, d))
                     + pow(abs(cos(a * 9.0 - uTime * 0.08 + 0.4)), 28.0) * 0.7 * (1.0 - smoothstep(0.0, 0.5, d));
          alpha = floor((halo * 0.55 + rays * 0.6) * 6.0) / 6.0;
          col = mix(vec3(1.0, 0.55, 0.15), vec3(1.0, 0.9, 0.6), clamp(halo + rays * 0.4, 0.0, 1.0));
          col = mix(col, vec3(1.0), uHeat * 0.6);
        }
        gl_FragColor = vec4(col, alpha);
      }`,
  });

function makeSun() {
  const uniforms = { uTime: { value: 0 }, uHeat: { value: 0 }, uRatio: { value: 0.35 }, uSpin: { value: 0 } };
  // The anchor keeps the sun's place, size and turn for the poke button and the implode.
  const anchor = new THREE.Object3D();
  const disk = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sunMaterial(uniforms));
  return { core: anchor, corona: disk, uniforms };
}

export function mountHero() {
  const host = document.querySelector('.fun-scene');
  const land = host?.querySelector('.fun-scene__land');
  if (!land) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fun3d fun3d--hero';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 6000);
  scene.fog = new THREE.Fog('#e9806e', 1000, 3200);
  scene.add(new THREE.HemisphereLight('#e9806e', '#1e0f22', 1.1));
  const key = new THREE.DirectionalLight('#ffd98a', 2.4);
  key.position.set(-0.3, 1, 0.7);
  scene.add(key);

  // Each layer: outer group sets depth and the perspective scale-up, inner group maps SVG units.
  const layers = LAYERS.map((cfg) => {
    const outer = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(slab(cfg));
    if (cfg.trees) inner.add(forest(cfg.trees, cfg.depth));
    outer.add(inner);
    scene.add(outer);
    return { cfg, outer, inner };
  });

  // Sun behind everything: a slowly turning pixel ball with its corona, on one disk.
  const sunLayer = { cfg: { d: 900 }, outer: new THREE.Group(), inner: new THREE.Group() };
  const { core: sun, corona: glow, uniforms: sunU } = makeSun();
  // In the gap between the hero text and the facts column, high enough to clear the far ridge.
  sun.position.set(760, 230, 0);
  sun.scale.setScalar(124 / SUN_D);
  glow.position.set(760, 230, -10);
  sunLayer.inner.add(glow, sun);
  sunLayer.outer.add(sunLayer.inner);
  scene.add(sunLayer.outer);
  layers.unshift(sunLayer);
  // Black hole pokes (fun-blackhole.js): `data-heat` on the scene shakes and whitens the sun,
  // `data-sun="implode"` crushes it to a point, "gone" hides it. The poke button follows the sun.
  const sunBtn = document.querySelector('.hero-sun');
  const sunWorld = new THREE.Vector3();
  let implodeT = 0;

  // Fireflies between the near hills.
  const FLIES = 28;
  const flies = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#fdb813', fog: false }), FLIES);
  const seeds = Array.from({ length: FLIES }, (_, i) => ({ x: ((i * 0.618) % 1) * 1440, y: 20 + ((i * 0.37) % 1) * 90, z: -((i * 0.29) % 1) * 160, p: i * 1.7 }));
  const flyLayer = { cfg: { d: 0 }, outer: new THREE.Group(), inner: new THREE.Group() };
  flyLayer.inner.add(flies);
  flyLayer.outer.add(flyLayer.inner);
  scene.add(flyLayer.outer);
  layers.push(flyLayer);
  const m = new THREE.Matrix4();

  let W = 1;
  let H = 1;
  let D = 1;
  let s = 1;
  const cam = { x: 0, y: 0 };
  let clock = 0;

  view(canvas, {
    own: true,
    scene,
    camera,
    resize(w, h) {
      W = w;
      H = h;
      D = h / 2 / Math.tan((FOV * Math.PI) / 360);
      s = Math.max(w / 1440, land.getBoundingClientRect().height / 420);
      layers.forEach(({ cfg, outer, inner }) => {
        const f = (D + cfg.d) / D;
        outer.position.z = -cfg.d;
        outer.scale.set(f, f, 1);
        inner.position.set(-720 * s, -h / 2, 0);
        inner.scale.setScalar(s);
      });
      scene.fog.near = D + 150;
      scene.fog.far = D + 2600;
    },
    update(dt) {
      if (root.classList.contains('time-stop')) dt = 0;
      clock += dt;
      // Camera moves with the pointer and sinks as the hero scrolls away, while the sun sets a little.
      // The view offset keeps the front plane still, so Vivi and the chocobo stay on their ground.
      const lift = Math.min(1, scrollY / H);
      const tx = (pointer.active ? (pointer.x / W - 0.5) * 90 : 0) + Math.sin(clock * 0.25) * 18;
      const ty = (pointer.active ? (0.5 - pointer.y / innerHeight) * 40 : 0) + 30 - lift * 70;
      cam.x = approach(cam.x, tx, 3, dt);
      cam.y = approach(cam.y, ty, 3, dt);
      camera.position.set(cam.x, cam.y, D);
      camera.setViewOffset(W, H, -cam.x, cam.y, W, H);

      const heat = Number(host.dataset.heat) || 0;
      const state = host.dataset.sun;
      implodeT = state === 'implode' ? implodeT + dt : 0;
      const shrink = state === 'implode' ? 1 - THREE.MathUtils.smootherstep(implodeT, 0, 1.1) : state === 'gone' ? 0 : 1;
      const jitter = heat * 1.6 + (state === 'implode' ? 6 : 0);
      sun.visible = glow.visible = state !== 'gone';
      sun.rotation.y = clock * (0.15 + heat * 0.8) + implodeT * 12;
      sun.position.set(760 + (Math.random() - 0.5) * jitter, 230 - lift * 45 + (Math.random() - 0.5) * jitter, 0);
      glow.position.set(sun.position.x, sun.position.y, -10);
      const diameter = 124 * (1 + heat * 0.04) * shrink;
      sun.scale.setScalar(diameter / SUN_D);
      sunU.uTime.value = clock * (1 + heat * 0.6);
      sunU.uSpin.value = sun.rotation.y;
      sunU.uHeat.value = Math.min(1, heat / 4.5 + (state ? 0.6 : 0));
      const praise = host.classList.contains('is-praised') ? 1.7 : 1;
      const corona = (360 + Math.sin(clock * 1.5) * 16 + heat * 30) * praise * (shrink > 0 ? 0.3 + 0.7 * shrink : 0);
      glow.scale.setScalar(Math.max(corona, 0.001));
      sunU.uRatio.value = corona > 0 ? Math.min(0.95, diameter / corona) : 0.5;
      // Keep the poke button on the projected sun.
      if (sunBtn) {
        sun.getWorldPosition(sunWorld).project(camera);
        const c = canvas.getBoundingClientRect();
        const hero = sunBtn.offsetParent?.getBoundingClientRect();
        if (hero) {
          sunBtn.style.left = `${c.left - hero.left + ((sunWorld.x + 1) / 2) * W}px`;
          sunBtn.style.top = `${c.top - hero.top + ((1 - sunWorld.y) / 2) * H}px`;
          sunBtn.style.setProperty('--size', `${Math.max(48, 124 * s)}px`);
        }
      }
      layers.forEach(({ inner }) =>
        inner.children.forEach((c) =>
          c.children.forEach((tree) => tree.userData.sway !== undefined && (tree.rotation.z = Math.sin(clock * 0.9 + tree.userData.sway) * 0.04))
        )
      );
      seeds.forEach((f, i) => {
        const on = Math.sin(clock * 1.3 + f.p) > 0.2;
        m.makeScale(on ? 3 : 0.01, on ? 3 : 0.01, 3);
        m.setPosition(f.x + Math.sin(clock * 0.4 + f.p) * 30, f.y + Math.sin(clock * 0.7 + f.p * 2) * 12, f.z);
        flies.setMatrixAt(i, m);
      });
      flies.instanceMatrix.needsUpdate = true;
    },
  });
}
