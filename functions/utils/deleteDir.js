const fs = require("fs/promises");

async function deleteDir(dir) {
  try {
    await fs.rmdir(dir)
  } catch (error) {
    if (error?.errno === -2) {
      console.log(`${dir} does not exist`);
    }
  }
}

module.exports = deleteDir;
