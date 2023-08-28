const os = require("os");
const path = require("path");

function getOutputLocation() {
  const tmp = os.tmpdir();
  const location = path.join(tmp, "output.mp4");
  return location;
}

module.exports = getOutputLocation