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

const OP_CODE_SET = [
  {
    id: "1NNN",
    desc: "JUMP to address",
    pattern: 0x1000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
    executeOn: (cpu, args) => {
      cpu.PC = args[0];
    },
  },
  {
    id: "2NNN",
    desc: "CALL subroutine",
    pattern: 0x2000,
    mask: 0xf000,
    arguments: [{ mask: 0x0fff }],
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
    desc: "RETURN from subroutine",
    pattern: 0x00ee,
    mask: 0xffff,
    arguments: [],
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
    desc: "CLEAR Screen",
    pattern: 0x00e0,
    mask: 0xffff,
    arguments: [],
    executeOn: (cpu, args) => {
      cpu.display.clear();
    },
  },
];

const decode = (opCode) => {
  op = OP_CODE_SET.find((op) => (opCode & op.mask) === op.pattern);
  args = op.arguments.map((arg) => opCode & arg.mask);

  return { instruction: op, withArgs: args };
};

module.exports = { decode };
