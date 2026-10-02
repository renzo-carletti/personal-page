import content from './content.json';

export default content;

export const { site, profile, stats, projects, experience, skills, certifications, education, languages } = content;
export const { languages: langs, defaultLang } = site;

// Pick one language from a bilingual field ({ en, es }); plain values pass through.
export function t(field, lang = defaultLang) {
  if (field == null || typeof field !== 'object' || Array.isArray(field)) return field;
  return field[lang] ?? field[defaultLang];
}

// Flat key → string map for one language. Keys match the `data-i18n` attributes in the markup.
function buildDict(lang) {
  const d = {};
  const put = (key, field) => {
    const value = t(field, lang);
    if (value != null) d[key] = value;
  };

  for (const [key, field] of Object.entries(content.ui)) put(key, field);

  put('hero.summary', profile.summary);
  d.roles = profile.roles.map((r) => t(r, lang));
  stats.forEach((s) => put(`hero.stats.${s.id}`, s.label));

  put('about.whoText', profile.about);
  put('about.current.text', profile.current);
  profile.highlights.forEach((h, i) => put(`about.highlights.${i}`, h));
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
    job.bullets.forEach((b, bi) => put(`exp.${i}.b${bi}`, b));
  });

  projects.forEach((p, i) => {
    for (const k of ['name', 'tagline', 'desc', 'metric']) put(`work.${i}.${k}`, p[k]);
    for (const k of ['problem', 'solution', 'impact']) put(`case.${i}.${k}`, p.case[k]);
  });

  skills.forEach((g, i) => put(`skills.g${i}`, g.group));
  certifications.forEach((c, i) => put(`certs.${i}`, c.name));

  return d;
}

export const translations = Object.fromEntries(langs.map((lang) => [lang, buildDict(lang)]));
