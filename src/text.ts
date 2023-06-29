import { textPatterns } from "./textPattern";
import * as screen from "./screen";

export const size = { x: 8, y: 5 };
export type Cell = { code: number; color: number; background: number };
export const grid: Cell[][] = [];
const prevGrid: Cell[][] = [];
const pattern: boolean[][][] = [];
const letterSize = { x: 3, y: 5 };

export function init(defaultColor: number) {
  textPatterns.forEach((tp) => {
    const p = [];
    const ls = tp.split("\n");
    for (let y = 1; y <= letterSize.y; y++) {
      const l = ls[y];
      const lp = [];
      for (let x = 0; x < letterSize.x; x++) {
        lp.push(!(x >= l.length) && l.charAt(x) !== " ");
      }
      p.push(lp);
    }
    pattern.push(p);
  });
  for (let x = 0; x < size.x; x++) {
    const l = [];
    const pl = [];
    for (let y = 0; y < size.y; y++) {
      l.push({ code: 0, color: defaultColor, background: 0 });
      pl.push({ code: 0, color: defaultColor, background: 0 });
    }
    grid.push(l);
    prevGrid.push(pl);
  }
}

export function update() {
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      const g = grid[x][y];
      const pg = prevGrid[x][y];
      if (
        pg.code !== g.code ||
        pg.color !== g.color ||
        pg.background !== g.background
      ) {
        drawPattern(x, y, g);
        pg.code = g.code;
        pg.color = g.color;
        pg.background = g.background;
      }
    }
  }
}

function drawPattern(x: number, y: number, c: Cell) {
  const ox = 1 + x * (letterSize.x + 1);
  const oy = 1 + y * (letterSize.y + 1);
  for (let x = -1; x < letterSize.x; x++) {
    for (let y = -1; y < letterSize.y; y++) {
      screen.textPixels[ox + x][oy + y] = c.background;
    }
  }
  if (c.code >= 33 && c.code <= 126) {
    const p = pattern[c.code - 33];
    for (let x = 0; x < letterSize.x; x++) {
      for (let y = 0; y < letterSize.y; y++) {
        if (p[y][x]) {
          screen.textPixels[ox + x][oy + y] = c.color;
        }
      }
    }
  }
}
