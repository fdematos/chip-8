const { DISPLAY_WIDTH, DISPLAY_HEIGHT } = require("./constants");

/* CHIP-8 has 35 opcodes, which are all two bytes long and stored big-endian.
 The opcodes are listed below, in hexadecimal and with the following symbols:

NNN: address
NN: 8-bit constant
N: 4-bit constant
X and Y: 4-bit register identifier
PC : Program Counter
I : 12bit register (For memory address) (Similar to void pointer);
VN: One of the 16 available variables. N may be 0 to F (hexadecimal);
*/

// DO NOT MOVE TO NEXT THE INSTRUCTION AFTER THOSE OPCODES
const OP_WITH_IMPACT_ON_PC = ["1NNN", "2NNN", "00EE", "BNNN"];

const OP_CODES = [
  {
    id: "1NNN",
    pattern: 0x1000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
    //Jump to address
    executeOn: (cpu, args) => {
      cpu.PC = args[0];
    },
  },
  {
    id: "2NNN",
    pattern: 0x2000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
    // Call Subroutine at address
    executeOn: (cpu, args) => {
      if (cpu.SP === 15) {
        throw new Error("Stack Overflow");
      }

      cpu.SP++;
      cpu.stack[cpu.SP] = cpu.PC + 2;
      cpu.PC = args[0];
    },
  },
  {
    id: "00EE",
    pattern: 0x00ee,
    mask: 0xffff,
    arguments: [],
    // Returns from subroutine",
    executeOn: (cpu, args) => {
      if (cpu.SP === -1) {
        throw new Error("Stack Underflow");
      }
      cpu.PC = cpu.stack[cpu.SP];
      cpu.SP--;
    },
  },
  {
    id: "00E0",
    pattern: 0x00e0,
    mask: 0xffff,
    arguments: [],
    // CLEAR Screen
    executeOn: (cpu, args) => {
      cpu.clearDisplay();
    },
  },
  {
    id: "3XNN",
    pattern: 0x3000,
    mask: 0xf000,
    arguments: [{ mask: 0x0f00, shift: 8 }, { mask: 0x00ff }],
    // IF VX equals NN then skip
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] == args[1]) {
        cpu.nextInstruction();
      }
    },
  },
  {
    id: "4XNN",
    pattern: 0x4000,
    mask: 0xf000,
    arguments: [{ mask: 0x0f00, shift: 8 }, { mask: 0x00ff }],
    // IF VX not equals NN then skip
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] != args[1]) {
        cpu.nextInstruction();
      }
    },
  },
  {
    id: "5XY0",
    pattern: 0x5000,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    // IF VX not equals VY then skip
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] == cpu.V[args[1]]) {
        cpu.nextInstruction();
      }
    },
  },
  {
    id: "6XNN",
    pattern: 0x6000,
    mask: 0xf000,
    arguments: [{ mask: 0x0f00, shift: 8 }, { mask: 0x00ff }],
    // Set value to V register,
    executeOn: (cpu, args) => {
      cpu.V[args[0]] = args[1];
    },
  },
  {
    id: "7XNN",
    pattern: 0x7000,
    mask: 0xf000,
    arguments: [{ mask: 0x0f00, shift: 8 }, { mask: 0x00ff }],
    //Add value to V register
    executeOn: (cpu, args) => {
      cpu.V[args[0]] += args[1];
    },
  },
  {
    id: "8XY0",
    pattern: 0x8000,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VY
    executeOn: (cpu, args) => {
      cpu.V[args[0]] = cpu.V[args[1]];
    },
  },

  {
    id: "8XY1",
    pattern: 0x8001,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VY | VX
    executeOn: (cpu, args) => {
      cpu.V[args[0]] |= cpu.V[args[1]];
    },
  },

  {
    id: "8XY2",
    pattern: 0x8002,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VY & VX
    executeOn: (cpu, args) => {
      cpu.V[args[0]] &= cpu.V[args[1]];
    },
  },

  {
    id: "8XY3",
    pattern: 0x8003,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VX ^ VY
    executeOn: (cpu, args) => {
      cpu.V[args[0]] ^= cpu.V[args[1]];
    },
  },

  {
    id: "8XY4",
    pattern: 0x8004,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VX + VY
    executeOn: (cpu, args) => {
      // Put the carry in VF
      cpu.V[0xf] = cpu.V[args[0]] + cpu.V[args[1]] > 0xff ? 1 : 0;
      cpu.V[args[0]] += cpu.V[args[1]];
    },
  },

  {
    id: "8XY5",
    pattern: 0x8005,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VX - VY
    executeOn: (cpu, args) => {
      cpu.V[0xf] = cpu.V[args[0]] >= cpu.V[args[1]] ? 1 : 0;
      cpu.V[args[0]] -= cpu.V[args[1]];
    },
  },

  {
    id: "8XY6",
    pattern: 0x8006,
    mask: 0xf00f,
    arguments: [{ mask: 0x0f00, shift: 8 }],
    //SHIFT VX Right (divide by 2)
    executeOn: (cpu, args) => {
      cpu.V[0xf] = cpu.V[args[0]] & 0x1;
      cpu.V[args[0]] = cpu.V[args[0]] >> 1;
    },
  },
  {
    id: "8XY7",
    pattern: 0x8007,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    //Set VX to VX - VY
    executeOn: (cpu, args) => {
      cpu.V[0xf] = cpu.V[args[1]] >= cpu.V[args[0]] ? 1 : 0;
      cpu.V[args[0]] = cpu.V[args[1]] - cpu.V[args[0]];
    },
  },

  {
    id: "8XYE",
    pattern: 0x800e,
    mask: 0xf00f,
    arguments: [{ mask: 0x0f00, shift: 8 }],
    //SHIFT VX left (multiply by 2)
    executeOn: (cpu, args) => {
      cpu.V[0xf] = cpu.V[args[0]] >> 7;
      cpu.V[args[0]] = cpu.V[args[0]] << 1;
    },
  },

  {
    id: "9XY0",
    pattern: 0x9000,
    mask: 0xf00f,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
    ],
    // IF VX not equals VY then skip
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] != cpu.V[args[1]]) {
        cpu.nextInstruction();
      }
    },
  },

  {
    id: "ANNN",
    pattern: 0xa000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
    // Set register index
    executeOn: (cpu, args) => {
      cpu.I = args[0];
    },
  },

  {
    id: "BNNN",
    pattern: 0xb000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
    // PC = V0 + NNN
    executeOn: (cpu, args) => {
      cpu.PC = cpu.V[0x0] + args[0];
    },
  },

  {
    id: "CXNN",
    pattern: 0xc000,
    mask: 0xf000,
    arguments: [{ mask: 0x0f00, shift: 8 }, { mask: 0x00ff }],
    //Random
    executeOn: (cpu, args) => {
      let random = Math.floor(Math.random() * 0x100);
      cpu.V[args[0]] = random & args[1];
    },
  },

  {
    id: "DXYN",
    pattern: 0xd000,
    mask: 0xf000,
    arguments: [
      { mask: 0x0f00, shift: 8 },
      { mask: 0x00f0, shift: 4 },
      { mask: 0x000f },
    ],

    /**
     * Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
     * Each row of 8 pixels is read as bit-coded starting from memory location I;
     * I value does not change after the execution of this instruction.
     * As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that does not happen.
     */
    executeOn: (cpu, args) => {
      const startX = cpu.V[args[0]];
      const startY = cpu.V[args[1]]; // y modulo DISPLAY_HEIGHT
      const sizeInMemory = args[2];

      if (cpu.I + sizeInMemory > 4095) {
        throw new Error("Memory Overflow");
      }

      cpu.V[0xf] = 0;

      for (let row = 0; row < sizeInMemory; row++) {
        let rowData = cpu.memory[cpu.I + row];

        // Each row (byte) represents 8 pixels (bits)
        for (let bit = 0; bit < 8; bit++) {
          /**
           * (spriteRow >> (7 - bit)) shifts spriteRow to the right by (7 - bit) positions.
           * This brings the bit you're interested in checking to the least significant bit (LSB) position.
           *
           * & 1 performs a bitwise AND operation with 1
           * which effectively isolates the LSB. If the LSB (the bit you're checking) is set,
           * the result of this operation is 1; if the LSB is not set, the result is 0.
           */
          const spritePixel = (rowData >> (7 - bit)) & 1;

          // x modulo DISPLAY_WIDTH (Screen Wrapping)
          let x = (startX + bit) & (DISPLAY_WIDTH - 1);

          // y modulo DISPLAY_HEIGHT (Screen Wrapping)
          let y = (startY + row) & (DISPLAY_HEIGHT - 1);

          const currentPixel = cpu.getPixel(x, y);

          /**
           * Perform a bitwise XOR between spritePixel and currentPixel.
           * If one of them is set (1) and the other is not (0), newPixel will be set (1).
           * If both are the same (both 0 or both 1), newPixel will be unset (0).
           */
          const newPixel = spritePixel ^ currentPixel;

          /**
           * VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn
           */
          if (currentPixel == 1 && newPixel == 0) {
            cpu.V[0xf] = 1;
          }

          cpu.setPixel(x, y, newPixel);
        }
      }
    },
  },

  {
    id: "EX9E",
    pattern: 0xe09e,
    mask: 0xf0ff,
    arguments: [{ mask: 0x0f00, shift: 8 }],
    // Skip instruction if VX == keyPressed
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] == cpu.keyPressed) {
        cpu.nextInstruction();
      }
    },
  },

  {
    id: "EXA1",
    pattern: 0xe0a1,
    mask: 0xf0ff,
    arguments: [{ mask: 0x0f00, shift: 8 }],
    // Skip instruction if VX != keyPressed
    executeOn: (cpu, args) => {
      if (cpu.V[args[0]] != cpu.keyPressed) {
        cpu.nextInstruction();
      }
    },
  },
];

const decode = (opCode) => {
  op = OP_CODES.find((op) => (opCode & op.mask) === op.pattern);
  if (!op) {
    throw new Error(`Opcode: ${opCode.toString(16)} not managed`);
  }
  args = op.arguments.map(
    (arg) => (opCode & arg.mask) >> (arg.shift ? arg.shift : 0)
  );

  return { instruction: op, withArgs: args };
};

module.exports = { decode, OP_WITH_IMPACT_ON_PC };
