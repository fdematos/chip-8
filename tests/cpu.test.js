const { CPU } = require("../src/cpu");
const { InMemoryDisplay } = require("../src/display/InMemoryDisplay");
const {
  MEMORY_START,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
} = require("../src/constants");

const display = new InMemoryDisplay();
const cpu = new CPU(display);

describe("CPU tests", () => {
  describe("Memory test", () => {
    test("load({data}) -  Should initalize memory with rom data", () => {
      cpu.load({ data: [0x1333, 0x1fc2] });

      for (var i = 0; i < MEMORY_START; i++) {
        expect(cpu.memory[i]).toBe(0);
      }
      expect(cpu.memory[MEMORY_START]).toBe(0x13);
      expect(cpu.memory[MEMORY_START + 1]).toBe(0x33);

      expect(cpu.memory[MEMORY_START + 2]).toBe(0x1f);
      expect(cpu.memory[MEMORY_START + 3]).toBe(0xc2);
    });

    test("opcode() - Should return current opcode according to PC", () => {
      cpu.load({ data: [0x1333, 0x1fc2] });
      expect(cpu.opCode()).toBe(0x1333);
    });
  });

  describe("OP Codes tests", () => {
    test("JUMP (1nnn) - PC should equals to address in argument", () => {
      cpu.load({ data: [0x1333] });
      cpu.step();

      expect(cpu.PC).toBe(0x333);
    });

    test("CALL SUBROUTINE (2nnn) - SP increment, PC should equals to address in argument", () => {
      cpu.load({ data: [0x2123] });
      const PCCall = cpu.PC;
      cpu.step();

      expect(cpu.SP).toBe(0);
      // Actual PC point to CALL. We store the next instruction to execute in return of the call so PC + 2 (opcode is 2 bytes long in memory)
      expect(cpu.stack[cpu.SP]).toBe(PCCall + 2);
      expect(cpu.PC).toBe(0x123);
    });

    test("CALL SUBROUTINE (2nnn) - SP is already 15 throw stack overflow", () => {
      cpu.load({ data: [0x2123] });
      cpu.SP = 15;

      expect(() => {
        cpu.step();
      }).toThrow(new Error("Stack Overflow"));
    });

    test("RETURN (00ee) - PC is set to stack pointer value, SP is decremented", () => {
      cpu.load({ data: [0x00ee] });
      cpu.SP = 1;
      cpu.stack[0x1] = 0x9;

      cpu.step();

      expect(cpu.PC).toBe(0x9);
      expect(cpu.SP).toBe(0);
    });

    test("RETURN (00ee) - SP at -1 throw stack underflow", () => {
      cpu.load({ data: [0x00ee] });
      cpu.SP = -1;

      expect(() => {
        cpu.step();
      }).toThrow(new Error("Stack Underflow"));
    });
  });

  test("CLEAR SCREEN (00e0) - Should clear screen", () => {
    cpu.load({ data: [0x00e0] });
    cpu.display.screen[0][0] = 1;
    cpu.step();

    for (var i = 0; i < DISPLAY_WIDTH; i++) {
      for (var j = 0; j < DISPLAY_HEIGHT; j++) {
        expect(cpu.display.screen[i][j]).toBe(0);
      }
    }
  });
});
