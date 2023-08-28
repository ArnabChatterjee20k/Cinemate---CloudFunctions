const ffmpeg = require("fluent-ffmpeg");
const getOutputLocation = require("./getOutpuLocation");

const bitrates = [];
const outputDir = getOutputLocation();

async function processVideo(videoURL) {
  const videoProcessPromises = bitrates.map((bitrate) =>
    optimiseVideo(videoURL, bitrate)
  );

  await Promise.all(videoProcessPromises);
}

function optimiseVideo(videoURL, bitrate) {
  const outputFileName = Date.now();
  ffmpeg(videoURL)
    .outputOptions([
      "-profile:v baseline", // H.264 profile for wider devide suppoet
      "-level 3.0", // H.264 level
      "-start_number 0", // Segment start number
      "-hls_time 10", // segnebt duration
      "-hls_list_size 0", // number of segments to keep in playlist (0 means all)
      "-f hls", // output format HLS
    ])
    .output(`${outputDir}/${outputFileName}`)
    .videoBitrate(bitrate)
    .audioCodec("aac")
    .audioBitrate("128k")
    .run();
}

module.exports = processVideo;
