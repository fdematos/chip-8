const { CPU } = require("../src/cpu/CPU");
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

    test("fetch() - Should return current opcode according to PC", () => {
      cpu.load({ data: [0x1333, 0x1fc2] });
      expect(cpu.fetch()).toBe(0x1333);
    });

    test("nextInstruction() - Move to next instruction", () => {
      cpu.load({ data: [0x1333, 0x1fc2] });
      cpu.PC = 0x202;
      cpu.nextInstruction();
      expect(cpu.PC).toBe(0x204);
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
    const PCCall = cpu.PC;
    cpu.step();

    for (var i = 0; i < DISPLAY_WIDTH; i++) {
      for (var j = 0; j < DISPLAY_HEIGHT; j++) {
        expect(cpu.display.screen[i][j]).toBe(0);
      }
    }

    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("SET TO Vx (0x6XNN)- Should set value to vx", () => {
    cpu.load({ data: [0x6a3f] });
    const PCCall = cpu.PC;
    cpu.step();

    expect(cpu.V[0xa]).toBe(0x3f);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("ADD TO Vx (0x7XNN)- Should set value to vx", () => {
    cpu.load({ data: [0x7a31] });
    cpu.V[0xa] = 0x2;
    const PCCall = cpu.PC;
    cpu.step();

    expect(cpu.V[0xa]).toBe(0x33);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("SET REGISTER INDEX (Annn) - I should equals to address in argument", () => {
    cpu.load({ data: [0xa333] });
    const PCCall = cpu.PC;
    cpu.step();

    expect(cpu.I).toBe(0x333);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("DRAW AT - Should display a n byte sprite at coordinates in register x, register y with no collision", () => {
    cpu.load({ data: [0xd123] });
    const PCCall = cpu.PC;
    cpu.V[0x1] = 0;
    cpu.V[0x2] = 0;

    cpu.memory[0x300] = 0xff;
    cpu.memory[0x301] = 0xff;
    cpu.memory[0x302] = 0xff;

    cpu.I = 0x300;

    cpu.step();

    // Check the display buffer for the first 3 rows
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 3; y++) {
        expect(cpu.display.get(x, y)).toBe(1);
      }
    }

    expect(cpu.V[0xf]).toBe(0);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("DRAW AT - Should display a n byte sprite at coordinates in register x, register y with collision", () => {
    cpu.load({ data: [0xd123] });
    const PCCall = cpu.PC;
    cpu.V[0x1] = 0;
    cpu.V[0x2] = 0;

    cpu.memory[0x300] = 0xff;
    cpu.memory[0x301] = 0xff;
    cpu.memory[0x302] = 0xff;

    cpu.I = 0x300;

    // create collision
    cpu.display.set(0, 2, 1);

    cpu.step();

    // Check the display buffer for the first 3 rows
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 3; y++) {
        if (x == 0 && y == 2) {
          expect(cpu.display.get(x, y)).toBe(0);
        } else {
          expect(cpu.display.get(x, y)).toBe(1);
        }
      }
    }

    expect(cpu.V[0xf]).toBe(1);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("DRAW AT - Should throw error if I + sizeInMemory > 4095", () => {
    cpu.load({ data: [0xd123] });
    cpu.I = 0xffd;

    expect(() => {
      cpu.step();
    }).toThrow(new Error("Memory Overflow"));
  });
});
