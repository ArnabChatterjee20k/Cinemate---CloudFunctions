const os = require("os");
const path = require("path");

function getOutputLocation(output=null) {
  const tmp = os.tmpdir();
  const location = path.join(tmp,output);
  if(output) return location
  return tmp;
}

module.exports = getOutputLocation