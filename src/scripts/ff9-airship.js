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
    const w = canvas.clientWidth || 220;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * dpr);
    renderer.setSize(w, w, false);
    return w;
  };
  size();
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.1, 7);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xfff2d8, 0.6));
  const dir = new THREE.DirectionalLight(0xffe0b0, 1.7);
  dir.position.set(3, 5, 5);
  scene.add(dir);
  const warm = new THREE.PointLight(0xffb050, 1.5, 20);
  warm.position.set(0, 2, 1.5);
  scene.add(warm);

  const group = new THREE.Group();
  const cream = new THREE.MeshStandardMaterial({ color: 0xf0e0b8, emissive: 0x6a4a1a, emissiveIntensity: 0.2, roughness: 0.55 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8a94f, emissive: 0x4a3008, emissiveIntensity: 0.25, roughness: 0.5 });
  const mahogany = new THREE.MeshStandardMaterial({ color: 0x6a4226, roughness: 0.85 });
  const redCurtain = new THREE.MeshStandardMaterial({ color: 0x9c1f2c, emissive: 0x3a080c, emissiveIntensity: 0.35, roughness: 0.7 });

  const balloon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 40, 28), cream);
  balloon.scale.set(1, 0.84, 1);
  balloon.position.y = 1.7;
  group.add(balloon);

  const redBand = (y) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.1, 12, 48), redCurtain);
    m.scale.set(1, 0.84, 1);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    return m;
  };
  group.add(redBand(1.35));
  group.add(redBand(2.05));

  const chateau = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.6, 0.85), cream);
  chateau.position.y = 0.62;
  group.add(chateau);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.55), cream);
  tower.position.y = 1.27;
  group.add(tower);

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4), gold);
  spire.position.y = 1.82;
  group.add(spire);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), gold);
  mast.position.set(0, 2.1, -0.45);
  group.add(mast);

  const pennant = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 3), redCurtain);
  pennant.position.set(0, 2.55, -0.45);
  pennant.rotation.z = Math.PI;
  group.add(pennant);

  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 1.15, 0.95, 4), mahogany);
  hull.rotation.y = Math.PI / 4;
  hull.position.y = -0.25;
  group.add(hull);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.0), new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.8 }));
  deck.position.y = -0.08;
  group.add(deck);

  const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.5, 0.12), redCurtain);
  curtain.position.set(0, -0.35, 0.55);
  group.add(curtain);

  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.14), gold);
  goldTrim.position.set(0, -0.09, 0.56);
  group.add(goldTrim);

  const goldBand = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.05, 0.94), gold);
  goldBand.position.y = -0.82;
  group.add(goldBand);

  const finH = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 4), mahogany);
  finH.scale.set(1, 1, 0.14);
  finH.position.set(0, -0.1, -1.15);
  finH.rotation.x = Math.PI;
  group.add(finH);

  const finL = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 4), mahogany);
  finL.scale.set(0.12, 1, 1);
  finL.position.set(-0.55, -0.5, -1.15);
  finL.rotation.z = -0.5;
  group.add(finL);

  const finR = finL.clone();
  finR.position.x = 0.55;
  finR.rotation.z = 0.5;
  group.add(finR);

  const propeller = new THREE.Group();
  for (const [rx, ry] of [[0, 0], [Math.PI / 2, 0]]) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.02), gold);
    blade.rotation.x = rx;
    propeller.add(blade);
  }
  propeller.position.set(0, -0.5, -1.35);
  group.add(propeller);

  for (const [x, z] of [[-0.6, 0.3], [0.6, 0.3], [-0.5, -0.4], [0.5, -0.4]]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.1, 6), new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 }));
    rope.position.set(x, 1.12, z);
    rope.rotation.z = x > 0 ? 0.12 : -0.12;
    group.add(rope);
  }

  scene.add(group);

  let mx = 0;
  let my = 0;
  const onMouse = (e) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener('mousemove', onMouse);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    group.position.y = Math.sin(t * 0.8) * 0.1;
    group.rotation.y = Math.sin(t * 0.3) * 0.14 + mx * 0.35;
    group.rotation.z = Math.sin(t * 0.45) * 0.02 + my * 0.12;
    propeller.rotation.z = t * 2.4;
    renderer.render(scene, camera);
  });

  const onResize = () => size();
  window.addEventListener('resize', onResize);

  state = { renderer, onMouse, onResize };
}

export function unmount() {
  if (!state) return;
  window.removeEventListener('mousemove', state.onMouse);
  window.removeEventListener('resize', state.onResize);
  state.renderer.setAnimationLoop(null);
  state.renderer.dispose();
  const canvas = document.querySelector('.fx-airship');
  if (canvas) canvas.remove();
  state = null;
}