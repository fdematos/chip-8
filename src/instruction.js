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
    execute: (cpu, args) => {
      cpu.PC = args[0];
    },
  },
];

const decode = (opCode) => {
  op = OP_CODE_SET.find((op) => (opCode & op.mask) === op.pattern);
  args = op.arguments.map((arg) => opCode & arg.mask);

  return { op, args };
};

module.exports = { decode };
