const blessed = require("blessed");

const { CPU } = require("./src/CPU");
const rom = require("./src/rom");
const { DISPLAY_WIDTH, DISPLAY_HEIGHT } = require("./src/constants");

const screen = blessed.screen({ smartCSR: true });
screen.title = "Chip8.js";
color = blessed.helpers.attrToBinary({ fg: "#33ff66" });

const romData = rom.loadFromFile("./roms/IBMLogo.ch8");

const cpu = new CPU();
cpu.load(romData);

function loop() {
  screen.clearRegion(0, DISPLAY_WIDTH, 0, DISPLAY_HEIGHT);
  cpu.process();

  for (var x = 0; x < DISPLAY_WIDTH; x++) {
    for (var y = 0; y < DISPLAY_HEIGHT; y++) {
      const pixel = cpu.display.get(x, y);
      if (pixel == 1) {
        screen.fillRegion(color, "█", x, x + 1, y, y + 1);
      } else {
        screen.clearRegion(x, x + 1, y, y + 1);
      }
      screen.render();
    }
  }

  setTimeout(loop, 3);
}

loop();
