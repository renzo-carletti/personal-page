# PROGRESS

Single source of truth for the redesign. Phase 0 (audit) done on 2026-10-02. References were viewed once and summarized here; do not re-open them.

## Phases
- [x] Phase 0: Audit + Style Brief
- [x] Phase 1: Content & architecture (2026-10-02)
- [x] Phase 2: Normal mode (2026-10-02; fun mode is a palette swap until Phase 3)
- [x] Phase 3: Fun mode (2026-10-02)
- [x] Phase 4: Polish & quality (2026-10-04)

### 1. Project map
- Stack: Astro 5.18 static site, `@astrojs/sitemap`, GSAP 3 (fun mode only), Fontsource Inter + JetBrains Mono (self-hosted, preloaded via inline @font-face).
- Deploy: GitHub Actions `.github/workflows/deploy.yml` → GitHub Pages; `ASTRO_BASE=/<repo>`, `SITE_URL` from repo. README still recommends Cloudflare Pages as option 1.
- Structure: `src/pages/index.astro` (single page) → `src/layouts/Layout.astro` → 10 components in `src/components/` (Nav, Hero, About, Experience, Work, Workflow, Skills, Certifications, Contact, Footer).
- Content: `src/data/cv.js` (profile, stats, projects w/ case studies, experience, skills, certs, education, languages) **plus** `src/i18n/translations.js` (454 lines, EN/ES) which duplicates much of the same text (e.g. `hero.summary` = `profile.summary`). Runtime i18n swap via `src/scripts/i18n.js` + `data-i18n` attributes.
- Modes: already exist. Pro (default, dark) and Fun (`html[data-theme=fun]`, key `rc-theme` in localStorage, set pre-paint in Layout). Fun = FF9 storybook + Outer Wilds cosmos (serif fonts from Google Fonts loaded on toggle, GSAP title FX `fun-fx.js`, `game-fx.js`). Extra B&W toggle and EN/ES toggle in Nav.
- Assets: `public/cv.pdf` (80K), `public/og.png` (140K), favicon.svg. Duplicate root `CV Renzo Emiliano Carletti.pdf`.
- Dead code: `src/scripts/hero-three.js` (358 lines) not imported anywhere.

### 2. Current design inventory
- Fonts: Pro = Inter Variable + JetBrains Mono. Fun = Cormorant Garamond, Crimson Text, Pinyon Script, Caveat (4 Google families, render-blocking-ish on toggle).
- Colors (pro): bg `#05060f`, text `#e8ebfa`, accents purple `#7c6cff`, cyan `#22d3ee`, pink `#e879f9`, purple→magenta gradient. Fun: navy `#070c18`, parchment `#f6ecd7`, gold `#e8b64c`, teal `#57c0b0`.
- Tokens: partial (`:root` colors, radius, fonts, ease, container). No type scale, spacing scale, border, shadow tokens.
- Layout: centered container 1080px, hero + stat grid + card grids per section.
- JS: reveal.js, scroll-ui.js (progress bar, back-to-top), i18n.js, Hero typing roles + count-up, Nav theme/lang/bw logic, GSAP fun FX.
- A11y: skip link ✓, `aria-pressed` on toggles ✓, reduced-motion handled in 5 places ✓. Issues: `color-scheme: dark` only, no light/`prefers-color-scheme` support; ◐ glyph as B&W button icon; no print stylesheet; contrast of `--faint #8a94b8` on glass to verify.
- Perf: 19 `backdrop-filter` uses (GPU cost, scroll jank on low-end), 34 gradients, aurora blobs + noise overlay layers, GSAP (~70KB) for title FX, 4 extra webfonts in fun mode.

### 3. AI-slop signals found
- [ ] Purple/cyan/magenta gradient accents + aurora blobs + noise overlay (pro).
- [ ] Glassmorphism everywhere (19 backdrop-filter).
- [ ] Identical rounded cards in grids (Work, Workflow, About, Certifications).
- [ ] Default Inter font.
- [ ] Vague/inflated copy: "Senior Full-Stack Developer…", "proven record", "high-performance", "robust", "mission-critical", "Proof of the grind", "Let's build something fast together".
- [ ] Stat wall with count-up (30%, 40%, 57K+, 786K+, 80%, 5+) — reads as fake unless sourced; needs verification by user.
- [ ] Typing-roles carousel in hero ("Headless CMS Architect / … Specialist").
- [ ] Centered hero/sections.
- [ ] Unicode glyph icons (◐); check other components for emoji-like glyphs in Phase 2.
- [ ] Two sources of truth for text (cv.js + translations.js).

### 4. Style Brief (from /references — mood board only, never shipped)

| file | type | dominant colors | resolution | art style | could inspire |
|---|---|---|---|---|---|
| landing_page_reference.jpg | UI / landing screenshot (Firewatch site, Campo Santo) | #FDB813 #F68B1F #D9531E #8E2B1A #3B0D0C #240A0B | 660×1250 | flat vector, layered silhouettes, atmospheric value steps, no outlines | title screen, banner-ribbon buttons, footer, whole page rhythm |
| cards_reference.jpg | UI cards (likely AI-generated, garbled text) | #E9806E #F6E7D2 #4E8A7E #7FA6A0 #E8A07A | 736×1104 | flat vector, arched-top cards, thin inset border, pill buttons | mission-briefing cards, project level cards |
| ship.jpg | concept render (FF9 cargo airship) | #E0A63A #6B5B95 #C9772E #2E2A45 | 390×570 | 3D pre-rendered, ornate | scroll-companion airship silhouette idea |
| ship2.jpg | concept render (FF9 Hildagarde 1) | #2E2A45 #B9BCC8 #6B5B95 #C0392B | ~720×1170 | 3D render, sharp fins | color of "dark" UI frames, flags/pennants motif |
| ship3.jpg | illustration (vine airship, unknown artist) | #EFE4D2 #6B8E3A #8B5A2B #7E4A9E #F7C04A | 736×830 | ink line + flat color, warm lanterns | original airship sprite, lantern glow, "loot" motif |
| ship4.jpg | concept render (FF9 Brahne Fleet) | #C0392B #E0A63A #8B5A2B #B9BCC8 | ~570×940 | 3D render | red/gold accent for danger/alerts, pennant flags |
| 0895ca27….jpg | illustration (signed fan art, Outer Wilds-style traveler) | #000000 #FF7A1A #F2A93B #3E8E41 #4C8C8A #FFFFFF | 1024×1450 | ink outline, flat cel shade, ember particles | campfire "rest point"/contact section, star+ember particles |
| 13677f58….jpg | illustration (signed Vivi fan art, FF9) | #D8B26A #E6CF5A #8DA3C7 #A8C79A #FFE14D | 576×800 | ink line, paper grain texture | parchment texture, warm character tone |
| 7326c3fd….jpg | illustration (FF9 Vivi + chocobos fan art) | #F5C842 #3A6EA5 #6FB0C8 #6E8A3A #E26FA8 | 736×1590 | thick ink line, saturated painterly | saturation ceiling, foliage shapes |
| a56d06b5….jpg | illustration (top-down forest map, unknown source) | #A8C66C #3F7D4E #8CC7D9 #F0A6B8 #E9B949 #8B5A2B | 736×1410 | top-down, soft ink line, flat shade | level-select map for projects (river path = route between stages) |
| d734b507….jpg | illustration (Outer Wilds solar system, vertical) | #0A0A12 #1E7A6E #E8501E #FFC23A #6A5ACD #B9BCC8 | 700×1555 | flat vector, cutaway planets, star field | vertical scroll journey, skill-tree constellation, achievements |

Proposed palette (16):
| name | hex | role |
|---|---|---|
| ink | #1A0E0F | text on light, outlines |
| night | #0B0F1E | fun bg |
| dusk | #2E2A45 | panels |
| rust | #8E2B1A | danger / borders |
| ember | #E8641E | hot accent, fire |
| amber | #FDB813 | primary accent, ribbons |
| gold | #E0A63A | frames, XP |
| parchment | #F3E6CC | body text on dark, card bg |
| paper | #D8B26A | texture, muted |
| coral | #E9806E | secondary buttons |
| pine | #2F6B47 | foliage, success |
| grass | #A8C66C | HP bar / success light |
| teal | #4E8A7E | info, links on parchment |
| sky | #8CC7D9 | water, highlights |
| violet | #6B5B95 | magic / rare items |
| star | #FFF4D6 | stars, glow |

Recurring visual rules:
- Perspective: side-view layered landscapes (Firewatch, cards); 3/4 view for ships; top-down only in forest map; vertical scroll composition (solar system).
- Outlines: two families — no-outline flat silhouettes (Firewatch, cards, solar system) vs. warm-brown ink line 2-3px (ship3, Vivi, traveler, forest map). Never pure black outlines.
- Shading: flat cel, 3-5 value steps for depth (atmospheric haze). No dithering anywhere. Paper grain on illustrated pieces.
- UI frames: notched banner ribbons with wide-tracked caps (Firewatch); arched-top cards with thin inset rule (cards); small shield emblem as divider.
- Type feel: wide-tracked geometric caps for labels, quiet serif captions (FF9 sheets), no script fonts.
- Light: one warm light source (sun/campfire/lantern) against cool dark.

Strongest 3 → Phase 3:
1. landing_page_reference (Firewatch) → title screen + HUD/ribbon UI + palette backbone.
2. a56d forest map → projects level-select map (stages along the river).
3. d734 solar system → skill tree as constellation/orbits + achievements; vertical journey backdrop.
Support: ship3 → original airship scroll companion; 0895 → campfire contact/"save point"; cards_reference → mission-briefing card shape.

IP flags (mood board only, never copy/trace/ship):
- FF9 (Square Enix): ship.jpg, ship2.jpg, ship4.jpg (official renders), Vivi/chocobo fan art (13677, 7326).
- Firewatch site/art (Campo Santo/Olly Moss): landing_page_reference.
- Outer Wilds (Mobius): d734 art; 0895 is signed fan art ("VJ 20").
- Unknown authors: ship3, a56d. cards_reference likely AI-generated.
- Vivi: user asked for Vivi in fun mode (favorite character). Shipped as an original pixel drawing (not a ripped or traced sprite) with a fan-tribute credit line in the footer.

Clash + proposed unified direction (NEEDS CONFIRMATION before Phase 3):
- Brief asks pixel art; references contain zero pixel art (flat vector + ink illustration + 3D renders).
- CONFIRMED by user (2026-10-02): **Hybrid**. Scenes = flat layered silhouettes, no outlines, reference palette (Firewatch dusk at top of page → Outer Wilds night lower down). Game layer = pixel HUD, pixel heading font, hard 2/4px borders, pixel sprite companion (an original small airship). Body text stays a readable font.
- CONFIRMED: **Replace** the current FF9 storybook Fun mode. Drop the serif/script Google Fonts. Drop GSAP if CSS can do the job.
- Phase 3 still starts by restating this direction in 3 lines and waiting for OK (per brief).

### 5. Phase plan (adjusted)
Phase 1 — Content & architecture
- [x] Merge cv.js + translations.js into `src/data/content.json` (EN/ES keyed per field) — one source, both modes. `src/data/content.js` exports data, `t(field, lang)` and the flat `translations` dict for runtime `data-i18n` swap; SSR text comes from the same dict.
- [x] Rewrite copy specific/plain. Only verified numbers kept (5+ yrs, 57K+ users, 786K+ events, e-UADER 2,000+ users / 1,100+ certs). No TODO(verify) left. Skills: +PHPUnit, +Search API; no Solr/Behat.
- [x] (Closed in Phase 4: PDF now generated from the site.) `public/cv.pdf` still contained dropped claims (30%/40%/80%/25%, "1,100+ enrollments in first month", "Mid-Senior"). User must regenerate the PDF.
- [x] Tokens in global.css: type scale, spacing, radius, border, shadow, motion, layout (shared) + color per mode (pro dark default, pro light `data-scheme="light"`, fun). Existing components still use old visuals; Phase 2 switches them to the scales.
- [x] Mode toggle: B&W toggle removed (user, 2026-10-02). New pro light/dark toggle (`.nav__scheme`, key `rc-scheme`, follows `prefers-color-scheme` until user picks, set pre-paint in Layout, aria-pressed = dark, hidden in fun mode). `rc-theme` fun toggle unchanged. theme-color meta follows `--bg`.
- [x] Old uncommitted FF9 planet/crystal WIP in Hero.astro/global.css discarded (user: only the new work matters).
- [x] Root `CV Renzo Emiliano Carletti.pdf` removed (identical to public/cv.pdf).
- [x] `hero-three.js` deleted in Phase 2 with the old hero.
Phase 2 — Normal mode
- [x] Type: Newsreader (display serif, wght axis only, 58K) + Public Sans (text) + JetBrains Mono (labels/dates). Inter removed. Self-hosted, latin + latin-ext, display fonts preloaded. Body measure 68ch.
- [x] Palette: neutral base + one accent, Drupal blue `#0678BE` (buttons) with `#5aaee8` (dark) / `#0567a6` (light) for text links. No gradients, glass, aurora, noise, scroll progress bar, reveal animations, count-ups or typing carousel.
- [x] Layout: editorial 3/9 grid, numbered section labels sticky on the left, content on the right. Hero 8/4 with "quick facts" aside and verified numbers row.
- [x] Sections: Intro (role + one-line tagline + summary) / 01 Selected work (Problem, What I did, Result, stack, link; all visible, modal removed) / 02 Experience (period column, 3 lead bullets + "More from this role" details) / 03 Drupal, in practice / 04 Skills (grouped lists, no tag cloud) / 05 Education and courses (degrees, languages, cert table) / 06 Contact (links + form).
- [x] Drupal credibility block: 8 capabilities, each with where it was done (`content.json` → `drupal`). Only confirmed facts: no drupal.org contributions, Behat, Solr, Layout Builder or SDC claimed. Decoupled diagram + AI workflow note moved here (old Workflow cards and About section removed).
- [x] Micro-details: link underline hovers, 2px focus rings, print stylesheet (one column, hides nav/form, opens details, prints external URLs; ~7 A4 pages), CV download in nav/hero/contact/footer, light/dark kept, Esc closes mobile menu.
- [x] Icons: one inline SVG set in `src/components/Icon.astro` (24 grid, 1.75 stroke). Glyphs (×, ▍, ◐, $ whoami) removed.
- [x] Fixes: contact form placeholder text leaking as visible text; labels now use `for`/`id`. Footer moved out of `<main>`. Numbers formatted per locale (1.100+ in ES). Experience period translated ("Actualidad").
- [x] Removed: GSAP + `@fontsource-variable/inter` deps, `fun-fx.js`, `game-fx.js`, `reveal.js`, `hero-three.js`, About.astro, Workflow.astro. Certifications.astro renamed to Education.astro.
- [x] Fun mode is only a palette swap until Phase 3 (done in Phase 3).
- [x] Certification dates localized in Phase 4.
Phase 3 — Fun mode
- [x] Approach: same markup and content as normal mode, reskinned by `src/styles/fun.css` (all rules under `@media screen` and `:root[data-theme='fun']`). Fun-only elements use `.fun-only` (display:none in normal mode and print). No GSAP, no extra JS deps.
- [x] `astro.config.mjs`: `scopedStyleStrategy: 'where'` so theme overrides win over scoped component styles. Normal mode verified pixel-identical before/after (1440 and 390 full-page diff).
- [x] Pixel font: Jersey 10 (`@fontsource/jersey-10`, latin + latin-ext, one weight, fetched only when fun styles use it). Pixelify Sans tried and dropped: its "5" reads as "S", bad for the stats. Body text stays Public Sans; no serif in fun (`--font-display` → sans).
- [x] Sprites: original pixel art in `src/components/fun/sprites.js` (character grids), rendered by `PixelSprite.astro` as one crisp SVG (paths merged per color). Vivi (user's request, fan tribute drawn from scratch), airship, campfire. No image files, so nothing in `/public/assets/fun/`.
- [x] Hero = title screen (`fun/HeroScene.astro`): dusk sky gradient, five flat ridge layers with pines (Firewatch-style values, no outlines), sun, status + achievements windows, blinking "Press start". Vivi stands on the ridge: idle bob, blinking eyes, glowing staff; click/Enter casts Fire (sparks + "Fire!"/"¡Piro!" bubble).
- [x] Page-wide (`fun/FunLayer.astro`): fixed pixel starfield with twinkle layer; airship companion drifts down with scroll (only ≥1440px, where there is a free margin). HUD nav: pixel font, "LV 5" badge, FF-style menu cursor on the current section, segmented XP bar = scroll progress (`--scroll` set in scroll-ui.js).
- [x] Sections: 01 level select (river path, stage nodes, "Stage 1-n" mission cards, featured = gold frame) / 02 quest log window / 03 spellbook (gem markers, arch diagram window) / 04 star chart (planet + ring per group, pixel-star items; Skills now renders a list, normal mode unchanged) / 05 achievements (pixel trophies) / 06 save point (Vivi + campfire, form window). Pixel section dividers.
- [x] Fun strings in `content.json` (`fun.*`, EN/ES). Footer credit in fun mode: "Vivi is a fan tribute: Final Fantasy IX © Square Enix. All pixel art on this site is original."
- [x] Checked: no horizontal overflow at 320/390/1000/1440; reduced motion handled by the global rule.
Phase 2b — Normal mode polish (2026-10-04, user: "looks kinda simple"; chose polished editorial, no photo, use site screenshots)
- [x] Project screenshots: captured once from the live sites (1440×900, headless Chrome), stored as WebP in `src/assets/work/`, served by `<Picture>` as AVIF/WebP 480/800/1200w, lazy. ~75 KB AVIF on desktop. `image` id per project in `content.json`; alt text `work.N.shot` built in `content.js` (EN/ES).
- [x] Work: cards on `--surface` with a light browser frame (dots + hostname). Featured projects full width with a 2:1 crop and 3-column steps; the others 2-up. Hover: accent border, shadow, image scale 1.02. Print hides screenshots.
- [x] Section numbers: large italic Newsreader numerals in the accent color (fun keeps its pixel badge).
- [x] Hero: line-art echo of the fun mode ridges (shared data in `src/components/scene.js`, also used by `fun/HeroScene.astro`), "Open to remote work" pill, accent rule above each number. `.pro-only` helper hides normal-only decoration in fun mode.
- [x] Experience: timeline rail with a dot per role; current role (period ends "Present") gets an accent dot and a "Now" tag.
- [x] Drupal diagram: drop/atom glyphs on nodes, dashed connector, protocol chip.
- [x] Contact: full-width closing block, big serif "Have a Drupal site to upgrade?", large email link + copy button. `contact.text` replaced by `contact.headline` + `contact.sub`.
- [x] Micro: primary button lift, arrow nudge on outbound links.
- [x] Checked: normal dark/light 1440, ES 390, 320, 1000, fun 1440/390; no horizontal overflow.

Phase 4 — Polish & quality (2026-10-04)
- [x] GitHub link fixed (`github.com/renzo-carletti`; old `Pipoku` URL was 404). Git remote moved to the new repo URL.
- [x] Site address defaults to `https://renzo-carletti.github.io/personal-page/` (no custom domain). `robots.txt` generated (`src/pages/robots.txt.ts`); sitemap leaves out `/cv`, `/og`, 404.
- [x] CVs: edited Word files (EN from the user's Drupal-oriented CV with unverified metrics removed, ES a translation with the same layout) are the source: `public/renzo-carletti-cv{,-es}.docx` → `.pdf` via `npm run assets` (LibreOffice). PDF and Word downloads follow page language (`data-cv` in i18n.js). The generated `/cv/` sheet was dropped. Verified: no removed claims in either PDF.
- [x] New share card `/og/` → `public/og.png` (editorial dark, ridge line art). New favicon (ridge mark) + `apple-touch-icon.png`.
- [x] Fonts moved to `src/styles/fonts.js`; pre-paint theme script to `ThemeInit.astro` (shared by Layout and 404).
- [x] Certification dates stored as `YYYY-MM`, formatted per language (`formatMonth` in content.js).
- [x] 404 page: plain in normal mode, "Game over / Continue?" with Vivi in fun mode.
- [x] Skip link translated; `<title>` switches language through `data-i18n`; Vivi moved after the hero actions in tab order. Unused dictionary keys removed (`about.whoText`, `about.highlights`, `work.N.desc`; the fields stay in JSON, the CV uses `about`/`highlights`).
- [x] `references/` git-ignored. README rewritten (GitHub Pages first).
- [x] Quality: Lighthouse mobile 98/100/100/100, desktop 100/100/100/100 (normal mode). axe-core: 0 violations in normal light/dark and fun at 390 and 1440. Keyboard walk-through OK, no console errors.

Open questions for user (Phase 1+): verify stats (30%/40%/57K/786K/80%/25%), drupal.org contributions/talks?, PHPUnit/Behat/Search API/Solr experience?, keep EN/ES?


### 6. User answers (2026-10-02)
- Metrics: only **57,000+ active users** and **786,000+ events** are true and measured. Drop "30% faster load" and "40% lower infra cost" (invented, not measured). True claim without numbers: upgraded sites for speed and performance, and added features for the different user roles of each project.
- e-UADER (e.uader.edu.ar): **2,000+ registered users**, **1,100+ certificates issued** (true, current). Replaces "1,100+ enrollments in first month".
- **5+ years** experience: true.
- Drop "80% fewer manual tasks" and "25% less downtime" (not measured). True claim without numbers: added features that simplified the interfaces and workflows of each area using the projects, so staff finish common tasks faster.
- drupal.org: has an account, no recent contributions. Work is mostly local projects and legacy upgrades, little contrib use. Do not claim contributions.
- Testing/search: PHPUnit yes, Search API yes. Behat no. Solr no (do not claim).
- Keep bilingual EN/ES.
- Approved: delete `src/scripts/hero-three.js` and root `CV Renzo Emiliano Carletti.pdf` (Phase 1).

### Fun mode 2 — play (2026-10-04)
- [x] Chocobo (original sprite, 2 leg frames) next to Vivi: click → "Kweh!", runs a lap off screen and back.
- [x] Vivi casts in turn Fire / Thunder / Stop / Bio (ES: Piro / Electro / Paro / Bio): sparks, pixel bolt on the staff + soft sky flash, time stop (world greys out and pauses, clock ring), green poison bubbles. Blizzard removed at the user's request.
- [x] Outer Wilds touches: mini solar system in the star chart, quantum moon that moves to another section whenever it is out of view, marshmallow roasting at the campfire (raw / perfect / burnt), supernova timer in the footer (5 min loop, `?supernova=N` to test), Nomai spiral dividers and a Nomai wall to translate, Experience as a "Ship log" (cards, orange strips, rumor lines, "?" on the current role).
- [x] Treasure chest in Achievements → CV download in the page language. Stage nodes light up with "Clear!" as projects scroll in.
- [x] Secrets: 7 interactions unlock achievements (`src/scripts/fun-secrets.js`, `rc-secrets` in localStorage), HUD counter "★ Secrets n/7", toast announced via aria-live. Handlers in `src/scripts/fun-play.js`.
- [x] Checked: normal mode pixel-identical (1440/390), axe 0 violations, every new button keyboard-reachable, reduced motion skips flashes and the chocobo lap, no overflow 320–1440.
- [x] Follow-up: chocobo redrawn (outlined, swept-back crest, long beak, stride frame), supernova loop 5 min, HUD "★ Secrets" opens a list with hints for the missing ones, quantum moon bigger.
- [x] Follow-up 2 (2026-10-04): chocobo redrawn chibi-style from the user's new references (style only, not traced): dark outline, three-tone shading, spiky crest, hooked beak, browed eye, feathered wing. Supernova is now a sequence (sun swells and collapses, blue-white shockwave, white-out, black silence with campfire and "the loop restarts", eyes blink open); the achievement pops on waking. Fixed the secrets list showing on load.
