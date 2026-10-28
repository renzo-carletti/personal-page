// Dark Souls corner: light the bonfire at the save point (then rest at it), pet Sif, and rate the
// orange soapstone messages left between sections. Also the big banner ("BONFIRE LIT", "YOU DIED").
import { isFun, play, tr, trf, unlock } from './fun-secrets.js';

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
  document.dispatchEvent(new CustomEvent('fun:rest'));
});
// A new loop puts the bonfire out again.
document.addEventListener('fun:loop', () => {
  fire?.classList.remove('is-lit');
  fire?.setAttribute('aria-label', tr('fun.bonfire.label'));
  if (fire) fire.dataset.i18n = 'fun.bonfire.label';
  if (hint) hint.textContent = tr('fun.bonfire.hint');
});

// ---------- Sif: wags, perks up, says hi ----------
const sif = document.querySelector('.sif');
sif?.addEventListener('click', () => {
  play(sif, 'is-wag', 1400);
  document.dispatchEvent(new CustomEvent('fun:pet'));
});

// ---------- Soapstone messages, one after a few sections ----------
const KEY = 'rc-soapstones';
const ratings = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') || {};
  } catch {
    return {};
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
  const rated = document.createElement('span');
  rated.className = 'soapstone__rated';
  msg.append(text, rated);
  const render = () => {
    const n = ratings()[i] ?? 0;
    text.textContent = tr(`fun.msg.${i}`);
    rated.textContent = n ? trf('fun.msg.rated', { n }) : '';
    msg.setAttribute('aria-label', `${tr('fun.msg.label')}: ${tr(`fun.msg.${i}`)}${n ? `. ${trf('fun.msg.rated', { n })}` : ''}`);
  };
  msg.addEventListener('click', () => {
    const all = ratings();
    all[i] = (all[i] ?? 0) + 1;
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {}
    render();
    play(msg, 'is-rated', 900);
  });
  document.addEventListener('i18n:changed', render);
  render();
  section.append(msg);
});
