/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onObjectFinalized } = require("firebase-functions/v2/storage");

const admin = require("firebase-admin");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { createClient } = require("@sanity/client");

const ffmpeg = require("ffmpeg");
const os = require("os");
const crypto = require("crypto");
const path = require("path");
const cert = require("D:/Projects/Youtube-RN/CineMate-CloudFunctions/service.json");
const app = initializeApp({ credential: admin.credential.cert(cert) });

const client = createClient({
  projectId: "6ydkcei8",
  dataset: "production",
  // useCdn:true,
  apiVersion: "2021-08-31",
  token:
    "skh0AcPIQwpl5p1FVcqe1eORe4OvSS9BgorzPx3XCvK5LBevOBGPHxXARGZezGcsRjGeOqfK4nRIoyXhiJXjVnyqtXcfJBxkqD9tJvyqzRzMMw0QDjgjyTLdSUyUc1FmZOXuKeCHjHFoddyfJ5VEtSYlg21slP5X1RRSwLX1wRFhtmH8pfAy",
});

exports.getURL = onRequest(async (req, res) => {
  let bucket = getStorage(app).bucket("rn-socialmedia-382203.appspot.com")
  const id = crypto.randomUUID();
  const file = bucket.file(`video.mp4`);
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: 'application/octet-stream',
  };
  const [url] = await file.getSignedUrl(options);

    logger.log(
      "curl -X PUT -H 'Content-Type: application/octet-stream' " +
        `--upload-file my-file '${url}'`
    );
  return res.status(200).json({url});
});

exports.exportVideo = onObjectFinalized({ cpu: 2 }, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  const fileName = path.basename(filePath);

  if (!contentType.startsWith("video/")) {
    return logger.error("Not a video");
  }

  if (fileName.startsWith("output")) {
    return logger.warn("Already a video");
  }

  // // downloading file into the memory
  const tmp = os.tmpdir();
  const location = path.join(tmp, "output.mp4");
  const bucket = getStorage().bucket(fileBucket);
  const downloadResponse = await bucket
    .file(filePath)
    .download({ destination: location });

  // optimise the video
  try {
    const video = new ffmpeg(location);
    // await video.
    const newVideo = (await video).addCommand(
      "-vf",
      "scale=114:114",
      "output.mp4"
    );
    logger.log("Video optimised", location);
  } catch (error) {
    logger.error("Error", error);
  }

  return;

  //   try {
  //     const data = await client.assets.upload("image", thumbnailBuffer, {
  //       contentType: metaData,
  //     });
  //     logger.log("Returned asset", data);
  //     client.create({ _type: "thumbnails" });
  //     logger.log("Thumbnail Uploaded!");
  //   } catch (error) {
  //     logger.error(error);
  //   } finally {
  //     logger.log("Over");
  //   }

  return;
});

// exports.uploadVideo = onObjectFinalized()
