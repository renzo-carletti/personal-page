// Dark Souls corner as a 3D diorama: Artorias' grave (a mossy monolith in a field of small swords)
// with the Cleansing Greatshield, the bonfire
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

// ---------- Cleansing Greatshield: tall dark steel greatshield with silver filigree ----------
// Flat top with raised corners, sides tapering to a point; navy-black steel, a silver rim and
// curling silver ornament with a faint blue sheen.
function greatshield() {
  const shield = new THREE.Group();
  const outline = (s) => {
    const sh = new THREE.Shape();
    sh.moveTo(-5.4 * s, 17 * s);
    sh.quadraticCurveTo(0, 15.8 * s, 5.4 * s, 17 * s);
    sh.lineTo(5 * s, 9 * s);
    sh.quadraticCurveTo(4.4 * s, 3 * s, 0, -1.5 * s);
    sh.quadraticCurveTo(-4.4 * s, 3 * s, -5 * s, 9 * s);
    sh.closePath();
    return sh;
  };
  const extrude = (shape, depth, bevel) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 });
  const rim = new THREE.Mesh(extrude(outline(1), 0.6, 0.3), toon('#aeb8cc'));
  rim.position.z = -0.6;
  const face = new THREE.Mesh(extrude(outline(0.88), 0.6, 0.25), toon('#1f2538'));
  face.position.set(0, 0.9, 0);
  shield.add(rim, face);
  const front = 1.2;
  const silver = toon('#c9d2e6');
  const sheen = new THREE.MeshBasicMaterial({ color: '#7fb3ff', transparent: true, opacity: 0.55 });
  // Filigree: a central spine, mirrored curls and a ring, with a thin glowing line inside.
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 13, 0.3), silver);
  spine.position.set(0, 8, front);
  shield.add(spine);
  [-1, 1].forEach((side) => {
    for (const [y, r, from, len] of [[12.6, 2.6, 0, Math.PI * 1.2], [7.4, 2.2, Math.PI, Math.PI * 1.1], [3.4, 1.5, 0, Math.PI]]) {
      const curl = new THREE.Mesh(new THREE.TorusGeometry(r, 0.22, 6, 24, len), silver);
      curl.position.set(side * (r + 0.3), y, front);
      curl.rotation.set(0, side < 0 ? Math.PI : 0, from);
      shield.add(curl);
    }
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.3, 8, 28), silver);
  ring.position.set(0, 10, front + 0.05);
  const glow = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 6, 28), sheen);
  glow.position.set(0, 10, front + 0.2);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.15, 11, 0.1), sheen);
  line.position.set(0, 7.5, front + 0.2);
  shield.add(ring, glow, line);
  return shield;
}

// ---------- Artorias' grave: a tall mossy monolith on a stone base, the shield leaning on it ----------
function grave() {
  const group = new THREE.Group();
  const stone = smooth([-8, -1, -7], [8, 25, 7], (x, y, z) => {
    const base = inEllipsoid(x, y, z, [0, 0, 0], [7.5, 3.2, 6]);
    // The monolith narrows a little and rounds off at the top; rough faces from the noise.
    const w = 3.6 - y * 0.06 + (patch(x, y, z, 2) - 0.5) * 0.9;
    const pillar = y >= 0 && y <= 23 && Math.abs(x - 0.5) <= w && Math.abs(z) <= w * 0.75 && inEllipsoid(x, y, z, [0.5, 10, 0], [5, 14, 5]);
    if (!base && !pillar) return null;
    const n = patch(x, y, z, 3);
    if ((base && y >= 1.5 && n > 0.58) || (pillar && n > 0.8)) return '#3e8e41';
    if (pillar && y > 19 && n > 0.62) return '#2f5a3a';
    return n > 0.62 ? '#6a6478' : n > 0.3 ? '#57516a' : '#4a4560';
  }, { res: 64, fallback: '#57516a' });
  group.add(stone);
  const shield = greatshield();
  shield.position.set(-1, 0.5, 6.2);
  shield.rotation.set(-0.22, 0.3, 0.04);
  group.add(shield);
  return group;
}

// ---------- The field of small swords stuck in the ground around the grave ----------
function swordField() {
  const field = new THREE.Group();
  const blade = new THREE.BoxGeometry(0.45, 6, 0.18);
  const guard = new THREE.BoxGeometry(2, 0.35, 0.4);
  const grip = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 6);
  const steel = [toon('#6f7486'), toon('#8a8f9e'), toon('#5a5d6b')];
  const dark = toon('#3a3540');
  const spots = [[-31, -6], [-28, 4], [-25, 9], [-14, 9], [-10, -9], [-6, 10], [5, -10], [9, 10], [22, -9], [27, 6], [30, -3], [-33, 0], [16, 11], [-18, -10]];
  spots.forEach(([x, z], i) => {
    const sword = new THREE.Group();
    const b = new THREE.Mesh(blade, steel[i % 3]);
    b.position.y = 2.2;
    const g = new THREE.Mesh(guard, dark);
    g.position.y = 5.3;
    const h = new THREE.Mesh(grip, dark);
    h.position.y = 6.2;
    sword.add(b, g, h);
    sword.position.set(x, -0.6, z);
    sword.rotation.set((hash(i, 1, 0) - 0.5) * 0.5, hash(i, 2, 0) * Math.PI, (hash(i, 3, 0) - 0.5) * 0.6);
    sword.scale.setScalar(0.85 + hash(i, 4, 0) * 0.35);
    field.add(sword);
  });
  return field;
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
  const steel = toon('#b9c3d6');
  const dark = toon('#262634');
  const grip = toon('#1f1d2b');
  const gold = toon('#8f97ad');

  // Blade outline in the XY plane: very long and narrow, parallel edges, short point.
  const L = 33;
  const W = 0.75;
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
  const fullerGeo = new THREE.BoxGeometry(0.06, 0.32, L - 8);
  [-0.37, 0.37].forEach((x) => {
    const fuller = new THREE.Mesh(fullerGeo, toon('#7d8396'));
    fuller.position.set(x, 0, (L - 8) / 2 + 1.5);
    sword.add(fuller);
  });

  // Cross guard, grip with wrap rings, pommel.
  // Ornate dark guard: a bar with curled ends sweeping toward the blade.
  const guard = new THREE.Mesh(new THREE.BoxGeometry(1, 5.2, 1), dark);
  guard.position.z = -0.4;
  sword.add(guard);
  [-1, 1].forEach((side) => {
    const curl = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.3, 6, 16, Math.PI * 1.3), dark);
    curl.rotation.set(0, Math.PI / 2, side > 0 ? -0.4 : Math.PI + 0.4);
    curl.position.set(0, side * 3.2, 0.4);
    sword.add(curl);
  });
  const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), gold);
  jewel.position.set(0.55, 0, -0.4);
  sword.add(jewel);
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
// Tones from the original: dark charcoal-brown back and head, warm grey flanks, sandy legs and
// chest, a dark mask on the muzzle.
const SILVER = '#6e6a68';
const BACK = '#423e43';
const SAND = '#a39b8f';
const MASK = '#353135';

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
    if (paws || legs || (torso && x <= -1.5 && y >= 5 && y <= 13) || (hind && y < 2)) return SAND;
    if (y >= 10 && x >= 1) return BACK;
    if (haunch && y < 4) return SAND;
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
      if (snout && y <= -0.3 && x <= -5) return '#231f24'; // mouth line
      if (snout) return MASK;
      if (ruff) return y < -1 ? SAND : SILVER;
      return BACK;
    }, { res: 52, fallback: SILVER })
  );
  // Pointed ears, dark nose, eyes.
  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.2, 4), toon(MASK));
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
  bite.rotation.set(0.22, -0.55, 0);
  const sword = greatsword();
  // Grip center (z = -4.2 in the sword's own space) sits in the mouth.
  sword.position.z = 4.2;
  bite.add(sword);
  head.add(bite);
  group.add(head);
  const biteRest = { position: bite.position.clone(), quaternion: bite.quaternion.clone() };

  // Bushy tail curled on the ground, on a pivot for wagging.
  const tail = new THREE.Group();
  tail.position.set(11, 3, 2);
  tail.add(
    smooth([-3, -4, -3], [9, 5, 10], (x, y, z) => {
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const c = [t * 5, 1 - t * 2.5, t * 6.5];
        if (inEllipsoid(x, y, z, c, [2.3 - t * 0.7, 1.9 - t * 0.6, 2.3 - t * 0.7])) return t > 0.8 ? SAND : y > 1 ? BACK : SILVER;
      }
      return null;
    }, { res: 40, fallback: SILVER })
  );
  group.add(tail);
  group.userData = { head, tail, bite, biteRest, headRest: head.position.clone() };
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
  world.add(swordField());
  const fire = bonfire();
  fire.scale.setScalar(1.35);
  world.add(fire);
  const wolf = sif();
  // A little room between the bonfire and Sif, so the dropped sword fits in front of her.
  wolf.position.set(16, 0, -1);
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

  // Petting Sif: she bows (neck down and forward, body leaning in) to carry the sword to the
  // ground in her jaws, lets go and it settles flat in place, she howls, then bows again, takes it
  // back and sits up. Everything follows smooth curves with no stops or jumps: the head moves along
  // eased keyframes and the sword along one curve each way, through a "flat" pose (lying where it
  // already points, grip under the mouth) on the way to its place by the bonfire.
  // The tip never goes through the ground: while she carries it down it rests on the ground and
  // slides. Timeline (s): bow 0–0.9, lay it down 0.8–2.2 (+ a small clank), howl 2.75–3.8, bow
  // 3.9–4.35, lift it 4.35–5.65, sit up 5.65–6.45.
  const HOWL = 6.45;
  const DROP = [0.8, 1.4];
  const LIFT = [4.35, 1.3];
  const SETTLE = 0.35;
  // Head pitch (+ = nose down), bow amount and head turn over time; eased between keys.
  const PITCH = [[0, 0], [0.9, 0.9], [2.2, 0.9], [2.75, -0.85], [3.8, -0.85], [4.35, 0.9], [5.65, 0.9], [6.45, 0]];
  const BOWING = [[0, 0], [0.9, 1], [2.2, 1], [2.75, 0], [3.9, 0], [4.35, 1], [5.65, 1], [6.45, 0]];
  const TURN = [[0, 0.1], [2.3, 0.1], [2.75, -0.15], [3.8, -0.15], [4.2, 0.1]];
  const HOWLING = [[2.5, 0], [2.8, 1], [3.6, 1], [3.8, 0]];
  // Head offset at a full bow (wolf space): the neck stretches down and forward.
  const BOW = new THREE.Vector3(-2.5, -4, 0);
  let since = 9;
  let phase = 'held';
  const pose = () => ({ position: new THREE.Vector3(), quaternion: new THREE.Quaternion() });
  const from = pose();
  const flat = pose();
  const held = pose();
  // Where the sword lies (diorama space): flat on the ground across the front of the clearing,
  // grip by Sif's paws and the long blade pointing toward the bonfire, in plain view.
  const onGround = { position: new THREE.Vector3(24, 0.7, 5), quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.atan2(-31, 6), Math.PI / 2, 'YXZ')) };
  const ease = (k) => k * k * (3 - 2 * k);
  const track = (keys, s) => {
    if (s <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1] = keys[i];
      if (s < t1) {
        const [t0, v0] = keys[i - 1];
        return v0 + (v1 - v0) * ease((s - t0) / (t1 - t0));
      }
    }
    return keys[keys.length - 1][1];
  };
  new MutationObserver(() => {
    if (sifBtn.classList.contains('is-howl') && since > HOWL) {
      since = 0;
      phase = 'held';
    }
  }).observe(sifBtn, { attributes: true, attributeFilter: ['class'] });

  // The pose the sword has in the jaws right now, in diorama space (follows the moving head).
  const restMatrix = new THREE.Matrix4();
  const m = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  function heldPose(out) {
    const { head, biteRest } = wolf.userData;
    world.updateMatrixWorld(true);
    restMatrix.compose(biteRest.position, biteRest.quaternion, tmp.set(1, 1, 1));
    m.copy(world.matrixWorld).invert().multiply(head.matrixWorld).multiply(restMatrix);
    m.decompose(out.position, out.quaternion, tmp);
  }

  // Lying on the ground, pointing the way the sword in the jaws points now, grip under the mouth.
  function flatPose(out) {
    const dir = tmp.set(0, 0, 1).applyQuaternion(from.quaternion);
    out.quaternion.setFromEuler(new THREE.Euler(0, Math.atan2(dir.x, dir.z), Math.PI / 2, 'YXZ'));
    out.position.lerpVectors(from.position, onGround.position, 0.4).setY(onGround.position.y);
  }

  // One smooth curve from pose a to pose c, bending toward pose b (a quadratic Bézier for the
  // position and the same construction with slerps for the rotation), eased at both ends.
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  function moveSword(bite, a, b, c, k) {
    const e = ease(k);
    const u = 1 - e;
    bite.position
      .copy(a.position).multiplyScalar(u * u)
      .addScaledVector(b.position, 2 * u * e)
      .addScaledVector(c.position, e * e);
    qa.slerpQuaternions(a.quaternion, b.quaternion, e);
    qb.slerpQuaternions(b.quaternion, c.quaternion, e);
    bite.quaternion.slerpQuaternions(qa, qb, e);
  }
  // If the tip of the sword is below the ground, tilt the blade up about the grip until it rests
  // on it (diorama space), so it slides along the ground instead of sinking into it.
  const TIP = new THREE.Vector3(0, 0, 37);
  const FLOOR = 0.8;
  const grip = new THREE.Vector3();
  const tip = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const pq = new THREE.Quaternion();
  const rq = new THREE.Quaternion();
  function keepTipUp(bite) {
    world.updateMatrixWorld(true);
    world.worldToLocal(bite.getWorldPosition(grip));
    world.worldToLocal(bite.localToWorld(tip.copy(TIP)));
    if (tip.y >= FLOOR) return;
    const len = grip.distanceTo(tip);
    const clamp = (x) => Math.min(1, Math.max(-1, x));
    const angle = Math.asin(clamp((grip.y - tip.y) / len)) - Math.asin(clamp((grip.y - FLOOR) / len));
    // Turning it about (blade direction × up) by a positive angle raises the tip.
    axis.subVectors(tip, grip).cross(tmp.set(0, 1, 0)).normalize().transformDirection(world.matrixWorld);
    bite.parent.getWorldQuaternion(pq);
    rq.setFromAxisAngle(axis, angle).premultiply(pq.clone().invert()).multiply(pq);
    bite.quaternion.premultiply(rq);
  }
  const progress = ([start, length]) => Math.min(1, Math.max(0, (since - start) / length));

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
      // Sif breathes and watches the fire; when petted she drops the sword, howls, picks it up.
      since += dt;
      const { head, tail, bite, biteRest, headRest } = wolf.userData;
      wolf.scale.y = 1 + Math.sin(t * 2) * 0.012;
      const acting = since < HOWL;
      const k = acting ? since : HOWL;
      head.rotation.z = Math.sin(t * 0.5) * 0.05 + track(PITCH, k) + Math.sin(since * 9) * 0.04 * track(HOWLING, k);
      head.rotation.y = track(TURN, k);
      // Bowing: neck down and forward, body leaning in a little toward the paws.
      const bow = track(BOWING, k);
      head.position.copy(headRest).addScaledVector(BOW, bow);
      wolf.rotation.z = bow * 0.05;
      const happy = acting && since > 5.6;
      wag = approach(wag, happy ? 1 : 0, 6, dt);
      tail.rotation.y = Math.sin(t * (happy ? 18 : 1.5)) * (0.12 + wag * 0.35);
      // Lay it down: from the jaws, through lying flat where it points, into its place.
      if (acting && phase === 'held' && since >= DROP[0]) {
        world.attach(bite);
        from.position.copy(bite.position);
        from.quaternion.copy(bite.quaternion);
        flatPose(flat);
        phase = 'down';
      }
      if (phase === 'down') {
        const p = progress(DROP);
        moveSword(bite, from, flat, onGround, p);
        if (p === 1) phase = 'ground';
      }
      // On the ground, with a small clank as it settles.
      if (phase === 'ground') {
        const s = (since - DROP[0] - DROP[1]) / SETTLE;
        bite.position.copy(onGround.position);
        bite.quaternion.copy(onGround.quaternion);
        if (s < 1) bite.rotateZ(Math.sin(s * Math.PI * 3) * 0.04 * (1 - s) ** 2);
        if (since >= LIFT[0]) phase = 'lift';
      }
      // Pick it up: the same way back, into the jaws as they move.
      if (phase === 'lift') {
        const p = progress(LIFT);
        heldPose(held);
        moveSword(bite, onGround, flat, held, p);
        if (p === 1) {
          head.attach(bite);
          bite.position.copy(biteRest.position);
          bite.quaternion.copy(biteRest.quaternion);
          phase = 'held';
        }
      }
      keepTipUp(bite);
      cover(fireBtn, fire);
      cover(sifBtn, wolf);
    },
  });
}
