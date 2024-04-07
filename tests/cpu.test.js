const { CPU } = require("../src/CPU");

const {
  MEMORY_START,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
  FONTS,
} = require("../src/constants");

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
  });

  describe("OP Codes tests", () => {
    test("1NNN - JUMP - PC should equals to address in argument", () => {
      cpu.load([0x1333]);
      cpu.process();

      expect(cpu.PC).toBe(0x333);
    });

    test("2NNN - CALL SUBROUTINE - SP increment, PC should equals to address in argument", () => {
      cpu.load([0x2123]);
      const PCCall = cpu.PC;
      cpu.process();

      expect(cpu.SP).toBe(0);
      // Actual PC point to CALL. We store the next instruction to execute in return of the call so PC + 2 (opcode is 2 bytes long in memory)
      expect(cpu.stack[cpu.SP]).toBe(PCCall + 2);
      expect(cpu.PC).toBe(0x123);
    });

    test("2NNN - CALL SUBROUTINE - SP is already 15 throw stack overflow", () => {
      cpu.load([0x2123]);
      cpu.SP = 15;

      expect(() => {
        cpu.process();
      }).toThrow(new Error("Stack Overflow"));
    });

    test("00EE - RETURN - PC is set to stack pointer value, SP is decremented", () => {
      cpu.load([0x00ee]);
      cpu.SP = 1;
      cpu.stack[0x1] = 0x9;

      cpu.process();

      expect(cpu.PC).toBe(0x9);
      expect(cpu.SP).toBe(0);
    });

    test("00EE - RETURN - SP at -1 throw stack underflow", () => {
      cpu.load([0x00ee]);
      cpu.SP = -1;

      expect(() => {
        cpu.process();
      }).toThrow(new Error("Stack Underflow"));
    });

    test("00E0 - CLEAR SCREEN - Should clear screen", () => {
      cpu.load([0x00e0]);
      cpu.setPixel(0, 0, 1);
      const PCCall = cpu.PC;
      cpu.process();

      for (var x = 0; x < DISPLAY_WIDTH; x++) {
        for (var y = 0; y < DISPLAY_HEIGHT; y++) {
          expect(cpu.getPixel(x, y)).toBe(0);
        }
      }

      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("3XNN - IF EQUALS - Should skip the next instruction, Vx equals NN", () => {
      cpu.load([0x3a12]);
      cpu.V[0xa] = 0x12;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 4);
    });

    test("3XNN - IF EQUALS - Should do nothing, Vx not equals NN", () => {
      cpu.load([0x3a12]);
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("4XNN - IF NOT EQUALS- Should skip the next instruction, Vx not equals NN", () => {
      cpu.load([0x4a12]);
      cpu.V[0xa] = 0x12;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("4XNN - IF NOT EQUALS - Should do nothing, Vx equals NN", () => {
      cpu.load([0x4a12]);
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 4);
    });

    test("5XY0 - IF VX EQUALS VY - Should skip the next instruction, Vx equals Vy", () => {
      cpu.load([0x5a10]);
      cpu.V[0xa] = 0x12;
      cpu.V[0x1] = 0x12;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 4);
    });

    test("5XY0 - IF VX EQUALS VY - Should not skip the next instruction, Vx not equals Vy", () => {
      cpu.load([0x5a10]);
      cpu.V[0xa] = 0x12;
      cpu.V[0x1] = 0x13;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("6XNN - SET TO Vx - Should set value to vx", () => {
      cpu.load([0x6a3f]);
      const PCCall = cpu.PC;
      cpu.process();

      expect(cpu.V[0xa]).toBe(0x3f);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("7XNN - ADD TO Vx - Should set value to vx", () => {
      cpu.load([0x7a31]);
      cpu.V[0xa] = 0x2;
      const PCCall = cpu.PC;
      cpu.process();

      expect(cpu.V[0xa]).toBe(0x33);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY0 - VX = VY - Should assign VY to VX", () => {
      cpu.load([0x8a10]);
      cpu.V[0xa] = 0x12;
      cpu.V[0x1] = 0x13;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x13);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY1 - VX |= VY - Should assign VX to VX bitwise OR VY", () => {
      cpu.load([0x8a11]);
      cpu.V[0xa] = 0x12;
      cpu.V[0x1] = 0x13;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x12 | 0x13);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY2 - VX &= VY - Should assign VX to VX bitwise AND VY", () => {
      cpu.load([0x8a12]);
      cpu.V[0xa] = 0x2;
      cpu.V[0x1] = 0x0;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x2 & 0x0);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY3 - VX &= VY - Should assign VX to with VX bitwise XOR VY", () => {
      cpu.load([0x8a13]);
      cpu.V[0xa] = 0x3;
      cpu.V[0x1] = 0x3;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x3 ^ 0x3);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY4 - VX = VX + VY - Should assign VX to VX + VY and VF to 0 because result <= 255", () => {
      cpu.load([0x8a14]);
      cpu.V[0xa] = 0x3;
      cpu.V[0x1] = 0x3;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x3 + 0x3);
      expect(cpu.V[0xf]).toBe(0x0);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY4 - VX = VX + VY - Should assign VX TO VX + VY and VF to 1 because result > 255", () => {
      cpu.load([0x8a14]);
      cpu.V[0xa] = 0xff;
      cpu.V[0x1] = 0xff;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0xfe);
      expect(cpu.V[0xf]).toBe(0x1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY5 - VX = VX - VY - Should assign VX to VX - VY and VF to 1 because VX >= VY  ", () => {
      cpu.load([0x8a15]);
      cpu.V[0xa] = 0x3;
      cpu.V[0x1] = 0x3;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x0);
      expect(cpu.V[0xf]).toBe(0x1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY5 - VX = VX - VY - Should assign VX to VX - VY and VF to 0 because VX < VY  ", () => {
      cpu.load([0x8a15]);
      cpu.V[0xa] = 0x2;
      cpu.V[0x1] = 0x3;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0xff);
      expect(cpu.V[0xf]).toBe(0x0);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY6 - SHIFT VX RIGHT - Divide VX by 2 - Put shifted bit to VF  ", () => {
      cpu.load([0x8a16]);
      cpu.V[0xa] = 0x5;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x2);
      expect(cpu.V[0xf]).toBe(0x1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY7 - VX = VY - VX - Should assign VX to VY - VX and VF to 1 because VY >= VX  ", () => {
      cpu.load([0x8a17]);
      cpu.V[0xa] = 0x3;
      cpu.V[0x1] = 0x3;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0x0);
      expect(cpu.V[0xf]).toBe(0x1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XY7 - VX = VY - VX - Should assign VX to VY - VX and VF to 1 because VY < VX  ", () => {
      cpu.load([0x8a17]);
      cpu.V[0xa] = 0x3;
      cpu.V[0x1] = 0x2;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0xff);
      expect(cpu.V[0xf]).toBe(0x0);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("8XYE - SHIFT VX LEFT - Multiply VX by 2 - Put shifted bit to VF  ", () => {
      cpu.load([0x8a1e]);
      cpu.V[0xa] = 0xff;
      const PCCall = cpu.PC;

      cpu.process();
      expect(cpu.V[0xa]).toBe(0xfe);
      expect(cpu.V[0xf]).toBe(0x1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("ANNN - SET REGISTER INDEX - I should equals to address in argument", () => {
      cpu.load([0xa333]);
      const PCCall = cpu.PC;
      cpu.process();

      expect(cpu.I).toBe(0x333);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("DXYN - DRAW AT - Should display a n byte sprite at coordinates in register x, register y with no collision", () => {
      cpu.load([0xd123]);
      const PCCall = cpu.PC;
      cpu.V[0x1] = 0;
      cpu.V[0x2] = 0;

      cpu.memory[0x300] = 0xff;
      cpu.memory[0x301] = 0xff;
      cpu.memory[0x302] = 0xff;

      cpu.I = 0x300;

      cpu.process();

      // Check the display buffer for the first 3 rows
      for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 3; y++) {
          expect(cpu.getPixel(x, y)).toBe(1);
        }
      }

      expect(cpu.V[0xf]).toBe(0);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("DXYN - DRAW AT - Should display a n byte sprite at coordinates in register x, register y with collision", () => {
      cpu.load([0xd123]);
      const PCCall = cpu.PC;
      cpu.V[0x1] = 0;
      cpu.V[0x2] = 0;

      cpu.memory[0x300] = 0xff;
      cpu.memory[0x301] = 0xff;
      cpu.memory[0x302] = 0xff;

      cpu.I = 0x300;

      // create collision
      cpu.setPixel(0, 2, 1);

      cpu.process();

      // Check the display buffer for the first 3 rows
      for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 3; y++) {
          if (x == 0 && y == 2) {
            expect(cpu.getPixel(x, y)).toBe(0);
          } else {
            expect(cpu.getPixel(x, y)).toBe(1);
          }
        }
      }

      expect(cpu.V[0xf]).toBe(1);
      expect(cpu.PC).toBe(PCCall + 2);
    });

    test("DXYN - DRAW AT - Should throw error if I + sizeInMemory > 4095", () => {
      cpu.load([0xd123]);
      cpu.I = 0xffd;

      expect(() => {
        cpu.process();
      }).toThrow(new Error("Memory Overflow"));
    });
  });
});
