// The Sims tribute: three needs (Fun, Energy, Social) and Simoleons in a small panel, and Vivi's
// plumbob colored by mood (green, yellow, red). Needs move with what you do on the page and are
// remembered in this browser. `html[data-mood]` drives the 2D plumbob; 3D reads `fun:needs`.
import { isFun, play } from './fun-secrets.js';

const root = document.documentElement;
const KEY = 'rc-needs';
const panel = document.querySelector('.needs');
const toggle = panel?.querySelector('.needs__toggle');
const vivi = document.querySelector('.vivi');

const clamp = (v) => Math.max(0, Math.min(100, v));
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s && typeof s.fun === 'number') return s;
  } catch {}
  return { fun: 60, energy: 80, social: 50, money: 20000, open: true };
}
const needs = load();
let saveTimer;

function render() {
  const avg = (needs.fun + needs.energy + needs.social) / 3;
  const mood = needs.energy < 15 || avg < 30 ? 'red' : avg < 60 ? 'yellow' : 'green';
  root.dataset.mood = mood;
  panel?.querySelectorAll('.needs__bar').forEach((bar) => {
    const v = Math.round(needs[bar.dataset.need]);
    bar.style.setProperty('--v', `${v}%`);
    bar.dataset.level = v < 30 ? 'low' : v < 60 ? 'mid' : 'high';
    bar.nextElementSibling.textContent = `${v}%`;
  });
  const money = panel?.querySelector('.needs__money');
  if (money) money.textContent = needs.money.toLocaleString(document.documentElement.lang || 'en');
  vivi?.classList.toggle('is-tired', mood === 'red');
  document.dispatchEvent(new CustomEvent('fun:needs', { detail: { ...needs, mood } }));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(needs));
    } catch {}
  }, 400);
}

export function change(delta) {
  Object.entries(delta).forEach(([k, d]) => (needs[k] = k === 'money' ? Math.max(0, needs[k] + d) : clamp(needs[k] + d)));
  render();
}

// Collapse or open the panel.
function setOpen(open) {
  needs.open = open;
  toggle?.setAttribute('aria-expanded', String(open));
  panel?.classList.toggle('is-closed', !open);
}
toggle?.addEventListener('click', () => {
  setOpen(!needs.open);
  render();
});
setOpen(needs.open !== false);

// Slow decay, faster for Energy while you scroll a lot.
setInterval(() => isFun() && !document.hidden && change({ fun: -1, energy: -0.6, social: -0.5 }), 25000);
let scrolled = 0;
let lastY = scrollY;
addEventListener(
  'scroll',
  () => {
    scrolled += Math.abs(scrollY - lastY);
    lastY = scrollY;
    if (scrolled > 4000 && isFun()) {
      scrolled = 0;
      change({ energy: -2 });
    }
  },
  { passive: true }
);

// Vivi: casting is fun, spamming him wears him out.
let clicks = [];
vivi?.addEventListener('click', () => {
  if (!isFun()) return;
  const now = performance.now();
  clicks = clicks.filter((t) => now - t < 5000).concat(now);
  if (clicks.length > 6) {
    change({ energy: -12, fun: -3 });
    play(vivi, 'is-yawn', 1600);
  } else change({ fun: 4, energy: -1 });
});
document.querySelector('.choco')?.addEventListener('click', () => isFun() && change({ social: 10, fun: 2 }));
document.addEventListener('fun:pet', () => change({ social: 12, fun: 3 }));
document.addEventListener('fun:rest', () => change({ energy: 100 }));
document.addEventListener('fun:unlocked', () => change({ fun: 15 }));
document.addEventListener('fun:breach', () => change({ fun: 25 }));
document.addEventListener('fun:money', (e) => change({ money: e.detail }));
document.addEventListener('i18n:changed', render);

// Saying hello in Contact counts as social, once per visit.
const contact = document.getElementById('contact');
if (contact) {
  const seen = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && isFun()) {
      change({ social: 6 });
      seen.disconnect();
    }
  });
  seen.observe(contact);
}

render();
