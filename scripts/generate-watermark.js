// Generates assets/img/watermark.svg: a tileable pattern of assorted fruit
// silhouettes used as a subtle background watermark across the site.
const fs = require('fs');
const path = require('path');

const TILE = 520;
const GRID = 4; // GRID x GRID cells per tile
const CELL = TILE / GRID;

// Seeded PRNG (mulberry32) so the "random" layout is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

const FRUITS = {
  apple: () => `
    <circle cx="0" cy="3" r="16"/>
    <rect x="-1.6" y="-14" width="3.2" height="9" rx="1.6"/>
    <ellipse cx="6" cy="-13" rx="6" ry="3" transform="rotate(-30 6 -13)"/>`,
  strawberry: () => `
    <path d="M0,-4 C-15,-4 -15,11 0,21 C15,11 15,-4 0,-4 Z"/>
    <path d="M0,-4 L-8,-13 L0,-8 L8,-13 Z"/>
    <circle cx="-5" cy="6" r="1.1"/><circle cx="5" cy="6" r="1.1"/>
    <circle cx="0" cy="12" r="1.1"/><circle cx="-6" cy="14" r="1.1"/><circle cx="6" cy="14" r="1.1"/>`,
  pineapple: () => `
    <ellipse cx="0" cy="7" rx="13" ry="20"/>
    <path d="M0,-13 L-3,-28 L2,-15 Z" transform="rotate(-35 0 -13)"/>
    <path d="M0,-13 L-2,-30 L3,-15 Z" transform="rotate(-15 0 -13)"/>
    <path d="M0,-13 L-2,-31 L3,-16 Z"/>
    <path d="M0,-13 L2,-30 L-3,-15 Z" transform="rotate(15 0 -13)"/>
    <path d="M0,-13 L3,-28 L-2,-15 Z" transform="rotate(35 0 -13)"/>`,
  banana: () => `
    <path d="M-18,9 C-15,-13 13,-15 19,7 C12,4 -11,3 -18,9 Z"/>`,
  cherries: () => `
    <path d="M0,-15 C-2,-8 -4,-2 -7,3 M0,-15 C2,-6 5,0 7,5" fill="none" stroke-width="2.4"/>
    <circle cx="-7" cy="10" r="8"/>
    <circle cx="7" cy="12" r="8"/>
    <ellipse cx="2" cy="-16" rx="5" ry="2.6" transform="rotate(20 2 -16)"/>`,
  grapes: () => `
    <circle cx="0" cy="-9" r="5"/>
    <circle cx="-6" cy="-3" r="5"/><circle cx="6" cy="-3" r="5"/>
    <circle cx="-10" cy="4" r="5"/><circle cx="0" cy="5" r="5"/><circle cx="10" cy="4" r="5"/>
    <circle cx="-4" cy="12" r="5"/><circle cx="6" cy="13" r="5"/>
    <rect x="-1.4" y="-20" width="2.8" height="8" rx="1.4"/>
    <ellipse cx="5" cy="-19" rx="5" ry="2.6" transform="rotate(-25 5 -19)"/>`,
  pear: () => `
    <circle cx="0" cy="-4" r="9"/>
    <circle cx="0" cy="12" r="14"/>
    <rect x="-1.4" y="-19" width="2.8" height="7" rx="1.4"/>`,
  mango: () => `
    <ellipse cx="0" cy="0" rx="10" ry="18" transform="rotate(-25 0 0)"/>
    <rect x="-1.4" y="-19" width="2.8" height="6" rx="1.4" transform="rotate(-25 0 -16)"/>`,
  sandia: () => `
    <path d="M-17,9 Q0,-15 17,9 Q0,3 -17,9 Z"/>
    <circle cx="-5" cy="4" r="1.1"/><circle cx="5" cy="4" r="1.1"/><circle cx="0" cy="-2" r="1.1"/>`,
};
const FRUIT_NAMES = Object.keys(FRUITS);

let icons = '';
for (let row = 0; row < GRID; row++) {
  for (let col = 0; col < GRID; col++) {
    const cx = col * CELL + CELL / 2 + (rand() - 0.5) * CELL * 0.5;
    const cy = row * CELL + CELL / 2 + (rand() - 0.5) * CELL * 0.5;
    const rot = Math.floor(rand() * 360);
    const scale = (0.55 + rand() * 0.5).toFixed(2);
    const name = FRUIT_NAMES[Math.floor(rand() * FRUIT_NAMES.length)];
    icons += `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot}) scale(${scale})">${FRUITS[name]()}</g>\n`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">
<g fill="#241f18" fill-opacity="0.055" stroke="#241f18" stroke-opacity="0.055">
${icons}</g>
</svg>`;

const outPath = path.join(__dirname, '..', 'assets', 'img', 'watermark.svg');
fs.writeFileSync(outPath, svg);
console.log('Escrito ' + outPath + ' (' + FRUIT_NAMES.length + ' tipos de fruta, ' + GRID * GRID + ' instancias por tile)');
