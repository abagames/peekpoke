export const size = { x: 32, y: 30 };
export const pixels: number[][] = [];
export const textPixels: number[][] = [];
const prevPixels: number[][] = [];
let canvasContext;
let colorStyles;
let screenCanvasX;
let screenCanvasY;

export function init(
  _canvasContext,
  _colorStyles,
  _screenCanvasX,
  _screenCanvasY
) {
  canvasContext = _canvasContext;
  colorStyles = _colorStyles;
  screenCanvasX = _screenCanvasX;
  screenCanvasY = _screenCanvasY;
  for (let x = 0; x < size.x; x++) {
    const l = [];
    const tl = [];
    const pl = [];
    for (let y = 0; y < size.y; y++) {
      l.push(0);
      tl.push(0);
      pl.push(0);
    }
    pixels.push(l);
    textPixels.push(tl);
    prevPixels.push(pl);
  }
}

export function draw() {
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      const p = textPixels[x][y] === 0 ? pixels[x][y] : textPixels[x][y];
      if (prevPixels[x][y] !== p) {
        canvasContext.fillStyle = colorStyles[p % COLOR_COUNT];
        canvasContext.fillRect(x + screenCanvasX, y + screenCanvasY, 1, 1);
        prevPixels[x][y] = p;
      }
    }
  }
}
