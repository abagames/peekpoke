import * as keyboard from "./keyboard";
import * as virtualPad from "./virtualPad";
import * as buzzer from "./buzzer";

export let memory: number[];
export let canvas: HTMLCanvasElement;
export let canvasContext: CanvasRenderingContext2D;
export let audioContext: AudioContext;

export const VIDEO_WIDTH = 32;
export const VIDEO_HEIGHT = 32;
export const TEXT_WIDTH = 8;
export const TEXT_HEIGHT = 5;
export const COLOR_BLACK = 0;
export const COLOR_BLUE = 1;
export const COLOR_RED = 2;
export const COLOR_PURPLE = 3;
export const COLOR_GREEN = 4;
export const COLOR_CYAN = 5;
export const COLOR_YELLOW = 6;
export const COLOR_WHITE = 7;
export const COLOR_TRANSPARENT = 8;
export const KEY_RIGHT = 0;
export const KEY_DOWN = 1;
export const KEY_LEFT = 2;
export const KEY_UP = 3;
export const KEY_X = 4;
export const KEY_Z = 5;
export const KEY_COUNT = 6;
export const KEY_STATE_IS_PRESSED = 1;
export const KEY_STATE_IS_JUST_PRESSED = 2;
export const KEY_STATE_IS_JUST_RELEASED = 4;
export const BUZZER_FREQUENCY_MIN = buzzer.BUZZER_FREQUENCY_MIN;
export const BUZZER_FREQUENCY_MAX = buzzer.BUZZER_FREQUENCY_MAX;
export const BUZZER_COUNT = 1;
export const ADDRESS_VIDEO = 0;
export const ADDRESS_TEXT = VIDEO_WIDTH * VIDEO_HEIGHT;
export const ADDRESS_TEXT_COLOR = ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_TEXT_BACKGROUND =
  ADDRESS_TEXT_COLOR + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_KEY = ADDRESS_TEXT_BACKGROUND + TEXT_WIDTH * TEXT_HEIGHT;
export const ADDRESS_BUZZER = ADDRESS_KEY + KEY_COUNT;
export const ADDRESS_COUNT = ADDRESS_BUZZER + BUZZER_COUNT;

const canvasWidth = 48;
const canvasHeight = 80;
const videoX = Math.floor((canvasWidth - VIDEO_WIDTH) / 2);
const videoY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 2);
const videoBezelX = Math.floor((canvasWidth - VIDEO_WIDTH) / 4);
const videoBezelY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 6);
const buttonWidth = Math.floor(canvasWidth * 0.15);
const buttonPressedWidth = Math.floor(canvasWidth * 0.3);
const arrowButtonX = Math.floor(canvasWidth * 0.3);
const arrowButtonY = Math.floor(canvasHeight * 0.7);

declare function setup();
declare function loop();

export function poke(address: number, value: number): void {
  if (address < 0 || address >= ADDRESS_COUNT) {
    throw `Invalid address: poke ${address}`;
  }
  memory[address] = value;
}

export function peek(address: number): number {
  if (address < 0 || address >= ADDRESS_COUNT) {
    throw `Invalid address: peek ${address}`;
  }
  return memory[address];
}

window.addEventListener("load", onLoad);

function onLoad() {
  memory = [];
  for (let i = 0; i < ADDRESS_COUNT; i++) {
    memory.push(0);
  }
  keyboard.init();
  buzzer.init();
  audioContext = buzzer.audioContext;
  initColors();
  initCanvas();
  setup();
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
  loop();
  updateVideo();
  updateBuzzer();
}

const keyCodes = [
  ["ArrowRight", "KeyD"],
  ["ArrowDown", "KeyS"],
  ["ArrowLeft", "KeyA"],
  ["ArrowUp", "KeyW"],
  ["KeyX", "Slash", "Space"],
  ["KeyZ", "Period"],
];
function updateKeyboardMemory() {
  for (let i = 0; i < 6; i++) {
    let k = 0;
    keyCodes[i].forEach((c) => {
      if (keyboard.code[c].isPressed) {
        k |= KEY_STATE_IS_PRESSED;
      }
      if (keyboard.code[c].isJustPressed) {
        k |= KEY_STATE_IS_JUST_PRESSED;
      }
      if (keyboard.code[c].isJustReleased) {
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
}

function updateVideo() {
  canvasContext.fillStyle = colorStyles[COLOR_BLACK];
  canvasContext.fillRect(videoX, videoY, VIDEO_WIDTH, VIDEO_HEIGHT);
  let x = 0;
  let y = 0;
  for (
    let i = ADDRESS_VIDEO;
    i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT;
    i++
  ) {
    let m = memory[i] | 0;
    m = ((m % 8) + 8) % 8;
    if (m > 0) {
      canvasContext.fillStyle = colorStyles[m];
      canvasContext.fillRect(x + videoX, y + videoY, 1, 1);
    }
    x++;
    if (x >= VIDEO_WIDTH) {
      x = 0;
      y++;
    }
  }
}

function updateBuzzer() {
  if (memory[ADDRESS_BUZZER] > 0) {
    buzzer.beepOn(memory[ADDRESS_BUZZER]);
  } else {
    buzzer.beepOff();
  }
}

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
background: ${colorStyles[COLOR_YELLOW]};
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
  canvasContext.fillStyle = colorStyles[COLOR_WHITE];
  canvasContext.fillRect(
    videoX - videoBezelX,
    videoY - videoBezelY,
    VIDEO_WIDTH + videoBezelX * 2,
    VIDEO_HEIGHT + videoBezelY * 2
  );
  initButtons();
  document.body.appendChild(canvas);
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
}

function initButtons() {
  const buttonXys = [
    {
      x: arrowButtonX + Math.floor(buttonWidth * 1.2),
      y: arrowButtonY,
    },
    {
      x: arrowButtonX,
      y: arrowButtonY + Math.floor(buttonWidth * 1.2),
    },
    {
      x: arrowButtonX - Math.floor(buttonWidth * 1.2),
      y: arrowButtonY,
    },
    {
      x: arrowButtonX,
      y: arrowButtonY - Math.floor(buttonWidth * 1.2),
    },
    {
      x: Math.floor(canvasWidth * 0.9),
      y: Math.floor(canvasHeight * 0.75),
    },
    {
      x: Math.floor(canvasWidth * 0.7),
      y: Math.floor(canvasHeight * 0.85),
    },
  ];
  virtualPad.init(
    canvas,
    { x: canvasWidth, y: canvasHeight },
    buttonXys,
    buttonPressedWidth
  );
  drawButtons();
}

function drawButtons() {
  virtualPad.buttons.forEach((b) => {
    canvasContext.fillStyle =
      colorStyles[b.isShowingPressed ? COLOR_BLUE : COLOR_BLACK];
    canvasContext.fillRect(
      Math.floor(b.x - buttonWidth / 2),
      Math.floor(b.y - buttonWidth / 2),
      buttonWidth,
      buttonWidth
    );
  });
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
