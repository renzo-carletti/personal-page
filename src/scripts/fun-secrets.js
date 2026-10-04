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

function renderCount() {
  document.querySelectorAll('.hud-secrets__n').forEach((el) => (el.textContent = String(found().size)));
}

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
