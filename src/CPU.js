const { MEMORY_START, DISPLAY_HEIGHT, DISPLAY_WIDTH, FONTS } = require("./constants");

const Instruction = require("./instruction");

class CPU {
  constructor() {
    this.initialize();
  }

  initialize() {
    /**
     *  Memory - 4kb (4096 bytes) memory storage (8-bit)
     * This memory is used to store the program code, data, stack, and even the built-in font set for drawing text on the screen
     */
    this.memory = new Uint8Array(4096);

    /**
     * Stack - (16 * 16-bit)
     * The stack operates on a Last In, First Out (LIFO)
     * The main use of the stack in Chip-8 is to store the addresses to return to after a subroutine call is completed.
     * When a subroutine is called, the current program counter (PC) — which points to the next instruction to execute — is saved on the stack.
     * After the subroutine has finished executing, the saved return address is popped off the stack and execution resumes at
     */
    this.stack = new Uint16Array(16);

    /**
     * SP - Stack Pointer (8-bit) points at topost level of stack
     * The stack pointer (SP) in Chip-8 is a special register that tracks the top of the stack.
     * It is used to determine where on the stack the next return address should be pushed or from where the last address should be popped.
     * Proper management of the SP is crucial to prevent stack overflows (attempting to push more addresses onto the stack than it can hold) or underflows (attempting to pop an address from an empty stack).
     */
    this.SP = -1;

    /**
     * In the Chip-8 virtual machine, the registers V0 through VF are 16 8-bit (one byte) general-purpose registers used to store values needed during program execution.
     * V0 to VE are used for general purposes by Chip-8 programs. They can hold values that are used in operations such as arithmetic, logic operations, and control flow.
     * The VF register is also used for general purposes like the others, but it has a special role as a flag register in certain operations. Notably, it is used to indicate carry in addition operations, borrow in subtraction operations, and collision in sprite drawing operations.
     */
    this.V = new Uint8Array(16);

    /**
     * The "I" register in the Chip-8 virtual machine serves a special purpose, distinct from the V0 to VF general-purpose registers.
     * It is a 16-bit register, used primarily as an address pointer for several operations, particularly those involving access to memory.
     */
    this.I = 0;

    /**
     * PC: Program Counter (8-bit) stores currently executing address
     * Start at 0x200, the first 512 bytes of memory (from 0x000 to 0x1FF) are reserved for the original Chip-8 interpreter.
     * The PC increments by 2 after executing each instruction because Chip-8 instructions are coded in 2 bytes.
     */
    this.PC = MEMORY_START;

    this.clearDisplay();
  }

  load(romData) {
    this.initialize();

    // Load fonts into memory - 0:80 
    for (let i = 0; i < FONTS.length; i++) {
      this.memory[i] = FONTS[i]
    }

    // Memory is an 8-bit array and opcodes are 16-bit, each opcode take two case in memory
    for (let i = 0; i < romData.length; i++) {
      // take the two first byte (most significant)
      this.memory[MEMORY_START + 2 * i] = romData[i] >> 8;
      // take the two last byte (least significant)
      this.memory[MEMORY_START + 2 * i + 1] = romData[i] & 0x00ff;
    }
  }
  

  process() {
    const opCode = this.fetch();
    const { instruction, withArgs } = Instruction.decode(opCode);
    instruction.executeOn(this, withArgs);

    if (!Instruction.OP_WITH_IMPACT_ON_PC.includes(instruction.id)) {
      this.nextInstruction();
    }
  }

  nextInstruction() {
    this.PC = this.PC + 2;
  }

  fetch() {
    return (this.memory[this.PC] << 8) | this.memory[this.PC + 1];
  }

  // Display Management
  clearDisplay() {
    this.buffer = Array.from(Array(DISPLAY_WIDTH), () =>
      new Array(DISPLAY_HEIGHT).fill(0)
    );
  }

  getPixel(x, y) {
    return this.buffer[x][y];
  }

  setPixel(x, y, value) {
    this.buffer[x][y] = value;
  }
}

module.exports = { CPU };
