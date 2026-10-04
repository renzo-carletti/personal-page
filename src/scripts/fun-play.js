// Fun mode interactions: Vivi's spells, the chocobo, the quantum moon, marshmallow roasting,
// the treasure chest, Nomai writing, the supernova timer and the "stage clear" markers.
// Elements are display:none in normal mode, and secrets only unlock in fun mode.
import { isFun, tr, unlock } from './fun-secrets.js';

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Restart a CSS animation class on an element and drop it after `ms`.
function play(el, cls, ms) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  clearTimeout(el._t?.[cls]);
  el._t = { ...el._t, [cls]: setTimeout(() => el.classList.remove(cls), ms) };
}

// ---------- Vivi: Fire → Blizzard → Thunder → Bio (FF9 names) ----------
const vivi = document.querySelector('.vivi');
const fx = document.querySelector('.fun-scene__fx');
const spells = ['fire', 'ice', 'bolt', 'bio'];
const cast = new Set();
let next = 0;
vivi?.addEventListener('click', () => {
  const spell = spells[next];
  next = (next + 1) % spells.length;
  spells.forEach((s) => vivi.classList.remove(`is-${s}`));
  vivi.dataset.spell = spell;
  play(vivi, `is-${spell}`, 1400);
  if (spell === 'bolt' && fx) play(fx, reducedMotion() ? 'is-bolt-calm' : 'is-bolt', 900);
  cast.add(spell);
  if (cast.size === spells.length) unlock('spells');
});

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
    qmoon.style.left = Math.random() < 0.5 ? `${2 + Math.random() * 6}%` : `${88 + Math.random() * 6}%`;
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
  qmoon.addEventListener('click', () => {
    qmoon.classList.add('is-caught');
    unlock('moon');
  });
}

// ---------- Marshmallow: click to roast, click again to pull it out ----------
const fire = document.querySelector('.savepoint__fire-btn');
const hint = document.querySelector('.savepoint__hint');
const ROAST_MS = 6000;
let roastStart = 0;
fire?.addEventListener('click', () => {
  if (!roastStart) {
    roastStart = performance.now();
    fire.classList.remove('is-raw', 'is-perfect', 'is-burnt');
    fire.classList.add('is-roasting');
    fire.setAttribute('aria-label', tr('fun.mallow.pull'));
    return;
  }
  const t = (performance.now() - roastStart) / ROAST_MS;
  roastStart = 0;
  const result = t < 0.36 ? 'raw' : t < 0.62 ? 'perfect' : 'burnt';
  fire.classList.remove('is-roasting');
  fire.classList.add(`is-${result}`);
  fire.setAttribute('aria-label', tr('fun.mallow.label'));
  if (hint) hint.textContent = tr(`fun.mallow.${result}`);
  if (result === 'perfect') unlock('mallow');
});

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
const novaTime = document.querySelector('.footer__nova-time');
const novaLoop = document.querySelector('.footer__nova-loop');
const flash = document.querySelector('.nova-flash');
if (novaTime) {
  const testSeconds = Number(new URLSearchParams(location.search).get('supernova'));
  const LOOP = testSeconds > 0 ? testSeconds : 5 * 60;
  let end = Date.now() + LOOP * 1000;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    novaTime.textContent = fmt(left);
    if (left > 0) return;
    if (isFun()) {
      if (!reducedMotion() && flash) play(flash, 'is-nova', 4000);
      if (novaLoop) {
        novaLoop.textContent = tr('fun.nova.loop');
        setTimeout(() => (novaLoop.textContent = ''), 6000);
      }
      unlock('nova');
    }
    end = Date.now() + LOOP * 1000;
  };
  tick();
  setInterval(tick, 1000);
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
