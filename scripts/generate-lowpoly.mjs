// Generates public/patterns/lowpoly.svg: a seamlessly tiling field of jittered
// triangles in sunny yellows. Run with `node scripts/generate-lowpoly.mjs`.
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 880;
const COLS = 10;
const ROWS = 8;
const PALETTE = ["#ffd43b", "#ffcf2e", "#ffda4f", "#ffc824", "#ffe066", "#ffd640", "#ffcb33", "#ffdd5a"];

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// Jitter is defined per wrapped grid index, so opposite edges of the tile line up.
const jitter = Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => [rand() - 0.5, rand() - 0.5]));
const cw = W / COLS;
const ch = H / ROWS;
const point = (i, j) => {
  const [jx, jy] = jitter[((i % COLS) + COLS) % COLS][((j % ROWS) + ROWS) % ROWS];
  return [+(i * cw + jx * cw * 0.7).toFixed(1), +(j * ch + jy * ch * 0.7).toFixed(1)];
};

// Colours are also keyed by wrapped cell index so triangles that straddle the tile
// edge get the same colour on both sides of the seam.
const colors = Array.from({ length: COLS }, () =>
  Array.from({ length: ROWS }, () => [0, 1].map(() => PALETTE[Math.floor(rand() * PALETTE.length)])),
);
const wrap = (n, m) => ((n % m) + m) % m;

const polys = [];
for (let i = -1; i <= COLS; i++) {
  for (let j = -1; j <= ROWS; j++) {
    const a = point(i, j);
    const b = point(i + 1, j);
    const c = point(i, j + 1);
    const d = point(i + 1, j + 1);
    // COLS and ROWS are even, so the flip pattern is periodic too.
    const flip = wrap(i, 2) ^ wrap(j, 2);
    const tris = flip ? [[a, b, d], [a, d, c]] : [[a, b, c], [b, d, c]];
    for (const [k, t] of tris.entries()) {
      const color = colors[wrap(i, COLS)][wrap(j, ROWS)][k];
      polys.push(`<polygon points="${t.map((p) => p.join(",")).join(" ")}" fill="${color}" stroke="${color}" stroke-width="1"/>`);
    }
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${polys.join("")}</svg>\n`;
writeFileSync("public/patterns/lowpoly.svg", svg);
console.log(`wrote public/patterns/lowpoly.svg (${polys.length} triangles, ${(svg.length / 1024).toFixed(1)} KB)`);
