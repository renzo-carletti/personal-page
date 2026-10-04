import content from './content.json';

export default content;

export const { site, profile, stats, projects, experience, skills, drupal, certifications, education, languages } = content;
export const { languages: langs, defaultLang } = site;

// Pick one language from a bilingual field ({ en, es }); plain values pass through.
export function t(field, lang = defaultLang) {
  if (field == null || typeof field !== 'object' || Array.isArray(field)) return field;
  return field[lang] ?? field[defaultLang];
}

// "2025-04" → "Apr 2025" / "abr 2025".
export function formatMonth(ym, lang = defaultLang) {
  const [y, m] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-AR' : 'en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace('.', '');
}

// Flat key → string map for one language. Keys match the `data-i18n` attributes in the markup.
function buildDict(lang) {
  const d = {};
  const put = (key, field) => {
    const value = t(field, lang);
    if (value != null) d[key] = value;
  };

  for (const [key, field] of Object.entries(content.ui)) put(key, field);

  put('hero.role', profile.role);
  put('hero.tagline', profile.tagline);
  put('hero.summary', profile.summary);
  stats.forEach((s) => {
    put(`hero.stats.${s.id}`, s.label);
    d[`hero.stats.${s.id}.value`] = s.value.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US') + s.suffix;
  });

  put('about.current.text', profile.current);
  education.forEach((e, i) => {
    for (const k of ['school', 'degree', 'detail', 'period']) put(`about.edu.${i}.${k}`, e[k]);
  });
  languages.forEach((l, i) => {
    put(`about.lang.${i}.name`, l.name);
    put(`about.lang.${i}.level`, l.level);
  });

  experience.forEach((job, i) => {
    put(`exp.${i}.role`, job.role);
    put(`exp.${i}.meta`, job.meta);
    put(`exp.${i}.period`, job.period);
    job.bullets.forEach((b, bi) => put(`exp.${i}.b${bi}`, b));
  });

  projects.forEach((p, i) => {
    for (const k of ['name', 'tagline', 'metric']) put(`work.${i}.${k}`, p[k]);
    for (const k of ['problem', 'solution', 'impact']) put(`case.${i}.${k}`, p.case[k]);
    d[`work.${i}.shot`] = `${t(content.ui['work.shot'], lang)} ${t(p.name, lang)}`;
  });

  put('drupal.versions', drupal.versions);
  drupal.items.forEach((item, i) => {
    put(`drupal.${i}.title`, item.title);
    put(`drupal.${i}.proof`, item.proof);
  });

  skills.forEach((g, i) => put(`skills.g${i}`, g.group));
  certifications.forEach((c, i) => {
    put(`certs.${i}`, c.name);
    d[`certs.${i}.date`] = formatMonth(c.date, lang);
  });

  return d;
}

export const translations = Object.fromEntries(langs.map((lang) => [lang, buildDict(lang)]));
