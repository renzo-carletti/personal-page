// Shared landscape for both modes (1440×420 viewBox): fun mode fills these ridges as a
// dusk scene, normal mode draws the same skyline as quiet line art under the hero.

// Ridge outlines, far to near. Each is an open line; close it with `V420H0Z` to fill.
export const farRidge = 'M0 300L120 262L220 282L340 222L430 252L520 204L640 262L760 232L880 272L1000 214L1120 252L1240 218L1360 262L1440 242';
export const midRidge = 'M0 322L90 302L200 332L310 284L420 316L560 272L700 322L820 292L960 332L1080 288L1200 322L1320 298L1440 312';

export const hill3 = (x) => 342 + 8 * Math.sin(x / 140);
export const hill4 = (x) => 376 + 6 * Math.sin(x / 110 + 1);

// Sample a hill function every 30 units into an open line.
export const hillLine = (fn) => `M0 ${fn(0).toFixed(1)}` + Array.from({ length: 49 }, (_, i) => `L${i * 30} ${fn(i * 30).toFixed(1)}`).join('');

// Pine silhouettes on a hill: deterministic positions so the build is stable.
export function pines(count, seed, baseY, [minH, maxH]) {
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: count }, () => {
    const x = Math.round(rand() * 1440);
    const height = minH + rand() * (maxH - minH);
    const y = baseY(x) + 4;
    const w = height * 0.28;
    return `M${x} ${(y - height).toFixed(1)}L${(x + w).toFixed(1)} ${y.toFixed(1)}L${(x - w).toFixed(1)} ${y.toFixed(1)}Z`;
  }).join('');
}
