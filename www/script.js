/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

//const status = document.getElementById('status');
//if (status) {
//  status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
//}
var dotStorage = [];

const BODY = document.querySelector("body");
const STATUS = document.querySelector("#status");
const VIDEO_DIV = document.querySelector("#video-div");
const VIDEO = document.querySelector("video");
const INPUT = document.querySelector("input");

const addDotsOnVideo = (x, y, z) => {
  let dot = document.createElement("div");

  dot.style.margin = "0px";
  dot.style.borderRadius = "50%";
  dot.style.width = "5px";
  dot.style.height = "5px";
  dot.style.backgroundColor = "lightgreen";
  dot.style.position = "absolute";
  dot.style.left = x + "px";
  dot.style.top = y + "px";

  VIDEO_DIV.appendChild(dot);
  dotStorage.push(dot);
};

const removeDotsFromVideo = () => {
  dotStorage.forEach((dot) => {
    VIDEO_DIV.removeChild(dot);
  })
  
  dotStorage.splice(0);
};

tf.ready().then(() => {
  STATUS.innerText = "TensorFlow.js loaded!";
  VIDEO_DIV.classList.remove("invisible");

  const handleUpload = (event) => {
    VIDEO.src = URL.createObjectURL(event.target.files[0]);
    VIDEO.onload = () => {
      URL.revokeObjectURL(VIDEO.src); // free memory
    };
  };

  INPUT.addEventListener("input", handleUpload);

  const main = async () => {
    // Load the MediaPipe Facemesh package.
    const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );

    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
    // array of detected faces from the MediaPipe graph. If passing in a video
    // stream, a single prediction per frame will be returned.
    const predictions = await model.estimateFaces({
      input: VIDEO,
    });

    if (predictions.length > 0) {
      /*
    `predictions` is an array of objects describing each detected face, for example:

    [
      {
        faceInViewConfidence: 1, // The probability of a face being present.
        boundingBox: { // The bounding box surrounding the face.
          topLeft: [232.28, 145.26],
          bottomRight: [449.75, 308.36],
        },
        mesh: [ // The 3D coordinates of each facial landmark.
          [92.07, 119.49, -17.54],
          [91.97, 102.52, -30.54],
          ...
        ],
        scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
          [322.32, 297.58, -17.54],
          [322.18, 263.95, -30.54]
        ],
        annotations: { // Semantic groupings of the `scaledMesh` coordinates.
          silhouette: [
            [326.19, 124.72, -3.82],
            [351.06, 126.30, -3.00],
            ...
          ],
          ...
        }
      }
    ]
    */
      removeDotsFromVideo();

      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;

        // Log facial keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];

          console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);

          addDotsOnVideo(x, y, z);
        }
      }
    }

    window.requestAnimationFrame(main);
  };

  VIDEO.addEventListener("play", main);
});
