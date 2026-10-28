// Everything that needs Three.js, in one lazily loaded chunk.
import { mountAirship, mountChocobo, mountVivi } from './actors.js';
import { mountHero } from './hero.js';
import { mountSolar } from './solar.js';
import { start, stop } from './stage.js';

export function mount() {
  mountHero();
  mountVivi();
  mountChocobo();
  mountSolar();
  mountAirship();
  return { resume: start, pause: stop };
}
