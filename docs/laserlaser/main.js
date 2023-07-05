let player;
let lasers;
let bonus;
let gameSpeed;
let buzzerTicks;
let ticks;
let score;
let state;

enableSplashScreen = true;

function setup() {
  setupTitle();
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

function setupInGame() {
  state = "inGame";
  ticks = -1;
  clearText();
  player = { x: 16, y: 15 };
  lasers = [];
  addBonus();
  gameSpeed = 9;
  score = 0;
}

function loopInGame() {
  gameSpeed -= 0.001;
  if (gameSpeed < 1) {
    gameSpeed = 1;
  }
  if (ticks % Math.floor(gameSpeed) > 0) {
    return;
  }
  player.isKeyPressed = false;
  clearVideo();
  if (Math.random() < 0.5) {
    addLaser();
    if (buzzerTicks < 0) {
      beep(240, 2);
    }
  }
  const ls = 2;
  lasers = lasers.filter((l) => {
    switch (l.angle) {
      case 0:
        l.w += ls;
        break;
      case 1:
        l.h += ls;
        break;
      case 2:
        l.w += ls;
        l.x -= ls;
        break;
      case 3:
        l.h += ls;
        l.y -= ls;
        break;
    }
    rect(
      l.x,
      l.y,
      l.w,
      l.h,
      l.w > VIDEO_WIDTH || l.h > VIDEO_HEIGHT ? COLOR_PURPLE : COLOR_RED
    );
    return l.w < VIDEO_WIDTH + 9 && l.h < VIDEO_HEIGHT + 9;
  });
  pset(bonus.x, bonus.y, COLOR_YELLOW);
  if (isKeyPressed(KEY_LEFT)) {
    player.x--;
    beep(20, 2);
  }
  if (isKeyPressed(KEY_RIGHT)) {
    player.x++;
    beep(20, 2);
  }
  player.x = wrap(player.x, VIDEO_WIDTH);
  if (isKeyPressed(KEY_UP)) {
    player.y--;
    beep(20, 2);
  }
  if (isKeyPressed(KEY_DOWN)) {
    player.y++;
    beep(20, 2);
  }
  player.y = wrap(player.y, VIDEO_HEIGHT);
  const pp = pget(player.x, player.y);
  if (pp === COLOR_RED) {
    setupGameOver();
    beep(22, 22);
  } else if (pp === COLOR_YELLOW) {
    score++;
    addBonus();
    beep(180, 9);
  }
  pset(player.x, player.y, COLOR_CYAN);
  const ss = `${score}`;
  const x = 8 - ss.length;
  print(ss, x, 0);
}

function addLaser() {
  const angle = rndi(4);
  let x, y;
  switch (angle) {
    case 0:
      x = 0;
      y = rndi(VIDEO_HEIGHT);
      break;
    case 1:
      x = rndi(VIDEO_WIDTH);
      y = 0;
      break;
    case 2:
      x = VIDEO_WIDTH - 1;
      y = rndi(VIDEO_HEIGHT);
      break;
    case 3:
      x = rndi(VIDEO_WIDTH);
      y = VIDEO_HEIGHT - 1;
      break;
  }
  lasers.push({ x, y, angle, w: 1, h: 1 });
}

function addBonus() {
  bonus = {
    x: rndi(VIDEO_WIDTH * 0.5) + Math.floor(VIDEO_WIDTH * 0.25),
    y: rndi(VIDEO_HEIGHT * 0.5) + Math.floor(VIDEO_HEIGHT * 0.25),
  };
}

function setupTitle() {
  state = "title";
  ticks = -1;
  clearVideo();
  print("LASER", 0, 1);
  print("LASER", 1, 2);
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

function setupGameOver() {
  state = "gameOver";
  ticks = -1;
  print("GAME", 1, 2);
  print("OVER", 2, 3);
}

function loopGameOver() {
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED && ticks > 20) {
    setupInGame();
  } else if (ticks > 180) {
    setupTitle();
  }
}

function isKeyPressed(key) {
  return peek(ADDRESS_KEY + key) & KEY_STATE_IS_PRESSED;
}

function isKeyJustPressed(key) {
  return peek(ADDRESS_KEY + key) & KEY_STATE_IS_JUST_PRESSED;
}

function clearVideo() {
  rect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, COLOR_BLACK);
}

function clearText() {
  for (let i = ADDRESS_TEXT; i < ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT; i++) {
    poke(i, 0);
  }
}

function print(str, x, y) {
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    const address = ADDRESS_TEXT + x + i + y * TEXT_WIDTH;
    poke(address, c);
  }
}

function rect(x, y, w, h, c) {
  for (let px = x; px < x + w; px++) {
    for (let py = y; py < y + h; py++) {
      pset(px, py, c);
    }
  }
}

function pset(x, y, c) {
  if (x < 0 || x >= VIDEO_WIDTH || y < 0 || y >= VIDEO_HEIGHT) {
    return;
  }
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
}

function pget(x, y) {
  return peek(ADDRESS_VIDEO + x + y * VIDEO_WIDTH);
}

function beep(freq, duration) {
  poke(ADDRESS_BUZZER, freq);
  buzzerTicks = duration;
}

function rndi(max) {
  return Math.floor(Math.random() * max);
}

function wrap(v, max) {
  return v < 0 ? max - 1 : v >= max ? 0 : v;
}
