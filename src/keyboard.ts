export type Code = (typeof codes)[number];

export type CodeState = {
  [key in Code]: {
    isPressed: boolean;
    isJustPressed: boolean;
    isJustReleased: boolean;
  };
};

export let codeState: CodeState;
let pressingCode: { [key: string]: boolean } = {};
let pressedCode: { [key: string]: boolean } = {};
let releasedCode: { [key: string]: boolean } = {};
let codeStateEntries;

export function init() {
  codeState = fromEntities(
    codes.map((c) => [
      c,
      {
        isPressed: false,
        isJustPressed: false,
        isJustReleased: false,
      },
    ])
  );
  codeStateEntries = entries(codeState);
  document.addEventListener("keydown", (e) => {
    pressingCode[e.code] = pressedCode[e.code] = true;
    if (
      e.code === "AltLeft" ||
      e.code === "AltRight" ||
      e.code === "ArrowRight" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowUp"
    ) {
      e.preventDefault();
    }
  });
  document.addEventListener("keyup", (e) => {
    pressingCode[e.code] = false;
    releasedCode[e.code] = true;
  });
}

export function update() {
  codeStateEntries.forEach(([c, s]) => {
    s.isJustPressed = pressedCode[c];
    s.isJustReleased = releasedCode[c];
    s.isPressed = pressingCode[c];
  });
  pressedCode = {};
  releasedCode = {};
}

function fromEntities(v: any[][]) {
  return [...v].reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
}

function entries(obj) {
  return Object.keys(obj).map((p) => [p, obj[p]]);
}

export const codes = [
  "ArrowRight",
  "KeyD",
  "ArrowDown",
  "KeyS",
  "ArrowLeft",
  "KeyA",
  "ArrowUp",
  "KeyW",
  "KeyX",
  "Slash",
  "Space",
  "KeyZ",
  "Period",
];
