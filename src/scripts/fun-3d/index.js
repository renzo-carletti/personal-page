// Fun mode 3D: voxel versions of the pixel art, drawn with Three.js. The Three.js chunk loads
// only in fun mode, with WebGL, and without reduced motion or data saver. Otherwise, or if
// anything fails, the 2D sprites stay. `html.has-3d` hides the 2D art the 3D views replace.
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let scenes;

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
  if (!supported()) return;
  try {
    scenes ??= import('./scenes.js').then((m) => m.mount());
    (await scenes).resume();
    if (root.dataset.theme === 'fun') root.classList.add('has-3d');
  } catch (err) {
    console.warn('Fun mode 3D is off:', err);
    stop();
  }
}

function stop() {
  root.classList.remove('has-3d');
  scenes?.then((s) => s.pause()).catch(() => {});
}

const later = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200));
if (root.dataset.theme === 'fun') later(start);
document.addEventListener('theme:changed', (e) => (e.detail.fun ? start() : stop()));
reduced.addEventListener('change', () => (reduced.matches ? stop() : root.dataset.theme === 'fun' && start()));
