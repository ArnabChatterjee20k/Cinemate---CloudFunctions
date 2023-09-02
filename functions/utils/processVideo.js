const os = require("os");
const fs = require("fs/promises");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const getOutputLocation = require("./getOutpuLocation");
const { logger } = require("firebase-functions/v1");
const createNewDir = require("./createNewDir");
const { getStorage } = require("firebase-admin/storage");

const bitrates = ["100k", "800k"];
const mediaManifestMap = {}; // bitrate => outputfileLocation

async function processVideo(videoURL) {
  const videoProcessPromises = bitrates.map((bitrate) =>
    optimiseVideo(videoURL, bitrate)
  );

  const files =  await Promise.all(videoProcessPromises);
  generateMasterManifest()
  return files
}

function optimiseVideo(videoURL, bitrate) {
  const outputFileName = Date.now();
  const outputDir = getOutputLocation(bitrate);
  logger.warn(outputDir)
  const outputVideo = `${outputDir}/${outputFileName}.m3u8`;
  mediaManifestMap[bitrate] = `${outputFileName}.m3u8`;
  return new Promise((resolve, reject) => {
    createNewDir(outputDir);
    ffmpeg(videoURL)
      .outputOptions([
        "-profile:v baseline", // H.264 profile for wider devide suppoet
        "-level 3.0", // H.264 level
        "-start_number 0", // Segment start number
        "-hls_time 10", // segnebt duration
        "-hls_list_size 0", // number of segments to keep in playlist (0 means all)
        "-f hls", // output format HLS
      ])
      .output(outputVideo)
      .videoBitrate(bitrate)
      .audioCodec("aac")
      .audioBitrate("128k")
      .on("end", (e) => {
        logger.log("Processing Ended");
        resolve(outputVideo);
      })
      .on("error", (e) => {
        logger.error(e);
        reject(e);
      })
      .run();
  });
}

async function generateMasterManifest() {
  const header = "#EXTM3U";
  const manifestContent = bitrates
    .map((bitrate) => {
      const manifestFileUrl = getStorage().bucket().file(mediaManifestMap[bitrate]).publicUrl()
      return `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=720X480\n${manifestFileUrl}`;
    })
    .join("\n");

  const location = os.tmpdir();
  const name = `${Date.now()}.m3u8`;
  const fileTempLocation = `/${location}/${name}`;

  await fs.writeFile(
    fileTempLocation,
    `${header}
    ${manifestContent}
  `
  );

  await getStorage().bucket().upload(fileTempLocation, {
    destination: `master-manifest-${name}`,
  });
}
module.exports = processVideo;
