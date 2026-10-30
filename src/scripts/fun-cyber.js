// Cyberpunk 2077 tribute: a locked access point in the Drupal section that opens a timed Breach
// Protocol (winning turns on Night City mode), and a scanner (hold Q, hold two fingers on a touch
// screen, or the `scan` cheat) that tints the page and tags each section.
import { isFun, play, reducedMotion, toast, tr, trf, unlock } from './fun-secrets.js';

// ---------- Breach Protocol: locked access point, timed terminal, Night City reward ----------
const root = document.documentElement;
const CODES = ['1C', '55', 'BD', 'E9', '7A'];
const SIZE = 5;
const BUFFER = 6;
const TIME = 30;
const card = document.querySelector('.breach');
const jack = card?.querySelector('.breach__jack');
const term = document.querySelector('.breach-term');
const grid = term?.querySelector('.breach__grid');
const seqEl = term?.querySelector('.breach__seq');
const bufEl = term?.querySelector('.breach__buf');
const status = term?.querySelector('.breach__status');
const retry = term?.querySelector('.breach__reset');
const timerBar = term?.querySelector('.breach-term__timer span');
const pick = (list) => list[Math.floor(Math.random() * list.length)];

let cells = [];
let target = [];
let buffer = [];
let line = { row: 0 };
let done = true;
let deadline = 0;
let timerFrame = 0;
let opener = null;

// Build a grid with a solution hidden along a valid row/column path.
function generate() {
  cells = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => pick(CODES)));
  const others = (n) => [...Array(SIZE).keys()].filter((i) => i !== n);
  const c0 = pick([...Array(SIZE).keys()]);
  const r1 = pick(others(0));
  const c2 = pick(others(c0));
  target = [pick(CODES), pick(CODES), pick(CODES)];
  cells[0][c0] = target[0];
  cells[r1][c0] = target[1];
  cells[r1][c2] = target[2];
  buffer = [];
  line = { row: 0 };
  done = false;
  cells = cells.map((row) => row.map((code) => ({ code, used: false })));
}

const matched = () => buffer.join(' ').includes(target.join(' '));

function render() {
  if (!grid) return;
  seqEl.textContent = target.join(' ');
  bufEl.textContent = Array.from({ length: BUFFER }, (_, i) => buffer[i] ?? '··').join(' ');
  grid.replaceChildren(
    ...cells.flatMap((row, r) =>
      row.map((cell, c) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = cell.code;
        b.setAttribute('aria-label', trf('fun.breach.cell', { r: r + 1, c: c + 1, code: cell.code }));
        const active = 'row' in line ? r === line.row : c === line.col;
        b.className = `breach__cell${active && !done ? ' is-active' : ''}${cell.used ? ' is-used' : ''}`;
        b.disabled = done || cell.used || !active;
        b.addEventListener('click', () => choose(r, c));
        return b;
      })
    )
  );
}

function stopTimer() {
  cancelAnimationFrame(timerFrame);
}

function tick() {
  const left = Math.max(0, deadline - performance.now());
  timerBar?.style.setProperty('--left', `${(left / (TIME * 1000)) * 100}%`);
  if (left <= 0) return fail(tr('fun.breach.timeout'));
  timerFrame = requestAnimationFrame(tick);
}

function fail(text) {
  done = true;
  stopTimer();
  status.textContent = text;
  play(term, 'is-failed', 700);
  render();
  retry.hidden = false;
  retry.focus();
}

function choose(r, c) {
  const cell = cells[r][c];
  cell.used = true;
  buffer.push(cell.code);
  line = 'row' in line ? { col: c } : { row: r };
  if (matched()) return win();
  if (buffer.length >= BUFFER) return fail(tr('fun.breach.fail'));
  status.textContent = trf('fun.breach.picked', { code: cell.code, n: buffer.length, max: BUFFER });
  render();
  grid.querySelector('button:not(:disabled)')?.focus();
}

// Short "connecting" beat, then a fresh puzzle with the clock running.
function start() {
  retry.hidden = true;
  term.classList.add('is-connecting');
  grid.replaceChildren();
  seqEl.textContent = bufEl.textContent = '';
  status.textContent = tr('fun.breach.connecting');
  timerBar?.style.setProperty('--left', '100%');
  setTimeout(() => {
    if (term.hidden) return;
    term.classList.remove('is-connecting');
    generate();
    status.textContent = '';
    render();
    deadline = performance.now() + TIME * 1000;
    stopTimer();
    timerFrame = requestAnimationFrame(tick);
    grid.querySelector('button:not(:disabled)')?.focus();
  }, reducedMotion() ? 0 : 800);
}

function openTerm() {
  if (!term || !isFun()) return;
  opener = document.activeElement;
  term.hidden = false;
  start();
}

function closeTerm() {
  if (!term || term.hidden) return;
  stopTimer();
  done = true;
  term.hidden = true;
  (opener?.isConnected ? opener : jack)?.focus({ preventScroll: true });
}

// Text scrambles, then settles letter by letter ("decrypted").
function decrypt(el) {
  const final = el.textContent;
  const glyphs = '01#$%&*+<>/\\|=ABCDEF';
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / 1200);
    const shown = Math.floor(final.length * k);
    el.textContent = final.slice(0, shown) + [...final.slice(shown)].map((ch) => (ch === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)])).join('');
    if (k < 1) requestAnimationFrame(step);
    else el.textContent = final;
  };
  requestAnimationFrame(step);
}

function setNightCity(on) {
  root.classList.toggle('night-city', on);
  document.querySelectorAll('[data-nightcity-off]').forEach((b) => (b.hidden = !on));
}

function win() {
  done = true;
  stopTimer();
  status.textContent = tr('fun.breach.win');
  term.classList.add('is-won');
  render();
  unlock('breach');
  document.dispatchEvent(new CustomEvent('fun:breach'));
  setTimeout(() => {
    closeTerm();
    term.classList.remove('is-won');
    if (!reducedMotion()) play(root, 'is-glitching', 2000);
    setNightCity(true);
    toast(`★ ${tr('fun.nc.on')}`, tr('fun.breach.open'));
    const state = card?.querySelector('.breach__state');
    if (state) state.textContent = tr('fun.breach.open');
    if (!reducedMotion()) document.querySelectorAll('#drupal .drupal__list :is(dt, dd)').forEach(decrypt);
  }, 900);
}

jack?.addEventListener('click', openTerm);
retry?.addEventListener('click', start);
term?.querySelector('.breach-term__close')?.addEventListener('click', closeTerm);
term?.addEventListener('click', (e) => e.target === term && closeTerm());
document.addEventListener('keydown', (e) => e.key === 'Escape' && term && !term.hidden && closeTerm());
document.addEventListener('fun:breach-open', openTerm);
document.querySelectorAll('[data-nightcity-off]').forEach((b) => b.addEventListener('click', () => setNightCity(false)));
document.addEventListener('theme:changed', (e) => !e.detail.fun && (closeTerm(), setNightCity(false)));
document.addEventListener('i18n:changed', () => !done && render());

// ---------- Scanner ----------
const typing = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');
const THREAT = ['low', 'low', 'med', 'med', 'high', 'low'];

function tags() {
  document.querySelectorAll('.scan-tag').forEach((t) => t.remove());
  document.querySelectorAll('main .section[id]').forEach((section, i) => {
    const num = section.querySelector('.section__num')?.textContent.trim();
    const title = section.querySelector('.section__title')?.textContent.trim() ?? section.id;
    const count = section.querySelectorAll('li, dt').length;
    const tag = document.createElement('span');
    tag.className = 'fun-only scan-tag';
    tag.setAttribute('aria-hidden', 'true');
    const parts = [num ? `${tr('fun.scan.section')} ${num}` : null, title, count ? `${count} ${tr('fun.scan.items')}` : null, `${tr('fun.scan.threat')}: ${tr(`fun.scan.${THREAT[i % THREAT.length]}`)}`];
    tag.textContent = parts.filter(Boolean).join(' · ').toUpperCase();
    const anchor = section.querySelector('.section__title');
    if (anchor) anchor.after(tag);
    else section.prepend(tag);
  });
}

function scan(on) {
  if (on && !isFun()) return;
  if (on) tags();
  root.classList.toggle('is-scanning', on);
}

document.addEventListener('keydown', (e) => {
  if ((e.key === 'q' || e.key === 'Q') && !e.repeat && !typing(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) scan(true);
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'q' || e.key === 'Q') scan(false);
});
// Touch screens: hold two fingers on the page (a short hold, so a quick pinch doesn't flash it).
let hold;
document.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length !== 2 || typing(e.target)) return;
    clearTimeout(hold);
    hold = setTimeout(() => scan(true), 250);
  },
  { passive: true }
);
const lift = (e) => {
  if (e.touches.length >= 2) return;
  clearTimeout(hold);
  if (root.classList.contains('is-scanning')) scan(false);
};
document.addEventListener('touchend', lift, { passive: true });
document.addEventListener('touchcancel', lift, { passive: true });
addEventListener('blur', () => scan(false));
document.addEventListener('fun:scan', () => scan(!root.classList.contains('is-scanning')));
