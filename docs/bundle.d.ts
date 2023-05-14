declare let memory: number[];
declare let collision: any[];
declare let canvas: HTMLCanvasElement;
declare let canvasContext: CanvasRenderingContext2D;
declare let audioContext: AudioContext;

declare const ADDRESS_VIDEO = 0;
declare const ADDRESS_KEY = 3072;
declare const ADDRESS_BUZZER = 3090;
declare const ADDRESS_COUNT = 3091;
declare const VIDEO_WIDTH = 64;
declare const VIDEO_HEIGHT = 48;
declare const COLOR_BLACK = 0;
declare const COLOR_BLUE = 1;
declare const COLOR_RED = 2;
declare const COLOR_PURPLE = 3;
declare const COLOR_GREEN = 4;
declare const COLOR_CYAN = 5;
declare const COLOR_YELLOW = 6;
declare const COLOR_WHITE = 7;
declare const KEY_UP = 0;
declare const KEY_LEFT = 1;
declare const KEY_DOWN = 2;
declare const KEY_RIGHT = 3;
declare const KEY_X = 4;
declare const KEY_Z = 5;
declare const KEY_STATE_IS_PRESSED = 0;
declare const KEY_STATE_IS_JUST_PRESSED = 1;
declare const KEY_STATE_IS_JUST_RELEASED = 2;
declare const KEY_STATE_COUNT = 3;
declare const BUZZER_OFF = 0;
declare const BUZZER_ON = 1;

declare function setup(): void;
declare function loop(): void;

declare function poke(address: number, value: number): void;
declare function peek(address: number): number;
