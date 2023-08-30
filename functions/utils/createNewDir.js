const fs = require("fs");

// const directoryName = "newDirectory";

function createNewDir(directoryName) {
  // Check if the directory already exists
  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName);
  }
}
module.exports = createNewDir;
