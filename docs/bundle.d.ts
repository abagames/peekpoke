declare let memory: number[];
declare let canvas: HTMLCanvasElement;
declare let canvasContext: CanvasRenderingContext2D;
declare let audioContext: AudioContext;

declare const ADDRESS_VIDEO: number;
declare const ADDRESS_KEY: number;
declare const ADDRESS_BUZZER: number;
declare const ADDRESS_COUNT: number;
declare const VIDEO_WIDTH: number;
declare const VIDEO_HEIGHT: number;
declare const COLOR_BLACK: number;
declare const COLOR_BLUE: number;
declare const COLOR_RED: number;
declare const COLOR_PURPLE: number;
declare const COLOR_GREEN: number;
declare const COLOR_CYAN: number;
declare const COLOR_YELLOW: number;
declare const COLOR_WHITE: number;
declare const KEY_RIGHT: number;
declare const KEY_DOWN: number;
declare const KEY_LEFT: number;
declare const KEY_UP: number;
declare const KEY_X: number;
declare const KEY_Z: number;
declare const KEY_STATE_IS_PRESSED: number;
declare const KEY_STATE_IS_JUST_PRESSED: number;
declare const KEY_STATE_IS_JUST_RELEASED: number;
declare const BUZZER_FREQUENCY_MIN: number;
declare const BUZZER_FREQUENCY_MAX: number;

declare function setup(): void;
declare function loop(): void;

declare function poke(address: number, value: number): void;
declare function peek(address: number): number;
