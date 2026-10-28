// Dark Souls corner: light the bonfire at the save point (then rest at it), pet Sif, and read the
// orange soapstone messages left between sections (each teaches a cheat). Also the big banner
// ("BONFIRE LIT", "YOU DIED").
import { isFun, play, toast, tr, trf, unlock } from './fun-secrets.js';
import { learn } from './fun-cheats.js';

const banner = document.querySelector('.souls-banner');
const bannerText = banner?.querySelector('.souls-banner__text');

// Banner across the screen; `kind` is 'lit' (gold) or 'died' (red).
export function showBanner(text, kind, ms = 2600) {
  if (!banner) return;
  bannerText.textContent = text;
  banner.dataset.kind = kind;
  play(banner, 'is-shown', ms);
}

// ---------- Bonfire: the first click lights it, later clicks rest ----------
const fire = document.querySelector('.savepoint__fire-btn');
const hint = document.querySelector('.savepoint__hint');
fire?.addEventListener('click', () => {
  if (!isFun()) return;
  if (!fire.classList.contains('is-lit')) {
    fire.classList.add('is-lit');
    fire.setAttribute('aria-label', tr('fun.bonfire.rest'));
    fire.dataset.i18n = 'fun.bonfire.rest';
    showBanner(tr('fun.lit'), 'lit');
    unlock('bonfire');
  } else if (hint) {
    hint.textContent = tr('fun.bonfire.rested');
  }
});
// A new loop puts the bonfire out again.
document.addEventListener('fun:loop', () => {
  fire?.classList.remove('is-lit');
  fire?.setAttribute('aria-label', tr('fun.bonfire.label'));
  if (fire) fire.dataset.i18n = 'fun.bonfire.label';
  if (hint) hint.textContent = tr('fun.bonfire.hint');
});

// ---------- Sif: sets the sword down, howls, picks it up ----------
const sif = document.querySelector('.sif');
sif?.addEventListener('click', () => {
  // Drops the sword, howls, picks it up again (3.9 s; the 3D view acts it out).
  if (!sif.classList.contains('is-howl')) play(sif, 'is-howl', 3900);
});

// ---------- Soapstone messages: each one teaches a cheat, read once ----------
const KEY = 'rc-soapstones';
const TEACHES = ['motherlode', 'praise the sun', 'scan', 'breach'];
const readSet = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
};
['work', 'experience', 'skills', 'education'].forEach((id, i) => {
  const section = document.getElementById(id)?.querySelector('.container');
  if (!section) return;
  const msg = document.createElement('button');
  msg.type = 'button';
  msg.className = 'fun-only soapstone';
  const text = document.createElement('span');
  text.className = 'soapstone__text';
  const state = document.createElement('span');
  state.className = 'soapstone__rated';
  msg.append(text, state);
  const render = () => {
    const read = readSet().has(i);
    msg.classList.toggle('is-read', read);
    text.textContent = tr(`fun.msg.${i}`);
    state.textContent = read ? tr('fun.msg.read') : '';
    msg.setAttribute('aria-label', `${tr('fun.msg.label')}: ${tr(`fun.msg.${i}`)}${read ? `. ${tr('fun.msg.read')}` : ''}`);
  };
  msg.addEventListener('click', () => {
    if (!isFun()) return;
    const set = readSet();
    if (!set.has(i)) {
      set.add(i);
      try {
        localStorage.setItem(KEY, JSON.stringify([...set]));
      } catch {}
      play(msg, 'is-rated', 900);
    }
    learn(TEACHES[i]);
    toast(`★ ${trf('fun.cheats.learned', { code: TEACHES[i] })}`, tr('fun.h.cheat'));
    render();
  });
  document.addEventListener('i18n:changed', render);
  render();
  section.append(msg);
});
