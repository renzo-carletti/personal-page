// Dark Souls corner as a 3D diorama: Artorias' grave with the Cleansing Greatshield, the bonfire
// (coiled sword, ash and a skull), and Sif sitting by the fire with the Greatsword of Artorias held
// by the grip in her jaws. Organic shapes are smooth (marching cubes over the same shape tests),
// weapons are beveled geometry, all with the same 3-step toon light. Fan tribute, sculpted from
// scratch. The real buttons (bonfire, Sif) follow the models on screen.
import * as THREE from 'three';
import { addLights, hash, inBox, inEllipsoid, smooth, toon } from './voxel.js';
import { approach, pointer, view } from './stage.js';

const FOV = 28;
const root = document.documentElement;
// Soft, low-frequency noise in 0..1: rounded patches (moss, stone tones) on smooth surfaces.
const patch = (x, y, z, size = 4) => {
  const k = 1.3 / size;
  const v = Math.sin(x * k + Math.sin(z * k * 0.8) * 2) * Math.cos(z * k * 1.1 - x * k * 0.4) + 0.5 * Math.sin((x + y * 1.7 + z) * k * 1.9);
  return 0.5 + v / 3;
};

// ---------- Ground: a mossy patch of dark earth ----------
function ground() {
  return smooth([-35, -3, -15], [35, 1, 15], (x, y, z) => {
    if ((x / 34) ** 2 + (z / 14) ** 2 > 1 || y > 0.6 + Math.sin(x * 0.3) * 0.25 || y < -2.5) return null;
    if (y < -0.4) return '#241c28';
    const n = patch(x, 0, z, 5);
    return n > 0.62 ? '#3e8e41' : n > 0.35 ? '#2f5a3a' : '#2e2433';
  }, { res: 72, fallback: '#2e2433' });
}

// ---------- Cleansing Greatshield: steel face, gold rim, emblem and two small crossed swords ----------
function greatshield() {
  const shield = new THREE.Group();
  const outline = (s) => {
    const sh = new THREE.Shape();
    sh.moveTo(-6 * s, 4 * s);
    sh.lineTo(-6 * s, 11 * s);
    sh.absarc(0, 11 * s, 6 * s, Math.PI, 0, true);
    sh.lineTo(6 * s, 4 * s);
    sh.quadraticCurveTo(6 * s, 0, 0, -1.5 * s);
    sh.quadraticCurveTo(-6 * s, 0, -6 * s, 4 * s);
    return sh;
  };
  const extrude = (shape, depth, bevel) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 });
  const rim = new THREE.Mesh(extrude(outline(1), 0.6, 0.3), toon('#c9a24e'));
  rim.position.z = -0.6;
  const face = new THREE.Mesh(extrude(outline(0.86), 0.6, 0.25), toon('#d3d7e2'));
  face.position.set(0, 0.7, 0);
  shield.add(rim, face);
  const front = 1.15;
  const bar = (w, h, color, x, y, rot = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.35), toon(color));
    m.position.set(x, y, front);
    m.rotation.z = rot;
    shield.add(m);
    return m;
  };
  // Crossed swords behind the emblem: blade, guard, grip, pommel.
  [-1, 1].forEach((dir) => {
    const rot = dir * 0.62;
    const along = (d) => [Math.sin(-rot) * d, 7 + Math.cos(rot) * d];
    const [bx, by] = along(-0.5);
    bar(0.7, 10, '#8f94a6', bx, by, rot).position.z = front - 0.05;
    const [gx, gy] = along(4.8);
    bar(3, 0.55, '#d8b45a', gx, gy, rot);
    const [hx, hy] = along(6.2);
    bar(0.5, 2.2, '#3a2a22', hx, hy, rot);
  });
  // Emblem: a gold cross with a ring.
  bar(1.1, 9.5, '#b38a35', 0, 7.6);
  bar(6, 1.1, '#b38a35', 0, 9.8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.35, 8, 24), toon('#b38a35'));
  ring.position.set(0, 9.8, front + 0.1);
  shield.add(ring);
  return shield;
}

// ---------- Artorias' grave: stone and the Cleansing Greatshield (Sif took the sword) ----------
function grave() {
  const group = new THREE.Group();
  const stone = smooth([-9, -1, -7], [9, 13, 7], (x, y, z) => {
    const mound = inEllipsoid(x, y, z, [0, 0, 0], [8, 4.5, 6]);
    const slab = inBox(x, y, z, [1.6, 0, -3.2], [4.4, 11.5, 3.2]) && inEllipsoid(x, y, z, [3, 4, 0], [2.4, 8.5, 4.6]);
    if (!mound && !slab) return null;
    const n = patch(x, y, z, 3);
    if (y >= 3 && n > 0.5 && !slab) return '#3e8e41';
    if (slab && y > 9 && n > 0.6) return '#3e8e41';
    return n > 0.66 ? '#6a6478' : n > 0.3 ? '#57516a' : '#4a4560';
  }, { res: 56, fallback: '#57516a' });
  group.add(stone);
  const shield = greatshield();
  shield.position.set(-1.5, 0, 6.5);
  shield.rotation.set(-0.28, 0.35, 0);
  group.add(shield);
  return group;
}

// ---------- Bonfire: ash, a skull, the coiled sword, embers and flames ----------
function coiledSword() {
  const group = new THREE.Group();
  // Blade: a flat bar twisted along its length.
  const geo = new THREE.BoxGeometry(1.4, 13, 0.4, 1, 48, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const a = (y + 6.5) * 0.55;
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a));
  }
  geo.computeVertexNormals();
  const blade = new THREE.Mesh(geo, toon('#a9aebd'));
  blade.position.y = 6.5;
  const guard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.7, 1), toon('#6e5a39'));
  guard.position.y = 13.4;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 3.6, 10), toon('#3a2a1f'));
  grip.position.y = 15.5;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), toon('#8b7a4a'));
  pommel.position.y = 17.6;
  group.add(blade, guard, grip, pommel);
  return group;
}

function bonfire() {
  const group = new THREE.Group();
  group.add(
    smooth([-7, -1, -7], [7, 4, 7], (x, y, z) => {
      if (!inEllipsoid(x, y, z, [0, 0, 0], [6, 3, 6]) || y < -0.5) return null;
      const n = patch(x, y, z, 2);
      if (y >= 1.2 && n > 0.85) return '#d9d0b8'; // bone bits
      return n > 0.6 ? '#6e6470' : n > 0.3 ? '#55505c' : '#3d3844';
    }, { res: 44, fallback: '#55505c' })
  );
  // A skull resting on the ash, with dark eye sockets.
  const skull = new THREE.Group();
  skull.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12), toon('#e6dcc4')));
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1.8), toon('#d9cfb4'));
  jaw.position.set(0, -1.2, 0.4);
  skull.add(jaw);
  [-0.7, 0.7].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), toon('#2a2230'));
    eye.position.set(x, 0.1, 1.55);
    skull.add(eye);
  });
  skull.position.set(3.5, 3.2, 3);
  skull.rotation.y = -0.5;
  group.add(skull);

  const coil = coiledSword();
  coil.position.y = 1;
  group.add(coil);

  // Embers glow in the ash before it is lit.
  const emberCount = 26;
  const embers = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.45, 0), new THREE.MeshBasicMaterial({ color: '#ff7a1a' }), emberCount);
  const em = new THREE.Matrix4();
  for (let i = 0; i < emberCount; i++) {
    const a = hash(i, 7, 1) * Math.PI * 2;
    const r = 1.5 + hash(i, 8, 2) * 4;
    em.setPosition(Math.cos(a) * r, 3 * Math.sqrt(Math.max(0, 1 - (r / 6) ** 2)) - 0.1, Math.sin(a) * r);
    embers.setMatrixAt(i, em);
  }
  group.add(embers);

  // Flames: a pool of small chips that rise, shrink and change color.
  const FLAMES = 80;
  const flames = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.75, 0), new THREE.MeshBasicMaterial({ color: '#ffffff' }), FLAMES);
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
    embers.material.color.set('#ff7a1a').multiplyScalar(0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 3)));
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

// ---------- Greatsword of Artorias: smooth, beveled, straight ----------
// Built along +z from the guard (z = 0): blade toward +z, grip and pommel toward -z.
function greatsword() {
  const sword = new THREE.Group();
  const steel = toon('#cdd2df');
  const dark = toon('#2b2b3a');
  const grip = toon('#2a2238');
  const gold = toon('#b89a4e');

  // Blade outline in the XY plane: long, wide, parallel edges, short point at the end.
  const L = 29;
  const W = 1.2;
  const shape = new THREE.Shape();
  shape.moveTo(0, -W);
  shape.lineTo(L - 4, -W);
  shape.lineTo(L, 0);
  shape.lineTo(L - 4, W);
  shape.lineTo(0, W);
  shape.closePath();
  const bladeGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.35, bevelSegments: 1 });
  bladeGeo.translate(0, 0, -0.12);
  const blade = new THREE.Mesh(bladeGeo, steel);
  // Lay the blade along +z with its flat side facing out (x).
  blade.rotation.y = -Math.PI / 2;
  sword.add(blade);

  // Fuller: a darker groove down the middle of both faces.
  const fullerGeo = new THREE.BoxGeometry(0.06, 0.5, L - 8);
  [-0.37, 0.37].forEach((x) => {
    const fuller = new THREE.Mesh(fullerGeo, toon('#7d8396'));
    fuller.position.set(x, 0, (L - 8) / 2 + 1.5);
    sword.add(fuller);
  });

  // Cross guard, grip with wrap rings, pommel.
  const guard = new THREE.Mesh(new THREE.BoxGeometry(1.3, 7, 1.2), dark);
  guard.position.z = -0.4;
  sword.add(guard);
  [-3.5, 3.5].forEach((y) => {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 1.2), gold);
    tip.position.set(0, y, -0.4);
    sword.add(tip);
  });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6.5, 10), grip);
  handle.rotation.x = Math.PI / 2;
  handle.position.z = -4.2;
  sword.add(handle);
  for (let k = 0; k < 4; k++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 4, 10), dark);
    ring.position.z = -1.8 - k * 1.6;
    sword.add(ring);
  }
  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(1.05, 0), gold);
  pommel.position.z = -8;
  sword.add(pommel);
  return sword;
}

// ---------- Sif: the great grey wolf, sitting, facing the fire (toward -x) ----------
const SILVER = '#959bad';

function sif() {
  const group = new THREE.Group();
  const body = smooth([-7, -1, -8], [14, 18, 8], (x, y, z) => {
    const haunch = inEllipsoid(x, y, z, [6, 6, 0], [6.5, 6.5, 5.5]);
    const torso = inEllipsoid(x, y, z, [1, 10, 0], [4.8, 7.5, 4.3]);
    const legs = x >= -3.4 && x <= -0.8 && Math.abs(Math.abs(z) - 2.2) <= 1.1 && y <= 8;
    const paws = inEllipsoid(x, y, z, [-3, 0.8, 2.3], [2, 1.2, 1.4]) || inEllipsoid(x, y, z, [-3, 0.8, -2.3], [2, 1.2, 1.4]);
    const hind = inEllipsoid(x, y, z, [3, 1, 4.5], [3.5, 1.4, 1.7]) || inEllipsoid(x, y, z, [3, 1, -4.5], [3.5, 1.4, 1.7]);
    if (!haunch && !torso && !legs && !paws && !hind) return null;
    // Light chest and paws, darker saddle along the back.
    if ((torso && x <= -1 && y >= 6 && y <= 15) || paws) return '#dde1ea';
    if (y >= 11 && x >= 3) return '#737a8e';
    return SILVER;
  }, { res: 60, fallback: SILVER });
  group.add(body);

  // Head on a neck pivot so it can turn and tilt.
  const head = new THREE.Group();
  head.position.set(-1, 16, 0);
  head.add(
    smooth([-11, -5, -5], [5, 7, 5], (x, y, z) => {
      const cranium = inEllipsoid(x, y, z, [-1, 2.5, 0], [4.4, 4, 3.6]);
      const snout = inEllipsoid(x, y, z, [-6.5, 0.8, 0], [4.2, 1.8, 1.9]);
      const ruff = inEllipsoid(x, y, z, [1.5, -1, 0], [3.5, 3.2, 4.4]);
      if (!cranium && !snout && !ruff) return null;
      if (snout && y <= -0.3 && x <= -5) return '#2a2230'; // mouth line
      if (snout || ruff) return '#dde1ea';
      return SILVER;
    }, { res: 52, fallback: SILVER })
  );
  // Pointed ears, dark nose, eyes.
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.2, 4), toon('#8a90a2'));
    ear.position.set(-0.5, 7.2, side * 2);
    ear.rotation.set(side * 0.18, Math.PI / 4, side * -0.1);
    head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), toon('#1a1020'));
    eye.position.set(-3.6, 3.4, side * 2.55);
    head.add(eye);
  });
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), toon('#1a1020'));
  nose.position.set(-10.5, 1.3, 0);
  head.add(nose);

  // The Greatsword of Artorias, bitten by the grip: the grip crosses the jaws, the guard sits
  // against one side of the muzzle and the long blade runs out from there, dipping to the ground.
  const bite = new THREE.Group();
  bite.position.set(-6.6, 0.2, 0);
  // Tip down and a little toward the viewer, so the whole length shows across the scene.
  bite.rotation.set(0.3, -0.35, 0);
  const sword = greatsword();
  // Grip center (z = -4.2 in the sword's own space) sits in the mouth.
  sword.position.z = 4.2;
  bite.add(sword);
  head.add(bite);
  group.add(head);

  // Bushy tail curled on the ground, on a pivot for wagging.
  const tail = new THREE.Group();
  tail.position.set(11, 3, 2);
  tail.add(
    smooth([-3, -4, -3], [9, 5, 10], (x, y, z) => {
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const c = [t * 5, 1 - t * 2.5, t * 6.5];
        if (inEllipsoid(x, y, z, c, [2.3 - t * 0.7, 1.9 - t * 0.6, 2.3 - t * 0.7])) return t > 0.8 ? '#dde1ea' : SILVER;
      }
      return null;
    }, { res: 40, fallback: SILVER })
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
