let ctx = null;
let bootDone = false;

const gates = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 721px)').matches;

function buildStarfield() {
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-starfield';
  const c2d = canvas.getContext('2d');
  const stars = [];
  const embers = [];
  let w = 0;
  let h = 0;
  let mx = 0;
  let my = 0;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars.length = 0;
    embers.length = 0;
    const count = Math.min(130, Math.floor((w * h) / 11000));
    for (let i = 0; i < count; i++) {
      const warm = Math.random() < 0.18;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.85 + 0.15,
        r: Math.random() * 1.3 + 0.4,
        tw: Math.random() * Math.PI * 2,
        warm,
      });
    }
    const emberCount = Math.min(22, Math.floor(w / 60));
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * w,
        y: h * (0.5 + Math.random() * 0.5),
        v: 0.12 + Math.random() * 0.2,
        drift: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.6,
        tw: Math.random() * Math.PI * 2,
      });
    }
  };

  const tick = () => {
    c2d.clearRect(0, 0, w, h);
    for (const s of stars) {
      const px = s.x + mx * s.z * 34;
      const py = s.y + my * s.z * 34;
      s.tw += 0.012;
      const a = 0.3 + 0.5 * Math.abs(Math.sin(s.tw));
      c2d.beginPath();
      c2d.arc(px, py, s.r, 0, Math.PI * 2);
      c2d.fillStyle = s.warm ? `rgba(255, 209, 102, ${a})` : `rgba(215, 228, 250, ${a})`;
      c2d.fill();
    }
    for (const e of embers) {
      e.y -= e.v;
      e.x += e.drift;
      e.tw += 0.03;
      if (e.y < -8 || e.x < -8 || e.x > w + 8) {
        e.y = h + 8;
        e.x = Math.random() * w;
      }
      const a = 0.18 + 0.3 * Math.abs(Math.sin(e.tw));
      c2d.beginPath();
      c2d.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      c2d.fillStyle = `rgba(255, 159, 67, ${a})`;
      c2d.fill();
    }
  };

  const onMouse = (e) => {
    mx = e.clientX / w - 0.5;
    my = e.clientY / h - 0.5;
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouse);
  document.body.appendChild(canvas);

  let raf = requestAnimationFrame(function loop() {
    tick();
    raf = requestAnimationFrame(loop);
  });

  return {
    el: canvas,
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      canvas.remove();
    },
  };
}

function buildJourney(gsap, ScrollTrigger) {
  const wrap = document.createElement('div');
  wrap.className = 'fx-journey';
  wrap.innerHTML = '<span class="fx-journey__fill"></span><span class="fx-journey__star"></span>';
  document.body.appendChild(wrap);

  const fill = wrap.querySelector('.fx-journey__fill');
  const star = wrap.querySelector('.fx-journey__star');

  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const p = self.progress;
      fill.style.transform = `scaleX(${p})`;
      star.style.left = `calc(${p * 100}% - 4.5px)`;
    },
  });

  return {
    el: wrap,
    stop() {
      st.kill();
      wrap.remove();
    },
  };
}

function buildTilt(gsap) {
  const cards = gsap.utils.toArray('.work__card, .about__card, .workflow__card, .arch');
  const fns = cards.map((card) => {
    gsap.set(card, { transformPerspective: 800 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.15, ease: 'power1.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.15, ease: 'power1.out' });
    const move = (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 12);
      rx(-py * 12);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', leave);
    return () => {
      card.removeEventListener('mousemove', move);
      card.removeEventListener('mouseleave', leave);
    };
  });
  return fns;
}

function buildBoot() {
  if (bootDone) return () => {};
  bootDone = true;
  const es = (document.documentElement.lang || 'en').toLowerCase().startsWith('es');
  const lines = es
    ? ['Un viaje comienza con un solo paso…', 'Cada página deja una huella en el mapa.']
    : ['Every journey begins with a single step…', 'Every page leaves a mark on the map.'];

  const boot = document.createElement('div');
  boot.className = 'fx-boot';
  const text = document.createElement('div');
  text.className = 'fx-boot__text';
  boot.appendChild(text);
  document.body.appendChild(boot);

  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  text.appendChild(p1);
  text.appendChild(p2);

  const type = (el, str, done) => {
    let i = 0;
    const iv = setInterval(() => {
      el.textContent = str.slice(0, ++i);
      if (i >= str.length) {
        clearInterval(iv);
        done();
      }
    }, 34);
  };

  type(p1, lines[0], () => setTimeout(() => type(p2, lines[1], () => {
    setTimeout(() => {
      boot.classList.add('fx-boot--done');
      setTimeout(() => boot.remove(), 1100);
    }, 2800);
  }), 400));

  return () => boot.remove();
}

export async function initGameFx() {
  if (ctx || typeof window === 'undefined' || !gates()) return;
  const bootStop = buildBoot();
  let star = null;
  let journey = null;
  let tiltFns = [];
  if (isDesktop()) {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    star = buildStarfield();
    journey = buildJourney(gsap, ScrollTrigger);
    tiltFns = buildTilt(gsap);
  }
  ctx = { star, journey, tiltFns, bootStop };
}

export function destroyGameFx() {
  if (!ctx) return;
  if (ctx.star) ctx.star.stop();
  if (ctx.journey) ctx.journey.stop();
  ctx.tiltFns.forEach((f) => f());
  ctx.bootStop();
  ctx = null;
}