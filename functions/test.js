const fetch = require("node-fetch"); // If using Node.js, require the fetch library

const file = "./package.json"; // Replace with the path to your local file
const signedUrl =
  "https://storage.googleapis.com/rn-socialmedia-382203.appspot.com/video.mp4?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=firebase-adminsdk-chm67%40rn-socialmedia-382203.iam.gserviceaccount.com%2F20230827%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230827T151232Z&X-Goog-Expires=900&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=2b2b209ead3315d166fbf470e3f86bd6c62e273ae6f934ea1636750133b53287c598743cb440bf90553306838efe2e3747b347790c8133c9990e73198172b256d6489f1e21bda5a5ec2bba0c63957a96d121da84a25fb3e1cd87b9c1f7cf8326dc17c2490e98774308dc83e79e172beb7a9335e15de287214b0b26d84dcad4c35ace3bf0093abbe82324bd81c7a4a3d9f9504605bf082ca0652daffd9fce91148c320277ec9a4029a726f0c9475517fd1e717ecc74cbb9738bb13d8d8d40114fd3c664ade06d15e46d08369ea446134179d5f618c8cb674e87b1a4de9eabea89ea15dd59e55038b2a7445834854296e5f7fa3d4c28644850ca400f5139cdc2c8";

const headers = {
  "Content-Type": "application/octet-stream",
};

const uploadOptions = {
  method: "PUT",
  headers: headers,
  body: require("fs").createReadStream(file), // If using Node.js, use fs.createReadStream to stream the file
};

fetch(signedUrl, uploadOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    console.log("File uploaded successfully!");
  })
  .catch((error) => {
    console.error("Upload error:", error);
  });
