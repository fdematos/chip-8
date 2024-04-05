const opcode = require("../src/instruction");

describe("OpCode tests", () => {
  test("1NNN - JUMP", () => {
    const instruction = opcode.decode(0x1333);
    expect(instruction.op.id).toBe("1NNN");
    expect(instruction.args[0]).toBe(0x333);
  });
});
