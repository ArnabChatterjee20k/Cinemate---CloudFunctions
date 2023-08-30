const { getStorage } = require("firebase-admin/storage");
const path = require("path");
const getOutputLocation = require("./getOutpuLocation");
const readDir = require("./readDir");

async function uploadChunks() {
  const bitrates = ["100k", "800k"];
  for (const bitrate of bitrates) {
    const videoDir = getOutputLocation(bitrate);
    const files = await readDir(videoDir);
    await Promise.all(files.map((file) => upload(path.join(videoDir, file), bitrate)));
  }
}

async function upload(fileLocation, folder) {
  await getStorage().bucket().upload(fileLocation, {
    destination: path.join(folder, path.basename(fileLocation)),
  });
}

uploadChunks().catch(error => {
  console.error("Error uploading chunks:", error);
});

module.exports = uploadChunks;
