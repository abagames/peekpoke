export type VirtualButton = {
  x: number;
  y: number;
  size: number;
  isPressed: boolean;
  isJustPressed: boolean;
  isJustReleased: boolean;
  isShowingPressed: boolean;
};
export let buttons: VirtualButton[];
let pressingButtons: boolean[];
let pressedButtons: boolean[];
let releasedButtons: boolean[];
let positions: {
  [key: string]: { pressingButtonIds: boolean[]; isPressed: boolean };
};

let screen: HTMLElement;
let pixelSize: { x: number; y: number };

export function init(
  _screen: HTMLElement,
  _pixelSize: { x: number; y: number },
  buttonXys: { x: number; y: number }[],
  buttonSize: number
) {
  buttons = buttonXys.map((b) => ({
    x: b.x,
    y: b.y,
    size: buttonSize,
    isPressed: false,
    isJustPressed: false,
    isJustReleased: false,
    isShowingPressed: false,
  }));
  pressingButtons = [];
  pressedButtons = [];
  releasedButtons = [];
  for (let i = 0; i < buttons.length; i++) {
    pressingButtons.push(false);
    pressedButtons.push(false);
    releasedButtons.push(false);
  }
  positions = {};
  screen = _screen;
  pixelSize = { x: _pixelSize.x, y: _pixelSize.y };
  document.addEventListener("mousedown", (e) => {
    onDown(e.pageX, e.pageY, "_mouse");
  });
  document.addEventListener("touchstart", (e) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const t = touches[i];
      onDown(t.pageX, t.pageY, t.identifier);
    }
  });
  document.addEventListener("mousemove", (e) => {
    onMove(e.pageX, e.pageY, "_mouse");
  });
  document.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        onMove(t.pageX, t.pageY, t.identifier);
      }
    },
    { passive: false }
  );
  document.addEventListener("mouseup", (e) => {
    onUp("_mouse");
  });
  document.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        onUp(t.identifier);
      }
    },
    { passive: false }
  );
}

export function update() {
  buttons.forEach((b, i) => {
    b.isJustPressed = pressedButtons[i];
    b.isJustReleased = releasedButtons[i];
    b.isPressed = pressingButtons[i];
    pressedButtons[i] = releasedButtons[i] = false;
  });
}

function onDown(x: number, y: number, id) {
  if (!positions.hasOwnProperty(id)) {
    const pressingButtonIds = [];
    for (let i = 0; i < buttons.length; i++) {
      pressingButtonIds.push(false);
    }
    positions[id] = { pressingButtonIds, isPressed: true };
  } else {
    positions[id].isPressed = true;
  }
  updateButtonState(x, y, "down", positions[id].pressingButtonIds);
}

function onMove(x: number, y: number, id) {
  if (!positions.hasOwnProperty(id) || !positions[id].isPressed) {
    return;
  }
  const p = positions[id];
  updateButtonState(x, y, "move", positions[id].pressingButtonIds);
}

function onUp(id) {
  const p = positions[id];
  for (let i = 0; i < buttons.length; i++) {
    if (p.pressingButtonIds[i]) {
      pressingButtons[i] = false;
      releasedButtons[i] = true;
      p.pressingButtonIds[i] = false;
    }
  }
  p.isPressed = false;
}

function updateButtonState(
  x: number,
  y: number,
  type: "down" | "move",
  pressingButtonIds: boolean[]
) {
  const pp = calcPointerPos(x, y);
  buttons.forEach((b, i) => {
    if (
      Math.abs(pp.x - b.x + 0.5) < b.size / 2 &&
      Math.abs(pp.y - b.y + 0.5) < b.size / 2
    ) {
      if (type === "down" || (type === "move" && !pressingButtonIds[i])) {
        pressingButtons[i] = pressedButtons[i] = true;
        pressingButtonIds[i] = true;
      }
    } else if (type === "move" && pressingButtonIds[i]) {
      pressingButtons[i] = false;
      releasedButtons[i] = true;
      pressingButtonIds[i] = false;
    }
  });
}

let pointerPos = { x: 0, y: 0 };

function calcPointerPos(x: number, y: number) {
  if (screen == null) {
    return;
  }
  pointerPos.x = Math.round(
    ((x - screen.offsetLeft) / screen.clientWidth + 0.5) * pixelSize.x
  );
  pointerPos.y = Math.round(
    ((y - screen.offsetTop) / screen.clientHeight + 0.5) * pixelSize.y
  );
  return pointerPos;
}
