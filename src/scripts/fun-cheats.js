// Sims-style cheat bar: the ` key (or the >_ button in the HUD) opens it, Esc closes it. Cheats come
// from all the games on the page. The first cheat that works unlocks the "Cheater" secret.
import { isFun, play, tr, trf, unlock } from './fun-secrets.js';

const form = document.getElementById('cheats');
const input = form?.querySelector('input');
const out = form?.querySelector('.cheats__out');
const btn = document.querySelector('.hud-cheats');
let opener = null;

const send = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
const say = (text) => out && (out.textContent = text);
const money = (n) => {
  send('fun:money', n);
  say(trf('fun.cheats.money', { n: n.toLocaleString(document.documentElement.lang || 'en') }));
};

const CHEATS = {
  motherlode: () => money(50000),
  rosebud: () => money(1000),
  kaching: () => money(1000),
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
  help: () => say(tr('fun.cheats.help')),
};

function open() {
  if (!form || !isFun()) return;
  opener = document.activeElement;
  form.hidden = false;
  btn?.setAttribute('aria-expanded', 'true');
  input.value = '';
  say('');
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
  const cheat = CHEATS[code];
  if (!cheat) {
    say(tr('fun.cheats.unknown'));
    play(form, 'is-wrong', 400);
    return;
  }
  if (code !== 'help') {
    if (!out.textContent || out.textContent === tr('fun.cheats.unknown')) say(tr('fun.cheats.ok'));
    unlock('cheat');
  }
  cheat();
});

// "Praise the sun": Vivi throws his arms up and the sun flares.
document.addEventListener('fun:praise', () => {
  const vivi = document.querySelector('.vivi');
  const scene = document.querySelector('.fun-scene');
  if (vivi) play(vivi, 'is-praise', 1800);
  if (scene) play(scene, 'is-praised', 1800);
});
