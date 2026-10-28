// Sims-style cheat bar: the ` key (or the >_ button in the HUD) opens it, Esc closes it. Cheats come
// from all the games on the page and are learned by playing: the orange soapstone messages teach
// some, and finding a secret teaches the cheat that replays it. Any cheat works once you know it;
// the first one unlocks the "Cheater" secret. Learned cheats are remembered in this browser.
import { isFun, play, reducedMotion, tr, trf, unlock } from './fun-secrets.js';

const form = document.getElementById('cheats');
const input = form?.querySelector('input');
const out = form?.querySelector('.cheats__out');
const known = form?.querySelector('.cheats__known');
const btn = document.querySelector('.hud-cheats');
const KEY = 'rc-cheats';
let opener = null;

const send = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
const say = (text) => out && (out.textContent = text);

// Simoleons: green § coins rain down the screen.
function coinRain() {
  say(trf('fun.cheats.money', { n: (50000).toLocaleString(document.documentElement.lang || 'en') }));
  if (reducedMotion()) return;
  const rain = document.createElement('div');
  rain.className = 'fun-only coin-rain';
  rain.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 36; i++) {
    const coin = document.createElement('span');
    coin.textContent = '§';
    coin.style.left = `${Math.random() * 100}%`;
    coin.style.animationDelay = `${Math.random() * 1.2}s`;
    coin.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
    rain.append(coin);
  }
  document.body.append(rain);
  setTimeout(() => rain.remove(), 3200);
}

const CHEATS = {
  motherlode: coinRain,
  'praise the sun': () => {
    send('fun:praise');
    say(tr('fun.cheats.praise'));
  },
  kweh: () => document.querySelector('.choco')?.click(),
  blackhole: () => {
    close();
    send('fun:blackhole');
  },
  supernova: () => {
    close();
    send('fun:nova');
  },
  breach: () => {
    close();
    const b = document.querySelector('.breach');
    b?.scrollIntoView({ block: 'center' });
    b?.querySelector('.breach__grid button:not(:disabled)')?.focus({ preventScroll: true });
  },
  scan: () => send('fun:scan'),
};
const ALL = Object.keys(CHEATS);

function learned() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(list) ? list.filter((c) => ALL.includes(c)) : []);
  } catch {
    return new Set();
  }
}

function renderKnown() {
  if (!known) return;
  const set = learned();
  const missing = ALL.length - set.size;
  const list = ALL.filter((c) => set.has(c)).join(', ');
  known.textContent = `${tr('fun.cheats.known')} ${list || '—'}${missing ? ` · ${trf('fun.cheats.missing', { n: missing })}` : ''}`;
}

// Learn a cheat; returns true the first time.
export function learn(code) {
  const set = learned();
  if (!ALL.includes(code) || set.has(code)) return false;
  set.add(code);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {}
  renderKnown();
  return true;
}

export const isLearned = (code) => learned().has(code);

// Finding a secret teaches the cheat that replays it.
const TEACH = { kweh: 'kweh', nova: 'supernova', horizon: 'blackhole' };
document.addEventListener('fun:unlocked', (e) => TEACH[e.detail.id] && learn(TEACH[e.detail.id]));

function open() {
  if (!form || !isFun()) return;
  opener = document.activeElement;
  form.hidden = false;
  btn?.setAttribute('aria-expanded', 'true');
  input.value = '';
  say('');
  renderKnown();
  input.focus();
}

function close() {
  if (!form || form.hidden) return;
  form.hidden = true;
  btn?.setAttribute('aria-expanded', 'false');
  if (opener?.isConnected) opener.focus({ preventScroll: true });
}

const typing = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');

document.addEventListener('keydown', (e) => {
  if (e.key === '`' && isFun() && !typing(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    form?.hidden ? open() : close();
  } else if (e.key === 'Escape' && form && !form.hidden) {
    close();
  }
});
btn?.addEventListener('click', () => (form?.hidden ? open() : close()));

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
  input.value = '';
  if (code === 'help') {
    say(tr('fun.cheats.help'));
    return;
  }
  const cheat = CHEATS[code];
  if (!cheat) {
    say(tr('fun.cheats.unknown'));
    play(form, 'is-wrong', 400);
    return;
  }
  learn(code);
  say(tr('fun.cheats.ok'));
  unlock('cheat');
  cheat();
});
document.addEventListener('i18n:changed', renderKnown);

// "Praise the sun": Vivi throws his arms up and the sun flares.
document.addEventListener('fun:praise', () => {
  const vivi = document.querySelector('.vivi');
  const scene = document.querySelector('.fun-scene');
  if (vivi) play(vivi, 'is-praise', 1800);
  if (scene) play(scene, 'is-praised', 1800);
});
