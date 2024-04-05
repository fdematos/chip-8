const { MEMORY_START } = require("./constants");
const Instruction = require("./instruction");

class CPU {
  constructor() {
    this.initialize();
  }

  initialize() {
    /* Memory - 4kb (4096 bytes) memory storage (8-bit)
     * This memory is used to store the program code, data, stack, and even the built-in font set for drawing text on the screen
     */
    this.memory = new Uint8Array(4096);

    /**
     * PC: Program Counter (8-bit) stores currently executing address
     * Start at 0x200, the first 512 bytes of memory (from 0x000 to 0x1FF) are reserved for the original Chip-8 interpreter.
     * The PC increments by 2 after executing each instruction because Chip-8 instructions are coded in 2 bytes.
     */
    this.PC = MEMORY_START;
  }

  load(rom) {
    this.initialize();

    // Memory is an 8-bit array and opcodes are 16-bit, each opcode take two case in memory
    for (let i = 0; i < rom.data.length; i++) {
      // take the two first byte (most significant)
      this.memory[MEMORY_START + 2 * i] = rom.data[i] >> 8;
      // take the two last byte (least significant)
      this.memory[MEMORY_START + 2 * i + 1] = rom.data[i] & 0x00ff;
    }
  }

  step() {
    const { op, args } = Instruction.decode(this.opCode());
    op.execute(this, args);
  }

  opCode() {
    return (this.memory[this.PC] << 8) | this.memory[this.PC + 1];
  }
}

module.exports = { CPU };
