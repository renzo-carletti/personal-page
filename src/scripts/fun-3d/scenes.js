// Everything that needs Three.js, in one lazily loaded chunk.
import { mountAirship, mountChocobo, mountVivi } from './actors.js';
import { mountHero } from './hero.js';
import { mountSky } from './sky.js';
import { mountSolar } from './solar.js';
import { mountSouls } from './souls.js';
import { start, stop } from './stage.js';

export function mount() {
  mountSky();
  mountHero();
  mountVivi();
  mountChocobo();
  mountSolar();
  mountAirship();
  mountSouls();
  return { resume: start, pause: stop };
}
