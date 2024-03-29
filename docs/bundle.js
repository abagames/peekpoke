(function (exports) {
    'use strict';

    let codeState;
    let pressingCode = {};
    let pressedCode = {};
    let releasedCode = {};
    let codeStateEntries;
    function init$4() {
        codeState = fromEntities(codes.map((c) => [
            c,
            {
                isPressed: false,
                isJustPressed: false,
                isJustReleased: false,
            },
        ]));
        codeStateEntries = entries(codeState);
        document.addEventListener("keydown", (e) => {
            pressingCode[e.code] = pressedCode[e.code] = true;
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
    function update$2() {
        codeStateEntries.forEach(([c, s]) => {
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
        "KeyM",
    ];

    let buttons;
    let pressingButtons;
    let pressedButtons;
    let releasedButtons;
    let positions;
    let screen;
    let pixelSize;
    function init$3(_screen, _pixelSize, buttonPositions) {
        buttons = buttonPositions.map((b) => ({
            x: b.x,
            y: b.y,
            size: b.size,
            touchSize: b.size * 2,
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
        document.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const touches = e.changedTouches;
            for (let i = 0; i < touches.length; i++) {
                const t = touches[i];
                onMove(t.pageX, t.pageY, t.identifier);
            }
        }, { passive: false });
        document.addEventListener("mouseup", (e) => {
            onUp("_mouse");
        });
        document.addEventListener("touchend", (e) => {
            e.preventDefault();
            const touches = e.changedTouches;
            for (let i = 0; i < touches.length; i++) {
                const t = touches[i];
                onUp(t.identifier);
            }
        }, { passive: false });
    }
    function update$1() {
        buttons.forEach((b, i) => {
            b.isJustPressed = pressedButtons[i];
            b.isJustReleased = releasedButtons[i];
            b.isPressed = pressingButtons[i];
            pressedButtons[i] = releasedButtons[i] = false;
        });
    }
    function onDown(x, y, id) {
        if (!positions.hasOwnProperty(id)) {
            const pressingButtonIds = [];
            for (let i = 0; i < buttons.length; i++) {
                pressingButtonIds.push(false);
            }
            positions[id] = { pressingButtonIds, isPressed: true };
        }
        else {
            positions[id].isPressed = true;
        }
        updateButtonState(x, y, "down", positions[id].pressingButtonIds);
    }
    function onMove(x, y, id) {
        if (!positions.hasOwnProperty(id) || !positions[id].isPressed) {
            return;
        }
        positions[id];
        updateButtonState(x, y, "move", positions[id].pressingButtonIds);
    }
    function onUp(id) {
        if (!positions.hasOwnProperty(id) || !positions[id].isPressed) {
            return;
        }
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
    function updateButtonState(x, y, type, pressingButtonIds) {
        const pp = calcPointerPos(x, y);
        buttons.forEach((b, i) => {
            if (Math.abs(pp.x - b.x + 0.5) < b.touchSize / 2 &&
                Math.abs(pp.y - b.y + 0.5) < b.touchSize / 2) {
                if (type === "down" || (type === "move" && !pressingButtonIds[i])) {
                    pressingButtons[i] = pressedButtons[i] = true;
                    pressingButtonIds[i] = true;
                }
            }
            else if (type === "move" && pressingButtonIds[i]) {
                pressingButtons[i] = false;
                releasedButtons[i] = true;
                pressingButtonIds[i] = false;
            }
        });
    }
    let pointerPos = { x: 0, y: 0 };
    function calcPointerPos(x, y) {
        if (screen == null) {
            return;
        }
        pointerPos.x = Math.round(((x - screen.offsetLeft) / screen.clientWidth + 0.5) * pixelSize.x);
        pointerPos.y = Math.round(((y - screen.offsetTop) / screen.clientHeight + 0.5) * pixelSize.y);
        return pointerPos;
    }

    let audioContext;
    let gain;
    let buzzerBuffers;
    let beepNode;
    let currentFrequency;
    function init$2() {
        // @ts-ignore
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        window.addEventListener("mousedown", resumeAudio);
        window.addEventListener("touchstart", resumeAudio);
        window.addEventListener("keydown", resumeAudio);
        gain = audioContext.createGain();
        gain.gain.value = 0.05;
        gain.connect(audioContext.destination);
        buzzerBuffers = {};
        currentFrequency = 0;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                beepOff();
            }
        });
    }
    function beepOn(frequency) {
        if (frequency === currentFrequency) {
            return;
        }
        if (currentFrequency > 0) {
            beepNode.stop();
        }
        let buffer;
        if (buzzerBuffers[frequency] == null) {
            buzzerBuffers[frequency] = createBuzzerBufferData(frequency);
        }
        buffer = buzzerBuffers[frequency];
        beepNode = new AudioBufferSourceNode(audioContext, {
            buffer,
            loop: true,
        });
        beepNode.start();
        beepNode.stop(getAudioTime() + 3);
        beepNode.connect(gain);
        currentFrequency = frequency;
    }
    function beepOff() {
        if (currentFrequency === 0) {
            return;
        }
        beepNode.stop();
        currentFrequency = 0;
    }
    function getAudioTime() {
        return audioContext.currentTime;
    }
    function resumeAudio() {
        audioContext.resume();
    }
    function createBuzzerBufferData(frequency) {
        const buffer = new AudioBuffer({
            numberOfChannels: 1,
            length: audioContext.sampleRate,
            sampleRate: audioContext.sampleRate,
        });
        const buzzerBufferData = buffer.getChannelData(0);
        for (let i = 0; i < audioContext.sampleRate; i++) {
            const vl = 0.5 +
                (Math.floor(i / (audioContext.sampleRate / 5000)) % 2 === 0 ? 0.2 : -0.2);
            let v = Math.floor(i / (audioContext.sampleRate / frequency)) % 2 === 0
                ? vl
                : -vl;
            buzzerBufferData[i] = v;
        }
        return buffer;
    }

    const size$1 = { x: 32, y: 30 };
    const pixels = [];
    const textPixels = [];
    const prevPixels = [];
    let canvasContext$1;
    let colorStyles$1;
    let screenCanvasX$1;
    let screenCanvasY$1;
    function init$1(_canvasContext, _colorStyles, _screenCanvasX, _screenCanvasY) {
        canvasContext$1 = _canvasContext;
        colorStyles$1 = _colorStyles;
        screenCanvasX$1 = _screenCanvasX;
        screenCanvasY$1 = _screenCanvasY;
        for (let x = 0; x < size$1.x; x++) {
            const l = [];
            const tl = [];
            const pl = [];
            for (let y = 0; y < size$1.y; y++) {
                l.push(0);
                tl.push(0);
                pl.push(0);
            }
            pixels.push(l);
            textPixels.push(tl);
            prevPixels.push(pl);
        }
    }
    function draw() {
        for (let x = 0; x < size$1.x; x++) {
            for (let y = 0; y < size$1.y; y++) {
                const p = textPixels[x][y] === 0 ? pixels[x][y] : textPixels[x][y];
                if (prevPixels[x][y] !== p) {
                    canvasContext$1.fillStyle = colorStyles$1[p % COLOR_COUNT];
                    canvasContext$1.fillRect(x + screenCanvasX$1, y + screenCanvasY$1, 1, 1);
                    prevPixels[x][y] = p;
                }
            }
        }
    }

    const textPatternStrings = [
        // !
        `
 l
 l
 l

 l
`,
        `
l l
l l



`,
        `
l l
lll
l l
lll
l l
`,
        `
 ll
ll
lll
 ll
ll
`,
        `
l l
  l
 l
l
l l
`,
        `
ll
ll
lll
l 
lll
`,
        `
 l
 l



`,
        `
  l
 l
 l
 l
  l
`,
        `
l
 l
 l
 l
l
`,
        `
 l
lll
 l
lll
 l
`,
        `
 l
 l
lll
 l
 l
`,
        `



 l
l
`,
        `


lll


`,
        `




 l
`,
        `
  l
 l
 l
 l
l
`,
        // 0
        `
lll
l l
l l
l l
lll
`,
        `
  l
  l
  l
  l
  1
`,
        `
lll
  l
lll
l
lll
`,
        `
lll
  l
lll
  l
lll
`,
        `
l l
l l
lll
  l
  l
`,
        `
lll
l
lll
  l
lll
`,
        `
l
l
lll
l l
lll
`,
        `
lll
  l
  l
  l
  l
`,
        `
lll
l l
lll
l l
lll
`,
        `
lll
l l
lll
  l
  l
`,
        // :
        `

 l

 l

`,
        `

 l

 l
l
`,
        `
  l
 l
l
 l
  l
`,
        `

lll

lll

`,
        `
l
 l
  l
 l
l
`,
        `
lll
  l
 ll

 l
`,
        `

lll
l l
l
 ll
`,
        // A
        `
lll
l l
lll
l l
l l
`,
        `
ll
l l
lll
l l
ll
`,
        `
lll
l
l
l
lll
`,
        `
ll
l l
l l
l l
ll
`,
        `
lll
l
lll
l
lll
`,
        `
lll
l
lll
l
l
`,
        `
lll
l
l l
l l
 ll
`,
        `
l l
l l
lll
l l
l l
`,
        `
 l
 l
 l
 l
 l
`,
        `
  l
  l
  l
  l
ll
`,
        `
l l
l l
ll
l l
l l
`,
        `
l
l
l
l
lll
`,
        `
l l
lll
l l
l l
l l
`,
        `
l l
lll
lll
lll
l l
`,
        `
lll
l l
l l
l l
lll
`,
        `
lll
l l
lll
l
l
`,
        `
lll
l l
l l
lll
lll
`,
        `
ll
l l
ll
l l
l l
`,
        `
lll
l
lll
  l
lll
`,
        `
lll
 l
 l
 l
 l
`,
        `
l l
l l
l l
l l
lll
`,
        `
l l
l l
l l
l l
 l
`,
        `
l l
l l
lll
lll
l l
`,
        `
l l
l l
 l
l l
l l
`,
        `
l l
l l
lll
 l
 l
`,
        `
lll
  l
 l
l
lll
`,
        `
 ll
 l
 l
 l
 ll
`,
        `
l
 l
 l
 l
  l
`,
        `
ll
 l
 l
 l
ll
`,
        `
 l
l l



`,
        `




lll
`,
        `
l
 l



`,
        // a
        `


 ll
l l
 ll
`,
        `

l
lll
l l
lll
`,
        `


lll
l
lll
`,
        `

  l
lll
l l
lll
`,
        `


lll
l
 ll
`,
        `

 ll
 l
lll
 l
`,
        `

lll
lll
  l
ll
`,
        `

l
l
lll
l l
`,
        `

 l

 l
 l
`,
        `

 l

 l
ll
`,
        `

l
l l
ll
l l
`,
        `

 l
 l
 l
 l
`,
        `


lll
lll
l l
`,
        `


ll
l l
l l
`,
        `


lll
l l
lll
`,
        `


lll
lll
l
`,
        `


lll
lll
  l
`,
        `


lll
l
l
`,
        `


 ll
lll
ll
`,
        `


lll
 l
 l
`,
        `


l l
l l
lll
`,
        `


l l
l l
 l
`,
        `


l l
lll
l l
`,
        `


l l
 l
l l
`,
        `


l l
 l
l
`,
        `


lll
 l
lll
`,
        //{
        `
 ll
 l
l
 l
 ll
`,
        `
 l
 l
 l
 l
 l
`,
        `
ll
 l
  l
 l
ll
`,
        `

l
lll
  l

`,
    ];
    const iconPatternStrings = [
        `
  l
l l
l l
  l

`,
    ];

    const size = { x: 8, y: 5 };
    const letterSize = { x: 3, y: 5 };
    const grid = [];
    let pattern;
    const prevGrid = [];
    function init(defaultColor) {
        pattern = setPattern(textPatternStrings);
        for (let x = 0; x < size.x; x++) {
            const l = [];
            const pl = [];
            for (let y = 0; y < size.y; y++) {
                l.push({ code: 0, color: defaultColor, background: 0 });
                pl.push({ code: 0, color: defaultColor, background: 0 });
            }
            grid.push(l);
            prevGrid.push(pl);
        }
    }
    function setPattern(patternStrings) {
        const pattern = [];
        patternStrings.forEach((tp) => {
            const p = [];
            const ls = tp.split("\n");
            for (let y = 1; y <= letterSize.y; y++) {
                const l = ls[y];
                const lp = [];
                for (let x = 0; x < letterSize.x; x++) {
                    lp.push(!(x >= l.length) && l.charAt(x) !== " ");
                }
                p.push(lp);
            }
            pattern.push(p);
        });
        return pattern;
    }
    function update() {
        for (let x = 0; x < size.x; x++) {
            for (let y = 0; y < size.y; y++) {
                const g = grid[x][y];
                const pg = prevGrid[x][y];
                if (pg.code !== g.code ||
                    pg.color !== g.color ||
                    pg.background !== g.background) {
                    drawPattern(x, y, g);
                    pg.code = g.code;
                    pg.color = g.color;
                    pg.background = g.background;
                }
            }
        }
    }
    function drawPattern(x, y, c) {
        const ox = 1 + x * (letterSize.x + 1);
        const oy = 1 + y * (letterSize.y + 1);
        for (let x = -1; x < letterSize.x; x++) {
            for (let y = -1; y < letterSize.y; y++) {
                textPixels[ox + x][oy + y] = c.background;
            }
        }
        if (c.code >= 33 && c.code <= 126) {
            const p = pattern[c.code - 33];
            for (let x = 0; x < letterSize.x; x++) {
                for (let y = 0; y < letterSize.y; y++) {
                    if (p[y][x]) {
                        textPixels[ox + x][oy + y] = c.color;
                    }
                }
            }
        }
    }

    const VIDEO_WIDTH = size$1.x;
    const VIDEO_HEIGHT = size$1.y;
    const TEXT_WIDTH = size.x;
    const TEXT_HEIGHT = size.y;
    const COLOR_BLACK = 0;
    const COLOR_BLUE = 1;
    const COLOR_RED = 2;
    const COLOR_PURPLE = 3;
    const COLOR_GREEN = 4;
    const COLOR_CYAN = 5;
    const COLOR_YELLOW = 6;
    const COLOR_WHITE = 7;
    const COLOR_COUNT$1 = 8;
    const KEY_RIGHT = 0;
    const KEY_DOWN = 1;
    const KEY_LEFT = 2;
    const KEY_UP = 3;
    const KEY_X = 4;
    const KEY_Z = 5;
    const KEY_MUTE = 6;
    const KEY_COUNT = 7;
    const KEY_STATE_IS_PRESSED = 1;
    const KEY_STATE_IS_JUST_PRESSED = 2;
    const KEY_STATE_IS_JUST_RELEASED = 4;
    const BUZZER_COUNT = 1;
    const MUTE_COUNT = 1;
    const ADDRESS_VIDEO = 0;
    const ADDRESS_TEXT = VIDEO_WIDTH * VIDEO_HEIGHT;
    const ADDRESS_TEXT_COLOR = ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT;
    const ADDRESS_TEXT_BACKGROUND = ADDRESS_TEXT_COLOR + TEXT_WIDTH * TEXT_HEIGHT;
    const ADDRESS_KEY = ADDRESS_TEXT_BACKGROUND + TEXT_WIDTH * TEXT_HEIGHT;
    const ADDRESS_BUZZER = ADDRESS_KEY + KEY_COUNT;
    const ADDRESS_MUTE = ADDRESS_BUZZER + BUZZER_COUNT;
    const ADDRESS_COUNT = ADDRESS_MUTE + MUTE_COUNT;
    /**
     * Retrieve the value at the specified address in memory.
     *
     * @param {number} address - The address to peek at.
     * @returns {number} - The value at the specified address.
     * @throws {string} - If the address is invalid.
     */
    function peek(address) {
        // Check if the address is within the valid range
        if (address < 0 || address >= ADDRESS_COUNT || !Number.isInteger(address)) {
            throw new ErrorWithStackTrace(`Invalid address: peek(${address})`);
        }
        // Return the value at the specified address
        return memory[address];
    }
    /**
     * Write a value to a memory address.
     *
     * @param address - The memory address to write to.
     * @param value - The value to write.
     * @throws {string} - If the address or value is invalid.
     */
    function poke(address, value) {
        // Check if the address is out of bounds
        if (address < 0 || address >= ADDRESS_COUNT || !Number.isInteger(address)) {
            throw new ErrorWithStackTrace(`Invalid address: poke(${address}, ${value})`);
        }
        if (value < 0 || value >= 256 || !Number.isInteger(value)) {
            throw new ErrorWithStackTrace(`Invalid value: poke(${address}, ${value})`);
        }
        // Write the value to the memory address
        memory[address] = value;
    }
    const win = window;
    win.enableSplashScreen = false;
    /**
     * Initialize PEEKPOKE with the given options.
     * @param options - The options for configuring the peekpoke functions.
     */
    function initPeekpoke(options) {
        win.setup = options.setup;
        win.loop = options.loop;
        if (options.enableSplashScreen != null) {
            win.enableSplashScreen = options.enableSplashScreen;
        }
    }
    window.addEventListener("load", onLoad);
    const memory = [];
    let iconPattern;
    let splashScreenTicks = -1;
    // Set to true to capture the screen.
    // To capture the screen, gif-capture-canvas library should be loaded in index.html.
    const isCapturingScreen = false;
    function onLoad() {
        for (let i = 0; i < ADDRESS_COUNT; i++) {
            memory.push(0);
        }
        for (let i = ADDRESS_TEXT_COLOR; i < ADDRESS_TEXT_COLOR + TEXT_WIDTH * TEXT_HEIGHT; i++) {
            memory[i] = COLOR_WHITE;
        }
        init$4();
        init$2();
        initColors();
        init(COLOR_WHITE);
        iconPattern = setPattern(iconPatternStrings);
        initCanvas();
        if (window.enableSplashScreen) {
            splashScreenTicks = 0;
        }
        else {
            setup();
        }
        requestAnimationFrame(updateFrame);
    }
    const targetFps = 68;
    const deltaTime = 1000 / targetFps;
    let nextFrameTime = 0;
    function updateFrame() {
        const requestId = requestAnimationFrame(updateFrame);
        const now = window.performance.now();
        if (now < nextFrameTime - targetFps / 12) {
            return;
        }
        nextFrameTime += deltaTime;
        if (nextFrameTime < now || nextFrameTime > now + deltaTime * 2) {
            nextFrameTime = now + deltaTime;
        }
        try {
            update$2();
            update$1();
            updateKeyboardMemory();
            drawButtons();
            if (splashScreenTicks >= 0) {
                loopSplashScreen();
            }
            else {
                loop();
            }
            updateVideo();
            updateText();
            update();
            draw();
            updateBuzzer();
            if (isCapturingScreen) ;
        }
        catch (e) {
            cancelAnimationFrame(requestId);
            console.error(e);
        }
    }
    const title = "PEEKPOKE";
    const splashScreenBuzzerSequence = [
        [100, 80],
        [0, 85],
        [200, 88],
        [0, 93],
        [0, 9999],
    ];
    let splashScreenBuzzerSequenceIndex = 0;
    function loopSplashScreen() {
        if (splashScreenTicks ===
            splashScreenBuzzerSequence[splashScreenBuzzerSequenceIndex][1]) {
            memory[ADDRESS_BUZZER] =
                splashScreenBuzzerSequence[splashScreenBuzzerSequenceIndex][0];
            splashScreenBuzzerSequenceIndex++;
        }
        if (splashScreenTicks < 80) {
            const sequence = Math.floor(splashScreenTicks / 40);
            for (let i = 0; i < 3; i++) {
                const tx = Math.floor(Math.random() * TEXT_WIDTH);
                const ty = Math.floor(Math.random() * TEXT_HEIGHT);
                let v;
                if (sequence === 0) {
                    const n = Math.floor(Math.random() * 16);
                    v = n < 10 ? "0".charCodeAt(0) + n : "A".charCodeAt(0) + (n - 10);
                }
                else {
                    v = ty === 2 ? title.charCodeAt(tx) : 0;
                }
                pokeSplashScreenVideo(tx, ty, v, v);
            }
        }
        if (splashScreenTicks === 80) {
            for (let tx = 0; tx < TEXT_WIDTH; tx++) {
                for (let ty = 0; ty < TEXT_HEIGHT; ty++) {
                    const v = ty === 2 ? title.charCodeAt(tx) : 0;
                    pokeSplashScreenVideo(tx, ty, v, 0);
                }
            }
        }
        if (splashScreenTicks === 160 ||
            peek(ADDRESS_KEY + KEY_X) & KEY_STATE_IS_JUST_PRESSED) {
            splashScreenTicks = -1;
            for (let i = ADDRESS_VIDEO; i < ADDRESS_TEXT + TEXT_WIDTH * TEXT_HEIGHT; i++) {
                memory[i] = 0;
            }
            memory[ADDRESS_BUZZER] = 0;
            setup();
            return;
        }
        splashScreenTicks++;
    }
    function pokeSplashScreenVideo(x, y, tv, vv) {
        memory[ADDRESS_TEXT + x + y * TEXT_WIDTH] = tv;
        for (let sx = 0; sx < VIDEO_WIDTH / TEXT_WIDTH; sx++) {
            const vx = x + sx * TEXT_WIDTH;
            for (let sy = 0; sy < VIDEO_HEIGHT / TEXT_HEIGHT; sy++) {
                const vy = y + sy * TEXT_HEIGHT;
                memory[ADDRESS_VIDEO + vx + vy * VIDEO_WIDTH] = vv;
            }
        }
    }
    const keyCodes = [
        ["ArrowRight", "KeyD"],
        ["ArrowDown", "KeyS"],
        ["ArrowLeft", "KeyA"],
        ["ArrowUp", "KeyW"],
        ["KeyX", "Slash", "Space"],
        ["KeyZ", "Period"],
        ["KeyM"],
    ];
    function updateKeyboardMemory() {
        for (let i = 0; i < KEY_COUNT; i++) {
            let k = 0;
            keyCodes[i].forEach((c) => {
                if (codeState[c].isPressed) {
                    k |= KEY_STATE_IS_PRESSED;
                }
                if (codeState[c].isJustPressed) {
                    k |= KEY_STATE_IS_JUST_PRESSED;
                }
                if (codeState[c].isJustReleased) {
                    k |= KEY_STATE_IS_JUST_RELEASED;
                }
            });
            if (buttons[i].isPressed) {
                k |= KEY_STATE_IS_PRESSED;
            }
            if (buttons[i].isJustPressed) {
                k |= KEY_STATE_IS_JUST_PRESSED;
            }
            if (buttons[i].isJustReleased) {
                k |= KEY_STATE_IS_JUST_RELEASED;
            }
            memory[ADDRESS_KEY + i] = k;
            buttons[i].isShowingPressed = (k & KEY_STATE_IS_PRESSED) > 0;
        }
        if ((memory[ADDRESS_KEY + KEY_MUTE] & KEY_STATE_IS_JUST_PRESSED) > 0) {
            memory[ADDRESS_MUTE] = memory[ADDRESS_MUTE] === 0 ? 1 : 0;
            drawBuzzerIcon();
        }
    }
    function updateVideo() {
        let x = 0;
        let y = 0;
        for (let i = ADDRESS_VIDEO; i < ADDRESS_VIDEO + VIDEO_WIDTH * VIDEO_HEIGHT; i++) {
            pixels[x][y] = memory[i];
            x++;
            if (x >= VIDEO_WIDTH) {
                x = 0;
                y++;
            }
        }
    }
    function updateText() {
        let x = 0;
        let y = 0;
        for (let i = 0; i < TEXT_WIDTH * TEXT_HEIGHT; i++) {
            const tg = grid[x][y];
            tg.code = memory[ADDRESS_TEXT + i];
            tg.color = memory[ADDRESS_TEXT_COLOR + i];
            tg.background = memory[ADDRESS_TEXT_BACKGROUND + i];
            x++;
            if (x >= TEXT_WIDTH) {
                x = 0;
                y++;
            }
        }
    }
    function updateBuzzer() {
        if (memory[ADDRESS_BUZZER] > 0 && memory[ADDRESS_MUTE] === 0) {
            beepOn(memory[ADDRESS_BUZZER] * 10);
        }
        else {
            beepOff();
        }
    }
    const canvasWidth = 48;
    const canvasHeight = 80;
    const screenCanvasX = Math.floor((canvasWidth - VIDEO_WIDTH) / 2);
    const screenCanvasY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 2);
    let canvas;
    let canvasContext;
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
background: ${colorStyles[COLOR_CYAN]};
`;
        const crispCss = `
image-rendering: -moz-crisp-edges;
image-rendering: -webkit-optimize-contrast;
image-rendering: -o-crisp-edges;
image-rendering: pixelated;
`;
        document.body.style.cssText = bodyCss;
        canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvasContext = canvas.getContext("2d");
        canvasContext.imageSmoothingEnabled = false;
        canvas.style.cssText = canvasCss + crispCss;
        canvasContext.fillStyle = colorStyles[COLOR_CYAN];
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        const videoBezelX = Math.floor((canvasWidth - VIDEO_WIDTH) / 4);
        const videoBezelY = Math.floor((canvasHeight / 2 - VIDEO_HEIGHT) / 5);
        canvasContext.fillStyle = colorStyles[COLOR_YELLOW];
        canvasContext.fillRect(screenCanvasX - videoBezelX, screenCanvasY - videoBezelY, VIDEO_WIDTH + videoBezelX * 2, VIDEO_HEIGHT + videoBezelY * 2);
        canvasContext.fillStyle = colorStyles[COLOR_BLACK];
        canvasContext.fillRect(screenCanvasX, screenCanvasY, VIDEO_WIDTH, VIDEO_HEIGHT);
        init$1(canvasContext, colorStyles, screenCanvasX, screenCanvasY);
        initButtons();
        canvasContext.fillStyle = colorStyles[COLOR_BLUE];
        drawText(pattern["X".charCodeAt(0) - 33], Math.floor(canvasWidth * 0.87), Math.floor(canvasHeight * 0.8));
        drawText(pattern["Z".charCodeAt(0) - 33], Math.floor(canvasWidth * 0.65), Math.floor(canvasHeight * 0.9));
        drawBuzzerIcon();
        const setSize = () => {
            const cs = 0.95;
            const wr = innerWidth / innerHeight;
            const cr = canvasWidth / canvasHeight;
            const flgWh = wr < cr;
            const cw = flgWh ? cs * innerWidth : cs * innerHeight * cr;
            const ch = !flgWh ? cs * innerHeight : (cs * innerWidth) / cr;
            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
        };
        window.addEventListener("resize", setSize);
        setSize();
        document.body.appendChild(canvas);
    }
    function initButtons() {
        const size = Math.floor(canvasWidth * 0.15);
        const arrowButtonX = Math.floor(canvasWidth * 0.3);
        const arrowButtonY = Math.floor(canvasHeight * 0.7);
        const buttonPositions = [
            {
                x: arrowButtonX + Math.floor(size * 1.2),
                y: arrowButtonY,
                size,
            },
            {
                x: arrowButtonX,
                y: arrowButtonY + Math.floor(size * 1.2),
                size,
            },
            {
                x: arrowButtonX - Math.floor(size * 1.2),
                y: arrowButtonY,
                size,
            },
            {
                x: arrowButtonX,
                y: arrowButtonY - Math.floor(size * 1.2),
                size,
            },
            {
                x: Math.floor(canvasWidth * 0.9),
                y: Math.floor(canvasHeight * 0.75),
                size,
            },
            {
                x: Math.floor(canvasWidth * 0.7),
                y: Math.floor(canvasHeight * 0.85),
                size,
            },
            {
                x: Math.floor(canvasWidth * 0.75),
                y: Math.floor(canvasHeight * 0.55),
                size: Math.floor(size * 0.66),
            },
        ];
        init$3(canvas, { x: canvasWidth, y: canvasHeight }, buttonPositions);
        drawButtons();
    }
    function drawButtons() {
        buttons.forEach((b) => {
            canvasContext.fillStyle =
                colorStyles[b.isShowingPressed ? COLOR_BLUE : COLOR_BLACK];
            const x = Math.floor(b.x - b.size / 2);
            const y = Math.floor(b.y - b.size / 2);
            canvasContext.fillRect(x, y, b.size, b.size);
            if (!b.isShowingPressed) {
                canvasContext.fillStyle = colorStyles[COLOR_WHITE];
                canvasContext.fillRect(x + 1, y + 1, 2, 1);
                canvasContext.fillRect(x + 1, y + 2, 1, 1);
            }
        });
    }
    function drawText(pattern, ox, oy) {
        for (let x = 0; x < letterSize.x; x++) {
            for (let y = 0; y < letterSize.y; y++) {
                if (pattern[y][x]) {
                    canvasContext.fillRect(ox + x, oy + y, 1, 1);
                }
            }
        }
    }
    function drawBuzzerIcon() {
        canvasContext.fillStyle =
            colorStyles[memory[ADDRESS_MUTE] === 0 ? COLOR_RED : COLOR_BLACK];
        drawText(iconPattern[0], Math.floor(canvasWidth * 0.85), Math.floor(canvasHeight * 0.53));
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
    class ErrorWithStackTrace extends Error {
        constructor(message) {
            super(message);
            this.name = "Error";
            const er = Error;
            if (er.captureStackTrace) {
                er.captureStackTrace(this, this.constructor);
            }
        }
    }
    // Capture the screen with gif-capture-canvas.
    let capturingCanvas;
    let capturingCanvasContext;
    const capturingCanvasOffset = { x: 0, y: screenCanvasY - 2 };
    const capturingCanvasSize = { x: canvasWidth, y: VIDEO_HEIGHT + 2 * 2 };
    function captureScreen() {
        capturingCanvasContext.drawImage(canvas, capturingCanvasOffset.x, capturingCanvasOffset.y, capturingCanvasSize.x, capturingCanvasSize.y, 0, 0, capturingCanvasSize.x, capturingCanvasSize.y);
        window.gcc.capture(capturingCanvas);
    }

    exports.ADDRESS_BUZZER = ADDRESS_BUZZER;
    exports.ADDRESS_COUNT = ADDRESS_COUNT;
    exports.ADDRESS_KEY = ADDRESS_KEY;
    exports.ADDRESS_MUTE = ADDRESS_MUTE;
    exports.ADDRESS_TEXT = ADDRESS_TEXT;
    exports.ADDRESS_TEXT_BACKGROUND = ADDRESS_TEXT_BACKGROUND;
    exports.ADDRESS_TEXT_COLOR = ADDRESS_TEXT_COLOR;
    exports.ADDRESS_VIDEO = ADDRESS_VIDEO;
    exports.BUZZER_COUNT = BUZZER_COUNT;
    exports.COLOR_BLACK = COLOR_BLACK;
    exports.COLOR_BLUE = COLOR_BLUE;
    exports.COLOR_COUNT = COLOR_COUNT$1;
    exports.COLOR_CYAN = COLOR_CYAN;
    exports.COLOR_GREEN = COLOR_GREEN;
    exports.COLOR_PURPLE = COLOR_PURPLE;
    exports.COLOR_RED = COLOR_RED;
    exports.COLOR_WHITE = COLOR_WHITE;
    exports.COLOR_YELLOW = COLOR_YELLOW;
    exports.KEY_COUNT = KEY_COUNT;
    exports.KEY_DOWN = KEY_DOWN;
    exports.KEY_LEFT = KEY_LEFT;
    exports.KEY_MUTE = KEY_MUTE;
    exports.KEY_RIGHT = KEY_RIGHT;
    exports.KEY_STATE_IS_JUST_PRESSED = KEY_STATE_IS_JUST_PRESSED;
    exports.KEY_STATE_IS_JUST_RELEASED = KEY_STATE_IS_JUST_RELEASED;
    exports.KEY_STATE_IS_PRESSED = KEY_STATE_IS_PRESSED;
    exports.KEY_UP = KEY_UP;
    exports.KEY_X = KEY_X;
    exports.KEY_Z = KEY_Z;
    exports.MUTE_COUNT = MUTE_COUNT;
    exports.TEXT_HEIGHT = TEXT_HEIGHT;
    exports.TEXT_WIDTH = TEXT_WIDTH;
    exports.VIDEO_HEIGHT = VIDEO_HEIGHT;
    exports.VIDEO_WIDTH = VIDEO_WIDTH;
    exports.initPeekpoke = initPeekpoke;
    exports.peek = peek;
    exports.poke = poke;

})(window || {});
