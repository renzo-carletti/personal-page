# PROGRESS

Single source of truth for the redesign. Phase 0 (audit) done on 2026-10-02. References were viewed once and summarized here; do not re-open them.

## Phases
- [x] Phase 0: Audit + Style Brief
- [x] Phase 1: Content & architecture (2026-10-02; open: user regenerates cv.pdf)
- [ ] Phase 2: Normal mode
- [ ] Phase 3: Fun mode
- [ ] Phase 4: Polish & quality

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
- Current site's Vivi-like elements (if any remain in Hero/fun mode) must be checked in Phase 3 for being original.

Clash + proposed unified direction (NEEDS CONFIRMATION before Phase 3):
- Brief asks pixel art; references contain zero pixel art (flat vector + ink illustration + 3D renders).
- CONFIRMED by user (2026-10-02): **Hybrid**. Scenes = flat layered silhouettes, no outlines, reference palette (Firewatch dusk at top of page → Outer Wilds night lower down). Game layer = pixel HUD, pixel heading font, hard 2/4px borders, pixel sprite companion (an original small airship). Body text stays a readable font.
- CONFIRMED: **Replace** the current FF9 storybook Fun mode. Drop the serif/script Google Fonts. Drop GSAP if CSS can do the job.
- Phase 3 still starts by restating this direction in 3 lines and waiting for OK (per brief).

### 5. Phase plan (adjusted)
Phase 1 — Content & architecture
- [x] Merge cv.js + translations.js into `src/data/content.json` (EN/ES keyed per field) — one source, both modes. `src/data/content.js` exports data, `t(field, lang)` and the flat `translations` dict for runtime `data-i18n` swap; SSR text comes from the same dict.
- [x] Rewrite copy specific/plain. Only verified numbers kept (5+ yrs, 57K+ users, 786K+ events, e-UADER 2,000+ users / 1,100+ certs). No TODO(verify) left. Skills: +PHPUnit, +Search API; no Solr/Behat.
- [ ] `public/cv.pdf` still contains dropped claims (30%/40%/80%/25%, "1,100+ enrollments in first month", "Mid-Senior"). User must regenerate the PDF.
- [x] Tokens in global.css: type scale, spacing, radius, border, shadow, motion, layout (shared) + color per mode (pro dark default, pro light `data-scheme="light"`, fun). Existing components still use old visuals; Phase 2 switches them to the scales.
- [x] Mode toggle: B&W toggle removed (user, 2026-10-02). New pro light/dark toggle (`.nav__scheme`, key `rc-scheme`, follows `prefers-color-scheme` until user picks, set pre-paint in Layout, aria-pressed = dark, hidden in fun mode). `rc-theme` fun toggle unchanged. theme-color meta follows `--bg`.
- [x] Old uncommitted FF9 planet/crystal WIP in Hero.astro/global.css discarded (user: only the new work matters).
- [x] Root `CV Renzo Emiliano Carletti.pdf` removed (identical to public/cv.pdf).
- [ ] `hero-three.js` is NOT dead: Hero.astro loads it with dynamic `import()` for the pro hero canvas. Phase 0 audit was wrong. Delete it in Phase 2 when the pro hero is rebuilt.
Phase 2 — Normal mode: as brief (Drupal blue accent, editorial grid, case studies, Drupal block, print CSS, SVG icons, remove glass/aurora/gradients).
Phase 3 — Fun mode: as brief, direction per confirmed decision; replace current FF9 storybook skin; drop GSAP if CSS suffices; assets in `/public/assets/fun/` (Astro serves from public; brief's `/assets/fun/`).
Phase 4 — Polish & quality: as brief; README rewrite (GitHub Pages first).

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
