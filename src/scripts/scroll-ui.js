const backToTop = document.getElementById('back-to-top');

function onScroll() {
  backToTop.classList.toggle('visible', window.scrollY > 600);
}

onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('main')?.focus({ preventScroll: true });
});

// Highlight the nav link of the section in view.
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')].filter((s) =>
  navLinks.some((a) => a.getAttribute('href') === `#${s.id}`)
);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => spy.observe(s));

// Print the full CV: open every collapsed block, then restore.
let closedForPrint = [];
window.addEventListener('beforeprint', () => {
  closedForPrint = [...document.querySelectorAll('details:not([open])')];
  closedForPrint.forEach((d) => (d.open = true));
});
window.addEventListener('afterprint', () => {
  closedForPrint.forEach((d) => (d.open = false));
  closedForPrint = [];
});
