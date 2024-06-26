const { CPU } = require("../src/CPU");

const { DISPLAY_WIDTH, DISPLAY_HEIGHT } = require("../src/constants");

const cpu = new CPU();

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

  test("9XY0 - IF VX NOT EQUALS VY - Should skip the next instruction, Vx not equals Vy", () => {
    cpu.load([0x9a10]);
    cpu.V[0xa] = 0x12;
    cpu.V[0x1] = 0x13;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 4);
  });

  test("9XY0 - IF VX NOT EQUALS VY - Should not skip the next instruction, Vx equals Vy", () => {
    cpu.load([0x9a10]);
    cpu.V[0xa] = 0x12;
    cpu.V[0x1] = 0x12;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("ANNN - SET REGISTER INDEX - I should equals to address in argument", () => {
    cpu.load([0xa333]);
    const PCCall = cpu.PC;
    cpu.process();

    expect(cpu.I).toBe(0x333);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("BNNN - JUMP TO NNN + V0 - Should set PCC to V0 + NNN", () => {
    cpu.load([0xb123]);
    cpu.V[0x0] = 0x2;

    cpu.process();

    expect(cpu.PC).toBe(0x125);
  });

  test("CXNN - RANDOM - Should generate random number", () => {
    cpu.load([0xc123]);
    const PCCall = cpu.PC;

    cpu.process();
    // Cannot test random, just test VX not equal 0
    expect(cpu.V[0x1]).not.toBe(0);
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

  test("EX9E - KEY PRESSED - Should skip the next instruction, Vx equals keypressed", () => {
    cpu.load([0xea9e]);
    cpu.V[0xa] = 0x1;
    cpu.keyPressed = 0x1;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 4);
  });

  test("EX9E - KEY PRESSED - Should not skip the next instruction, Vx not equals keypressed", () => {
    cpu.load([0xea9e]);
    cpu.V[0xa] = 0x1;
    cpu.keyPressed = 0x2;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("EXA1 - KEY NOT PRESSED - Should skip the next instruction, Vx not equals keypressed", () => {
    cpu.load([0xeaa1]);
    cpu.V[0xa] = 0x1;
    cpu.keyPressed = 0x2;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 4);
  });

  test("EXA1 - KEY not PRESSED - Should not skip the next instruction, Vx equals keypressed", () => {
    cpu.load([0xeaa1]);
    cpu.V[0xa] = 0x1;
    cpu.keyPressed = 0x1;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX07 - SET VX TO DT - Should set VX to DT value", () => {
    cpu.load([0xfa07]);
    const PCCall = cpu.PC;
    cpu.DT = 0x12;

    cpu.process();
    expect(cpu.V[0xa]).toBe(cpu.DT);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX0A - WAIT FOR KEYPRESS - Should do nothing if no key pressed", () => {
    cpu.load([0xfa0a]);
    cpu.keyPressed = undefined;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.PC).toBe(PCCall);
  });

  test("FX0A - WAIT FOR KEYPRESS - Should put keypressed in VX", () => {
    cpu.load([0xfa0a]);
    cpu.keyPressed = 0x2;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.V[0xa]).toBe(0x2);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX15 - SET DT TO VX - Should set DT to DX value", () => {
    cpu.load([0xfa15]);
    const PCCall = cpu.PC;
    cpu.V[0xa] = 0xff;

    cpu.process();
    expect(cpu.DT).toBe(cpu.V[0xa]);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX18 - SET ST TO VX - Should set ST to DX value", () => {
    cpu.load([0xfa18]);
    const PCCall = cpu.PC;
    cpu.V[0xa] = 0xff;

    cpu.process();
    expect(cpu.ST).toBe(cpu.V[0xa]);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX1E - ADD VX TO I - Should add Vx to I, VF = 0 because no overflow", () => {
    cpu.load([0xfa1e]);
    cpu.V[0xa] = 0x3;
    cpu.I = 0x3;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.I).toBe(0x3 + 0x3);
    expect(cpu.V[0xf]).toBe(0x0);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX1E - ADD VX TO I - Should add Vx to I, VF = 1 because overflow", () => {
    cpu.load([0xfa1e]);
    cpu.V[0xa] = 0xff;
    cpu.I = 0xffff;
    const PCCall = cpu.PC;

    cpu.process();
    expect(cpu.I).toBe(0xfe);
    expect(cpu.V[0xf]).toBe(0x1);
    expect(cpu.PC).toBe(PCCall + 2);
  });

  test("FX29 - should set I to the location of the Sprite for digit in register x", () => {
    cpu.load([0xfa29]);
    cpu.V[0xa] = 0xd;
    cpu.process();

    expect(cpu.I).toBe(0xd * 5);
  });

  test("FX33 - Should load BCD representation of VX into memory I, I+1, I+2 for 123", () => {
    cpu.load([0xfa33]);
    cpu.V[0xa] = 0x7b;
    cpu.I = 0x400;
    cpu.process();

    expect(cpu.memory[0x400]).toBe(1);
    expect(cpu.memory[0x401]).toBe(2);
    expect(cpu.memory[0x402]).toBe(3);
  });

  test("FX33 - Should load BCD representation of VX into memory I, I+1, I+2 for 5 ", () => {
    cpu.load([0xfa33]);
    cpu.V[0xa] = 0x05;
    cpu.I = 0x400;
    cpu.process();

    expect(cpu.memory[0x400]).toBe(0);
    expect(cpu.memory[0x401]).toBe(0);
    expect(cpu.memory[0x402]).toBe(5);
  });

  test("FX55 - Should store V0 to VX value to memory starting at I ", () => {
    cpu.load([0xf255]);
    cpu.V[0x0] = 0x02;
    cpu.V[0x1] = 0x04;
    cpu.V[0x2] = 0x06;
    cpu.I = 0x400;
    cpu.process();

    expect(cpu.memory[0x400]).toBe(2);
    expect(cpu.memory[0x401]).toBe(4);
    expect(cpu.memory[0x402]).toBe(6);
  });

  test("FX65 - Should load set V0 to VX with memory value starting at I ", () => {
    cpu.load([0xf265]);
    cpu.memory[0x400] = 0x02;
    cpu.memory[0x401] = 0x04;
    cpu.memory[0x402] = 0x06;
    cpu.I = 0x400;
    cpu.process();

    expect(cpu.V[0x0]).toBe(2);
    expect(cpu.V[0x1]).toBe(4);
    expect(cpu.V[0x2]).toBe(6);
  });
});
