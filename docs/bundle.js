(function (exports) {
    'use strict';

    let code;
    const defaultOptions = {
        onKeyDown: undefined,
    };
    let options;
    let pressingCode = {};
    let pressedCode = {};
    let releasedCode = {};
    function init$1(_options) {
        options = Object.assign(Object.assign({}, defaultOptions), _options);
        code = fromEntities(codes.map((c) => [
            c,
            {
                isPressed: false,
                isJustPressed: false,
                isJustReleased: false,
            },
        ]));
        document.addEventListener("keydown", (e) => {
            pressingCode[e.code] = pressedCode[e.code] = true;
            if (options.onKeyDown != null) {
                options.onKeyDown();
            }
            if (e.code === "AltLeft" ||
                e.code === "AltRight" ||
                e.code === "ArrowRight" ||
                e.code === "ArrowDown" ||
                e.code === "ArrowLeft" ||
                e.code === "ArrowUp") {
                e.preventDefault();
            }
        });
        document.addEventListener("keyup", (e) => {
            pressingCode[e.code] = false;
            releasedCode[e.code] = true;
        });
    }
    function update() {
        entries(code).forEach(([c, s]) => {
            s.isJustPressed = !s.isPressed && pressedCode[c];
            s.isJustReleased = s.isPressed && releasedCode[c];
            s.isPressed = !!pressingCode[c];
        });
        pressedCode = {};
        releasedCode = {};
    }
    function fromEntities(v) {
        return [...v].reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
    }
    function entries(obj) {
        return Object.keys(obj).map((p) => [p, obj[p]]);
    }
    const codes = [
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

    let audioContext;
    let gain;
    let buzzerBuffer;
    function init() {
        // @ts-ignore
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.addEventListener("mousedown", resumeAudio);
        window.addEventListener("touchstart", resumeAudio);
        window.addEventListener("keydown", resumeAudio);
        gain = audioContext.createGain();
        gain.gain.value = 0.05;
        gain.connect(audioContext.destination);
        buzzerBuffer = new AudioBuffer({
            numberOfChannels: 1,
            length: audioContext.sampleRate,
            sampleRate: audioContext.sampleRate,
        });
        const buzzerBufferData = buzzerBuffer.getChannelData(0);
        for (let i = 0; i < audioContext.sampleRate; i++) {
            const vl = 0.5 +
                (Math.floor(i / (audioContext.sampleRate / 5000)) % 2 === 0 ? 0.2 : -0.2);
            let v = Math.floor(i / (audioContext.sampleRate / 2400)) % 2 === 0 ? vl : -vl;
            buzzerBufferData[i] = v;
        }
    }
    let isBeepOn = false;
    let beepNode;
    function beepOn() {
        if (isBeepOn) {
            return;
        }
        beepNode = new AudioBufferSourceNode(audioContext, {
            buffer: buzzerBuffer,
            loop: true,
        });
        beepNode.start();
        beepNode.connect(gain);
        isBeepOn = true;
    }
    function beepOff() {
        if (!isBeepOn) {
            return;
        }
        beepNode.stop();
        isBeepOn = false;
    }
    function resumeAudio() {
        audioContext.resume();
    }

    exports.memory = void 0;
    exports.canvas = void 0;
    exports.canvasContext = void 0;
    exports.audioContext = void 0;
    const ADDRESS_VIDEO = 0;
    const ADDRESS_KEY = 3072;
    const ADDRESS_BUZZER = 3090;
    const ADDRESS_COUNT = 3091;
    const VIDEO_WIDTH = 64;
    const VIDEO_HEIGHT = 48;
    const COLOR_BLACK = 0;
    const COLOR_BLUE = 1;
    const COLOR_RED = 2;
    const COLOR_PURPLE = 3;
    const COLOR_GREEN = 4;
    const COLOR_CYAN = 5;
    const COLOR_YELLOW = 6;
    const COLOR_WHITE = 7;
    const KEY_UP = 0;
    const KEY_LEFT = 1;
    const KEY_DOWN = 2;
    const KEY_RIGHT = 3;
    const KEY_X = 4;
    const KEY_Z = 5;
    const KEY_STATE_IS_PRESSED = 0;
    const KEY_STATE_IS_JUST_PRESSED = 1;
    const KEY_STATE_IS_JUST_RELEASED = 2;
    const KEY_STATE_COUNT = 3;
    const BUZZER_OFF = 0;
    const BUZZER_ON = 1;
    function poke(address, value) {
        if (address < 0 || address >= ADDRESS_COUNT) {
            throw `Invalid address: poke ${address}`;
        }
        exports.memory[address] = value;
    }
    function peek(address) {
        if (address < 0 || address >= ADDRESS_COUNT) {
            throw `Invalid address: peek ${address}`;
        }
        return exports.memory[address];
    }
    window.addEventListener("load", onLoad);
    function onLoad() {
        exports.memory = [];
        for (let i = 0; i < ADDRESS_COUNT; i++) {
            exports.memory.push(0);
        }
        init$1();
        init();
        exports.audioContext = audioContext;
        initColors();
        initCanvas();
        setup();
        requestAnimationFrame(updateFrame);
    }
    const targetFps = 68;
    const deltaTime = 1000 / targetFps;
    let nextFrameTime = 0;
    function updateFrame() {
        requestAnimationFrame(updateFrame);
        const now = window.performance.now();
        if (now < nextFrameTime - targetFps / 12) {
            return;
        }
        nextFrameTime += deltaTime;
        if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
            nextFrameTime = now + deltaTime;
        }
        update();
        updateKeyboardMemory();
        loop();
        updateVideo();
        updateBuzzer();
    }
    const keyCodes = [
        ["ArrowUp", "KeyW"],
        ["ArrowLeft", "KeyA"],
        ["ArrowDown", "KeyS"],
        ["ArrowRight", "KeyD"],
        ["KeyX", "Slash", "Space"],
        ["KeyZ", "Period"],
    ];
    function updateKeyboardMemory() {
        for (let i = 0; i < 6; i++) {
            let isPressed = 0;
            let isJustPressed = 0;
            let isJustReleased = 0;
            keyCodes[i].forEach((c) => {
                if (code[c].isPressed) {
                    isPressed = 1;
                }
                if (code[c].isJustPressed) {
                    isJustPressed = 1;
                }
                if (code[c].isJustReleased) {
                    isJustReleased = 1;
                }
                exports.memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_PRESSED] =
                    isPressed;
                exports.memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_JUST_PRESSED] =
                    isJustPressed;
                exports.memory[ADDRESS_KEY + i * KEY_STATE_COUNT + KEY_STATE_IS_JUST_RELEASED] =
                    isJustReleased;
            });
        }
    }
    function updateVideo() {
        exports.canvasContext.fillStyle = colorStyles[COLOR_BLACK];
        exports.canvasContext.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        let x = 0;
        let y = 0;
        for (let i = ADDRESS_VIDEO; i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT; i++) {
            const m = exports.memory[i];
            if (m > 0) {
                exports.canvasContext.fillStyle = colorStyles[m];
                exports.canvasContext.fillRect(x, y, 1, 1);
            }
            x++;
            if (x >= VIDEO_WIDTH) {
                x = 0;
                y++;
            }
        }
    }
    function updateBuzzer() {
        if (exports.memory[ADDRESS_BUZZER] > 0) {
            beepOn();
        }
        else {
            beepOff();
        }
    }
    function initCanvas() {
        const _bodyBackground = "#111";
        const bodyCss = `
-webkit-touch-callout: none;
-webkit-tap-highlight-color: ${_bodyBackground};
-webkit-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;
background: ${_bodyBackground};
color: #888;
`;
        const canvasCss = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
`;
        const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
        document.body.style.cssText = bodyCss;
        exports.canvas = document.createElement("canvas");
        exports.canvas.width = VIDEO_WIDTH;
        exports.canvas.height = VIDEO_HEIGHT;
        exports.canvasContext = exports.canvas.getContext("2d");
        exports.canvasContext.imageSmoothingEnabled = false;
        exports.canvas.style.cssText = canvasCss + crispCss;
        document.body.appendChild(exports.canvas);
        const setSize = () => {
            const cs = 0.95;
            const wr = innerWidth / innerHeight;
            const cr = VIDEO_WIDTH / VIDEO_HEIGHT;
            const flgWh = wr < cr;
            const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
            const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
            exports.canvas.style.width = `${cw}px`;
            exports.canvas.style.height = `${ch}px`;
        };
        window.addEventListener("resize", setSize);
        setSize();
    }
    let colorStyles;
    function initColors() {
        const rgbNumbers = [
            0x222222, 0x3f51b5, 0xe91e63, 0x9c27b0, 0x4caf50, 0x03a9f4, 0xffc107,
            0xeeeeee,
        ];
        colorStyles = [];
        for (let i = COLOR_BLACK; i <= COLOR_WHITE; i++) {
            const n = rgbNumbers[i];
            const r = (n & 0xff0000) >> 16;
            const g = (n & 0xff00) >> 8;
            const b = n & 0xff;
            colorStyles.push(`rgb(${r},${g},${b})`);
        }
    }

    exports.ADDRESS_BUZZER = ADDRESS_BUZZER;
    exports.ADDRESS_COUNT = ADDRESS_COUNT;
    exports.ADDRESS_KEY = ADDRESS_KEY;
    exports.ADDRESS_VIDEO = ADDRESS_VIDEO;
    exports.BUZZER_OFF = BUZZER_OFF;
    exports.BUZZER_ON = BUZZER_ON;
    exports.COLOR_BLACK = COLOR_BLACK;
    exports.COLOR_BLUE = COLOR_BLUE;
    exports.COLOR_CYAN = COLOR_CYAN;
    exports.COLOR_GREEN = COLOR_GREEN;
    exports.COLOR_PURPLE = COLOR_PURPLE;
    exports.COLOR_RED = COLOR_RED;
    exports.COLOR_WHITE = COLOR_WHITE;
    exports.COLOR_YELLOW = COLOR_YELLOW;
    exports.KEY_DOWN = KEY_DOWN;
    exports.KEY_LEFT = KEY_LEFT;
    exports.KEY_RIGHT = KEY_RIGHT;
    exports.KEY_STATE_COUNT = KEY_STATE_COUNT;
    exports.KEY_STATE_IS_JUST_PRESSED = KEY_STATE_IS_JUST_PRESSED;
    exports.KEY_STATE_IS_JUST_RELEASED = KEY_STATE_IS_JUST_RELEASED;
    exports.KEY_STATE_IS_PRESSED = KEY_STATE_IS_PRESSED;
    exports.KEY_UP = KEY_UP;
    exports.KEY_X = KEY_X;
    exports.KEY_Z = KEY_Z;
    exports.VIDEO_HEIGHT = VIDEO_HEIGHT;
    exports.VIDEO_WIDTH = VIDEO_WIDTH;
    exports.peek = peek;
    exports.poke = poke;

})(window || {});
