// Self-hosted font faces, shared by the site layout and the CV / share-image pages.
// Jersey 10 (fun mode) is only fetched when a fun style uses it.
import newsLatin from '@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url';
import newsLatinExt from '@fontsource-variable/newsreader/files/newsreader-latin-ext-wght-normal.woff2?url';
import publicLatin from '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2?url';
import publicLatinExt from '@fontsource-variable/public-sans/files/public-sans-latin-ext-wght-normal.woff2?url';
import jbLatin from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
import jbLatinExt from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2?url';
import pixLatin from '@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2?url';
import pixLatinExt from '@fontsource/jersey-10/files/jersey-10-latin-ext-400-normal.woff2?url';

export { newsLatin, publicLatin };

export const fontCss = `
@font-face {
  font-family: 'Newsreader Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url('${newsLatin}') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Newsreader Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url('${newsLatinExt}') format('woff2-variations');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Public Sans Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('${publicLatin}') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Public Sans Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('${publicLatinExt}') format('woff2-variations');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'JetBrains Mono Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 800;
  src: url('${jbLatin}') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 800;
  src: url('${jbLatinExt}') format('woff2-variations');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Jersey 10';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url('${pixLatin}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Jersey 10';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url('${pixLatinExt}') format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
`;
