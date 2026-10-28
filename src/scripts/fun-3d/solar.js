// Star chart solar system in 3D: voxel sun and planets on a tilted orbit plane. Same orbits and
// periods as the 2D version. Dragging is handled in fun-play.js (it works in 2D too) and
// arrives here as the `--spin` angle on `.solar`.
import * as THREE from 'three';
import { planets, sun as sunSprite } from '../../components/fun/sprites.js';
import { addLights, glowTexture, spriteToVoxels } from './voxel.js';
import { approach, view } from './stage.js';

const FOV = 30;
const ORBITS = [
  { planet: planets.forest, r: 46, period: 9 },
  { planet: planets.sand, r: 72, period: 14 },
  { planet: planets.rock, r: 98, period: 21 },
  { planet: planets.gas, r: 126, period: 32, ring: true },
];
const root = document.documentElement;

function dottedCircle(r) {
  const count = Math.round(r / 2.5);
  const pts = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
  });
  const material = new THREE.PointsMaterial({ color: '#8cc7d9', size: 2.5, sizeAttenuation: false, transparent: true, opacity: 0.65 });
  return new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), material);
}

// A ring of small voxels around the gas giant.
function voxelRing(r, color) {
  const count = 22;
  const ring = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), new THREE.MeshBasicMaterial({ color }), count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    m.makeRotationY(-a);
    m.setPosition(Math.cos(a) * r, 0, Math.sin(a) * r);
    ring.setMatrixAt(i, m);
  }
  ring.rotation.z = 0.35;
  return ring;
}

export function mountSolar() {
  const host = document.querySelector('.solar');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fun3d fun3d--solar';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 3000);
  addLights(scene, { key: [0, 0.2, 1], intensity: 1.2 });
  // The sun lights the planets from the middle.
  scene.add(new THREE.PointLight('#ffd98a', 3, 0, 0));

  const system = new THREE.Group();
  scene.add(system);
  const sun = spriteToVoxels(sunSprite, { shape: 'round' });
  sun.scale.setScalar(36 / 11);
  sun.traverse((o) => o.material && (o.material = new THREE.MeshBasicMaterial({ color: o.material.color })));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), depthWrite: false }));
  glow.scale.setScalar(110);
  system.add(glow, sun);

  const bodies = ORBITS.map((o, i) => {
    system.add(dottedCircle(o.r));
    const planet = spriteToVoxels(o.planet, { shape: 'round' });
    planet.scale.setScalar(20 / 7);
    if (o.ring) planet.add(voxelRing(6.2, '#b9bcc8'));
    system.add(planet);
    return { ...o, planet, start: (i * 97 * Math.PI) / 180 };
  });

  let clock = 0;
  let spin = 0;

  view(canvas, {
    scene,
    camera,
    resize(w, h) {
      const fit = 150 / Math.tan((FOV * Math.PI) / 360) / Math.min(1, w / h);
      // Looking down at about 35 degrees, so the orbits read as tilted ellipses.
      camera.position.set(0, fit * 0.57, fit * 0.82);
      camera.lookAt(0, -6, 0);
    },
    update(dt) {
      if (root.classList.contains('time-stop')) dt = 0;
      clock += dt;
      const target = (parseFloat(host.style.getPropertyValue('--spin')) || 0) * (Math.PI / 180);
      spin = approach(spin, target, 10, dt);
      system.rotation.y = -spin;
      sun.rotation.y = clock * 0.4;
      glow.scale.setScalar(110 + Math.sin(clock * 2) * 6);
      bodies.forEach((b) => {
        const a = b.start + (clock / b.period) * Math.PI * 2;
        b.planet.position.set(Math.sin(a) * b.r, 0, -Math.cos(a) * b.r);
        b.planet.rotation.y = clock * (1.5 - b.r / 120);
      });
    },
  });
}
