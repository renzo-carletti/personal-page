// Fun mode interactions: Vivi's spells, the chocobo, the quantum moon, the solar system spin,
// the treasure chest, Nomai writing, the supernova timer and the "stage clear" markers.
// Elements are display:none in normal mode, and secrets only unlock in fun mode.
import { isFun, play, reducedMotion, tr, unlock } from './fun-secrets.js';

// ---------- Vivi: Fire → Thunder → Stop → Bio (FF9 names) ----------
const vivi = document.querySelector('.vivi');
const fx = document.querySelector('.fun-scene__fx');
const spells = ['fire', 'bolt', 'stop', 'bio'];
const cast = new Set();
let next = 0;
vivi?.addEventListener('click', () => {
  const spell = spells[next];
  next = (next + 1) % spells.length;
  spells.forEach((s) => vivi.classList.remove(`is-${s}`));
  vivi.dataset.spell = spell;
  play(vivi, `is-${spell}`, 1400);
  if (spell === 'bolt' && fx) play(fx, reducedMotion() ? 'is-bolt-calm' : 'is-bolt', 900);
  if (spell === 'stop') {
    // Time stops: everything but Vivi greys out and pauses for a moment.
    if (fx) play(fx, 'is-stop', 1900);
    play(document.documentElement, 'time-stop', 1800);
  }
  cast.add(spell);
  if (cast.size === spells.length) unlock('spells');
});
document.addEventListener('fun:loop', () => (next = 0));

// ---------- Chocobo: kweh, then a lap off screen and back ----------
const choco = document.querySelector('.choco');
choco?.addEventListener('click', () => {
  if (choco.classList.contains('is-running')) return;
  play(choco, 'is-kweh', 1200);
  unlock('kweh');
  if (!reducedMotion()) setTimeout(() => play(choco, 'is-running', 3600), 500);
});

// ---------- Quantum moon: moves whenever nobody is looking ----------
const qmoon = document.querySelector('.qmoon');
const spots = [...document.querySelectorAll('main .section')];
if (qmoon && spots.length) {
  let seen = false;
  let current = -1;
  const relocate = () => {
    let i;
    do i = Math.floor(Math.random() * spots.length);
    while (i === current && spots.length > 1);
    current = i;
    spots[i].append(qmoon);
    qmoon.style.top = `${10 + Math.random() * 70}%`;
    // Near the left or right edge; from the right it is placed by `right`, so it never sticks out.
    const side = Math.random() < 0.5 ? 'left' : 'right';
    qmoon.dataset.side = side;
    qmoon.style.left = qmoon.style.right = '';
    qmoon.style[side] = `${2 + Math.random() * 6}%`;
    qmoon.classList.remove('is-caught');
  };
  relocate();
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) seen = true;
    else if (seen) {
      seen = false;
      relocate();
    }
  }).observe(qmoon);
  document.addEventListener('fun:loop', relocate);
  qmoon.addEventListener('click', () => {
    qmoon.classList.add('is-caught');
    unlock('moon');
  });
}

// ---------- Solar system: drag to spin it, with a little coasting; three turns unlock a secret ----------
// The angle goes to `--spin` on `.solar`: CSS turns the 2D orbits, the 3D view reads it too.
const solar = document.querySelector('.solar');
if (solar) {
  let angle = 0;
  let speed = 0;
  let turned = 0;
  let dragX = null;
  const turn = (d) => {
    angle += d;
    turned += Math.abs(d);
    solar.style.setProperty('--spin', `${angle.toFixed(1)}deg`);
    if (turned >= 3 * 360) unlock('dizzy');
  };
  const coast = () => {
    if (dragX !== null || Math.abs(speed) < 0.1) return;
    speed *= 0.95;
    turn(speed);
    requestAnimationFrame(coast);
  };
  solar.addEventListener('pointerdown', (e) => {
    dragX = e.clientX;
    speed = 0;
    solar.setPointerCapture(e.pointerId);
  });
  solar.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    speed = (e.clientX - dragX) * 0.8;
    dragX = e.clientX;
    turn(speed);
  });
  const release = () => {
    if (dragX === null) return;
    dragX = null;
    if (!reducedMotion()) coast();
  };
  solar.addEventListener('pointerup', release);
  solar.addEventListener('pointercancel', release);
}

// ---------- Treasure chest ----------
const chest = document.querySelector('.chest__btn');
chest?.addEventListener('click', () => {
  const open = chest.getAttribute('aria-expanded') !== 'true';
  chest.setAttribute('aria-expanded', String(open));
  document.getElementById('chest-loot').hidden = !open;
  if (open) {
    play(chest, 'is-sparkle', 900);
    unlock('chest');
  }
});

// ---------- Nomai writing ----------
const nomai = document.querySelector('.nomai');
const translate = () => {
  nomai.classList.add('is-translated');
  unlock('nomai');
};
nomai?.addEventListener('click', translate);
nomai?.addEventListener('mouseenter', translate);

// ---------- Supernova: 5 minutes per loop (?supernova=N to test with N seconds) ----------
// The `supernova` cheat sends `fun:nova` to explode the sun right away.
const novaTime = document.querySelector('.footer__nova-time');
const novaLoop = document.querySelector('.footer__nova-loop');
const nova = document.querySelector('.nova');
if (novaTime) {
  const testSeconds = Number(new URLSearchParams(location.search).get('supernova'));
  const LOOP = testSeconds > 0 ? testSeconds : 5 * 60;
  let end = Date.now() + LOOP * 1000;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const explode = () => {
    if (isFun()) {
      const animate = !reducedMotion() && nova;
      if (animate) play(nova, 'is-nova', 7400);
      if (novaLoop) {
        novaLoop.textContent = tr('fun.nova.loop');
        setTimeout(() => (novaLoop.textContent = ''), 6000);
      }
      // The achievement pops when you "wake up", after the sequence.
      setTimeout(() => unlock('nova'), animate ? 7200 : 0);
    }
    end = Date.now() + LOOP * 1000;
  };
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    novaTime.textContent = fmt(left);
    if (left === 0) explode();
  };
  tick();
  setInterval(tick, 1000);
  document.addEventListener('fun:nova', explode);
  document.addEventListener('fun:loop', () => {
    end = Date.now() + LOOP * 1000;
    tick();
  });
}

// ---------- Stage clear: light each level node the first time it is seen ----------
const cases = document.querySelectorAll('.case');
const clearObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || !isFun()) return;
      entry.target.dataset.clear = tr('fun.clear');
      entry.target.classList.add('is-cleared');
      clearObs.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);
cases.forEach((c) => clearObs.observe(c));
document.addEventListener('i18n:changed', () => {
  document.querySelectorAll('.case.is-cleared').forEach((c) => (c.dataset.clear = tr('fun.clear')));
});
