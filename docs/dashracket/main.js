let rackets;
let racketDashTicks;
let racketDashWidth;
let balls;
let gameSpeed;
let nextBallTicks;
let leftBallCount;
let buzzerTicks;
let state;
let ticks;
let score;

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
  print("DASH", 0, 1);
  print("RACKET", 1, 2);
}

function setupInGame() {
  state = "inGame";
  ticks = -1;
  score = 0;
  clearVideo();
  clearText();
  gameSpeed = 1;
  rackets = [
    { x: 14, y: 27 },
    { x: 14, y: 1 },
  ];
  racketDashTicks = -1;
  racketDashWidth = 0;
  balls = [];
  nextBallTicks = 0;
  leftBallCount = 3;
}

function setupGameOver() {
  state = "gameOver";
  ticks = -1;
  print("GAME", 1, 2);
  print("OVER", 2, 3);
}

function loopTitle() {
  const t = ticks % 180;
  if (t === 0) {
    print("[X]    ", 1, 3);
    print("START", 2, 4);
  } else if (t === 60) {
    print("[ARROW]   ", 1, 3);
    print("MOVE ", 2, 4);
  } else if (t === 120) {
    print("[X]    ", 1, 3);
    print("DASH", 2, 4);
  }
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
    setupInGame();
  }
}

function loopInGame() {
  clearVideo();
  gameSpeed += 0.0001;
  nextBallTicks--;
  if (nextBallTicks < 0 || balls.length === 0) {
    addBall();
    nextBallTicks = (120 + Math.random() * 30) / gameSpeed;
  }
  rect(0, 0, 2, VIDEO_HEIGHT, COLOR_BLUE);
  rect(VIDEO_WIDTH - 2, 0, 2, VIDEO_HEIGHT, COLOR_BLUE);
  rackets.forEach((r, i) => {
    if (i === 0) {
      if (peek(ADDRESS_KEY + KEY_LEFT) & KEY_STATE_IS_PRESSED) {
        if (
          peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED &&
          racketDashTicks < 0
        ) {
          racketDashWidth = r.x - 2 + 5;
          r.x = 2;
          racketDashTicks = 9 / gameSpeed;
        } else if (racketDashTicks < 0) {
          r.x -= gameSpeed;
        }
      }
      if (peek(ADDRESS_KEY + KEY_RIGHT) & KEY_STATE_IS_PRESSED) {
        if (
          peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED &&
          racketDashTicks < 0
        ) {
          r.x++;
          racketDashWidth = VIDEO_WIDTH - 2 - r.x;
          racketDashTicks = 9 / gameSpeed;
        } else if (racketDashTicks < 0) {
          r.x += gameSpeed;
        }
      }
      r.x = clamp(r.x, 2, VIDEO_WIDTH - 2 - 5);
      if (racketDashTicks >= 0) {
        rect(r.x, r.y, racketDashWidth, 2, COLOR_CYAN);
        racketDashTicks--;
        if (racketDashTicks < 0 && r.x > 2) {
          r.x = VIDEO_WIDTH - 2 - 5;
        }
      } else {
        rect(r.x, r.y, 5, 2, COLOR_CYAN);
      }
    } else {
      if (balls.length > 0) {
        const rcx = r.x + 2;
        let nb;
        let minDist = 99;
        for (let j = 0; j < balls.length; j++) {
          const b = balls[j];
          const d = Math.sqrt(Math.pow(b.x - rcx, 2) + Math.pow(b.y - r.y, 2));
          if (d < minDist) {
            minDist = d;
            nb = b;
          }
        }
        if (Math.abs(nb.x - rcx) < gameSpeed) {
        } else if (nb.x < rcx) {
          r.x -= gameSpeed;
        } else if (nb.x > rcx) {
          r.x += gameSpeed;
        }
        r.x = clamp(r.x, 2, VIDEO_WIDTH - 2 - 5);
      }
      rect(r.x, r.y, 5, 2, COLOR_PURPLE);
    }
  });
  balls = balls.filter((b) => {
    b.x += b.vx;
    b.y += b.vy;
    if (b.y < 0) {
      beep(80, 6);
      leftBallCount++;
      if (leftBallCount > 9) {
        leftBallCount = 9;
      }
      return false;
    } else if (b.y >= VIDEO_HEIGHT) {
      leftBallCount--;
      if (leftBallCount < 0) {
        leftBallCount = 0;
        beep(40, 9);
        setupGameOver();
      } else {
        beep(40, 6);
      }
      return false;
    }
    if (b.x < 2 && b.vx < 0) {
      b.vx = -b.vx;
      if (buzzerTicks < 0) {
        beep(50, 1);
      }
    } else if (b.x > VIDEO_WIDTH - 2 && b.vx > 0) {
      b.vx = -b.vx;
      if (buzzerTicks < 0) {
        beep(50, 1);
      }
    }
    if (pget(b.x, b.y) === COLOR_CYAN && b.vy > 0) {
      b.vy = -b.vy;
      beep(200, 3);
      score++;
    }
    if (pget(b.x, b.y) === COLOR_PURPLE && b.vy < 0) {
      b.vy = -b.vy;
      beep(150, 3);
    }
    pset(b.x, b.y, COLOR_WHITE);
    return true;
  });
  for (let i = 0; i < leftBallCount; i++) {
    pset(3 + i * 2, VIDEO_HEIGHT - 1, COLOR_WHITE);
  }
  const ss = `${score}`;
  print(ss, 8 - ss.length, 0);
}

function loopGameOver() {
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED && ticks > 20) {
    setupInGame();
  }
  if (ticks > 180) {
    setupTitle();
  }
}

function addBall() {
  let angle = Math.random() * 0.125 + 0.125;
  if (Math.random() < 0.5) {
    angle = -angle;
  }
  angle = (angle + 0.5) * Math.PI;
  const speed = 0.5 * gameSpeed;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  balls.push({ x: 16, y: 5, vx, vy });
}

function clearVideo() {
  rect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT, COLOR_BLACK);
}

function clearText() {
  for (let i = ADDRESS_TEXT; i < ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT; i++) {
    poke(i, 0);
  }
}

function rect(x, y, w, h, c) {
  for (let px = x; px < x + w; px++) {
    for (let py = y; py < y + h; py++) {
      pset(px, py, c);
    }
  }
}

function print(text, x, y) {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    poke(ADDRESS_TEXT + x + i + y * TEXT_WIDTH, c);
  }
}

function beep(freq, duration) {
  poke(ADDRESS_BUZZER, freq);
  buzzerTicks = duration;
}

function pset(x, y, c) {
  poke(ADDRESS_VIDEO + Math.floor(x) + Math.floor(y) * VIDEO_WIDTH, c);
}

function pget(x, y) {
  return peek(ADDRESS_VIDEO + Math.floor(x) + Math.floor(y) * VIDEO_WIDTH);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
