const fs = require("fs");

const decode = (data) => {
  const buffer = data;
  const romData = [];

  for (let i = 0; i < buffer.length; i += 2) {
    romData.push((buffer[i] << 8) | (buffer[i + 1] << 0));
  }

  return romData;
};

const loadFromFile = (path) => {
  const fileContents = fs.readFileSync(path);
  if (!fileContents) throw new Error("File not found");

  return decode(fileContents);
};

module.exports = {
  decode,
  loadFromFile,
};
