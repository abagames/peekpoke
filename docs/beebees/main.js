let turret;
let leftTurretCount;
let bees;
let soundBee;
let ticks;
let gameSpeed;
let score;
let buzzerTicks;
let state;

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
  print("BEEBEES", 0, 1);
}

function setupInGame() {
  state = "inGame";
  ticks = -1;
  score = 0;
  clearVideo();
  clearText();
  turret = { x: 14, y: 26, shotY: -1, destroyedTicks: 0 };
  leftTurretCount = 2;
  bees = [];
  for (let i = 0; i < 5; i++) {
    bees.push({});
    setBee(i);
  }
  soundBee = undefined;
  gameSpeed = 7;
  buzzerTicks = 0;
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
    print("SHOT", 2, 4);
  }
  if (peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
    setupInGame();
  }
}

function loopInGame() {
  gameSpeed -= 0.0005;
  if (gameSpeed < 1) {
    gameSpeed = 1;
  }
  if (
    peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED &&
    turret.shotY < 0 &&
    turret.destroyedTicks <= 0
  ) {
    if (buzzerTicks <= 0) {
      beep(22, 2);
    }
    turret.shotY = turret.y;
  }
  if (ticks % Math.floor(gameSpeed) > 0) {
    return;
  }
  clearVideo();
  if (turret.destroyedTicks <= 0) {
    if (peek(ADDRESS_KEY + KEY_LEFT) & KEY_STATE_IS_PRESSED) {
      turret.x--;
    }
    if (peek(ADDRESS_KEY + KEY_RIGHT) & KEY_STATE_IS_PRESSED) {
      turret.x++;
    }
    turret.x = wrap(turret.x, VIDEO_WIDTH);
    if (turret.shotY >= 0) {
      turret.shotY -= 3;
      drawPattern([0, -1, 0, 0, 0, 1], turret.x, turret.shotY, COLOR_YELLOW);
    }
    drawPattern([-1, 1, 0, 0, 1, 1], turret.x, turret.y, COLOR_CYAN);
  } else {
    turret.destroyedTicks++;
    if (turret.destroyedTicks < 9) {
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = 0; oy <= 1; oy++) {
          pset(turret.x + ox, turret.y + oy, Math.floor(Math.random() * 7));
        }
      }
    } else {
      if (turret.destroyedTicks >= 19) {
        turret.destroyedTicks = 0;
        turret.shotY = -1;
        bees.forEach((b) => {
          b.stayTicks += Math.floor(Math.random() * 3 + 1) * 6;
        });
        if (leftTurretCount < 0) {
          setupGameOver();
        }
      }
    }
  }
  let isShotHit = false;
  bees.forEach((b, i) => {
    if (b.destroyedTicks > 0) {
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          pset(b.x + ox, b.y + oy, Math.floor(Math.random() * 7));
        }
      }
      b.destroyedTicks++;
      if (b.destroyedTicks > 4) {
        setBee(i);
      }
      return;
    }
    if (
      turret.shotY >= 0 &&
      Math.abs(turret.x - b.x) < 3 &&
      Math.abs(turret.shotY - b.y) < 2
    ) {
      beep(40, 5);
      score++;
      b.destroyedTicks = 1;
      isShotHit = true;
    } else if (
      turret.destroyedTicks <= 0 &&
      Math.abs(turret.x - b.x) < 2 &&
      Math.abs(turret.y - b.y) < 2
    ) {
      beep(20, 9);
      turret.destroyedTicks = 1;
      turret.shotY = -1;
      leftTurretCount--;
    }
    let pt = [-2, -1, -1, 0, 0, 1, 1, 0, 2, -1];
    if (b.stayTicks > 0) {
      if (b.stayTicks % 6 < 3) {
        b.y--;
        pt = [-2, 0, -1, -1, 0, 0, 1, -1, 2, 0];
      } else {
        b.y++;
      }
      b.stayTicks--;
      if (b.stayTicks <= 0) {
        if (turret.destroyedTicks > 0) {
          b.stayTicks += 6;
        }
        b.vx = Math.random() * 2 - 1;
        b.ty = Math.random() * 7 + 3;
        b.isFromTop = false;
        soundBee = b;
      }
    } else {
      b.x += b.vx * 2;
      b.y += 2;
      if (b.y > VIDEO_HEIGHT) {
        b.y -= VIDEO_HEIGHT + 1;
        b.isFromTop = true;
      }
      if (b.isFromTop && b.y > b.ty) {
        b.stayTicks = Math.random() * 9 + 9;
      }
    }
    b.x = wrap(b.x, VIDEO_WIDTH);
    drawPattern(pt, b.x, b.y, COLOR_RED);
  });
  if (
    buzzerTicks <= 0 &&
    soundBee != null &&
    soundBee.y < 25 &&
    soundBee.destroyedTicks <= 0 &&
    soundBee.stayTicks <= 0 &&
    turret.destroyedTicks <= 0
  ) {
    beep(250 - soundBee.y * 5, 3);
  }
  if (isShotHit) {
    turret.shotY = -1;
  }
  for (let i = 0; i < leftTurretCount; i++) {
    drawPattern([-1, 1, 0, 0, 1, 1], 30 - i * 4, 28, COLOR_CYAN);
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

function setBee(index) {
  bees[index] = {
    x: Math.random() * VIDEO_WIDTH,
    y: Math.random() * -9,
    vx: Math.random() * 2 - 1,
    ty: Math.random() * 7 + 3,
    stayTicks: 0,
    isFromTop: true,
    destroyedTicks: 0,
  };
}

function drawPattern(p, x, y, c) {
  for (let i = 0; i < p.length; i += 2) {
    const ox = p[i];
    const oy = p[i + 1];
    pset(x + ox, y + oy, c);
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

function pset(px, py, c) {
  const x = Math.floor(px);
  const y = Math.floor(py);
  if (x < 0 || x >= VIDEO_WIDTH || y < 0 || y >= VIDEO_HEIGHT) {
    return;
  }
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
  poke(ADDRESS_VIDEO + x + y * VIDEO_WIDTH, c);
}

function pget(x, y) {
  return peek(ADDRESS_VIDEO + x + y * VIDEO_WIDTH);
}

function beep(freq, duration) {
  poke(ADDRESS_BUZZER, freq);
  buzzerTicks = duration;
}
function wrap(n, high) {
  return ((n % high) + high) % high;
}
