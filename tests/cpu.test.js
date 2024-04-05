const { CPU } = require("../src/cpu");
const { MEMORY_START } = require("../src/constants");

const cpu = new CPU();

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
    test("JUMP_ADDR (1nnn) - Program counter should be set to address in argument", () => {
      cpu.load({ data: [0x1333] });
      cpu.step();

      expect(cpu.PC).toBe(0x333);
    });

    /*test("RETURN (00ee) - Program counter should be set to stack pointer, then decrement stack pointer", () => {
      cpu.SP = 0x2;
      cpu.stack[0x2] = 0xf;

      cpu.load({ data: [0x00ee] });
      cpu.step();

      expect(cpu.PC).toBe(0xf);
      expect(cpu.SP).toBe(0x1);
    });*/
  });
});
