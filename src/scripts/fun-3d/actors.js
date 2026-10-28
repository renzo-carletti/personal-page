// Voxel Vivi, chocobo and airship. Each one draws into a canvas inside its 2D element and lines
// up with the (now invisible) pixel sprite, so the buttons, bubbles and CSS motion stay as they are.
import * as THREE from 'three';
import { airship, chocobo, chocoRun, vivi } from '../../components/fun/sprites.js';
import { addLights, spriteToVoxels } from './voxel.js';
import { approach, pointer, view } from './stage.js';

const root = document.documentElement;
const timeStopped = () => root.classList.contains('time-stop');
const FOV = 24;

function canvasIn(host, name) {
  const canvas = document.createElement('canvas');
  canvas.className = `fun3d fun3d--${name}`;
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  return canvas;
}

/**
 * A model in its own small view. `anchor` is the hidden 2D sprite: the model gets its size and
 * place, feet on the sprite's bottom edge. `body` is the group to move; `model` is centered in it.
 */
function actor({ host, anchor, name, models }) {
  const canvas = canvasIn(host, name);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 2000);
  addLights(scene);
  const body = new THREE.Group();
  const { w, h } = models[0].userData.size;
  models.forEach((m) => {
    m.position.y = h / 2;
    body.add(m);
  });
  scene.add(body);
  const a = { canvas, scene, camera, body, models, yaw: 0, home: new THREE.Vector3(), screen: { x: 0, y: 0 } };

  a.resize = (cw, ch) => {
    const c = canvas.getBoundingClientRect();
    const s = anchor.getBoundingClientRect();
    if (!s.width) return;
    const ppc = s.width / w;
    camera.position.set(0, 0, ch / ppc / 2 / Math.tan((FOV * Math.PI) / 360));
    a.home.set((s.left + s.width / 2 - c.left - cw / 2) / ppc, (ch / 2 - (s.bottom - c.top)) / ppc, 0);
    body.position.copy(a.home);
  };
  // Where the model stands on screen right now, for looking at the cursor.
  a.locate = () => {
    const c = canvas.getBoundingClientRect();
    a.screen.x = c.left + c.width / 2;
    a.screen.y = c.top + c.height / 2;
  };
  a.look = (t, dt, { yaw = 0, range = 0.55 } = {}) => {
    a.locate();
    const target = pointer.active
      ? THREE.MathUtils.clamp((pointer.x - a.screen.x) / 420, -1, 1) * range
      : Math.sin(t * 0.7) * range * 0.6;
    const pitch = pointer.active ? THREE.MathUtils.clamp((pointer.y - a.screen.y) / 700, -1, 1) * 0.18 : 0;
    a.yaw = approach(a.yaw, yaw + target, 6, dt);
    body.rotation.y = a.yaw;
    body.rotation.x = approach(body.rotation.x, pitch, 6, dt);
  };
  return a;
}

const meshes = (model, name) => {
  const list = [];
  model.traverse((o) => o.name === name && list.push(o));
  return list;
};

// Watch the state classes fun-play.js sets, and call `fn(name)` for each class that appears.
function onClassAdded(el, names, fn) {
  let before = new Set(el.classList);
  new MutationObserver(() => {
    const now = new Set(el.classList);
    names.forEach((n) => now.has(n) && !before.has(n) && fn(n));
    before = now;
  }).observe(el, { attributes: true, attributeFilter: ['class'] });
}

// Squash on take-off, stretch in the air, squash on landing.
function hop(body, p, height) {
  const y = Math.sin(Math.PI * p) * height;
  const squash = p < 0.15 ? 1 - Math.sin((p / 0.15) * Math.PI) * 0.22 : p > 0.85 ? 1 - Math.sin(((p - 0.85) / 0.15) * Math.PI) * 0.18 : 1 + Math.sin(Math.PI * p) * 0.1;
  body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  return y;
}

const SPELL_COLOR = { fire: '#ff7a1a', bolt: '#fff4a0', stop: '#b9a7ff', bio: '#8fe36b' };

export function mountVivi() {
  const el = document.querySelector('.vivi');
  const anchor = el?.querySelector('.vivi__sprite');
  if (!anchor) return;
  const model = spriteToVoxels(vivi, { depth: 9 });
  const a = actor({ host: el, anchor, name: 'vivi', models: [model] });
  const eyes = meshes(model, 'sprite-eyes');
  const orb = meshes(model, 'sprite-orb')[0];
  const orbColor = orb.material.color.clone();
  let spell = null;
  let since = 9;
  let blinkAt = 2;

  onClassAdded(el, ['is-praise'], () => {
    spell = 'praise';
    since = 0;
    orb.material.color.set('#fdb813');
  });
  onClassAdded(el, Object.keys(SPELL_COLOR).map((s) => `is-${s}`), (cls) => {
    spell = cls.slice(3);
    since = 0;
    orb.material.color.set(SPELL_COLOR[spell]);
  });

  view(a.canvas, {
    scene: a.scene,
    camera: a.camera,
    resize: a.resize,
    update(dt, t) {
      since += dt;
      a.look(t, dt);
      // Spells: a hop for Fire and Bio, a big jump for Thunder, a full twirl for Stop.
      const dur = spell === 'bolt' || spell === 'praise' ? 0.75 : 0.55;
      const p = since / dur;
      let y = Math.sin(t * 4.2) * 0.35;
      a.body.scale.set(1, 1, 1);
      if (p < 1) y += hop(a.body, p, spell === 'bolt' || spell === 'praise' ? 9 : 5);
      if (spell === 'stop' && since < 0.9) a.body.rotation.y += THREE.MathUtils.smootherstep(since, 0, 0.9) * Math.PI * 2;
      if (spell === 'bio' && since < 1.2) a.body.rotation.z = Math.sin(since * 22) * 0.12 * (1.2 - since);
      else a.body.rotation.z = 0;
      a.body.position.y = a.home.y + y;
      // Orb flares in the spell color, then fades back.
      const glow = Math.max(0, 1 - since / 1.4);
      orb.scale.setScalar(1 + glow * 0.9 + Math.sin(t * 6) * 0.08);
      if (glow === 0) orb.material.color.lerp(orbColor, 0.2);
      // Blink every few seconds.
      blinkAt -= dt;
      const shut = blinkAt < 0 && blinkAt > -0.12;
      if (blinkAt < -0.12) blinkAt = 2 + Math.random() * 3;
      eyes.forEach((e) => (e.scale.y = shut ? 0.15 : 1));
    },
  });
}

export function mountChocobo() {
  const el = document.querySelector('.choco');
  const host = el?.querySelector('.choco__body');
  const anchor = host?.querySelector('.choco__sprite');
  if (!anchor) return;
  const stand = spriteToVoxels(chocobo, { depth: 11 });
  const run = spriteToVoxels(chocoRun, { depth: 11 });
  run.visible = false;
  const a = actor({ host, anchor, name: 'choco', models: [stand, run] });
  let kweh = 9;
  let peck = 3;

  onClassAdded(el, ['is-kweh'], () => (kweh = 0));

  view(a.canvas, {
    scene: a.scene,
    camera: a.camera,
    resize: a.resize,
    update(dt, t) {
      if (timeStopped()) return;
      const running = el.classList.contains('is-running');
      // Two leg frames, like the pixel sprite, but in voxels.
      const stride = running && Math.floor(t / 0.13) % 2 === 1;
      stand.visible = !stride;
      run.visible = stride;
      kweh += dt;
      peck -= dt;
      a.body.scale.set(1, 1, 1);
      let y = 0;
      if (running) {
        // Three-quarter view while running, so the depth shows.
        a.look(t, dt, { yaw: -0.7, range: 0 });
        y = Math.abs(Math.sin(t * 24)) * 1.6;
        a.body.rotation.z = -0.12;
      } else {
        a.look(t, dt, { yaw: -0.25 });
        // A happy wiggle on "Kweh!", now and then a peck at the ground.
        if (kweh < 0.6) {
          y = hop(a.body, kweh / 0.6, 6);
          a.body.rotation.z = Math.sin(kweh * 30) * 0.15;
        } else if (peck < 0 && peck > -0.35) {
          a.body.rotation.z = -Math.sin((-peck / 0.35) * Math.PI) * 0.35;
        } else {
          a.body.rotation.z = 0;
          if (peck <= -0.35) peck = 3 + Math.random() * 4;
        }
      }
      a.body.position.y = a.home.y + y;
    },
  });
}

export function mountAirship() {
  const el = document.querySelector('.airship');
  const anchor = el?.querySelector('.airship__sprite');
  if (!anchor) return;
  const model = spriteToVoxels(airship, { depth: 13 });
  const a = actor({ host: el, anchor, name: 'airship', models: [model] });
  a.body.position.y = 0;
  model.position.y = 0;
  const prop = meshes(model, 'sprite-prop');
  const lamps = meshes(model, 'sprite-lamps');
  let lastY = scrollY;
  let speed = 0;
  let roll = 1;

  // Back to top: the airship does a barrel roll on the way up.
  document.getElementById('back-to-top')?.addEventListener('click', () => (roll = 0));

  view(a.canvas, {
    scene: a.scene,
    camera: a.camera,
    resize(cw, ch) {
      a.resize(cw, ch);
      a.home.y += model.userData.size.h / 2;
      a.body.position.copy(a.home);
    },
    update(dt, t) {
      if (timeStopped()) return;
      const v = dt ? (scrollY - lastY) / dt : 0;
      lastY = scrollY;
      speed = approach(speed, THREE.MathUtils.clamp(v / 2500, -1, 1), 4, dt);
      roll = Math.min(1, roll + dt / 1.1);
      // Banks and pitches with scroll speed, sways slowly to show its sides.
      a.body.rotation.x = approach(a.body.rotation.x, speed * 0.5, 5, dt);
      a.body.rotation.z = -speed * 0.35 + THREE.MathUtils.smootherstep(roll, 0, 1) * Math.PI * 2;
      a.body.rotation.y = Math.sin(t * 0.5) * 0.55 - 0.3;
      a.body.position.y = a.home.y + Math.sin(t * 1.6) * 0.8;
      prop.forEach((p) => (p.scale.y = 0.4 + Math.abs(Math.sin(t * 40)) * 0.8));
      lamps.forEach((l) => l.material.color.set(Math.sin(t * 5) > 0 ? '#fdb813' : '#fff4d6'));
    },
  });
}
