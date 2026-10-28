// Fun mode secrets: remembered in this browser, counted in the HUD, announced with a toast.
import { currentLang } from './i18n.js';
import { translations, defaultLang } from '../data/content.js';
import { SECRETS } from '../data/secrets.js';

export { SECRETS };
const KEY = 'rc-secrets';

export const tr = (key) => (translations[currentLang()] ?? translations[defaultLang])[key] ?? key;
// A string with {name} placeholders filled in.
export const trf = (key, vars) => tr(key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
export const isFun = () => document.documentElement.dataset.theme === 'fun';
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Restart a CSS animation class on an element and drop it after `ms`.
export function play(el, cls, ms) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  clearTimeout(el._t?.[cls]);
  el._t = { ...el._t, [cls]: setTimeout(() => el.classList.remove(cls), ms) };
}

function found() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(list) ? list.filter((id) => SECRETS.includes(id)) : []);
  } catch {
    return new Set();
  }
}

const panel = document.getElementById('secrets-panel');
const panelBtn = document.querySelector('.hud-secrets__btn');

// Found secrets show their name; missing ones show a hint.
function renderPanel() {
  if (!panel) return;
  const set = found();
  panel.replaceChildren(
    ...SECRETS.map((id) => {
      const li = document.createElement('li');
      const done = set.has(id);
      li.className = done ? 'is-found' : '';
      li.textContent = `${done ? '★' : '☆'} ${tr(done ? `fun.s.${id}` : `fun.h.${id}`)}`;
      return li;
    })
  );
}

function renderCount() {
  document.querySelectorAll('.hud-secrets__n').forEach((el) => (el.textContent = String(found().size)));
  renderPanel();
}

function setPanel(open) {
  if (!panel || !panelBtn) return;
  panel.hidden = !open;
  panelBtn.setAttribute('aria-expanded', String(open));
  if (open) renderPanel();
}

panelBtn?.addEventListener('click', () => setPanel(panel.hidden));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel && !panel.hidden) {
    setPanel(false);
    panelBtn.focus();
  }
});
document.addEventListener('click', (e) => {
  if (panel && !panel.hidden && !e.target.closest('.hud-secrets')) setPanel(false);
});
document.addEventListener('i18n:changed', renderPanel);

let toastTimer;
export function toast(title, text) {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.querySelector('.toast__title').textContent = title;
  el.querySelector('.toast__text').textContent = text;
  el.classList.remove('is-shown');
  void el.offsetWidth; // restart the slide-in
  el.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-shown'), 4200);
}

export function unlock(id) {
  if (!isFun()) return;
  const set = found();
  if (set.has(id)) return;
  set.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {}
  renderCount();
  toast(`★ ${tr('fun.unlocked')} · ${set.size}/${SECRETS.length}`, tr(`fun.s.${id}`));
  document.dispatchEvent(new CustomEvent('fun:unlocked', { detail: { id } }));
}

renderCount();
