// Fun mode cards tilt toward the pointer (mission cards, ship log, legendary certificates).
// Sets --rx/--ry (tilt) and --mx/--my (pointer spot, for the sheen); fun/3d.css does the rest.
// Mouse, or tilting the phone on touch screens (fun-gyro.js), and not with reduced motion.
// Keyboard focus gets a fixed tilt in CSS.
import { onTilt } from './fun-gyro.js';

const fine = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const MAX = 4;
const cards = document.querySelectorAll('.case article, .job, .doc__thumb');

cards.forEach((card) => {
  let frame = 0;
  card.addEventListener('pointermove', (e) => {
    if (document.documentElement.dataset.theme !== 'fun' || !fine.matches || reduced.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      card.classList.add('is-tilted');
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    card.classList.remove('is-tilted');
    ['--rx', '--ry', '--mx', '--my'].forEach((p) => card.style.removeProperty(p));
  });
});

// Phone tilt: only the cards on screen move, at most once per frame and only on a visible change.
const onScreen = new Set();
const watch = new IntersectionObserver((entries) =>
  entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)))
);
cards.forEach((card) => watch.observe(card));
let pending = false;
let last = { x: 0, y: 0 };
onTilt((tilt) => {
  if (pending || (Math.abs(tilt.x - last.x) < 0.03 && Math.abs(tilt.y - last.y) < 0.03)) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    last = { x: tilt.x, y: tilt.y };
    onScreen.forEach((card) => {
      card.style.setProperty('--ry', `${(tilt.x * MAX).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-tilt.y * MAX).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(50 + tilt.x * 50).toFixed(1)}%`);
      card.style.setProperty('--my', `${(50 + tilt.y * 50).toFixed(1)}%`);
    });
    document.documentElement.classList.add('is-gyro');
  });
});
