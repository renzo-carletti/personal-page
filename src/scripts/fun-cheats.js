// Cheat book (a Sims nod): the ` key or the >_ button in the HUD opens it, Esc or ✕ closes it. One
// card per cheat: learned ones show what they do and a Use button, missing ones show where to
// learn them. Cheats are learned by playing: the orange soapstone messages teach some, and finding
// a secret teaches the cheat that replays it. The first cheat used unlocks the "Cheater" secret.
import { isFun, play, reducedMotion, tr, trf, unlock } from './fun-secrets.js';

const book = document.getElementById('cheats');
const form = book?.querySelector('form');
const input = form?.querySelector('input');
const out = form?.querySelector('.cheats__out');
const list = book?.querySelector('.cheatbook__list');
const progress = book?.querySelector('.cheatbook__progress');
const options = document.getElementById('cheat-known');
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
  breach: () => send('fun:breach-open'),
  scan: () => send('fun:scan'),
};
const ALL = Object.keys(CHEATS);
// String keys per cheat (`fun.cheat.<key>.desc` / `.where`).
const KEYS = { 'praise the sun': 'praise' };
const key = (code) => KEYS[code] ?? code;
// Cheats that leave the book open (their effect shows around it).
const STAY = new Set(['motherlode']);

function learned() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(list) ? list.filter((c) => ALL.includes(c)) : []);
  } catch {
    return new Set();
  }
}

function renderBook(fresh) {
  if (!list) return;
  const set = learned();
  progress.textContent = trf('fun.cheats.progress', { n: set.size, total: ALL.length });
  list.replaceChildren(
    ...ALL.map((code) => {
      const li = document.createElement('li');
      const has = set.has(code);
      li.className = `cheatcard ${has ? 'is-known' : 'is-missing'}${code === fresh ? ' is-new' : ''}`;
      const name = document.createElement('code');
      name.textContent = has ? code : '???';
      const text = document.createElement('p');
      text.textContent = tr(`fun.cheat.${key(code)}.${has ? 'desc' : 'where'}`);
      li.append(name, text);
      if (has) {
        const use = document.createElement('button');
        use.type = 'button';
        use.className = 'btn';
        use.textContent = tr('fun.cheats.use');
        use.setAttribute('aria-label', `${tr('fun.cheats.use')}: ${code}`);
        use.addEventListener('click', () => run(code));
        li.append(use);
      } else {
        li.setAttribute('aria-label', `${tr('fun.cheats.locked')}. ${text.textContent}`);
      }
      return li;
    })
  );
  options?.replaceChildren(...[...set].map((code) => Object.assign(document.createElement('option'), { value: code })));
}

// Learn a cheat; returns true the first time.
export function learn(code) {
  const set = learned();
  if (!ALL.includes(code) || set.has(code)) return false;
  set.add(code);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {}
  renderBook(code);
  return true;
}

export const isLearned = (code) => learned().has(code);

// Finding a secret teaches the cheat that replays it.
const TEACH = { kweh: 'kweh', nova: 'supernova', horizon: 'blackhole' };
document.addEventListener('fun:unlocked', (e) => TEACH[e.detail.id] && learn(TEACH[e.detail.id]));

function open() {
  if (!book || !isFun()) return;
  opener = document.activeElement;
  book.hidden = false;
  btn?.setAttribute('aria-expanded', 'true');
  input.value = '';
  say('');
  renderBook();
  input.focus();
}

function close() {
  if (!book || book.hidden) return;
  book.hidden = true;
  btn?.setAttribute('aria-expanded', 'false');
  if (opener?.isConnected) opener.focus({ preventScroll: true });
}

function run(code) {
  learn(code);
  unlock('cheat');
  say(tr('fun.cheats.ok'));
  if (!STAY.has(code)) close();
  CHEATS[code]();
}

const typing = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');

document.addEventListener('keydown', (e) => {
  if (e.key === '`' && isFun() && !typing(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    book?.hidden ? open() : close();
  } else if (e.key === 'Escape' && book && !book.hidden) {
    close();
  } else if (e.key === 'Tab' && book && !book.hidden) {
    // Keep focus inside the open book.
    const items = [...book.querySelectorAll('button, input')].filter((el) => !el.disabled);
    const first = items[0];
    const last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
btn?.addEventListener('click', () => (book?.hidden ? open() : close()));
book?.querySelector('.cheatbook__close')?.addEventListener('click', close);
// A click on the dimmed backdrop closes it.
book?.addEventListener('click', (e) => e.target === book && close());

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
  input.value = '';
  if (!CHEATS[code]) {
    say(tr('fun.cheats.unknown'));
    play(book, 'is-wrong', 400);
    return;
  }
  run(code);
});
document.addEventListener('i18n:changed', () => renderBook());

// "Praise the sun": Vivi throws his arms up and the sun flares.
document.addEventListener('fun:praise', () => {
  const vivi = document.querySelector('.vivi');
  const scene = document.querySelector('.fun-scene');
  if (vivi) play(vivi, 'is-praise', 1800);
  if (scene) play(scene, 'is-praised', 1800);
});
