import * as keyboard from "./keyboard";
import * as virtualPad from "./virtualPad";
import * as buzzer from "./buzzer";
import * as screen from "./screen";
import * as text from "./text";
import { iconPatternStrings } from "./pattern";

export const VIDEO_WIDTH = screen.size.x;
export const VIDEO_HEIGHT = screen.size.y;
export const TEXT_WIDTH = text.size.x;
export const TEXT_HEIGHT = text.size.y;
export const COLOR_BLACK = 0;
export const COLOR_BLUE = 1;
export const COLOR_RED = 2;
export const COLOR_PURPLE = 3;
export const COLOR_GREEN = 4;
export const COLOR_CYAN = 5;
export const COLOR_YELLOW = 6;
export const COLOR_WHITE = 7;
export const COLOR_COUNT = 8;
export const KEY_RIGHT = 0;
export const KEY_DOWN = 1;
export const KEY_LEFT = 2;
export const KEY_UP = 3;
export const KEY_X = 4;
export const KEY_Z = 5;
export const KEY_MUTE = 6;
export const KEY_COUNT = 7;
export const KEY_STATE_IS_PRESSED = 1;
export const KEY_STATE_IS_JUST_PRESSED = 2;
export const KEY_STATE_IS_JUST_RELEASED = 4;
export const BUZZER_COUNT = 1;
export const MUTE_COUNT = 1;
export const ADDRESS_VIDEO = 0;
export const ADDRESS_TEXT = VIDEO_WIDTH * VIDEO_HEIGHT;
export const ADDRESS_TEXT_COLOR = ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_TEXT_BACKGROUND =
  ADDRESS_TEXT_COLOR + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_KEY = ADDRESS_TEXT_BACKGROUND + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_BUZZER = ADDRESS_KEY + KEY_COUNT;
export const ADDRESS_MUTE = ADDRESS_BUZZER + BUZZER_COUNT;
export const ADDRESS_COUNT = ADDRESS_MUTE + MUTE_COUNT;

declare function setup();
declare function loop();

export function peek(address: number): number {
  if (address < 0 || address >= ADDRESS_COUNT) {
    throw `Invalid address: peek ${address}`;
  }
  return memory[address];
}

export function poke(address: number, value: number): void {
  if (address < 0 || address >= ADDRESS_COUNT) {
    throw `Invalid address: poke ${address}`;
  }
  memory[address] = value & 0xff;
}

window.addEventListener("load", onLoad);
(window as any).enableSplashScreen = false;

const memory: number[] = [];
let iconPattern: boolean[][][];
let splashScreenTicks = -1;

function onLoad() {
  for (let i = 0; i < ADDRESS_COUNT; i++) {
    memory.push(0);
  }
  for (
    let i = ADDRESS_TEXT_COLOR;
    i < ADDRESS_TEXT_COLOR + TEXT_WIDTH * TEXT_HEIGHT;
    i++
  ) {
    memory[i] = COLOR_WHITE;
  }
  keyboard.init();
  buzzer.init();
  initColors();
  text.init(COLOR_WHITE);
  iconPattern = text.setPattern(iconPatternStrings);
  initCanvas();
  if ((window as any).enableSplashScreen) {
    splashScreenTicks = 0;
  } else {
    setup();
  }
  requestAnimationFrame(updateFrame);
}

const targetFps = 68;
const deltaTime = 1000 / targetFps;
let nextFrameTime = 0;

function updateFrame() {
  requestAnimationFrame(updateFrame);
  const now = window.performance.now();
  if (now < nextFrameTime - targetFps / 12) {
    return;
  }
  nextFrameTime += deltaTime;
  if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
    nextFrameTime = now + deltaTime;
  }
  keyboard.update();
  virtualPad.update();
  updateKeyboardMemory();
  drawButtons();
  if (splashScreenTicks >= 0) {
    loopSplashScreen();
  } else {
    loop();
  }
  updateVideo();
  updateText();
  text.update();
  screen.draw();
  updateBuzzer();
}

const title = "PEEKPOKE";
const splashScreenBuzzerSequence = [
  [100, 80],
  [0, 85],
  [200, 88],
  [0, 93],
  [0, 9999],
];
let splashScreenBuzzerSequenceIndex = 0;

function loopSplashScreen() {
  if (
    splashScreenTicks ===
    splashScreenBuzzerSequence[splashScreenBuzzerSequenceIndex][1]
  ) {
    memory[ADDRESS_BUZZER] =
      splashScreenBuzzerSequence[splashScreenBuzzerSequenceIndex][0];
    splashScreenBuzzerSequenceIndex++;
  }
  if (splashScreenTicks < 80) {
    const sequence = Math.floor(splashScreenTicks / 40);
    for (let i = 0; i < 3; i++) {
      const tx = Math.floor(Math.random() * TEXT_WIDTH);
      const ty = Math.floor(Math.random() * TEXT_HEIGHT);
      let v;
      if (sequence === 0) {
        const n = Math.floor(Math.random() * 16);
        v = n < 10 ? "0".charCodeAt(0) + n : "A".charCodeAt(0) + (n - 10);
      } else {
        v = ty === 2 ? title.charCodeAt(tx) : 0;
      }
      pokeSplashScreenVideo(tx, ty, v, v);
    }
  } else if (splashScreenTicks === 80) {
    for (let tx = 0; tx < TEXT_WIDTH; tx++) {
      for (let ty = 0; ty < TEXT_HEIGHT; ty++) {
        const v = ty === 2 ? title.charCodeAt(tx) : 0;
        pokeSplashScreenVideo(tx, ty, v, 0);
      }
    }
  } else if (splashScreenTicks === 160) {
    splashScreenTicks = -1;
    for (
      let i = ADDRESS_VIDEO;
      i < ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT;
      i++
    ) {
      memory[i] = 0;
    }
    setup();
    return;
  }
  splashScreenTicks++;
}

function pokeSplashScreenVideo(x: number, y: number, tv: number, vv: number) {
  memory[ADDRESS_TEXT + x + y * TEXT_WIDTH] = tv;
  for (let sx = 0; sx < VIDEO_WIDTH / TEXT_WIDTH; sx++) {
    const vx = x + sx * TEXT_WIDTH;
    for (let sy = 0; sy < VIDEO_HEIGHT / TEXT_HEIGHT; sy++) {
      const vy = y + sy * TEXT_HEIGHT;
      memory[ADDRESS_VIDEO + vx + vy * VIDEO_WIDTH] = vv;
    }
  }
}

const keyCodes = [
  ["ArrowRight", "KeyD"],
  ["ArrowDown", "KeyS"],
  ["ArrowLeft", "KeyA"],
  ["ArrowUp", "KeyW"],
  ["KeyX", "Slash", "Space"],
  ["KeyZ", "Period"],
  ["KeyM"],
];
function updateKeyboardMemory() {
  for (let i = 0; i < KEY_COUNT; i++) {
    let k = 0;
    keyCodes[i].forEach((c) => {
      if (keyboard.codeState[c].isPressed) {
        k |= KEY_STATE_IS_PRESSED;
      }
      if (keyboard.codeState[c].isJustPressed) {
        k |= KEY_STATE_IS_JUST_PRESSED;
      }
      if (keyboard.codeState[c].isJustReleased) {
        k |= KEY_STATE_IS_JUST_RELEASED;
      }
    });
    if (virtualPad.buttons[i].isPressed) {
      k |= KEY_STATE_IS_PRESSED;
    }
    if (virtualPad.buttons[i].isJustPressed) {
      k |= KEY_STATE_IS_JUST_PRESSED;
    }
    if (virtualPad.buttons[i].isJustReleased) {
      k |= KEY_STATE_IS_JUST_RELEASED;
    }
    memory[ADDRESS_KEY + i] = k;
    virtualPad.buttons[i].isShowingPressed = (k & KEY_STATE_IS_PRESSED) > 0;
  }
  if ((memory[ADDRESS_KEY + KEY_MUTE] & KEY_STATE_IS_JUST_PRESSED) > 0) {
    memory[ADDRESS_MUTE] = memory[ADDRESS_MUTE] === 0 ? 1 : 0;
    drawBuzzerIcon();
  }
}

function updateVideo() {
  let x = 0;
  let y = 0;
  for (
    let i = ADDRESS_VIDEO;
    i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT;
    i++
  ) {
    screen.pixels[x][y] = memory[i] % COLOR_COUNT;
    x++;
    if (x >= VIDEO_WIDTH) {
      x = 0;
      y++;
    }
  }
}

function updateText() {
  let x = 0;
  let y = 0;
  for (let i = 0; i < TEXT_WIDTH * TEXT_HEIGHT; i++) {
    const tg = text.grid[x][y];
    tg.code = memory[ADDRESS_TEXT + i];
    tg.color = memory[ADDRESS_TEXT_COLOR + i] % COLOR_COUNT;
    tg.background = memory[ADDRESS_TEXT_BACKGROUND + i] % COLOR_COUNT;
    x++;
    if (x >= TEXT_WIDTH) {
      x = 0;
      y++;
    }
  }
}

function updateBuzzer() {
  if (memory[ADDRESS_BUZZER] > 0 && memory[ADDRESS_MUTE] === 0) {
    buzzer.beepOn(memory[ADDRESS_BUZZER] * 10);
  } else {
    buzzer.beepOff();
  }
}

const canvasWidth = 48;
const canvasHeight = 80;
let canvas: HTMLCanvasElement;
let canvasContext: CanvasRenderingContext2D;

function initCanvas() {
  const _bodyBackground = "#111";
  const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
  const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
background: ${colorStyles[COLOR_CYAN]};
`;
  const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  document.body.style.cssText = bodyCss;
  canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvasContext = canvas.getContext("2d");
  canvasContext.imageSmoothingEnabled = false;
  canvas.style.cssText = canvasCss + crispCss;
  const screenCanvasX = Math.floor((canvasWidth - VIDEO_WIDTH) / 2);
  const screenCanvasY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 2);
  const videoBezelX = Math.floor((canvasWidth - VIDEO_WIDTH) / 4);
  const videoBezelY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 5);
  canvasContext.fillStyle = colorStyles[COLOR_YELLOW];
  canvasContext.fillRect(
    screenCanvasX - videoBezelX,
    screenCanvasY - videoBezelY,
    VIDEO_WIDTH + videoBezelX * 2,
    VIDEO_HEIGHT + videoBezelY * 2
  );
  canvasContext.fillStyle = colorStyles[COLOR_BLACK];
  canvasContext.fillRect(
    screenCanvasX,
    screenCanvasY,
    VIDEO_WIDTH,
    VIDEO_HEIGHT
  );
  screen.init(canvasContext, colorStyles, screenCanvasX, screenCanvasY);
  initButtons();
  canvasContext.fillStyle = colorStyles[COLOR_BLUE];
  drawText(
    text.pattern["X".charCodeAt(0) - 33],
    Math.floor(canvasWidth * 0.87),
    Math.floor(canvasHeight * 0.8)
  );
  drawText(
    text.pattern["Z".charCodeAt(0) - 33],
    Math.floor(canvasWidth * 0.65),
    Math.floor(canvasHeight * 0.9)
  );
  drawBuzzerIcon();
  const setSize = () => {
    const cs = 0.95;
    const wr = innerWidth / innerHeight;
    const cr = canvasWidth / canvasHeight;
    const flgWh = wr < cr;
    const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
    const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
  };
  window.addEventListener("resize", setSize);
  setSize();
  document.body.appendChild(canvas);
}

function initButtons() {
  const size = Math.floor(canvasWidth * 0.15);
  const arrowButtonX = Math.floor(canvasWidth * 0.3);
  const arrowButtonY = Math.floor(canvasHeight * 0.7);
  const buttonPositions = [
    {
      x: arrowButtonX + Math.floor(size * 1.2),
      y: arrowButtonY,
      size,
    },
    {
      x: arrowButtonX,
      y: arrowButtonY + Math.floor(size * 1.2),
      size,
    },
    {
      x: arrowButtonX - Math.floor(size * 1.2),
      y: arrowButtonY,
      size,
    },
    {
      x: arrowButtonX,
      y: arrowButtonY - Math.floor(size * 1.2),
      size,
    },
    {
      x: Math.floor(canvasWidth * 0.9),
      y: Math.floor(canvasHeight * 0.75),
      size,
    },
    {
      x: Math.floor(canvasWidth * 0.7),
      y: Math.floor(canvasHeight * 0.85),
      size,
    },
    {
      x: Math.floor(canvasWidth * 0.75),
      y: Math.floor(canvasHeight * 0.55),
      size: Math.floor(size * 0.66),
    },
  ];
  virtualPad.init(canvas, { x: canvasWidth, y: canvasHeight }, buttonPositions);
  drawButtons();
}

function drawButtons() {
  virtualPad.buttons.forEach((b) => {
    canvasContext.fillStyle =
      colorStyles[b.isShowingPressed ? COLOR_BLUE : COLOR_BLACK];
    const x = Math.floor(b.x - b.size / 2);
    const y = Math.floor(b.y - b.size / 2);
    canvasContext.fillRect(x, y, b.size, b.size);
    if (!b.isShowingPressed) {
      canvasContext.fillStyle = colorStyles[COLOR_WHITE];
      canvasContext.fillRect(x + 1, y + 1, 2, 1);
      canvasContext.fillRect(x + 1, y + 2, 1, 1);
    }
  });
}

function drawText(pattern: boolean[][], ox: number, oy: number) {
  for (let x = 0; x < text.letterSize.x; x++) {
    for (let y = 0; y < text.letterSize.y; y++) {
      if (pattern[y][x]) {
        canvasContext.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}

function drawBuzzerIcon() {
  canvasContext.fillStyle =
    colorStyles[memory[ADDRESS_MUTE] === 0 ? COLOR_RED : COLOR_BLACK];
  drawText(
    iconPattern[0],
    Math.floor(canvasWidth * 0.85),
    Math.floor(canvasHeight * 0.53)
  );
}

let colorStyles: string[];

function initColors() {
  const rgbNumbers = [
    0x222222, 0x3f51b5, 0xe91e63, 0x9c27b0, 0x4caf50, 0x03a9f4, 0xffc107,
    0xeeeeee,
  ];
  colorStyles = [];
  for (let i = COLOR_BLACK; i <= COLOR_WHITE; i++) {
    const n = rgbNumbers[i];
    const r = (n & 0xff0000) >> 16;
    const g = (n & 0xff00) >> 8;
    const b = n & 0xff;
    colorStyles.push(`rgb(${r},${g},${b})`);
  }
}
