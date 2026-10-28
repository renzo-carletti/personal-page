// Turns the pixel sprites from sprites.js into voxel models: one box column per pixel,
// merged per color so each model costs one draw call per palette entry.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Three flat light steps, like the cel-shaded references (3–5 value steps, no gradients).
const steps = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
steps.minFilter = steps.magFilter = THREE.NearestFilter;
steps.needsUpdate = true;

const toonCache = new Map();
export function toon(color) {
  if (!toonCache.has(color)) toonCache.set(color, new THREE.MeshToonMaterial({ color, gradientMap: steps }));
  return toonCache.get(color);
}

// Palette classes that glow: drawn unlit so they keep their full color in the dark.
const GLOW = new Set(['sprite-eyes', 'sprite-orb', 'sprite-lamps', 'sprite-flame']);

// Chebyshev distance from each cell to the nearest transparent cell (or the sprite edge).
function edgeDistance(rows, w, h) {
  const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && (rows[y][x] ?? '.') !== '.';
  const dist = rows.map((row, y) => Array.from({ length: w }, (_, x) => (filled(x, y) ? Infinity : 0)));
  let queue = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!filled(x, y)) continue;
      let edge = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!filled(x + dx, y + dy)) edge = true;
      if (edge) {
        dist[y][x] = 1;
        queue.push([x, y]);
      }
    }
  while (queue.length) {
    const next = [];
    for (const [x, y] of queue)
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (filled(nx, ny) && dist[ny][nx] > dist[y][x] + 1) {
            dist[ny][nx] = dist[y][x] + 1;
            next.push([nx, ny]);
          }
        }
    queue = next;
  }
  return dist;
}

/**
 * Build a voxel model from a sprite. The model is centered, 1 unit per pixel, facing +z.
 * shape 'puffy': columns get deeper away from the outline, so characters look rounded.
 * shape 'round': depth follows a sphere, for the sun, moon and planets.
 */
export function spriteToVoxels(sprite, { shape = 'puffy', depth = 7 } = {}) {
  const { rows, palette } = sprite;
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const dist = shape === 'puffy' ? edgeDistance(rows, w, h) : null;
  const r = Math.max(w, h) / 2;
  const groups = new Map();

  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.' || !palette[ch]) return;
      let d;
      if (dist) d = Math.min(depth, 1 + (dist[y][x] - 1) * 2);
      else {
        const dx = x + 0.5 - w / 2;
        const dy = y + 0.5 - h / 2;
        d = Math.max(1, Math.round(2 * Math.sqrt(Math.max(0, r * r - dx * dx - dy * dy))));
      }
      const box = new THREE.BoxGeometry(1, 1, d);
      box.translate(x + 0.5 - w / 2, h / 2 - y - 0.5, 0);
      const key = ch;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(box);
    });
  });

  const model = new THREE.Group();
  for (const [ch, boxes] of groups) {
    const entry = palette[ch];
    const { fill, cls } = typeof entry === 'string' ? { fill: entry, cls: '' } : entry;
    const material = GLOW.has(cls) ? new THREE.MeshBasicMaterial({ color: fill }) : cls ? toon(fill).clone() : toon(fill);
    const mesh = new THREE.Mesh(mergeGeometries(boxes), material);
    boxes.forEach((b) => b.dispose());
    mesh.name = cls;
    model.add(mesh);
  }
  model.userData.size = { w, h };
  return model;
}

// One warm key light against a cool fill, as in the references.
export function addLights(scene, { key = [-0.6, 1, 1.2], intensity = 2.6 } = {}) {
  scene.add(new THREE.HemisphereLight('#8cc7d9', '#2e2a45', 1.4));
  const sun = new THREE.DirectionalLight('#ffd98a', intensity);
  sun.position.set(...key);
  scene.add(sun);
  return sun;
}

// Soft round glow for sprites (the suns).
export function glowTexture(rgb = '253,184,19') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},0.55)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.18)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
