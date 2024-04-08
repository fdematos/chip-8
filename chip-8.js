const blessed = require("blessed");

const { CPU } = require("./src/CPU");
const rom = require("./src/rom");
const { DISPLAY_WIDTH, DISPLAY_HEIGHT, KEY_MAP } = require("./src/constants");

const screen = blessed.screen({ smartCSR: true });
screen.title = "Chip8.js";
color = blessed.helpers.attrToBinary({ fg: "#33ff66" });

const romData = rom.loadFromFile("./roms/games/Breakout.ch8");

const cpu = new CPU();

screen.key(["escape", "C-c"], () => {
  process.exit(0);
});

screen.on("keypress", (_, key) => {
  manageKeyboard(cpu, key);
});

cpu.load(romData);

function manageKeyboard(cpu, key) {
  const keyIndex = KEY_MAP.indexOf(key.full);
  if (keyIndex > -1) {
    cpu.keyPressed = keyIndex;
  }
}

function display(cpu) {
  screen.clearRegion(0, DISPLAY_WIDTH, 0, DISPLAY_HEIGHT);
  for (var x = 0; x < DISPLAY_WIDTH; x++) {
    for (var y = 0; y < DISPLAY_HEIGHT; y++) {
      const pixel = cpu.getPixel(x, y);
      if (pixel == 1) {
        screen.fillRegion(color, "█", x, x + 1, y, y + 1);
      } else {
        screen.clearRegion(x, x + 1, y, y + 1);
      }
      screen.render();
    }
  }
}

function loop() {
  cpu.timer();
  cpu.process();
  display(cpu);

  setTimeout(loop, 1);
}

loop();
