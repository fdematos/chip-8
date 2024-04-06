const { DISPLAY_WIDTH, DISPLAY_HEIGHT } = require("./constants");

// Display: 64 x 32 pixels - Monochrome
class Display {
  constructor() {
    this.clear();
  }

  clear() {
    this.buffer = Array.from(Array(DISPLAY_WIDTH), () =>
      new Array(DISPLAY_HEIGHT).fill(0)
    );
  }

  get(x, y) {
    return this.buffer[x][y];
  }

  set(x, y, value) {
    this.buffer[x][y] = value;
  }
}

module.exports = { Display };
