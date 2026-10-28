// Cyberpunk 2077 tribute: a Breach Protocol puzzle in the Drupal section, and a scanner (hold Q,
// or the `scan` cheat) that tints the page and tags each section.
import { isFun, play, tr, trf, unlock } from './fun-secrets.js';

// ---------- Breach Protocol ----------
const CODES = ['1C', '55', 'BD', 'E9', '7A'];
const SIZE = 5;
const BUFFER = 6;
const box = document.querySelector('.breach');
const grid = box?.querySelector('.breach__grid');
const seqEl = box?.querySelector('.breach__seq');
const bufEl = box?.querySelector('.breach__buf');
const status = box?.querySelector('.breach__status');
const pick = (list) => list[Math.floor(Math.random() * list.length)];

let cells = [];
let target = [];
let buffer = [];
let line = { row: 0 };
let done = false;

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

const matched = () => {
  const s = buffer.join(' ');
  return s.includes(target.join(' '));
};

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

function choose(r, c) {
  const cell = cells[r][c];
  cell.used = true;
  buffer.push(cell.code);
  line = 'row' in line ? { col: c } : { row: r };
  if (matched()) {
    done = true;
    status.textContent = tr('fun.breach.win');
    box.classList.add('is-won');
    unlock('breach');
    document.dispatchEvent(new CustomEvent('fun:breach'));
  } else if (buffer.length >= BUFFER) {
    done = true;
    status.textContent = tr('fun.breach.fail');
    play(box, 'is-failed', 700);
  } else {
    status.textContent = trf('fun.breach.picked', { code: cell.code, n: buffer.length, max: BUFFER });
  }
  render();
  // Keep keyboard focus inside the grid on the next playable cell.
  grid.querySelector('button:not(:disabled)')?.focus();
  if (done) box.querySelector('.breach__reset')?.focus();
}

function reset() {
  generate();
  box?.classList.remove('is-won');
  if (status) status.textContent = '';
  render();
}
box?.querySelector('.breach__reset')?.addEventListener('click', reset);
document.addEventListener('i18n:changed', render);
if (box) reset();

// ---------- Scanner ----------
const root = document.documentElement;
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
addEventListener('blur', () => scan(false));
document.addEventListener('fun:scan', () => scan(!root.classList.contains('is-scanning')));
