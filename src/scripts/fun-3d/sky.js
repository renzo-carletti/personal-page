// Page-wide night sky in 3D: square pixel stars flowing slowly toward you (a short warp toward
// you while you scroll down, away from you while you scroll up), shooting stars, and now and then
// an icy comet crossing the sky with a blue ion tail and a warm dust tail (a nod to the
// Interloper). Replaces the 2D starfield.
import * as THREE from 'three';
import { glowTexture } from './voxel.js';
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

// Shooting star: a tapered streak, brightest at the head, with a small glow on the head.
const streakMaterial = (color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        // uv.x runs from the end of the tail (0) to the head (1); the streak narrows toward the tail.
        float width = mix(0.08, 1.0, vUv.x * vUv.x);
        if (abs(vUv.y - 0.5) * 2.0 > width) discard;
        float a = pow(vUv.x, 2.2);
        gl_FragColor = vec4(mix(uColor, vec3(1.0), vUv.x * 0.6), a * uOpacity);
      }`,
  });

function streak(color, glowRgb) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), streakMaterial(color));
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(glowRgb), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  head.scale.setScalar(26);
  group.add(body, head);
  group.userData = { body, head };
  group.visible = false;
  return group;
}

// Comet: an icy nucleus inside a soft glowing coma, and two tails of square pixel particles left
// behind as it moves: a long straight blue ion tail and a shorter, wider dust tail that drifts
// down and away. Particles live in world space, so the tails follow the path the comet took.
const TAIL_KINDS = [
  // Ion tail: fast, narrow, blue.
  { share: 0.55, life: 3.4, back: 55, spread: 3, drift: [0, 0], size: [2, 4], color: ['#ffffff', '#8cc7ff', '#3d6fd9'] },
  // Dust tail: slow, wide, warm, curving down.
  { share: 0.45, life: 4.2, back: 18, spread: 9, drift: [0, -18], size: [2.5, 5], color: ['#fff4d6', '#f3cf9a', '#b86a4a'] },
];

const tailMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aAge;
      attribute float aSize;
      attribute vec3 aHead;
      attribute vec3 aMid;
      attribute vec3 aEnd;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float k = clamp(aAge, 0.0, 1.0);
        // Square pixels that shrink as they age; dead ones (age >= 1) vanish.
        gl_PointSize = aAge >= 1.0 ? 0.0 : floor(max(1.0, aSize * (1.0 - k * 0.6) * uScale * 1100.0 / -mv.z));
        vColor = k < 0.5 ? mix(aHead, aMid, k * 2.0) : mix(aMid, aEnd, k * 2.0 - 1.0);
        vAlpha = 1.0 - k;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      // Stepped fade, like the rest of the pixel art.
      void main() { gl_FragColor = vec4(vColor, floor(vAlpha * 5.0 + 0.5) / 5.0); }`,
  });

function comet() {
  const head = new THREE.Group();
  // Nucleus: a small faceted rock of ice, lit only by its own colors.
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(4.5, 0), new THREE.MeshBasicMaterial({ color: '#eaf8ff' }));
  const dark = new THREE.Mesh(new THREE.IcosahedronGeometry(4.6, 0), new THREE.MeshBasicMaterial({ color: '#8cc7d9', wireframe: true }));
  const glow = (rgb, size, opacity = 1) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(rgb), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
    sprite.scale.setScalar(size);
    return sprite;
  };
  const coma = glow('140,200,255', 120);
  const core = glow('255,255,255', 34);
  head.add(coma, rock, dark, core);
  head.userData = { rock, dark, coma, core };
  // A faint glowing body under the particles, so the tail reads as one stream from afar.
  const body = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), streakMaterial('#5f8fd9'));
  body.material.uniforms.uOpacity.value = 0.55;
  body.visible = false;

  const N = 1100;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  const age = new Float32Array(N).fill(1);
  const life = new Float32Array(N).fill(1);
  const size = new Float32Array(N);
  const cols = { aHead: new Float32Array(N * 3), aMid: new Float32Array(N * 3), aEnd: new Float32Array(N * 3) };
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aAge', new THREE.BufferAttribute(age, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  Object.entries(cols).forEach(([name, arr]) => geo.setAttribute(name, new THREE.BufferAttribute(arr, 3)));
  const tail = new THREE.Points(geo, tailMaterial());
  tail.frustumCulled = false;
  const c = new THREE.Color();
  let next = 0;
  let carry = 0;

  // Emit from the head (moving along `dir`, a unit vector), then age and move every particle.
  function update(dt, emitting, at, dir) {
    body.visible = emitting;
    if (emitting) {
      body.position.set(at.x - dir.x * 170, at.y - dir.y * 170, at.z - 1);
      body.rotation.z = Math.atan2(dir.y, dir.x);
      body.scale.set(340, 16, 1);
      carry += dt * 240;
      for (; carry >= 1; carry--) {
        const i = next;
        next = (next + 1) % N;
        const kind = Math.random() < TAIL_KINDS[0].share ? TAIL_KINDS[0] : TAIL_KINDS[1];
        const side = (Math.random() - 0.5) * kind.spread;
        // Out the back, a little sideways (perpendicular to the path), plus the kind's drift.
        vel[i * 3] = -dir.x * kind.back * (0.8 + Math.random() * 0.4) - dir.y * side + kind.drift[0];
        vel[i * 3 + 1] = -dir.y * kind.back * (0.8 + Math.random() * 0.4) + dir.x * side + kind.drift[1] * (0.6 + Math.random() * 0.8);
        vel[i * 3 + 2] = (Math.random() - 0.5) * kind.spread;
        pos.set([at.x + (Math.random() - 0.5) * 4, at.y + (Math.random() - 0.5) * 4, at.z], i * 3);
        age[i] = 0;
        life[i] = kind.life * (0.7 + Math.random() * 0.5);
        size[i] = kind.size[0] + Math.random() * (kind.size[1] - kind.size[0]);
        ['aHead', 'aMid', 'aEnd'].forEach((name, k) => {
          c.set(kind.color[k]);
          cols[name].set([c.r, c.g, c.b], i * 3);
        });
      }
    }
    let alive = false;
    for (let i = 0; i < N; i++) {
      if (age[i] >= 1) continue;
      alive = true;
      age[i] = Math.min(1, age[i] + dt / life[i]);
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    Object.values(geo.attributes).forEach((a) => (a.needsUpdate = true));
    tail.visible = alive;
    return alive;
  }

  head.visible = false;
  tail.visible = false;
  return { head, tail, body, update };
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
  const shooters = [streak('#fff4d6', '255,240,200'), streak('#8cc7d9', '160,215,240')];
  shooters.forEach((s) => scene.add(s));
  const ice = comet();
  scene.add(ice.body, ice.tail, ice.head);
  const cometPos = new THREE.Vector3();
  const cometDir = new THREE.Vector3(-1, 0, 0);

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
      ice.tail.material.uniforms.uScale.value = u.uScale.value;
    },
    update(dt) {
      if (root.classList.contains('time-stop')) dt = 0;
      clock += dt;
      // Scroll speed, signed: down brings the stars toward you, up sends them away.
      const v = dt ? (scrollY - lastY) / dt : 0;
      lastY = scrollY;
      // Calm drift, with a warp boost in the scroll direction; it kicks in fast (also when the
      // direction flips) and eases back.
      const want = 14 + Math.max(-900, Math.min(900, v * 0.6));
      const kick = Math.abs(want) > Math.abs(speed) || want * speed < 0;
      speed = approach(speed, want, kick ? 6 : 1.5, dt);
      flow = (((flow + speed * dt) % DEPTH) + DEPTH) % DEPTH;
      u.uFlow.value = flow;
      u.uTime.value = clock;
      field.rotation.z = clock * 0.004;
      look.x = approach(look.x, pointer.active ? (pointer.x / innerWidth - 0.5) * 40 : 0, 2, dt);
      look.y = approach(look.y, pointer.active ? (0.5 - pointer.y / innerHeight) * 25 : 0, 2, dt);
      camera.position.x = look.x;
      camera.position.y = look.y;

      // Shooting stars: one every few seconds, quick diagonal streaks with a glowing head.
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
        const { body, head } = s.line.userData;
        const hx = s.x + s.dx * s.t;
        const hy = s.y + s.dy * s.t;
        // The tail grows out of the head, then keeps its length.
        const tail = Math.min(s.t, 0.3);
        const len = Math.hypot(s.dx, s.dy) * tail;
        body.position.set(hx - (s.dx * tail) / 2, hy - (s.dy * tail) / 2, -300);
        body.rotation.z = Math.atan2(s.dy, s.dx);
        body.scale.set(Math.max(1, len), 3.2, 1);
        head.position.set(hx, hy, -300);
        // Flares up as it appears, burns out at the end.
        const fade = 1 - Math.max(0, s.t - 0.7) / 0.3;
        body.material.uniforms.uOpacity.value = fade;
        head.material.opacity = fade * Math.min(1, s.t * 6);
        head.scale.setScalar(22 + Math.sin(s.t * Math.PI) * 10);
        if (s.t >= 1) {
          s.line.visible = false;
          shots.splice(i, 1);
        }
      }

      // Comet crossing right to left over about 22 seconds, every minute or so. The tails keep
      // streaming for a moment after the head leaves the screen.
      cometAt -= dt;
      if (cometAt < 0 && cometT < 0) {
        cometT = 0;
        cometPos.set(1000, 120, -650);
      }
      const flying = cometT >= 0;
      if (flying) {
        cometT += dt / 22;
        const x = 1000 - cometT * 2000;
        const y = 120 + Math.sin(cometT * Math.PI) * 140;
        if (dt) cometDir.set(x - cometPos.x, y - cometPos.y, 0).normalize();
        cometPos.set(x, y, -650);
        ice.head.visible = true;
        ice.head.position.copy(cometPos);
        const { rock, dark, coma, core } = ice.head.userData;
        rock.rotation.set(clock * 0.7, clock * 1.1, 0);
        dark.rotation.copy(rock.rotation);
        // The coma breathes, the core twinkles.
        coma.scale.setScalar(120 + Math.sin(clock * 2.1) * 10);
        core.material.opacity = 0.8 + 0.2 * Math.sin(clock * 9);
        if (cometT >= 1) {
          cometT = -1;
          ice.head.visible = false;
          cometAt = 50 + Math.random() * 30;
        }
      }
      if (flying || ice.tail.visible) ice.update(dt, flying, cometPos, cometDir);
    },
  });
}
