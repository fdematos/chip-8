const { CPU } = require("../src/CPU");

const { MEMORY_START, FONTS } = require("../src/constants");

const cpu = new CPU();

describe("CPU tests", () => {
  describe("Memory test", () => {
    test("load(romData) -  Should load Fonts at first memory bytse", () => {
      cpu.load([0x1333, 0x1fc2]);

      for (var i = 0; i < FONTS.length; i++) {
        expect(cpu.memory[i]).toBe(FONTS[i]);
      }
    });

    test("load(romData) -  Should initalize memory with rom data starting 0x200. Previous block are reserved ", () => {
      cpu.load([0x1333, 0x1fc2]);

      expect(cpu.memory[MEMORY_START]).toBe(0x13);
      expect(cpu.memory[MEMORY_START + 1]).toBe(0x33);

      expect(cpu.memory[MEMORY_START + 2]).toBe(0x1f);
      expect(cpu.memory[MEMORY_START + 3]).toBe(0xc2);
    });

    test("fetch() - Should return current opcode according to PC", () => {
      cpu.load([0x1333, 0x1fc2]);
      expect(cpu.fetch()).toBe(0x1333);
    });

    test("nextInstruction() - Move to next instruction", () => {
      cpu.load([0x1333, 0x1fc2]);
      cpu.PC = 0x202;
      cpu.nextInstruction();
      expect(cpu.PC).toBe(0x204);
    });

    test("timer() - Should do nothing if  DT and ST are equal to 0", () => {
      cpu.load([0x1333, 0x1fc2]);
      cpu.DT = 0;
      cpu.ST = 0;

      cpu.timer();
      expect(cpu.DT).toBe(0);
      expect(cpu.ST).toBe(0);
    });

    test("timer() - Should do nothing if  DT and ST are equal to 0", () => {
      cpu.load([0x1333, 0x1fc2]);
      cpu.DT = 2;
      cpu.ST = 3;

      cpu.timer();
      expect(cpu.DT).toBe(1);
      expect(cpu.ST).toBe(2);
    });
  });
});
