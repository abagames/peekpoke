let snake;
let isAngleChanged;
let bomb;
let nextBomb;
let gameSpeed;
let score;
let ticks;
// How long the buzzer is on. Buzzer is off when buzzerTicks is 0.
let buzzerTicks;
// Game state: "title", "inGame", "gameOver"
let state;

// Enable splash screen.
enableSplashScreen = true;

// The setup function is called before the game starts.
function setup() {
  setupTitle();
  ticks = 0;
  buzzerTicks = 0;
}

// The loop function is called continuously 60 times per second.
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
  if (isJustPressed(KEY_X)) {
    setupInGame();
  }
}

const angleOffsets = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

function loopInGame() {
  const pa = snake.angle;
  if (!isAngleChanged) {
    if (isJustPressed(KEY_RIGHT) && snake.angle !== 2) {
      snake.angle = 0;
    } else if (isJustPressed(KEY_DOWN) && snake.angle !== 3) {
      snake.angle = 1;
    } else if (isJustPressed(KEY_LEFT) && snake.angle !== 0) {
      snake.angle = 2;
    } else if (isJustPressed(KEY_UP) && snake.angle !== 1) {
      snake.angle = 3;
    }
  }
  if (snake.angle !== pa) {
    beep(100, 7);
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
    beep(10, 2);
  }
  pset(snake.x, snake.y, COLOR_GREEN);
  if (bomb.radius >= 0) {
    drawBombRadius(COLOR_BLACK);
    bomb.radius++;
    if (bomb.radius > 5) {
      setBomb(nextBomb.x, nextBomb.y);
    }
    drawBombRadius(COLOR_WHITE + 2 + rndi(6));
    beep(rndi(30) + bomb.radius * 20, 5);
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
    beep(33, 30);
  }
  pset(snake.x, snake.y, COLOR_CYAN);
  drawScore();
}

function loopGameOver() {
  if (isJustPressed(KEY_X)) {
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

// Print the given text at the specified position.
function print(text, x, y) {
  // Iterate through each character in the text
  for (let i = 0; i < text.length; i++) {
    // Get the ASCII code of the current character
    const c = text.charCodeAt(i);
    // Calculate the memory address of the current character
    const address = ADDRESS_TEXT + x + i + y * TEXT_WIDTH;
    // Store the ASCII code at the calculated memory address
    poke(address, c);
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

// Set the color of a pixel at the specified coordinates.
function pset(x, y, c) {
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
}

// Get the color of a pixel at the specified coordinates.
function pget(x, y) {
  return peek(ADDRESS_VIDEO + x + y * VIDEO_WIDTH);
}

// Set the frequency and duration of the buzzer.
function beep(freq, duration) {
  poke(ADDRESS_BUZZER, freq);
  buzzerTicks = duration;
}

// Check if a key is just pressed.
// Specify the target key by passing KEY_UP, KEY_X, ... constants as the first parameter.
function isJustPressed(key) {
  return peek(ADDRESS_KEY + key) & KEY_STATE_IS_JUST_PRESSED;
}

function wrap(n, high) {
  return ((n % high) + high) % high;
}

function rndi(n) {
  return Math.floor(Math.random() * n);
}
