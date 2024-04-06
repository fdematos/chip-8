const opcode = require("../src/instruction");

describe("Decode tests", () => {
  test("1NNN - JUMP", () => {
    const { instruction, withArgs } = opcode.decode(0x1333);
    expect(instruction.id).toBe("1NNN");
    expect(withArgs[0]).toBe(0x333);
  });

  test("2NNN - CALL SUB ROUTINE", () => {
    const { instruction, withArgs } = opcode.decode(0x2134);
    expect(instruction.id).toBe("2NNN");
    expect(withArgs[0]).toBe(0x134);
  });

  test("00EE - CALL SUB ROUTINE", () => {
    const { instruction, withArgs } = opcode.decode(0x00ee);
    expect(instruction.id).toBe("00EE");
    expect(withArgs.length).toBe(0);
  });
});
