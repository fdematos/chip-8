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
}

module.exports = { InMemoryDisplay };
