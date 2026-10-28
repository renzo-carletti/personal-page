// Turns the pixel sprites from sprites.js into voxel models: one box column per pixel,
// merged per color so each model costs one draw call per palette entry.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

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

// Face directions for voxelize: normal, then the 4 corners of that face on a unit cube.
const FACES = [
  [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
  [[-1, 0, 0], [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]]],
  [[0, 1, 0], [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]],
  [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
  [[0, 0, 1], [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]]],
  [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]],
];

/**
 * Sculpt a voxel model from a color function: `colorAt(x, y, z)` returns a CSS color or null for
 * empty, over integer coordinates from `min` to `max` (inclusive). Only faces next to empty space
 * are built, one mesh per color. `glow` lists colors drawn unlit.
 */
export function voxelize(min, max, colorAt, { glow = [] } = {}) {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const sx = x1 - x0 + 1;
  const sy = y1 - y0 + 1;
  const sz = z1 - z0 + 1;
  const grid = new Array(sx * sy * sz);
  const idx = (x, y, z) => (x - x0) + sx * ((y - y0) + sy * (z - z0));
  for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[idx(x, y, z)] = colorAt(x, y, z) || null;
  const filled = (x, y, z) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && z >= z0 && z <= z1 && grid[idx(x, y, z)];

  const byColor = new Map();
  for (let z = z0; z <= z1; z++)
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const color = grid[idx(x, y, z)];
        if (!color) continue;
        if (!byColor.has(color)) byColor.set(color, { pos: [], nor: [], index: [] });
        const g = byColor.get(color);
        for (const [n, corners] of FACES) {
          if (filled(x + n[0], y + n[1], z + n[2])) continue;
          const base = g.pos.length / 3;
          corners.forEach(([cx, cy, cz]) => {
            g.pos.push(x + cx, y + cy, z + cz);
            g.nor.push(...n);
          });
          g.index.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }

  const model = new THREE.Group();
  for (const [color, g] of byColor) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.nor, 3));
    geo.setIndex(g.index);
    const mesh = new THREE.Mesh(geo, glow.includes(color) ? new THREE.MeshBasicMaterial({ color }) : toon(color));
    mesh.name = color;
    model.add(mesh);
  }
  return model;
}

// Shape tests for voxelize color functions.
export const inEllipsoid = (x, y, z, [cx, cy, cz], [rx, ry, rz]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2 <= 1;
export const inBox = (x, y, z, [ax, ay, az], [bx, by, bz]) => x >= ax && x <= bx && y >= ay && y <= by && z >= az && z <= bz;
// Small stable noise in 0..1 for speckled stone, ash and fur.
export const hash = (x, y, z) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

// Toon material that reads per-vertex colors (for the smoothed models below).
export const toonVertex = () => new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: steps });

/**
 * Same inputs as voxelize, but a smooth surface instead of cubes: the shape is sampled into a
 * field, blurred and polygonized with marching cubes, then each vertex takes the color found just
 * inside the surface. Use for organic shapes (Sif, stones, ash); `res` is the grid resolution.
 */
export function smooth(min, max, colorAt, { res = 48, blur = 1, maxPoly = 40000, fallback = '#808080' } = {}) {
  const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) + 3;
  const c = min.map((m, i) => (m + max[i]) / 2);
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, maxPoly);
  const half = res / 2;
  const world = (cell, i) => c[i] + ((cell - half) / half) * (span / 2);
  for (let z = 0; z < res; z++)
    for (let y = 0; y < res; y++)
      for (let x = 0; x < res; x++) mc.setCell(x, y, z, colorAt(world(x, 0), world(y, 1), world(z, 2)) ? 160 : 0);
  mc.blur(blur);
  mc.update();

  const n = mc.count;
  const pos = new Float32Array(n * 3);
  const nor = mc.normalArray.slice(0, n * 3);
  const col = new Float32Array(n * 3);
  const color = new THREE.Color();
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = c[k] + mc.positionArray[i * 3 + k] * (span / 2);
    // Marching cubes leaves the normals unnormalized (raw field gradients).
    const len = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1;
    for (let k = 0; k < 3; k++) nor[i * 3 + k] /= len;
    let found = null;
    for (const depth of [0.35, 0.8, 1.4, 2.2]) {
      found = colorAt(pos[i * 3] - nor[i * 3] * depth, pos[i * 3 + 1] - nor[i * 3 + 1] * depth, pos[i * 3 + 2] - nor[i * 3 + 2] * depth);
      if (found) break;
    }
    color.set(found || fallback);
    col.set([color.r, color.g, color.b], i * 3);
  }
  mc.geometry.dispose();
  mc.material.dispose();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(geo, toonVertex());
}
