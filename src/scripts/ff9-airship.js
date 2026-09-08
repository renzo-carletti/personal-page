let state = null;

export async function mount() {
  if (state) return;
  const THREE = await import('three');

  const host = document.querySelector('.hero') || document.body;
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-airship';
  host.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.remove();
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = () => {
    const w = canvas.clientWidth || 280;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * dpr);
    renderer.setSize(w, w, false);
    return w;
  };
  size();
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8);
  camera.lookAt(0, 0.1, 0);

  scene.add(new THREE.AmbientLight(0xfff2d8, 0.7));
  const dir = new THREE.DirectionalLight(0xffe0b0, 1.6);
  dir.position.set(3, 5, 5);
  scene.add(dir);
  const warm = new THREE.PointLight(0xffb050, 1.4, 24);
  warm.position.set(0, 2.4, 2);
  scene.add(warm);
  const front = new THREE.PointLight(0xffd9a0, 1.1, 14);
  front.position.set(-2.5, 0.5, 3.5);
  scene.add(front);

  const cream = new THREE.MeshStandardMaterial({ color: 0xf2e2bd, emissive: 0x6a4a1a, emissiveIntensity: 0.18, roughness: 0.55 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8a94f, emissive: 0x4a3008, emissiveIntensity: 0.28, roughness: 0.5 });
  const mahogany = new THREE.MeshStandardMaterial({ color: 0x6a4226, roughness: 0.85 });
  const redCurtain = new THREE.MeshStandardMaterial({ color: 0x9c1f2c, emissive: 0x3a080c, emissiveIntensity: 0.35, roughness: 0.7 });

  const group = new THREE.Group();

  const balloon = new THREE.Mesh(new THREE.SphereGeometry(1.6, 40, 28), cream);
  balloon.scale.set(1, 0.85, 1);
  balloon.position.y = 1.85;
  group.add(balloon);

  const redBand = (y, r) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.11, 12, 48), redCurtain);
    m.scale.set(1, 0.85, 1);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    return m;
  };
  group.add(redBand(1.55, 1.62));
  group.add(redBand(2.3, 1.6));

  const goldBand = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.045, 10, 48), gold);
  goldBand.scale.set(1, 0.85, 1);
  goldBand.rotation.x = Math.PI / 2;
  goldBand.position.y = 1.92;
  group.add(goldBand);

  const chateau = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.9), cream);
  chateau.position.y = 0.72;
  group.add(chateau);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.55, 4), gold);
  roof.position.y = 1.27;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const windows = [];
  for (const x of [-0.3, 0, 0.3]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.05), gold);
    w.position.set(x, 0.75, 0.47);
    windows.push(w);
    group.add(w);
  }

  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 1.3, 1.0, 4), mahogany);
  hull.rotation.y = Math.PI / 4;
  hull.position.y = -0.3;
  group.add(hull);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.8 }));
  deck.position.y = -0.02;
  group.add(deck);

  const curtain = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.62, 0.14), redCurtain);
  curtain.position.set(0, -0.35, 0.62);
  group.add(curtain);

  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.06, 0.16), gold);
  trim.position.set(0, -0.04, 0.63);
  group.add(trim);

  const propeller = new THREE.Group();
  for (const rx of [0, Math.PI / 2]) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.03), gold);
    blade.rotation.x = rx;
    propeller.add(blade);
  }
  propeller.position.set(0, -0.4, -1.2);
  group.add(propeller);

  scene.add(group);

  const viviMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2e, roughness: 0.85 });
  const viviDark = new THREE.MeshStandardMaterial({ color: 0x2a1f28, roughness: 0.8 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xffd94f, emissive: 0xffb020, emissiveIntensity: 1.6 });

  const vivi = new THREE.Group();
  const vBody = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 20), viviMat);
  vBody.position.y = -0.22;
  vivi.add(vBody);
  const vCloak = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.68, 12), viviMat);
  vCloak.position.y = -0.5;
  vCloak.rotation.x = Math.PI;
  vivi.add(vCloak);
  const vHat = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.15, 16), viviDark);
  vHat.position.y = 0.68;
  vivi.add(vHat);
  const vBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 20), viviDark);
  vBrim.position.y = 0.24;
  vivi.add(vBrim);
  const vEyeG = new THREE.SphereGeometry(0.085, 14, 12);
  const vE1 = new THREE.Mesh(vEyeG, glowMat);
  vE1.position.set(-0.16, 0.18, 0.54);
  vivi.add(vE1);
  const vE2 = new THREE.Mesh(vEyeG, glowMat);
  vE2.position.set(0.16, 0.18, 0.54);
  vivi.add(vE2);
  const vStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.8 }));
  vStaff.position.set(0.6, -0.7, 0);
  vStaff.rotation.z = 0.3;
  vivi.add(vStaff);
  const vOrb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), glowMat);
  vOrb.position.set(0.82, -0.1, 0);
  vivi.add(vOrb);
  vivi.position.set(-1.5, -0.45, 0.7);
  vivi.scale.setScalar(1.2);
  scene.add(vivi);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    group.position.y = Math.sin(t * 0.8) * 0.1;
    group.rotation.y = Math.sin(t * 0.3) * 0.14;
    group.rotation.z = Math.sin(t * 0.45) * 0.02;
    propeller.rotation.z = t * 2.4;
    vivi.position.y = -0.45 + Math.sin(t * 1.1 + 1) * 0.11;
    vivi.rotation.z = Math.sin(t * 0.7) * 0.05;
    renderer.render(scene, camera);
  });

  const onResize = () => size();
  window.addEventListener('resize', onResize);

  state = { renderer, onResize };
}

export function unmount() {
  if (!state) return;
  window.removeEventListener('resize', state.onResize);
  state.renderer.setAnimationLoop(null);
  state.renderer.dispose();
  const canvas = document.querySelector('.fx-airship');
  if (canvas) canvas.remove();
  state = null;
}