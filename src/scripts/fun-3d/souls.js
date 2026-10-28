// Dark Souls corner as a voxel diorama: Artorias' grave with his greatsword and the Cleansing
// Greatshield, the bonfire (coiled sword, ash and bones), and Sif sitting by the fire. Fan tribute,
// sculpted from scratch. The real buttons (bonfire, Sif) follow the models on screen.
import * as THREE from 'three';
import { addLights, hash, inBox, inEllipsoid, voxelize } from './voxel.js';
import { approach, pointer, view } from './stage.js';

const FOV = 28;
const root = document.documentElement;

// ---------- Ground: a mossy patch of dark earth ----------
function ground() {
  return voxelize([-34, -2, -14], [34, 0, 14], (x, y, z) => {
    if ((x / 34) ** 2 + (z / 14) ** 2 > 1) return null;
    if (y < 0) return '#241c28';
    const n = hash(x, 0, z);
    return n > 0.82 ? '#3e8e41' : n > 0.55 ? '#2f5a3a' : '#2e2433';
  });
}

// ---------- Artorias' grave: stone and the Cleansing Greatshield (Sif took the sword) ----------
function grave() {
  const group = new THREE.Group();
  const stone = voxelize([-8, 0, -6], [8, 11, 6], (x, y, z) => {
    const mound = inEllipsoid(x, y, z, [0, 0, 0], [8, 4.5, 6]);
    const slab = inBox(x, y, z, [2, 0, -3], [4, 11, 3]) && !(y === 11 && Math.abs(z) === 3);
    if (!mound && !slab) return null;
    const n = hash(x, y, z);
    if (mound && y >= 3 && n > 0.45) return '#3e8e41';
    return n > 0.6 ? '#6a6478' : n > 0.25 ? '#57516a' : '#47425a';
  });
  group.add(stone);

  // Cleansing Greatshield: tall steel greatshield with a rounded top, gold rim and emblem.
  const shield = voxelize([-6, 0, -1], [6, 16, 0], (x, y, z) => {
    const top = y > 11 ? (x / 6) ** 2 + ((y - 11) / 5.5) ** 2 <= 1 : true;
    const bottom = y < 3 ? Math.abs(x) <= 3 + y : true;
    if (Math.abs(x) > 6 || !top || !bottom) return null;
    if (z === -1) return '#5e6170';
    const innerTop = y > 11 ? (x / 4.8) ** 2 + ((y - 11) / 4.4) ** 2 <= 1 : true;
    const innerBottom = y < 4 ? Math.abs(x) <= 2 + y : true;
    const rim = Math.abs(x) >= 6 || !innerTop || !innerBottom || y === 0;
    if (rim) return '#c9a24e';
    const emblem = (x === 0 && y >= 4 && y <= 13) || (y === 10 && Math.abs(x) <= 3) || (Math.abs(x) + Math.abs(y - 10) === 2);
    if (emblem) return '#b38a35';
    // Two small crossed swords behind the emblem: silver blades, gold guards, dark grips.
    for (const dir of [1, -1]) {
      const along = y - 2;
      const cx = dir * (-4 + along * 0.66);
      if (along >= 1 && along <= 8 && Math.abs(x - cx) <= 0.5) return '#7d8194';
      if (along === 9 && Math.abs(x - cx) <= 1.5) return '#d8b45a';
      if (along >= 10 && along <= 11 && Math.abs(x - cx) <= 0.5) return '#3a2a22';
    }
    return (x + y) % 5 === 0 ? '#dfe3ec' : '#cfd3de';
  });
  shield.position.set(-1.5, 0, 6.5);
  shield.rotation.set(-0.28, 0.35, 0);
  group.add(shield);
  return group;
}

// ---------- Bonfire: ash, bones, coiled sword, embers and voxel flames ----------
function bonfire() {
  const group = new THREE.Group();
  group.add(
    voxelize([-6, 0, -6], [6, 3, 6], (x, y, z) => {
      if (!inEllipsoid(x, y, z, [0, 0, 0], [6, 3, 6])) return null;
      const n = hash(x, y, z);
      if (y >= 1 && n > 0.93) return '#d9d0b8'; // bone bits
      return n > 0.6 ? '#6e6470' : n > 0.3 ? '#55505c' : '#3d3844';
    })
  );
  // A skull resting on the ash.
  const skull = voxelize([-2, 0, -2], [2, 3, 2], (x, y, z) => {
    if (!inEllipsoid(x, y, z, [0, 1.5, 0], [2.2, 1.8, 2])) return null;
    if (z === 2 && y === 2 && Math.abs(x) === 1) return '#2a2230';
    return '#e6dcc4';
  });
  skull.position.set(3.5, 2, 3);
  skull.rotation.y = -0.5;
  group.add(skull);

  // Coiled sword: the blade twists as it rises (a voxel helix), hilt on top.
  const coil = voxelize([-2, 0, -2], [2, 20, 2], (x, y, z) => {
    if (y <= 13) {
      const a = y * 0.75;
      const cx = Math.round(Math.cos(a) * 0.8);
      const cz = Math.round(Math.sin(a) * 0.8);
      if ((x === cx && z === cz) || (x === 0 && z === 0)) return y % 3 === 0 ? '#c6cad6' : '#8f93a3';
      return null;
    }
    if (y === 14 && Math.abs(x) <= 2 && z === 0) return '#6e5a39';
    if (y >= 15 && y <= 18 && x === 0 && z === 0) return '#3a2a1f';
    if (y === 19 && x === 0 && z === 0) return '#8b7a4a';
    return null;
  });
  coil.position.y = 1;
  group.add(coil);

  // Embers glow in the ash before it is lit.
  const embers = voxelize([-5, 1, -5], [5, 3, 5], (x, y, z) =>
    inEllipsoid(x, y, z, [0, 0, 0], [5.5, 3.2, 5.5]) && !inEllipsoid(x, y, z, [0, 0, 0], [4.8, 2.4, 4.8]) && hash(x, y, z) > 0.86 ? '#ff7a1a' : null,
  { glow: ['#ff7a1a'] });
  group.add(embers);

  // Flames: a pool of voxels that rise, shrink and change color.
  const FLAMES = 80;
  const flames = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#ffffff' }), FLAMES);
  flames.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(FLAMES * 3), 3);
  const parts = Array.from({ length: FLAMES }, (_, i) => ({ life: i / FLAMES, a: hash(i, 1, 2) * Math.PI * 2, r: 0.5 + hash(i, 3, 4) * 2.8, speed: 0.7 + hash(i, 5, 6) * 0.6 }));
  group.add(flames);

  const light = new THREE.PointLight('#ff8a3a', 0, 80, 1.4);
  light.position.set(0, 9, 2);
  group.add(light);

  const colors = [new THREE.Color('#fff4d6'), new THREE.Color('#fdb813'), new THREE.Color('#e8641e'), new THREE.Color('#8e2b1a')];
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  let lit = 0;
  group.userData.update = (dt, t, on) => {
    lit = approach(lit, on ? 1 : 0, 3, dt);
    flames.visible = lit > 0.02;
    embers.children.forEach((e) => e.material.color.setScalar(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 3))).multiply(c.set('#ff7a1a')));
    light.intensity = lit * (110 + Math.sin(t * 17) * 18 + Math.sin(t * 7) * 14);
    if (!flames.visible) return;
    parts.forEach((p, i) => {
      p.life += dt * p.speed;
      if (p.life > 1) {
        p.life -= 1;
        p.a = Math.random() * Math.PI * 2;
        p.r = 0.4 + Math.random() * 2.8;
      }
      const k = p.life;
      const r = p.r * (1 - k * 0.8);
      const s = (2 - k * 1.5) * lit;
      m.makeScale(s, s, s);
      m.setPosition(Math.cos(p.a + k * 2) * r, 2.5 + k * 13 * lit, Math.sin(p.a + k * 2) * r);
      flames.setMatrixAt(i, m);
      const ci = Math.min(2, Math.floor(k * 3));
      c.copy(colors[ci]).lerp(colors[ci + 1], k * 3 - ci);
      flames.setColorAt(i, c);
    });
    flames.instanceMatrix.needsUpdate = true;
    flames.instanceColor.needsUpdate = true;
  };
  return group;
}

// ---------- Sif: the great grey wolf, sitting, facing the fire (toward -x) ----------
const FUR = ['#8e94a6', '#9da3b4', '#7d8396'];
const fur = (x, y, z) => FUR[Math.floor(hash(x, y, z) * 3)];

function sif() {
  const group = new THREE.Group();
  const body = voxelize([-6, 0, -7], [13, 17, 7], (x, y, z) => {
    const haunch = inEllipsoid(x, y, z, [6, 6, 0], [6.5, 6.5, 5.5]);
    const torso = inEllipsoid(x, y, z, [1, 10, 0], [4.8, 7.5, 4.3]);
    const legs = (x >= -3 && x <= -1 && Math.abs(Math.abs(z) - 2.2) <= 1 && y <= 8);
    const paws = inEllipsoid(x, y, z, [-3, 0.8, 2.3], [2, 1.2, 1.3]) || inEllipsoid(x, y, z, [-3, 0.8, -2.3], [2, 1.2, 1.3]);
    const hind = inEllipsoid(x, y, z, [3, 1, 4.5], [3.5, 1.4, 1.6]) || inEllipsoid(x, y, z, [3, 1, -4.5], [3.5, 1.4, 1.6]);
    if (!haunch && !torso && !legs && !paws && !hind) return null;
    // Light chest and paws, darker saddle along the back.
    if ((torso && x <= -1 && y >= 6 && y <= 15) || paws) return hash(x, y, z) > 0.5 ? '#e4e7ee' : '#d4d8e2';
    if (y >= 11 && x >= 3) return '#6f7588';
    return fur(x, y, z);
  });
  group.add(body);

  // Head on a neck pivot so it can turn and tilt.
  const head = new THREE.Group();
  head.position.set(-1, 16, 0);
  const skull = voxelize([-10, -4, -4], [4, 9, 4], (x, y, z) => {
    const cranium = inEllipsoid(x, y, z, [-1, 2.5, 0], [4.4, 4, 3.6]);
    const snout = inEllipsoid(x, y, z, [-6.5, 0.8, 0], [4.2, 1.8, 1.9]);
    const ear = (side) => {
      const dz = z - side * 2;
      const h = y - 5;
      return h >= 0 && h <= 4 && Math.abs(x + 0.5) <= 1.6 - h * 0.35 && Math.abs(dz) <= 1.4 - h * 0.3;
    };
    const ruff = inEllipsoid(x, y, z, [1.5, -1, 0], [3.5, 3.2, 4.4]);
    if (!cranium && !snout && !ear(1) && !ear(-1) && !ruff) return null;
    if (snout && x <= -9) return '#1a1020'; // nose
    if (snout && y <= -0.5 && x <= -5) return '#2a2230'; // mouth line
    if (cranium && Math.abs(z) === 3 && y === 3 && x >= -3 && x <= -2) return '#1a1020'; // eyes
    if ((ear(1) || ear(-1)) && Math.abs(Math.abs(z) - 2) <= 0.4 && x >= -1 && x <= 0) return '#5a5f70';
    if (snout || ruff) return hash(x, y, z) > 0.5 ? '#e4e7ee' : '#cdd1dc';
    return fur(x, y, z);
  });
  head.add(skull);
  // The Greatsword of Artorias held crosswise in the jaws: the long blade runs out to one side and
  // dips toward the ground, the guard and grip stick out on the other side of the muzzle.
  const sword = voxelize([-8, -16, -12], [-4, 4, 36], (x, y, z) => {
    if (x < -7 || x > -5) return null;
    if (z >= -1 && z <= 35) {
      const yc = -Math.max(0, z - 3) * 0.36;
      const half = z > 31 ? 1.2 - (z - 31) * 0.3 : 1.4;
      if (Math.abs(y - yc) > half) return null;
      return Math.abs(y - yc) < 0.5 && x === -6 ? '#f3f5fa' : '#b9bdcc';
    }
    if (z === -2 && Math.abs(y) <= 3) return '#2e2e3c';
    if (z >= -8 && z <= -3 && Math.abs(y) <= 0.6 && x === -6) return z % 2 ? '#3a2a22' : '#4e3a2c';
    if (z === -9 && Math.abs(y) <= 1 && x === -6) return '#9a8a5a';
    return null;
  });
  sword.position.set(0, 0.4, 0);
  head.add(sword);
  group.add(head);

  // Bushy tail curled on the ground, on a pivot for wagging.
  const tail = new THREE.Group();
  tail.position.set(11, 3, 2);
  tail.add(
    voxelize([-2, -3, -2], [8, 4, 9], (x, y, z) => {
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const c = [t * 5, 1 - t * 2.5, t * 6.5];
        if (inEllipsoid(x, y, z, c, [2.2 - t * 0.6, 1.8 - t * 0.5, 2.2 - t * 0.6])) return t > 0.8 ? '#e4e7ee' : fur(x, y, z);
      }
      return null;
    })
  );
  group.add(tail);
  group.userData = { head, tail };
  return group;
}

export function mountSouls() {
  const host = document.querySelector('.savepoint__scene');
  const fireBtn = host?.querySelector('.savepoint__fire-btn');
  const sifBtn = host?.querySelector('.sif');
  if (!host || !fireBtn || !sifBtn) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fun3d fun3d--souls';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 2, 1, 600);
  addLights(scene, { key: [-0.4, 1, 0.8], intensity: 1.6 });
  scene.add(new THREE.AmbientLight('#2e2a45', 0.6));

  const world = new THREE.Group();
  scene.add(world);
  world.add(ground());
  const tomb = grave();
  tomb.position.set(-21, 0, -2);
  world.add(tomb);
  const fire = bonfire();
  fire.scale.setScalar(1.35);
  world.add(fire);
  const wolf = sif();
  wolf.position.set(12, 0, -1);
  // Three-quarter view so the bitten sword reads across the scene.
  wolf.rotation.y = 0.6;
  world.add(wolf);

  const target = new THREE.Vector3(0, 11, 0);
  const v = new THREE.Vector3();
  const box = new THREE.Box3();
  let yaw = 0;
  let wag = 0;

  // Put a real button over a model's box on screen.
  function cover(btn, obj) {
    box.setFromObject(obj);
    const c = canvas.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) {
          v.set(x, y, z).project(camera);
          const sx = ((v.x + 1) / 2) * c.width;
          const sy = ((1 - v.y) / 2) * c.height;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
    Object.assign(btn.style, {
      left: `${c.left - h.left + minX}px`,
      top: `${c.top - h.top + minY}px`,
      width: `${maxX - minX}px`,
      height: `${maxY - minY}px`,
    });
  }

  let since = 9;
  new MutationObserver(() => sifBtn.classList.contains('is-wag') && (since = 0)).observe(sifBtn, { attributes: true, attributeFilter: ['class'] });

  view(canvas, {
    scene,
    camera,
    resize(w, h) {
      // Fit the diorama width (about 72 voxels) with a slightly high angle.
      const dist = 37 / (Math.tan((FOV * Math.PI) / 360) * (w / h));
      camera.position.set(0, dist * 0.3, dist);
      camera.lookAt(target);
    },
    update(dt, t) {
      if (root.classList.contains('time-stop')) dt = 0;
      // The diorama turns a little with the pointer and on its own.
      const want = pointer.active ? ((pointer.x / innerWidth) - 0.5) * 0.5 : Math.sin(t * 0.3) * 0.18;
      yaw = approach(yaw, want, 2, dt);
      world.rotation.y = yaw;
      fire.userData.update(dt, t, fireBtn.classList.contains('is-lit'));
      // Sif breathes, watches the fire, wags and tilts the head when petted.
      since += dt;
      const { head, tail } = wolf.userData;
      wolf.scale.y = 1 + Math.sin(t * 2) * 0.012;
      const happy = since < 1.4;
      wag = approach(wag, happy ? 1 : 0, 6, dt);
      tail.rotation.y = Math.sin(t * (happy ? 18 : 1.5)) * (0.12 + wag * 0.35);
      head.rotation.z = approach(head.rotation.z, happy ? 0.28 : Math.sin(t * 0.5) * 0.05, 5, dt);
      head.rotation.y = approach(head.rotation.y, happy ? -0.4 : 0.1, 4, dt);
      cover(fireBtn, fire);
      cover(sifBtn, wolf);
    },
  });
}
