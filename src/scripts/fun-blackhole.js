// Poke the title screen sun five times: it heats up, cracks and implodes into a black hole. The
// page falls in, the Dark Souls death screen shows, and the eyes open at the top on a new loop
// (Outer Wilds). Found secrets stay. The `blackhole` cheat sends `fun:blackhole` to skip the pokes.
import { isFun, play, reducedMotion, tr, unlock } from './fun-secrets.js';
import { showBanner } from './fun-souls.js';

const root = document.documentElement;
const btn = document.querySelector('.hero-sun');
const scene = document.querySelector('.fun-scene');
const sun2d = document.querySelector('.fun-scene__sun-core');
const hole = document.querySelector('.blackhole');
const POKES = 5;
let pokes = 0;
let calm;
let busy = false;

// Keep the button on the 2D sun; when 3D runs, hero.js moves it onto the voxel sun instead.
function place() {
  if (!btn || !sun2d || root.classList.contains('has-3d')) return;
  const s = sun2d.getBoundingClientRect();
  const h = btn.offsetParent?.getBoundingClientRect();
  if (!h || !s.width) return;
  btn.style.left = `${s.left - h.left + s.width / 2}px`;
  btn.style.top = `${s.top - h.top + s.height / 2}px`;
  btn.style.setProperty('--size', `${Math.max(48, s.width)}px`);
}
addEventListener('resize', place);
new MutationObserver(place).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
place();

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The page elements that fall in, each one spinning toward the hole from its own box.
const falling = () => [...document.querySelectorAll('main, .nav, .site-footer, footer, .fun-sky, .airship')];

async function collapse() {
  if (busy || !isFun() || !hole) return;
  busy = true;
  pokes = 0;
  const r = btn?.getBoundingClientRect();
  const x = r && r.width ? r.left + r.width / 2 : innerWidth / 2;
  const y = r && r.width ? Math.max(0, Math.min(innerHeight, r.top + r.height / 2)) : innerHeight / 3;
  hole.style.setProperty('--bx', `${x}px`);
  hole.style.setProperty('--by', `${y}px`);

  if (reducedMotion()) {
    hole.classList.add('is-dark');
    showBanner(tr('fun.died'), 'died', 1800);
    await wait(1900);
  } else {
    // 1. Implosion (1.2s): the sun shrinks to a point.
    scene?.setAttribute('data-sun', 'implode');
    await wait(1200);
    // 2. Black hole opens and the page spirals in (2.8s).
    scene?.setAttribute('data-sun', 'gone');
    hole.classList.add('is-open');
    await wait(500);
    falling().forEach((el) => {
      const b = el.getBoundingClientRect();
      el.style.transformOrigin = `${x - b.left}px ${y - b.top}px`;
      el.classList.add('is-falling');
    });
    await wait(2600);
    // 3. Black, then YOU DIED (2.6s).
    hole.classList.add('is-dark');
    await wait(400);
    showBanner(tr('fun.died'), 'died', 2400);
    await wait(2600);
  }

  // 4. New loop: back to the top, everything restored, the eyes open.
  falling().forEach((el) => {
    el.classList.remove('is-falling');
    el.style.transformOrigin = '';
  });
  scene?.removeAttribute('data-sun');
  scene?.removeAttribute('data-heat');
  scrollTo({ top: 0, behavior: 'instant' });
  document.dispatchEvent(new CustomEvent('fun:loop'));
  hole.classList.remove('is-open');
  if (!reducedMotion()) {
    play(hole, 'is-waking', 1500);
    await wait(1400);
  }
  hole.classList.remove('is-dark');
  busy = false;
  unlock('horizon');
}

btn?.addEventListener('click', () => {
  if (busy) return;
  pokes += 1;
  clearTimeout(calm);
  calm = setTimeout(() => {
    pokes = 0;
    scene?.removeAttribute('data-heat');
  }, 6000);
  if (pokes >= POKES) return collapse();
  // Each poke heats it up and shakes it harder.
  scene?.setAttribute('data-heat', String(pokes));
  play(btn, 'is-poked', 500);
});

document.addEventListener('fun:blackhole', collapse);
