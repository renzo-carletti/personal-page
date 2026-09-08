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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.4);
  camera.lookAt(0, 0.15, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dir = new THREE.DirectionalLight(0xffe0b0, 1.6);
  dir.position.set(3, 4, 5);
  scene.add(dir);
  const warm = new THREE.PointLight(0xffb050, 1.4, 20);
  warm.position.set(0, 1.3, 1.2);
  scene.add(warm);

  const group = new THREE.Group();

  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xf2e2bd, emissive: 0x6a4a1a, emissiveIntensity: 0.22, roughness: 0.55 })
  );
  balloon.scale.set(1, 0.82, 1);
  balloon.position.y = 0.9;
  group.add(balloon);

  const rib = (ry) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1.37, 0.026, 8, 44), new THREE.MeshStandardMaterial({ color: 0xb07a3a, roughness: 0.7 }));
    m.scale.set(1, 0.82, 1);
    m.rotation.y = ry;
    m.position.y = 0.9;
    return m;
  };
  group.add(rib(0));
  group.add(rib(Math.PI / 3));
  group.add(rib((2 * Math.PI) / 3));

  const band = new THREE.Mesh(new THREE.TorusGeometry(1.38, 0.085, 10, 44), new THREE.MeshStandardMaterial({ color: 0xc94f3d, emissive: 0x5a1a10, emissiveIntensity: 0.3, roughness: 0.6 }));
  band.scale.set(1, 0.82, 1);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.9;
  group.add(band);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.07, 0.95), new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.8 }));
  deck.position.y = -0.28;
  group.add(deck);

  const gondola = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.42, 0.68), new THREE.MeshStandardMaterial({ color: 0x7a4a28, roughness: 0.85 }));
  gondola.position.y = -0.55;
  group.add(gondola);

  const finH = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 4), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }));
  finH.scale.set(1, 1, 0.16);
  finH.position.set(0, -0.1, -1.4);
  finH.rotation.x = Math.PI;
  group.add(finH);

  const finL = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.95, 4), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 }));
  finL.scale.set(0.14, 1, 1);
  finL.position.set(-0.42, -0.35, -1.4);
  finL.rotation.z = -0.4;
  group.add(finL);

  const finR = finL.clone();
  finR.position.x = 0.42;
  finR.rotation.z = 0.4;
  group.add(finR);

  const propeller = new THREE.Group();
  for (const [rx, ry] of [[0, 0], [Math.PI / 2, 0]]) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.02), new THREE.MeshStandardMaterial({ color: 0xd8a94f, roughness: 0.6 }));
    blade.rotation.x = rx;
    propeller.add(blade);
  }
  propeller.position.set(0, -0.35, -1.62);
  group.add(propeller);

  for (const [x, z] of [[-0.62, 0.25], [0.62, 0.25], [-0.5, -0.5], [0.5, -0.5]]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 }));
    rope.position.set(x, 0.22, z);
    rope.rotation.z = x > 0 ? 0.14 : -0.14;
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
    group.position.y = Math.sin(t * 0.9) * 0.12;
    group.rotation.y = Math.sin(t * 0.35) * 0.16 + mx * 0.4;
    group.rotation.z = Math.sin(t * 0.5) * 0.03 + my * 0.14;
    propeller.rotation.z = t * 2.2;
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