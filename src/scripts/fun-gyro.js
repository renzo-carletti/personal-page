// Device tilt on touch screens in fun mode, so phones get the parallax that follows the mouse on
// desktop (3D camera, sky, Vivi looking around, card tilt). `tilt.x` and `tilt.y` run from -1 to 1
// (right and down positive) relative to how the phone is held: the rest angle slowly follows the
// phone, so only movement counts. iOS asks for permission first, and only from a tap, so the
// request rides on turning fun mode on or on the first tap on a toy.
import { isFun, reducedMotion } from './fun-secrets.js';

export const tilt = { x: 0, y: 0, active: false };
const coarse = matchMedia('(hover: none) and (pointer: coarse)');
const RANGE = 18; // degrees for a full swing
const FOLLOW = 0.006; // how fast the rest angle catches up, per reading
const TOYS = '.nav__theme, .btn--start, .vivi, .choco, .hero-sun, .sif, .savepoint__fire-btn';
const clamp = (v) => Math.max(-1, Math.min(1, v));
const listeners = new Set();
let rest = null;
let asked = false;

export const onTilt = (fn) => listeners.add(fn);

function read(e) {
  if (e.beta == null || e.gamma == null) return;
  if (!isFun() || reducedMotion()) {
    tilt.active = false;
    rest = null;
    return;
  }
  // Phone axes to screen axes for the current orientation.
  const angle = screen.orientation?.angle ?? window.orientation ?? 0;
  let x = e.gamma;
  let y = e.beta;
  if (angle === 90) [x, y] = [e.beta, -e.gamma];
  else if (angle === -90 || angle === 270) [x, y] = [-e.beta, e.gamma];
  else if (angle === 180) [x, y] = [-e.gamma, -e.beta];
  // Held near upright the angles can flip; start over from the new pose.
  if (!rest || Math.abs(x - rest.x) > 60 || Math.abs(y - rest.y) > 60) rest = { x, y };
  rest.x += (x - rest.x) * FOLLOW;
  rest.y += (y - rest.y) * FOLLOW;
  tilt.x = clamp((x - rest.x) / RANGE);
  tilt.y = clamp((y - rest.y) / RANGE);
  tilt.active = true;
  listeners.forEach((fn) => fn(tilt));
}

if (coarse.matches && 'DeviceOrientationEvent' in window) {
  addEventListener('deviceorientation', read);
  document.addEventListener('click', (e) => {
    const ask = DeviceOrientationEvent.requestPermission;
    if (asked || !ask || !isFun() || !e.target.closest?.(TOYS)) return;
    asked = true;
    ask.call(DeviceOrientationEvent).catch(() => {});
  });
}
