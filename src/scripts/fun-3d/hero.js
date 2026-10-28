// Title screen diorama: the same ridges as the flat SVG scene, extruded into slabs at real depth,
// with pine pyramids, a voxel sun and fireflies. At rest the front layer lines up with the SVG
// it replaces; moving the pointer or scrolling moves the camera, and the far layers drift.
import * as THREE from 'three';
import { farRidge, midRidge, hill3, hill4 } from '../../components/scene.js';
import { sun as sunSprite } from '../../components/fun/sprites.js';
import { glowTexture, spriteToVoxels, toon } from './voxel.js';
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

  // Sun behind everything, a slowly turning voxel ball with a soft glow.
  const sunLayer = { cfg: { d: 900 }, outer: new THREE.Group(), inner: new THREE.Group() };
  const sun = spriteToVoxels(sunSprite, { shape: 'round' });
  sun.position.set(560, 170, 0);
  sun.scale.setScalar(124 / 11);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), depthWrite: false, fog: false }));
  glow.position.set(560, 170, -10);
  sunLayer.inner.add(glow, sun);
  sunLayer.outer.add(sunLayer.inner);
  scene.add(sunLayer.outer);
  sun.traverse((o) => o.material && (o.material = new THREE.MeshBasicMaterial({ color: o.material.color, fog: false })));
  layers.unshift(sunLayer);

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
      // Camera moves with the pointer and sinks as the hero scrolls away, while the sun sets.
      // The view offset keeps the front plane still, so Vivi and the chocobo stay on their ground.
      const lift = Math.min(1, scrollY / H);
      const tx = (pointer.active ? (pointer.x / W - 0.5) * 90 : 0) + Math.sin(clock * 0.25) * 18;
      const ty = (pointer.active ? (0.5 - pointer.y / innerHeight) * 40 : 0) + 30 - lift * 70;
      cam.x = approach(cam.x, tx, 3, dt);
      cam.y = approach(cam.y, ty, 3, dt);
      camera.position.set(cam.x, cam.y, D);
      camera.setViewOffset(W, H, -cam.x, cam.y, W, H);

      sun.rotation.y = clock * 0.3;
      sun.position.y = glow.position.y = 170 - lift * 90;
      glow.scale.setScalar(250 + Math.sin(clock * 1.5) * 14);
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
