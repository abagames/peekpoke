let x;
let y;
let angle;
const angleOffsets = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
let gameSpeed;
let ticks;
let buzzerTicks;

function setup() {
  x = Math.floor(VIDEO_WIDTH * 0.2);
  y = VIDEO_HEIGHT / 2;
  angle = 0;
  gameSpeed = 9;
  ticks = 0;
  buzzerTicks = 0;
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, 4);
}

function loop() {
  buzzerTicks--;
  if (buzzerTicks <= 0) {
    poke(ADDRESS_BUZZER, 0);
    buzzerTicks = 0;
  }
  ticks++;
  const pa = angle;
  if (
    memory[
      ADDRESS_KEY + KEY_UP * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED
    ] === 1 &&
    angle !== 1
  ) {
    angle = 3;
  }
  if (
    memory[
      ADDRESS_KEY + KEY_LEFT * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED
    ] === 1 &&
    angle !== 0
  ) {
    angle = 2;
  }
  if (
    memory[
      ADDRESS_KEY + KEY_DOWN * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED
    ] === 1 &&
    angle !== 3
  ) {
    angle = 1;
  }
  if (
    memory[
      ADDRESS_KEY + KEY_RIGHT * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED
    ] === 1 &&
    angle !== 2
  ) {
    angle = 0;
  }
  if (angle !== pa) {
    poke(ADDRESS_BUZZER, 2000);
    buzzerTicks = 7;
  }
  if (ticks % gameSpeed > 0) {
    return;
  }
  poke(ADDRESS_BUZZER, 1000);
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, 7);
  const ao = angleOffsets[angle];
  x += ao.x;
  y += ao.y;
  if (x < 0) {
    x = VIDEO_WIDTH - 1;
  } else if (x >= VIDEO_WIDTH) {
    x = 0;
  }
  if (y < 0) {
    y = VIDEO_HEIGHT - 1;
  } else if (y >= VIDEO_HEIGHT) {
    y = 0;
  }
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, 4);
}
