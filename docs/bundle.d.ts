declare const VIDEO_WIDTH: number;
declare const VIDEO_HEIGHT: number;
declare const TEXT_WIDTH: number;
declare const TEXT_HEIGHT: number;
declare const COLOR_BLACK: number;
declare const COLOR_BLUE: number;
declare const COLOR_RED: number;
declare const COLOR_PURPLE: number;
declare const COLOR_GREEN: number;
declare const COLOR_CYAN: number;
declare const COLOR_YELLOW: number;
declare const COLOR_WHITE: number;
declare const COLOR_COUNT: number;
declare const KEY_RIGHT: number;
declare const KEY_DOWN: number;
declare const KEY_LEFT: number;
declare const KEY_UP: number;
declare const KEY_X: number;
declare const KEY_Z: number;
declare const KEY_MUTE: number;
declare const KEY_COUNT: number;
declare const KEY_STATE_IS_PRESSED: number;
declare const KEY_STATE_IS_JUST_PRESSED: number;
declare const KEY_STATE_IS_JUST_RELEASED: number;
declare const BUZZER_COUNT: number;
declare const MUTE_COUNT: number;
declare const ADDRESS_VIDEO: number;
declare const ADDRESS_TEXT: number;
declare const ADDRESS_TEXT_COLOR: number;
declare const ADDRESS_TEXT_BACKGROUND: number;
declare const ADDRESS_KEY: number;
declare const ADDRESS_BUZZER: number;
declare const ADDRESS_MUTE: number;
declare const ADDRESS_COUNT: number;

// Set enableSplashScreen to true to enable the splash screen.
declare let enableSplashScreen: boolean;

/**
 * Retrieve the value at the specified address in memory.
 *
 * @param {number} address - The address to peek at.
 * @returns {number} - The value at the specified address.
 * @throws {string} - If the address is invalid.
 */
declare function peek(address: number): number;
/**
 * Write a value to a memory address.
 *
 * @param address - The memory address to write to.
 * @param value - The value to write.
 * @throws {string} - If the address is invalid.
 */
declare function poke(address: number, value: number): void;

declare function setup(): void;
declare function loop(): void;
