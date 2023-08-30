const os = require("os");
const path = require("path");

function getOutputLocation(output) {
  const tmp = os.tmpdir();
  const location = path.join(tmp,output);
  return location;
}

module.exports = getOutputLocation