// Page-wide night sky in 3D: square pixel stars flowing slowly toward you (faster while you
// scroll, like a short warp), shooting stars, and now and then
// a comet with an icy tail crossing the sky (a nod to the Interloper). Replaces the 2D starfield.
import * as THREE from 'three';
import { approach, pointer, view } from './stage.js';

const FOV = 60;
const DEPTH = 2200;
const root = document.documentElement;
const STAR_COLORS = ['#fff4d6', '#fff4d6', '#b9bcc8', '#8cc7d9', '#e9806e', '#fdb813'];

// Square points with a size that grows as they come close, and a twinkle per star.
const starMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uFlow: { value: 0 }, uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aPhase;
      attribute float aSize;
      uniform float uTime;
      uniform float uFlow;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.z = mod(p.z + uFlow, ${DEPTH.toFixed(1)}) - ${(DEPTH - 200).toFixed(1)};
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = floor(clamp(aSize * uScale * 1400.0 / -mv.z, 2.0 * uScale, 5.0 * uScale));
        vColor = aColor;
        // Fade in from the far end, fade out right before passing the camera.
        float fade = smoothstep(${(-DEPTH + 200).toFixed(1)}, -1500.0, p.z) * (1.0 - smoothstep(60.0, 190.0, p.z));
        vAlpha = fade * (0.6 + 0.4 * step(0.0, sin(uTime * (1.0 + aPhase) + aPhase * 6.28)));
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() { gl_FragColor = vec4(vColor, vAlpha); }`,
  });

function stars(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const size = new Float32Array(count);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - 0.5) * 2600, (Math.random() - 0.5) * 1800, -Math.random() * DEPTH], i * 3);
    c.set(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]);
    col.set([c.r, c.g, c.b], i * 3);
    phase[i] = Math.random();
    size[i] = Math.random() < 0.08 ? 3 : 1.5 + Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  return new THREE.Points(geo, starMaterial());
}

// A streak: bright head, tail fading out (RGBA vertex colors).
function streak(rgb) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array([...rgb, 1, ...rgb, 0]), 4));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
  line.visible = false;
  return line;
}

// Icy comet: a small voxel cluster and a tail of square dots streaming behind it.
function comet() {
  const group = new THREE.Group();
  const ice = new THREE.MeshBasicMaterial({ color: '#d8f3ff' });
  const blue = new THREE.MeshBasicMaterial({ color: '#8cc7d9' });
  [[0, 0, 0, 1], [1, 0, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 1], [0, -1, 0, 0], [0, 0, 1, 1], [1, 1, 0, 0]].forEach(([x, y, z, light]) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), light ? ice : blue);
    box.position.set(x * 5, y * 5, z * 5);
    group.add(box);
  });
  const TAIL = 60;
  const tailPos = new Float32Array(TAIL * 3);
  const tailCol = new Float32Array(TAIL * 4);
  for (let i = 0; i < TAIL; i++) {
    const f = i / TAIL;
    tailPos.set([f * 260 + (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 18 * f, 0], i * 3);
    tailCol.set([0.55 + 0.4 * (1 - f), 0.8 + 0.2 * (1 - f), 1, (1 - f) * 0.9], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(tailCol, 4));
  const tail = new THREE.Points(geo, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false }));
  group.add(tail);
  group.visible = false;
  return group;
}

export function mountSky() {
  const host = document.querySelector('.fun-sky');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fun3d fun3d--sky';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 4000);
  camera.position.z = 200;

  const field = stars(innerWidth < 720 ? 700 : 1400);
  scene.add(field);
  const shooters = [streak([1, 0.96, 0.84]), streak([0.55, 0.78, 0.85])];
  shooters.forEach((s) => scene.add(s));
  const ice = comet();
  scene.add(ice);

  const u = field.material.uniforms;
  let clock = 0;
  let flow = 0;
  let speed = 0;
  let lastY = scrollY;
  let nextShot = 3;
  const shots = [];
  // `?comet` sends the comet right away (for testing).
  let cometAt = new URLSearchParams(location.search).has('comet') ? 0 : 12;
  let cometT = -1;
  const look = { x: 0, y: 0 };

  view(canvas, {
    own: true,
    scene,
    camera,
    resize() {
      u.uScale.value = Math.min(devicePixelRatio || 1, 2);
    },
    update(dt) {
      if (root.classList.contains('time-stop')) dt = 0;
      clock += dt;
      const v = dt ? Math.abs(scrollY - lastY) / dt : 0;
      lastY = scrollY;
      // Calm drift, with a warp boost while scrolling.
      speed = approach(speed, 14 + Math.min(900, v * 0.6), v > speed ? 6 : 1.5, dt);
      flow += speed * dt;
      u.uFlow.value = flow % DEPTH;
      u.uTime.value = clock;
      field.rotation.z = clock * 0.004;
      look.x = approach(look.x, pointer.active ? (pointer.x / innerWidth - 0.5) * 40 : 0, 2, dt);
      look.y = approach(look.y, pointer.active ? (0.5 - pointer.y / innerHeight) * 25 : 0, 2, dt);
      camera.position.x = look.x;
      camera.position.y = look.y;

      // Shooting stars: one every few seconds, quick diagonal streaks.
      nextShot -= dt;
      if (nextShot < 0) {
        const line = shooters.find((s) => !s.visible);
        if (line) {
          const dir = Math.random() < 0.5 ? 1 : -1;
          shots.push({ line, t: 0, x: (Math.random() - 0.5) * 900, y: 150 + Math.random() * 350, dx: dir * (500 + Math.random() * 300), dy: -260 - Math.random() * 120 });
          line.visible = true;
        }
        nextShot = 4 + Math.random() * 6;
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.t += dt / 0.9;
        const p = s.line.geometry.attributes.position;
        const hx = s.x + s.dx * s.t;
        const hy = s.y + s.dy * s.t;
        const tail = Math.min(s.t, 0.25);
        p.setXYZ(0, hx, hy, -300);
        p.setXYZ(1, hx - s.dx * tail, hy - s.dy * tail, -300);
        p.needsUpdate = true;
        s.line.material.opacity = 1 - Math.max(0, s.t - 0.7) / 0.3;
        if (s.t >= 1) {
          s.line.visible = false;
          shots.splice(i, 1);
        }
      }

      // Comet crossing right to left over about 22 seconds, every minute or so.
      cometAt -= dt;
      if (cometAt < 0 && cometT < 0) cometT = 0;
      if (cometT >= 0) {
        cometT += dt / 22;
        ice.visible = true;
        ice.position.set(900 - cometT * 1800, 120 + Math.sin(cometT * Math.PI) * 140, -650);
        ice.rotation.z = -Math.cos(cometT * Math.PI) * 0.25;
        ice.children.forEach((c, i) => c.isMesh && (c.rotation.x = clock * (1 + i * 0.2)));
        if (cometT >= 1) {
          cometT = -1;
          ice.visible = false;
          cometAt = 50 + Math.random() * 30;
        }
      }
    },
  });
}
