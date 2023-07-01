let snake;
let ticks;
let buzzerTicks;
let isAngleChanged;
let bomb;
let nextBomb;
let gameSpeed;
let state;
let score;
const angleOffsets = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

enableSplashScreen = true;

function setup() {
  setupTitle();
  ticks = 0;
  buzzerTicks = 0;
}

function loop() {
  buzzerTicks--;
  if (buzzerTicks <= 0) {
    poke(ADDRESS_BUZZER, 0);
  }
  if (state === "title") {
    loopTitle();
  } else if (state == "inGame") {
    loopInGame();
  } else {
    loopGameOver();
  }
  ticks++;
}

function setupTitle() {
  state = "title";
  ticks = -1;
  clearVideo();
  print("BOMB", 0, 1);
  print("SNAKE", 1, 2);
}

function setupInGame() {
  state = "inGame";
  ticks = -1;
  score = 0;
  clearText();
  clearVideo();
  gameSpeed = 10;
  snake = { x: Math.floor(VIDEO_WIDTH * 0.2), y: VIDEO_HEIGHT / 2, angle: 0 };
  isAngleChanged = false;
  setBomb(snake.x + 4, snake.y);
}

function setupGameOver() {
  state = "gameOver";
  ticks = -1;
  print("GAME", 1, 2);
  print("OVER", 2, 3);
}

function loopTitle() {
  const t = ticks % 120;
  if (t === 0) {
    print("[X]    ", 1, 3);
    print("START", 2, 4);
  } else if (t === 60) {
    print("[ARROW]   ", 1, 3);
    print("MOVE ", 2, 4);
  }
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
    setupInGame();
  }
}

function loopInGame() {
  const pa = snake.angle;
  if (!isAngleChanged) {
    if (
      peek(ADDRESS_KEY + KEY_RIGHT) & KEY_STATE_IS_JUST_PRESSED &&
      snake.angle !== 2
    ) {
      snake.angle = 0;
    } else if (
      peek(ADDRESS_KEY + KEY_DOWN) & KEY_STATE_IS_JUST_PRESSED &&
      snake.angle !== 3
    ) {
      snake.angle = 1;
    } else if (
      peek(ADDRESS_KEY + KEY_LEFT) & KEY_STATE_IS_JUST_PRESSED &&
      snake.angle !== 0
    ) {
      snake.angle = 2;
    } else if (
      peek(ADDRESS_KEY + KEY_UP) & KEY_STATE_IS_JUST_PRESSED &&
      snake.angle !== 1
    ) {
      snake.angle = 3;
    }
  }
  if (snake.angle !== pa) {
    poke(ADDRESS_BUZZER, 100);
    buzzerTicks = 7;
    isAngleChanged = true;
  }
  gameSpeed -= 0.001;
  if (gameSpeed < 1) {
    gameSpeed = 1;
  }
  if (ticks % Math.floor(gameSpeed) > 0) {
    return;
  }
  isAngleChanged = false;
  if (buzzerTicks < 0) {
    poke(ADDRESS_BUZZER, 10);
    buzzerTicks = 2;
  }
  pset(snake.x, snake.y, COLOR_GREEN);
  if (bomb.radius >= 0) {
    drawBombRadius(COLOR_BLACK);
    bomb.radius++;
    if (bomb.radius > 5) {
      setBomb(nextBomb.x, nextBomb.y);
    }
    drawBombRadius(COLOR_WHITE + 2 + rndi(6));
    poke(ADDRESS_BUZZER, rndi(30) + bomb.radius * 20);
    buzzerTicks = 5;
  }
  const ao = angleOffsets[snake.angle];
  snake.x = wrap(snake.x + ao.x, VIDEO_WIDTH);
  snake.y = wrap(snake.y + ao.y, VIDEO_HEIGHT);
  if (pget(snake.x, snake.y) === COLOR_RED) {
    bomb.radius = 0;
    setNextBomb();
  }
  if (pget(snake.x, snake.y) === COLOR_GREEN) {
    setupGameOver();
    poke(ADDRESS_BUZZER, 33);
    buzzerTicks = 30;
  }
  pset(snake.x, snake.y, COLOR_CYAN);
  drawScore();
}

function loopGameOver() {
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
    setupInGame();
  }
  if (ticks > 180) {
    setupTitle();
  }
}

function drawBombRadius(c) {
  for (let x = bomb.x - bomb.radius; x <= bomb.x + bomb.radius; x++) {
    if (x === bomb.x - bomb.radius || x === bomb.x + bomb.radius) {
      for (let y = bomb.y - bomb.radius; y <= bomb.y + bomb.radius; y++) {
        drawBombPixel(x, y, c);
      }
    } else {
      drawBombPixel(x, bomb.y - bomb.radius, c);
      drawBombPixel(x, bomb.y + bomb.radius, c);
    }
  }
}

function drawBombPixel(x, y, c) {
  if (pgetWrapped(x, y) === COLOR_GREEN) {
    score++;
  }
  psetWrapped(x, y, c);
}

function setNextBomb() {
  for (let r = 4; r >= -1; r--) {
    for (let i = 0; i < 9; i++) {
      const x = rndi(VIDEO_WIDTH);
      const y = rndi(VIDEO_HEIGHT);
      if (r === -1) {
        nextBomb = { x, y };
        return;
      }
      let isValid = true;
      for (let ox = x - r; ox <= x + r; ox++) {
        for (let oy = y - r; oy < y + r; oy++) {
          if (pgetWrapped(ox, oy) === COLOR_GREEN) {
            isValid = false;
            break;
          }
        }
      }
      if (isValid) {
        nextBomb = { x, y };
        return;
      }
    }
  }
}

function setBomb(x, y) {
  bomb = { x, y, radius: -1 };
  pset(x, y, COLOR_RED);
}

function drawScore() {
  const ss = `${score}`;
  const x = 8 - ss.length;
  if (snake.y > VIDEO_HEIGHT * 0.2 || state == "gameOver") {
    print(ss, x, 0);
    print("        ", 0, 4);
  } else {
    print(`${score}`, x, 4);
    print("        ", 0, 0);
  }
}

function psetWrapped(x, y, c) {
  const px = wrap(x, VIDEO_WIDTH);
  const py = wrap(y, VIDEO_HEIGHT);
  poke(ADDRESS_VIDEO + px + py * VIDEO_WIDTH, c);
}

function pgetWrapped(x, y, c) {
  const px = wrap(x, VIDEO_WIDTH);
  const py = wrap(y, VIDEO_HEIGHT);
  return peek(ADDRESS_VIDEO + px + py * VIDEO_WIDTH);
}

function print(text, x, y) {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    poke(ADDRESS_TEXT + x + i + y * TEXT_WIDTH, c);
  }
}

function clearVideo() {
  for (
    let i = ADDRESS_VIDEO;
    i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT;
    i++
  ) {
    poke(i, 0);
  }
}

function clearText() {
  for (let i = ADDRESS_TEXT; i < ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT; i++) {
    poke(i, 0);
  }
}

function pset(x, y, c) {
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
}

function pget(x, y) {
  return peek(ADDRESS_VIDEO + x + y * VIDEO_WIDTH);
}

function wrap(n, high) {
  return ((n % high) + high) % high;
}

function rndi(n) {
  return Math.floor(Math.random() * n);
}
