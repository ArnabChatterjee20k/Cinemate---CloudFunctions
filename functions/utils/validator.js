const path = require("path");

function isEncodedVideo(filename) {
  const fileExtension = path.extname(filename);

  // Check if the file extension is ".ts"
  if (fileExtension === ".ts" || fileExtension === ".m3u8") {
    return true;
  } else {
    return false;
  }
}

function isVideo(filename) {
  const fileExtension = path.extname(filename);
  if (fileExtension === ".mp4" || fileExtension === ".mkv" || fileExtension==".webm") {
    return true;
  } else {
    return false;
  }
}

module.exports = {isEncodedVideo , isVideo}