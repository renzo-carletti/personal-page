# Renzo Carletti — Personal Page

Portfolio and CV of Renzo Emiliano Carletti, Drupal & React developer.
Live at **https://renzo-carletti.github.io/personal-page/**.

The site has two modes on the same page and content:

- **Normal mode** (default): an editorial layout with project screenshots, a timeline and a contact block. Light and dark follow the OS until the visitor picks one.
- **Fun mode** (gamepad button in the nav): the same content as a pixel game. It has a dusk title screen, a level-select project map, a quest log, a star chart and a campfire save point. Vivi casts Fire if you click him.

Both modes are bilingual (EN/ES), work without JavaScript for reading, and print as a clean CV.

## Stack

- [Astro 5](https://astro.build), fully static. Little JS: nav, language switch, scroll progress, contact form and Vivi's spell.
- Plain CSS with design tokens (`src/styles/global.css`). Fun mode is a separate skin (`src/styles/fun.css`).
- Self-hosted fonts: Newsreader (display), Public Sans (text), JetBrains Mono (labels), Jersey 10 (fun mode only, loaded on demand).
- Project screenshots go through `astro:assets` and ship as responsive AVIF/WebP.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321/personal-page/
npm run build    # static site → dist/
npm run preview  # serve the built site
```

Requires Node.js 20.19+ or 22+.

## Deploy

### GitHub Pages (current setup)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`:

1. Repo → **Settings → Pages** → Source: **GitHub Actions** (one time).
2. Push to `main`. The site deploys to `https://<user>.github.io/<repo>/`.

The workflow sets `SITE_URL` and `ASTRO_BASE` from the repo name, so canonical URLs, the sitemap, `robots.txt` and the share image all point to the right place. Without those variables the build defaults to `https://renzo-carletti.github.io/personal-page/`.

### Other hosts or a custom domain

Any static host works: build command `npm run build`, output `dist/`. At the root of a domain, set:

```bash
SITE_URL=https://your-domain.com ASTRO_BASE=/ npm run build
```

## Editing content

All text lives in **`src/data/content.json`**, with English and Spanish side by side (`{ "en": "...", "es": "..." }`):

| Key | What it holds |
|---|---|
| `profile` | Name, role, tagline, summary, contact links |
| `stats` | The numbers in the hero (only verified figures) |
| `projects` | Case studies: problem, what I did, result, stack, `image` (file in `src/assets/work/`) |
| `experience`, `drupal`, `skills`, `education`, `certifications`, `languages` | One block per section. Certification dates are `YYYY-MM` and get formatted per language |
| `ui` | Every interface string, keyed like `nav.work` |

`src/data/content.js` turns the JSON into the server-rendered text and the runtime dictionary. Elements carry `data-i18n="key"` (plus `data-i18n-attr` for attributes), and `src/scripts/i18n.js` swaps them when the language changes. To add a language, add its code to `site.languages` and a value for it in every field.

## Generated files

Some files in `public/` are rendered from the site, so they never drift from `content.json`:

```bash
npm run assets
```

This builds the site, serves it, and uses headless Chrome to write:

- `public/renzo-carletti-cv.pdf` and `public/renzo-carletti-cv-es.pdf`, converted from the Word files `public/renzo-carletti-cv.docx` (English) and `public/renzo-carletti-cv-es.docx` (Spanish). Edit the Word files; the conversion needs LibreOffice
- `public/og.png`, the 1200×630 share card from `/og/`
- `public/apple-touch-icon.png`, from `public/favicon.svg`

It needs Google Chrome or Chromium (`CHROME=/path/to/binary` to override). Commit the results; CI doesn't run it. The download buttons serve the CV in the visitor's language; the footer also links the Word file in the same language.

Both CVs are written in Word, so when you change your experience, update `content.json` (the site) and both `.docx` files.

**Project screenshots** (`src/assets/work/*.webp`) were captured once from the live sites at 1440×900. Replace a file with the same name to update it.

## How fun mode works

- `html[data-theme="fun"]` switches the skin. It's stored in `localStorage` (`rc-theme`) and applied before first paint (`src/components/ThemeInit.astro`).
- `src/styles/fun.css` restyles the same markup. Elements that exist only in one mode use `.fun-only` or `.pro-only`.
- `astro.config.mjs` sets `scopedStyleStrategy: 'where'`, so the theme overrides win over component styles at equal specificity.
- Pixel art is plain text grids in `src/components/fun/sprites.js`, rendered as crisp SVG by `PixelSprite.astro`. To draw a new sprite, add a grid and a palette.
- The landscape lines are shared by both modes (`src/components/scene.js`): filled ridges in fun mode, line art under the normal hero.
- All motion respects `prefers-reduced-motion`.

## Quality

Lighthouse on the built site: Performance 98 (mobile) / 100 (desktop), Accessibility, Best Practices and SEO 100. axe-core reports no violations in either mode.

## Credits

Vivi is a fan tribute to Final Fantasy IX (© Square Enix). All pixel art on this site is original and drawn for it; no game assets are used. The mood board in `references/` is git-ignored and is not part of the site.
