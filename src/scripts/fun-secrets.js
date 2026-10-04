// Fun mode secrets: remembered in this browser, counted in the HUD, announced with a toast.
import { currentLang } from './i18n.js';
import { translations, defaultLang } from '../data/content.js';

export const SECRETS = ['spells', 'kweh', 'mallow', 'moon', 'chest', 'nomai', 'nova'];
const KEY = 'rc-secrets';

export const tr = (key) => (translations[currentLang()] ?? translations[defaultLang])[key] ?? key;
export const isFun = () => document.documentElement.dataset.theme === 'fun';

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
}

renderCount();
