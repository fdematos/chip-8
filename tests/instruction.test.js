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

  test("00E0 - CLEAR SCREEN", () => {
    const { instruction, withArgs } = opcode.decode(0x00e0);
    expect(instruction.id).toBe("00E0");
    expect(withArgs.length).toBe(0);
  });

  test("6XNN - SET VALUE TO REGISTER", () => {
    const { instruction, withArgs } = opcode.decode(0x6312);
    expect(instruction.id).toBe("6XNN");
    expect(withArgs.length).toBe(2);
    expect(withArgs[0]).toBe(0x3);
    expect(withArgs[1]).toBe(0x12);
  });

  test("7XNN - ADD VALUE TO REGISTER", () => {
    const { instruction, withArgs } = opcode.decode(0x7acf);
    expect(instruction.id).toBe("7XNN");
    expect(withArgs.length).toBe(2);
    expect(withArgs[0]).toBe(0xa);
    expect(withArgs[1]).toBe(0xcf);
  });

  test("ANNN - SET INDEX REGISTER", () => {
    const { instruction, withArgs } = opcode.decode(0xa123);
    expect(instruction.id).toBe("ANNN");
    expect(withArgs[0]).toBe(0x123);
  });

  test("DXYN - DRAW AT", () => {
    const { instruction, withArgs } = opcode.decode(0xd123);
    expect(instruction.id).toBe("DXYN");
    expect(withArgs.length).toBe(3);
    expect(withArgs[0]).toBe(0x1);
    expect(withArgs[1]).toBe(0x2);
    expect(withArgs[2]).toBe(0x3);
  });
});
