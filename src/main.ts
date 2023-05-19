import * as keyboard from "./keyboard";
import * as buzzer from "./buzzer";

export let memory: number[];
export let canvas: HTMLCanvasElement;
export let canvasContext: CanvasRenderingContext2D;
export let audioContext: AudioContext;

export const ADDRESS_VIDEO = 0;
export const ADDRESS_KEY = 3072;
export const ADDRESS_BUZZER = 3090;
export const ADDRESS_COUNT = 3091;
export const VIDEO_WIDTH = 64;
export const VIDEO_HEIGHT = 48;
export const COLOR_BLACK = 0;
export const COLOR_BLUE = 1;
export const COLOR_RED = 2;
export const COLOR_PURPLE = 3;
export const COLOR_GREEN = 4;
export const COLOR_CYAN = 5;
export const COLOR_YELLOW = 6;
export const COLOR_WHITE = 7;
export const KEY_UP = 0;
export const KEY_LEFT = 1;
export const KEY_DOWN = 2;
export const KEY_RIGHT = 3;
export const KEY_X = 4;
export const KEY_Z = 5;
export const KEY_STATE_IS_PRESSED = 0;
export const KEY_STATE_IS_JUST_PRESSED = 1;
export const KEY_STATE_IS_JUST_RELEASED = 2;
export const KEY_STATE_COUNT = 3;
export const BUZZER_FREQUENCY_MIN = buzzer.BUZZER_FREQUENCY_MIN;
export const BUZZER_FREQUENCY_MAX = buzzer.BUZZER_FREQUENCY_MAX;

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
  updateKeyboardMemory();
  loop();
  updateVideo();
  updateBuzzer();
}

const keyCodes = [
  ["ArrowUp", "KeyW"],
  ["ArrowLeft", "KeyA"],
  ["ArrowDown", "KeyS"],
  ["ArrowRight", "KeyD"],
  ["KeyX", "Slash", "Space"],
  ["KeyZ", "Period"],
];
function updateKeyboardMemory() {
  for (let i = 0; i < 6; i++) {
    let isPressed = 0;
    let isJustPressed = 0;
    let isJustReleased = 0;
    keyCodes[i].forEach((c) => {
      if (keyboard.code[c].isPressed) {
        isPressed = 1;
      }
      if (keyboard.code[c].isJustPressed) {
        isJustPressed = 1;
      }
      if (keyboard.code[c].isJustReleased) {
        isJustReleased = 1;
      }
      memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_PRESSED] =
        isPressed;
      memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED] =
        isJustPressed;
      memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_JUST_RELEASED] =
        isJustReleased;
    });
  }
}

function updateVideo() {
  canvasContext.fillStyle = colorStyles[COLOR_BLACK];
  canvasContext.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  let x = 0;
  let y = 0;
  for (
    let i = ADDRESS_VIDEO;
    i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT;
    i++
  ) {
    const m = memory[i];
    if (m > 0) {
      canvasContext.fillStyle = colorStyles[m];
      canvasContext.fillRect(x, y, 1, 1);
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
`;
  const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
  document.body.style.cssText = bodyCss;
  canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  canvasContext = canvas.getContext("2d");
  canvasContext.imageSmoothingEnabled = false;
  canvas.style.cssText = canvasCss + crispCss;
  document.body.appendChild(canvas);
  const setSize = () => {
    const cs = 0.95;
    const wr = innerWidth / innerHeight;
    const cr = VIDEO_WIDTH / VIDEO_HEIGHT;
    const flgWh = wr < cr;
    const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
    const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
  };
  window.addEventListener("resize", setSize);
  setSize();
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
