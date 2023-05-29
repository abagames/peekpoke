export type Code = (typeof codes)[number];

export type CodeState = {
  [key in Code]: {
    isPressed: boolean;
    isJustPressed: boolean;
    isJustReleased: boolean;
  };
};

export let code: CodeState;

type Options = {
  onKeyDown?: Function;
};
const defaultOptions: Options = {
  onKeyDown: undefined,
};
let options: Options;

let pressingCode: { [key: string]: boolean } = {};
let pressedCode: { [key: string]: boolean } = {};
let releasedCode: { [key: string]: boolean } = {};

export function init(_options?: Options) {
  options = { ...defaultOptions, ..._options };
  code = fromEntities(
    codes.map((c) => [
      c,
      {
        isPressed: false,
        isJustPressed: false,
        isJustReleased: false,
      },
    ])
  );
  document.addEventListener("keydown", (e) => {
    pressingCode[e.code] = pressedCode[e.code] = true;
    if (options.onKeyDown != null) {
      options.onKeyDown();
    }
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
  entries(code).forEach(([c, s]) => {
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
  "Escape",
  "Digit0",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Minus",
  "Equal",
  "Backspace",
  "Tab",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "BracketLeft",
  "BracketRight",
  "Enter",
  "ControlLeft",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
  "Backquote",
  "ShiftLeft",
  "Backslash",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
  "Slash",
  "ShiftRight",
  "NumpadMultiply",
  "AltLeft",
  "Space",
  "CapsLock",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "Pause",
  "ScrollLock",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "NumpadSubtract",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "NumpadAdd",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad0",
  "NumpadDecimal",
  "IntlBackslash",
  "F11",
  "F12",
  "F13",
  "F14",
  "F15",
  "F16",
  "F17",
  "F18",
  "F19",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "IntlYen",
  "Undo",
  "Paste",
  "MediaTrackPrevious",
  "Cut",
  "Copy",
  "MediaTrackNext",
  "NumpadEnter",
  "ControlRight",
  "LaunchMail",
  "AudioVolumeMute",
  "MediaPlayPause",
  "MediaStop",
  "Eject",
  "AudioVolumeDown",
  "AudioVolumeUp",
  "BrowserHome",
  "NumpadDivide",
  "PrintScreen",
  "AltRight",
  "Help",
  "NumLock",
  "Pause",
  "Home",
  "ArrowUp",
  "PageUp",
  "ArrowLeft",
  "ArrowRight",
  "End",
  "ArrowDown",
  "PageDown",
  "Insert",
  "Delete",
  "OSLeft",
  "OSRight",
  "ContextMenu",
  "BrowserSearch",
  "BrowserFavorites",
  "BrowserRefresh",
  "BrowserStop",
  "BrowserForward",
  "BrowserBack",
];
