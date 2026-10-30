// Normal mode: CV blocks fade up once as they enter the view (styles in global.css).
// Off with reduced motion and in fun mode, which has its own effects; switching to fun shows everything.
const root = document.documentElement;
const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)');

// Blocks that reveal, in groups: siblings in one group step in 60 ms apart.
const GROUPS = [
  '.section__head',
  '.cases > .case',
  '.jobs > .job',
  '.drupal__list > div',
  '.drupal__side > *',
  '.skills > .skills__group',
  '.docs__list > .doc',
  '.edu__col',
  '.contact > *',
];
const STEP = 0.06;
const MAX_DELAY = 0.3;

let observer;

function showAll() {
  observer?.disconnect();
  observer = null;
  root.classList.remove('js-reveal');
}

function start() {
  if (observer || root.dataset.theme === 'fun' || !motionOk.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' }
  );
  GROUPS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.classList.contains('is-in')) return;
      // Already on screen (e.g. a reload mid-page): show it as is, no flash.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-in');
        return;
      }
      const index = [...el.parentElement.children].indexOf(el);
      el.dataset.reveal = '';
      el.style.setProperty('--reveal-delay', `${Math.min(index * STEP, MAX_DELAY)}s`);
      observer.observe(el);
    });
  });
  root.classList.add('js-reveal');
}

start();
document.addEventListener('theme:changed', (e) => (e.detail.fun ? showAll() : start()));
motionOk.addEventListener('change', () => (motionOk.matches ? start() : showAll()));
