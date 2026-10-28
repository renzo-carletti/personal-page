// Fun mode cards tilt toward the pointer (mission cards, ship log, legendary certificates).
// Sets --rx/--ry (tilt) and --mx/--my (pointer spot, for the sheen); fun/3d.css does the rest.
// Mouse only, and not with reduced motion. Keyboard focus gets a fixed tilt in CSS.
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const MAX = 4;

document.querySelectorAll('.case article, .job, .doc__thumb').forEach((card) => {
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
