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

const letterSize = { x: 3, y: 5 };
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

const COLOR_BLACK = 0;
const COLOR_BLUE = 1;
const COLOR_RED = 2;
const COLOR_PURPLE = 3;
const COLOR_GREEN = 4;
const COLOR_CYAN = 5;
const COLOR_YELLOW = 6;
const COLOR_WHITE = 7;
window.addEventListener("load", onLoad);
let textPattern;
function onLoad() {
    textPattern = setPattern(textPatternStrings);
    initColors();
    initCanvas();
    drawMemoryMap();
}
function drawMemoryMap() {
    canvasContext.fillStyle = "#118";
    canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
    canvasContext.fillStyle = colorStyles[COLOR_RED];
    print("PEEKPOKE memory map", 3, 2);
    drawLine(22, 12, 90, 12);
    drawLine(22, 135, 90, 135);
    drawLine(22, 12, 22, 135);
    drawLine(90, 12, 90, 136);
    print("0x000", 2, 11);
    print("VIDEO", 25, 15);
    print("32x30 pixels", 30, 22);
    const colorNames = [
        "BLACK",
        "BLUE",
        "RED",
        "PURPLE",
        "GREEN",
        "CYAN",
        "YELLOW",
        "WHITE",
    ];
    for (let i = 0; i < 8; i++) {
        canvasContext.fillStyle = colorStyles[i];
        print(`${i}: ${colorNames[i]}`, 100, 3 + i * 6);
    }
    canvasContext.fillStyle = colorStyles[COLOR_RED];
    drawLine(22, 53, 90, 53);
    print("0x3C0", 2, 52);
    print("TEXT", 25, 55);
    print("8x5 characters", 30, 62);
    print(`0x21:! 0x22:" ...`, 100, 56);
    print(`0x41:A 0x42:B ...`, 100, 62);
    drawLine(22, 70, 90, 70);
    print("0x3E8", 2, 69);
    print("TEXT_COLOR", 25, 72);
    print("8x5 characters", 30, 79);
    for (let i = 0; i < 8; i++) {
        canvasContext.fillStyle = colorStyles[i];
        print(`${i}`, 100 + i * 4, 74);
    }
    canvasContext.fillStyle = colorStyles[COLOR_RED];
    drawLine(22, 87, 90, 87);
    print("0x410", 2, 86);
    print("TEXT_BACKGROUND", 25, 89);
    print("8x5 characters", 30, 96);
    for (let i = 0; i < 8; i++) {
        canvasContext.fillStyle = colorStyles[i];
        canvasContext.fillRect(100 + i * 4, 91, 4, 6);
        canvasContext.fillStyle = colorStyles[COLOR_WHITE];
        print(`${i}`, 100 + i * 4, 91);
    }
    canvasContext.fillStyle = colorStyles[COLOR_RED];
    drawLine(22, 104, 90, 104);
    print("0x438", 2, 103);
    print("KEY", 25, 106);
    print("7 keys", 30, 113);
    print("1: IS PRESSED", 100, 102);
    print("2: IS JUST PRESSED", 100, 108);
    print("4: IS JUST RELEASED", 100, 114);
    drawLine(22, 119, 90, 119);
    print("0x43F", 2, 118);
    print("BUZZER", 25, 121);
    print("0:OFF N:x10Hz", 100, 121);
    drawLine(22, 127, 90, 127);
    print("0x440", 2, 126);
    print("MUTE", 25, 129);
    print("0:SOUND ON 1:MUTE", 100, 129);
}
function drawLine(x1, y1, x2, y2) {
    let ox = x2 - x1;
    let oy = y2 - y1;
    if (ox < 1) {
        canvasContext.fillRect(x1, y1, 1, oy);
        return;
    }
    if (oy < 1) {
        canvasContext.fillRect(x1, y1, ox, 1);
        return;
    }
    let l;
    if (Math.abs(ox) > Math.abs(oy)) {
        ox /= oy;
        l = Math.abs(oy);
        oy = 1;
    }
    else {
        oy /= ox;
        l = Math.abs(ox);
        ox = 1;
    }
    let x = x1;
    let y = y1;
    for (let i = 0; i < l; i++) {
        canvasContext.fillRect(Math.floor(x), Math.floor(y), Math.floor(ox), Math.floor(oy));
        x += ox;
        y += oy;
    }
}
function print(text, x, y) {
    let tx = x;
    for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i);
        if (c >= 33 && c <= 127) {
            drawText(textPattern[c - 33], tx, y);
        }
        tx += 4;
    }
}
const canvasWidth = 178;
const canvasHeight = 138;
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
background: "#118";
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
function drawText(pattern, ox, oy) {
    for (let x = 0; x < letterSize.x; x++) {
        for (let y = 0; y < letterSize.y; y++) {
            if (pattern[y][x]) {
                canvasContext.fillRect(ox + x, oy + y, 1, 1);
            }
        }
    }
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

export { COLOR_BLACK, COLOR_BLUE, COLOR_CYAN, COLOR_GREEN, COLOR_PURPLE, COLOR_RED, COLOR_WHITE, COLOR_YELLOW };
