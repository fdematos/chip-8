const { MEMORY_START } = require("./constants");
const Instruction = require("./instruction");

class CPU {
  constructor(display) {
    this.display = display;

    this.initialize();
  }

  initialize() {
    /* Memory - 4kb (4096 bytes) memory storage (8-bit)
     * This memory is used to store the program code, data, stack, and even the built-in font set for drawing text on the screen
     */
    this.memory = new Uint8Array(4096);

    /* Stack - (16 * 16-bit) 
       The stack operates on a Last In, First Out (LIFO)
       The main use of the stack in Chip-8 is to store the addresses to return to after a subroutine call is completed.
       When a subroutine is called, the current program counter (PC) — which points to the next instruction to execute — is saved on the stack. 
       After the subroutine has finished executing, the saved return address is popped off the stack and execution resumes at 
    */
    this.stack = new Uint16Array(16);

    /* SP - Stack Pointer (8-bit) points at topost level of stack
      The stack pointer (SP) in Chip-8 is a special register that tracks the top of the stack. 
      It is used to determine where on the stack the next return address should be pushed or from where the last address should be popped. 
      Proper management of the SP is crucial to prevent stack overflows (attempting to push more addresses onto the stack than it can hold) or underflows (attempting to pop an address from an empty stack).
    */
    this.SP = -1;

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
    const { instruction, withArgs } = Instruction.decode(this.opCode());
    instruction.executeOn(this, withArgs);
  }

  opCode() {
    return (this.memory[this.PC] << 8) | this.memory[this.PC + 1];
  }
}

module.exports = { CPU };
