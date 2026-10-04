// Original pixel art for fun mode. One character per pixel, '.' is transparent.
// Palette entries are a fill color, or { fill, cls } to put that color in its own class (for animation).

// Black mage tribute (Vivi, Final Fantasy IX). Drawn from scratch for this site, not a ripped sprite.
export const vivi = {
  rows: [
    '.........hhh',
    '........hHHHh',
    '.........hhHHh',
    '...........hHHh',
    '..........hHHHh',
    '.........hHHHHh',
    '........hHHHHHHh',
    '........hHHHHHHh',
    '.......hHHHHHHHHh.....oo',
    '.......ddddddddddd....oo',
    '...hhhHHHHHHHHHHHHHhh..w',
    '..hHHHHHHHHHHHHHHHHHHh.w',
    '...hhhhKKKKKKKKKKhhhh..w',
    '.......KKKKKKKKKKK.....w',
    '.......KKYYKKKYYKK.....w',
    '.......KKYYKKKYYKK.....w',
    '.......KKKKKKKKKKK.....w',
    '........KKKKKKKKK......w',
    '......cBBBCCCCCBBBc....w',
    '.....bBBBBBCCCBBBBBb...w',
    '....WbBBBBBBBBBBBBBbWWWw',
    '....WWbBBBBBBBBBBBbWWWWw',
    '......bBBBBBBBBBBBb....w',
    '......bBBBBBBBBBBBBb...w',
    '.....bbbbbbbbbbbbbbbb..w',
    '.......PPPP...PPPP.....w',
    '.......PpPP...PPpP.....w',
    '.......PPPP...PPPP.....w',
    '......OOOOO...OOOOO....w',
    '......OOOOO...OOOOO....w',
  ],
  palette: {
    H: '#b8945a',
    h: '#7d5d33',
    d: '#5c4224',
    K: '#120c18',
    Y: { fill: '#ffd23a', cls: 'sprite-eyes' },
    B: '#3b5fb0',
    b: '#243c7c',
    C: '#6b8fd8',
    c: '#243c7c',
    W: '#f3e6cc',
    P: '#9a8257',
    p: '#6e5a39',
    O: '#5a3a22',
    w: '#8b5a2b',
    o: { fill: '#e8641e', cls: 'sprite-orb' },
  },
};

// Small airship: striped balloon, wooden gondola, pennant. Original design.
export const airship = {
  rows: [
    '.........aaaaaaaaaa',
    '......aaAAAAAAAAAAaa',
    '....aaAAAAAAAAAAAAAAaa',
    '...aAAAAAAAAAAAAAAAAAAa',
    '..arrrrrrrrrrrrrrrrrrrra.f',
    '..aAAAAAAAAAAAAAAAAAAAAa.fF',
    '..arrrrrrrrrrrrrrrrrrrra.fFF',
    '...aAAAAAAAAAAAAAAAAAAa..f',
    '....aaAAAAAAAAAAAAAAaa...f',
    '......aaaaaaaaaaaaaa.....f',
    '.......l..l....l..l......f',
    '........l.l....l.l.......f',
    '....g....lHHHHHHl........f',
    '....gg.HHHHHHHHHHHHHH...ff',
    '.....pHHyHHyHHyHHyHHHHHHf',
    '......hhhhhhhhhhhhhhhhhh',
    '........hhhhhhhhhhhhhh',
  ],
  palette: {
    a: '#c9772e',
    A: '#e9806e',
    r: '#f3e6cc',
    l: '#3a2a1f',
    H: '#8b5a2b',
    h: '#5a3a22',
    y: { fill: '#fdb813', cls: 'sprite-lamps' },
    f: '#3a2a1f',
    F: '#e8641e',
    g: { fill: '#b9bcc8', cls: 'sprite-prop' },
    p: '#3a2a1f',
  },
};

// Campfire with two flame frames swapped by CSS.
export const campfire = {
  rows: [
    '.....1......',
    '....12.2....',
    '...1221.2...',
    '...12321....',
    '..1233321...',
    '..12333321..',
    '...123321...',
    '.LLL1221LLL.',
    'LLLLLLLLLLLL',
    '.ll.LLLL.ll.',
  ],
  palette: {
    1: { fill: '#e8641e', cls: 'sprite-flame' },
    2: { fill: '#fdb813', cls: 'sprite-flame' },
    3: { fill: '#fff4d6', cls: 'sprite-flame' },
    L: '#8b5a2b',
    l: '#5a3a22',
  },
};

// Chocobo tribute (FF9), drawn from scratch: swept-back crest, long beak, outlined body.
// Two frames share the body: standing legs and a running stride.
const chocoBody = [
    '..............oooo',
    '.....ooo....ooYYYYoo',
    '...ooTTTo..oYYYYYYYYo',
    '.ooTTTTTToooYYYYYYYYYo',
    '..oooTTTTTYYYYYYYYYYYYo',
    '.....ooTTYYYYYYYKKYYYYo',
    '...ooTTTTYYYYYYKWKKYYYoooo',
    '.ooTTTTooYYYYYYKKKKYYBBBBBBo',
    '..ooooo..oYYYYYYKKYYYBBBBBBBBo',
    '..........oYYYYYYYYYYbbbbbbbo',
    '...........oYYYYYYYYYobbbbbo',
    '............oYYYYYYYYo.ooooo',
    '............oYYYYYYYo',
    '............oYYYYYYYo',
    '...........oYYYYYYYYo',
    '...........oYYYYYYYYYo',
    '..oo.......oYYYYYYYYYYo',
    '.oTTo.....oYYYYYYYYYYYYo',
    'oTTTTo...oYYYYYYYYYYYYYYo',
    '.oTTTTo.oYYYYYYYYYYYYYYYYo',
    'oTTTTTToYYYYYwwwwYYYYYYYYYo',
    '.ooTTTTYYYYwwwwwwwYYYYYYYYo',
    '...oTTYYYYwwwvwvwwwYYYYYYYo',
    '....oYYYYYYwwvwvwwYYYYYYYYo',
    '....oYYYYYYYwwwwwYYYYYYYYo',
    '.....oYYYYYYYYYYYYYYYYYYo',
    '......oYTYTYYYYYYYYTYTYo',
    '.......oTYTYToooooTYTYTo',
    '........oooooo...oooooo',
];
const chocoPalette = {
  o: '#7a4e12',
  Y: '#f7c948',
  T: '#ffe27a',
  K: '#1a1020',
  W: '#ffffff',
  B: '#f2a65a',
  b: '#c9773a',
  w: '#e2a52a',
  v: '#c8921c',
  A: '#e8a03a',
  a: '#b8722a',
};
export const chocobo = {
  rows: [
    ...chocoBody,
    '..........oAAo....oAAo',
    '..........oAAo....oAAo',
    '..........oAao....oAao',
    '..........oAao....oAao',
    '..........oAao....oAao',
    '.........oAAao...oAAao',
    '........oAAAAAo.oAAAAAo',
    '.......oAAooAAo.oAAooAAo',
    '.......ooo..ooo.ooo..ooo',
  ],
  palette: chocoPalette,
};
export const chocoRun = {
  rows: [
    ...chocoBody,
    '.........oAAo......oAAo',
    '........oAAo........oAAo',
    '.......oAAo..........oAAo',
    '......oAao............oAao',
    '.....oAao..............oAo',
    '....oAAo...............oAAo',
    '...oAAAAo.............oAAAAo',
    '..oAAooAo.............oAooAAo',
    '..ooo..oo.............oo..ooo',
  ],
  palette: chocoPalette,
};

// Treasure chest, closed and open.
export const chestClosed = {
  rows: [
    '.LLLLLLLLLL.',
    'LGGGGGGGGGGL',
    'LggggggggggL',
    'LLLLLYYLLLLL',
    'LBBBBYYBBBBL',
    'LBBBBBBBBBBL',
    'LbbbbbbbbbbL',
    'LLLLLLLLLLLL',
  ],
  palette: { L: '#3a2a1f', G: '#c9772e', g: '#8b5a2b', Y: '#fdb813', B: '#8b5a2b', b: '#5a3a22' },
};

export const chestOpen = {
  rows: [
    '.LLLLLLLLLL.',
    'LggggggggggL',
    'LGGGGGGGGGGL',
    '.LLLLLLLLLL.',
    'L**********L',
    'LBBBBYYBBBBL',
    'LBBBBBBBBBBL',
    'LbbbbbbbbbbL',
    'LLLLLLLLLLLL',
  ],
  palette: { L: '#3a2a1f', G: '#c9772e', g: '#8b5a2b', Y: '#fdb813', B: '#8b5a2b', b: '#5a3a22', '*': { fill: '#fff4d6', cls: 'sprite-glow' } },
};

// Marshmallow on a stick (Outer Wilds tribute). The mallow color is animated by CSS.
export const mallowStick = {
  rows: [
    '..........mm',
    '.........mmmm',
    '.........mmmm',
    '..........mm',
    '.........s',
    '........s',
    '.......s',
    '......s',
    '.....s',
    '....s',
    '...s',
    '..s',
  ],
  palette: { m: { fill: '#fff4d6', cls: 'sprite-mallow' }, s: '#8b5a2b' },
};

export const moon = {
  rows: ['..mmmm..', '.mMMMMm.', 'mMMcMMMm', 'mMMMMcMm', 'mMcMMMMm', 'mMMMMMMm', '.mMMcMm.', '..mmmm..'],
  palette: { m: '#7f8291', M: '#b9bcc8', c: '#8f93a3' },
};

const planet = (a, A, b) => ({
  rows: ['..aaa..', '.aAAAa.', 'aAAbAAa', 'aAAAAba', 'aAbAAAa', '.aAAAa.', '..aaa..'],
  palette: { a, A, b },
});
export const planets = {
  forest: planet('#2f6b47', '#3e8e41', '#a8c66c'),
  sand: planet('#c9772e', '#e0a63a', '#f3e6cc'),
  rock: planet('#5a3a22', '#8e2b1a', '#e8641e'),
  gas: planet('#2e4a7a', '#4c8c8a', '#8cc7d9'),
};

export const sun = {
  rows: [
    '....sss....',
    '..sSSSSSs..',
    '.sSSOOOSSs.',
    '.sSOOOOOSs.',
    'sSOOOOOOOSs',
    'sSOOOOOOOSs',
    'sSOOOOOOOSs',
    '.sSOOOOOSs.',
    '.sSSOOOSSs.',
    '..sSSSSSs..',
    '....sss....',
  ],
  palette: { s: '#e8641e', S: '#fdb813', O: '#fff4d6' },
};

export const bolt = {
  rows: ['....WW', '...WW', '..WW', '.WWWWW', '...WW', '..WW', '.WW', 'WWWWW', '..WW', '.WW', 'WW'],
  palette: { W: '#fff4d6' },
};
