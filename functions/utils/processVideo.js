const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const getOutputLocation = require("./getOutpuLocation");
const { logger } = require("firebase-functions/v1");
const createNewDir = require("./createNewDir");

async function processVideo(videoURL) {
  const bitrates = ["100k", "800k"];
  const videoProcessPromises = bitrates.map((bitrate) =>
    optimiseVideo(videoURL, bitrate)
  );

  return await Promise.all(videoProcessPromises);
}

function optimiseVideo(videoURL, bitrate) {
  return new Promise((resolve, reject) => {
    const outputFileName = Date.now();
    const outputDir = getOutputLocation(bitrate);
    createNewDir(outputDir);
    const outputVideo = `${outputDir}/${outputFileName}.m3u8`;
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
        resolve(outputVideo)
      })
      .on("error",(e)=>{
        logger.error(e)
        reject(e)
      })
      .run();
  });

}

module.exports = processVideo;
