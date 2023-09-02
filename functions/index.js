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
const { getStorage, getDownloadURL } = require("firebase-admin/storage");

const { createClient } = require("@sanity/client");
const os = require("os");
const crypto = require("crypto");
const path = require("path");

const app = initializeApp();
const processVideo = require("./utils/processVideo.js");
const uploadChunks = require("./utils/uploadChunks.js");
const deleteDir = require("./utils/deleteDir.js");
const { isEncodedVideo , isVideo } = require("./utils/validator.js");


exports.exportVideo = onObjectFinalized({ cpu: 2,timeoutSeconds:6000 }, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  const fileName = path.basename(filePath);

  if(isEncodedVideo(fileName) || !isVideo(fileName)){
    return logger.warn("Not a video "+fileName)
  }
  // optimise the video
  try {
    logger.log("Main Process")
    const fileRef = getStorage().bucket(fileBucket).file(filePath);
    const url = await getDownloadURL(fileRef);
    await processVideo(url);
    await uploadChunks();
    await getStorage().bucket().file(filePath).delete()
    logger.log("Main Process Over")

  } catch (error) {
    logger.error("Error", error);
  }
  
  return;
});
