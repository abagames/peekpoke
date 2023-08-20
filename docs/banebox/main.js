let floors;
let nextFloorDist;
let boxes;
let nextBoxDist;
let player;
let shot;
let ticks;
let buzzerTicks;
let state;
let score;

function setup() {
  setupTitle();
  ticks = 0;
  buzzerTicks = 0;
}

function setupTitle() {
  state = "title";
  ticks = -1;
  clearVideo();
  print("BANEBOX", 0, 1);
  print("    ", 1, 2);
}

function setupInGame() {
  clearText();
  state = "inGame";
  ticks = -1;
  score = 0;
  floors = [{ x: 0, y: 20, w: 30 }];
  nextFloorDist = 0;
  boxes = [];
  nextBoxDist = 0;
  player = { x: 5, y: 0, vy: 0 };
  shot = { x: 0, y: 0, isShot: false };
}

function setupGameOver() {
  state = "gameOver";
  ticks = -1;
  print("GAME", 1, 2);
  print("OVER", 2, 3);
  beep(20, 20);
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

function loopTitle() {
  const t = ticks % 240;
  if (t === 0) {
    print("[X]    ", 1, 3);
    print("START", 2, 4);
  } else if (t === 60) {
    print("[ARROW]   ", 1, 3);
    print("MOVE ", 2, 4);
  } else if (t === 120) {
    print("[X]    ", 1, 3);
    print("JUMP", 2, 4);
  } else if (t === 180) {
    print("[Z]    ", 1, 3);
    print("FIRE", 2, 4);
  }
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
    setupInGame();
  }
}

function loopInGame() {
  clearVideo();
  const gameSpeed = 1 + Math.sqrt(ticks * 0.001);
  const scrollSpeed = 0.07 * gameSpeed;

  if (shot.isShot) {
    shot.x += 0.5 * gameSpeed;
    rect(shot.x, shot.y - 1, 2, 3, COLOR_BLUE);
    if (shot.x > 32) {
      shot.isShot = false;
    }
  }

  boxes = boxes.filter((b) => {
    b.x -= scrollSpeed;
    if (b.vy === 0) {
      b.x -= b.speed * gameSpeed;
      if (b.x < player.x) {
        b.vy = player.y < b.y ? -1 : 1;
      }
    } else {
      b.y += b.speed * gameSpeed * b.vy;
    }
    if (rect(b.x, b.y, b.size, b.size, COLOR_PURPLE) === COLOR_BLUE) {
      shot.isShot = false;
      beep(220, 9);
      score++;
      return false;
    }
    return b.x + b.size >= 0 || b.y + b.size >= 0 || b.y < 30;
  });
  nextBoxDist -= scrollSpeed;
  if (nextBoxDist < 0) {
    const size = Math.random() * 5 + 5;
    const speed = ((Math.random() + 2) * 0.1) / Math.sqrt(size);
    boxes.push({ x: 32, y: Math.random() * 30 - size / 2, size, speed, vy: 0 });
    nextBoxDist = Math.random() * 24 + 3;
  }

  floors = floors.filter((f) => {
    rect(f.x, f.y, f.w, 1, COLOR_YELLOW);
    f.x -= scrollSpeed;
    return f.x + f.w >= 0;
  });
  nextFloorDist -= scrollSpeed;
  if (nextFloorDist < 0) {
    const w = Math.random() * 9 + 6;
    floors.push({ x: 32, y: Math.floor(Math.random() * 9) * 2 + 12, w });
    nextFloorDist = Math.random() * 16 + w - 9;
  }

  if (peek(ADDRESS_KEY + KEY_LEFT) & KEY_STATE_IS_PRESSED) {
    player.x -= 0.15 * gameSpeed;
  }
  if (peek(ADDRESS_KEY + KEY_RIGHT) & KEY_STATE_IS_PRESSED) {
    player.x += 0.15 * gameSpeed;
  }
  player.x = clamp(player.x, 0, 31);
  const gv = peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_PRESSED ? 0.01 : 0.025;
  player.vy += gv * gameSpeed;
  player.vy = clamp(player.vy, -1, 1);
  const pvy = -player.vy / gameSpeed;
  if (pvy > 0.25) {
    beep(Math.floor(200 - (pvy - 0.25) * 400), 2);
  }
  player.y += player.vy;
  const c = pget(player.x, Math.ceil(player.y));
  if (c === COLOR_YELLOW) {
    if (player.vy >= 0) {
      player.y = Math.ceil(player.y - 1);
      if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
        player.vy = -0.5 * gameSpeed;
      } else {
        player.vy = 0;
      }
    } else {
      player.y = Math.ceil(player.y + 1);
      player.vy *= -0.7;
    }
  }
  if (player.y < 0 && player.vy < 0) {
    player.vy *= -0.7;
  }
  if (!shot.isShot && peek(ADDRESS_KEY + KEY_Z) & KEY_STATE_IS_JUST_PRESSED) {
    shot.x = player.x;
    shot.y = player.y;
    shot.isShot = true;
    beep(60, 3);
  }
  if (pget(player.x, player.y + 1) === COLOR_PURPLE || player.y > 30) {
    setupGameOver();
  }
  pset(player.x, player.y, COLOR_CYAN);

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

function print(text, x, y) {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const address = ADDRESS_TEXT + x + i + y * TEXT_WIDTH;
    poke(address, c);
  }
}

function rect(x, y, w, h, c) {
  if (x + w - 1 < 0 || x > VIDEO_WIDTH || y + h - 1 < 0 || y > VIDEO_HEIGHT) {
    return;
  }
  let collision = 0;
  const bx = clamp(Math.floor(x), 0, VIDEO_WIDTH - 1);
  const ex = clamp(Math.floor(x) + Math.floor(w) - 1, 0, VIDEO_WIDTH - 1);
  const by = clamp(Math.floor(y), 0, VIDEO_HEIGHT - 1);
  const ey = clamp(Math.floor(y) + Math.floor(h) - 1, 0, VIDEO_HEIGHT - 1);
  for (let px = bx; px <= ex; px++) {
    for (let py = by; py <= ey; py++) {
      collision |= peek(ADDRESS_VIDEO + px + py * VIDEO_WIDTH);
      poke(ADDRESS_VIDEO + px + py * VIDEO_WIDTH, c);
    }
  }
  return collision;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max));
}

function pset(px, py, c) {
  const x = Math.floor(px);
  const y = Math.floor(py);
  if (x < 0 || x >= VIDEO_WIDTH || y < 0 || y >= VIDEO_HEIGHT) {
    return;
  }
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
}

function pget(px, py) {
  const x = Math.floor(px);
  const y = Math.floor(py);
  if (x < 0 || x >= VIDEO_WIDTH || y < 0 || y >= VIDEO_HEIGHT) {
    return 0;
  }
  return peek(ADDRESS_VIDEO + x + y * VIDEO_WIDTH);
}

function beep(freq, duration) {
  poke(ADDRESS_BUZZER, Math.floor(freq));
  buzzerTicks = duration;
}
