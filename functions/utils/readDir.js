const fs = require("fs/promises");
async function readDir(dir) {
  const files = await fs.readdir(dir);
  return files;
}

module.exports = readDir;
