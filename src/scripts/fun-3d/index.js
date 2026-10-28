// Fun mode 3D: voxel versions of the pixel art, drawn with Three.js. The Three.js chunk loads
// only in fun mode, with WebGL, and without reduced motion or data saver. Otherwise, or if
// anything fails, the 2D sprites stay. `html.wants-3d` (set before first paint by ThemeInit, or
// here when fun mode turns on) hides the 2D art the 3D views replace, so it never flashes;
// `html.has-3d` shows the 3D canvases once they run.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let scenes;
let giveUp;

function supported() {
  if (reduced.matches || navigator.connection?.saveData) return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

async function start() {
  if (!supported()) return stop();
  root.classList.add('wants-3d');
  // If the chunk is slow or stuck, show the 2D art instead of an empty scene.
  clearTimeout(giveUp);
  giveUp = setTimeout(() => !root.classList.contains('has-3d') && root.classList.remove('wants-3d'), 6000);
  try {
    scenes ??= import('./scenes.js').then((m) => m.mount());
    (await scenes).resume();
    if (root.dataset.theme === 'fun') root.classList.add('wants-3d', 'has-3d');
  } catch (err) {
    console.warn('Fun mode 3D is off:', err);
    stop();
  }
}

function stop() {
  clearTimeout(giveUp);
  root.classList.remove('has-3d', 'wants-3d');
  scenes?.then((s) => s.pause()).catch(() => {});
}

if (root.dataset.theme === 'fun') start();
else root.classList.remove('wants-3d');
document.addEventListener('theme:changed', (e) => (e.detail.fun ? start() : stop()));
reduced.addEventListener('change', () => (reduced.matches ? stop() : root.dataset.theme === 'fun' && start()));
