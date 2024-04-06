const { DISPLAY_WIDTH, DISPLAY_HEIGHT } = require("../constants");

// Display: 64 x 32 pixels - Monochrome
class InMemoryDisplay {
  constructor() {
    this.clear();
  }

  clear() {
    this.screen = Array.from(Array(DISPLAY_WIDTH), () =>
      new Array(DISPLAY_HEIGHT).fill(0)
    );
  }

  get(x, y) {
    return this.screen[x][y];
  }

  set(x, y, value) {
    this.screen[x][y] = value;
  }
}

module.exports = { InMemoryDisplay };
