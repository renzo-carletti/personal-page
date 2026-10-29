// Render loop for the fun mode 3D views. The hero and the Dark Souls diorama have their own
// antialiased WebGL renderers; the small views (Vivi, chocobo, airship, solar system) share one
// and copy their frame into a 2D canvas, so the page holds three WebGL contexts at most. Views
// draw only while on screen.
import * as THREE from 'three';
import { tilt } from '../fun-gyro.js';

const dpr = () => Math.min(devicePixelRatio || 1, innerWidth < 960 ? 1.5 : 2);
const views = new Set();
let shared;
let running = false;
let last = 0;
let elapsed = 0;

function sharedRenderer() {
  if (!shared) {
    shared = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: false });
    shared.setClearColor(0x000000, 0);
    shared.setScissorTest(true);
  }
  return shared;
}

// The shared canvas fits the biggest small view; each view renders into its bottom-left corner.
function fitShared() {
  if (!shared) return;
  let w = 1;
  let h = 1;
  views.forEach((v) => {
    if (v.own) return;
    w = Math.max(w, v.pw);
    h = Math.max(h, v.ph);
  });
  const size = shared.getSize(new THREE.Vector2());
  if (size.x < w || size.y < h) shared.setSize(Math.max(w, size.x), Math.max(h, size.y), false);
}

/**
 * A canvas with a scene and a camera. `update(dt, t)` runs before each draw; `resize(w, h)`
 * runs when the canvas changes size (CSS pixels). `own: true` gives the view its own renderer.
 */
export function view(canvas, { scene, camera, update, resize, own = false }) {
  const v = { canvas, scene, camera, update, own, visible: false, w: 0, h: 0, pw: 0, ph: 0 };
  if (own) {
    v.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    v.renderer.setClearColor(0x000000, 0);
  } else {
    v.ctx = canvas.getContext('2d');
  }

  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (!width || !height) return;
    v.w = width;
    v.h = height;
    v.pw = Math.round(width * dpr());
    v.ph = Math.round(height * dpr());
    if (own) {
      v.renderer.setPixelRatio(dpr());
      v.renderer.setSize(width, height, false);
    } else {
      canvas.width = v.pw;
      canvas.height = v.ph;
      fitShared();
    }
    camera.aspect = width / height;
    resize?.(width, height);
    camera.updateProjectionMatrix();
    draw(v, 0);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    v.visible = entry.isIntersecting;
  }).observe(canvas);

  views.add(v);
  return v;
}

function draw(v, dt) {
  if (!v.w) return;
  v.update?.(dt, elapsed);
  if (v.own) {
    v.renderer.render(v.scene, v.camera);
    return;
  }
  const r = sharedRenderer();
  const ratio = r.getPixelRatio();
  const full = r.getSize(new THREE.Vector2());
  r.setViewport(0, 0, v.pw / ratio, v.ph / ratio);
  r.setScissor(0, 0, v.pw / ratio, v.ph / ratio);
  r.clear();
  r.render(v.scene, v.camera);
  v.ctx.clearRect(0, 0, v.pw, v.ph);
  v.ctx.drawImage(r.domElement, 0, full.y * ratio - v.ph, v.pw, v.ph, 0, 0, v.pw, v.ph);
}

function frame(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;
  elapsed += dt;
  followTilt();
  views.forEach((v) => v.visible && draw(v, dt));
  requestAnimationFrame(frame);
}

export function start() {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}

export function stop() {
  running = false;
}

// Shared pointer position in viewport pixels, for models that look at the cursor. On touch
// screens tilting the phone moves it instead (fun-gyro.js).
export const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
let mouse = false;
addEventListener(
  'pointermove',
  (e) => {
    mouse = e.pointerType === 'mouse';
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = mouse;
  },
  { passive: true }
);

function followTilt() {
  if (mouse) return;
  pointer.active = tilt.active;
  if (!tilt.active) return;
  pointer.x = innerWidth * (0.5 + tilt.x / 2);
  pointer.y = innerHeight * (0.5 + tilt.y / 2);
}

// Ease a value toward a target, frame-rate independent.
export const approach = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt));
