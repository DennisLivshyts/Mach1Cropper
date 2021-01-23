'use strict';

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');
var input = document.querySelectorAll("input[type=number]");
recordedVideo.ontimeupdate = function(e) {
  console.log("recorded video currentTime:", e.target.currentTime)
}
gumVideo.onprogress = function(e) {
  // console.log("getUserMedia video currentTime:", e.target.currentTime)
}
var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;

var currentTimes = [];
recordButton.nextElementSibling.innerHTML = "recorded video " 
                                            + currentTimes.length 
                                            + "s";
// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' ||
  location.host === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

// Use old-style gUM to avoid requirement to enable the
// Enable experimental Web Platform features flag in Chrome 49

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  audio: true,
  video: true
};

navigator.getUserMedia(constraints, successCallback, errorCallback);

function successCallback(stream) {
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

// navigator.mediaDevices.getUserMedia(constraints)
// .then(function(stream) {
//   console.log('getUserMedia() got stream: ', stream);
//   window.stream = stream; // make available to browser console
//   if (window.URL) {
//     gumVideo.src = window.URL.createObjectURL(stream);
//   } else {
//     gumVideo.src = stream;
//   }
// }).catch(function(error) {
//   console.log('navigator.getUserMedia error: ', error);
// });

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    currentTimes.push(gumVideo.currentTime);
    recordedBlobs.push(event.data);
    recordButton.nextElementSibling.innerHTML = "recorded video " 
                                                + recordedBlobs.length 
                                                + "s";
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
  console.log("recorded times from getUserMedia video:", currentTimes);
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  var options = {
    mimeType: 'video/webm',
    bitsPerSecond: 100000
  };
  recordedBlobs = [];
  currentTimes = [];
  for (var i = 0; i < input.length; i++) {
    input[i].setAttribute("max", 1);
    input[i].setAttribute("disabled", "disabled");
  }
  playButton.disabled = true;
  downloadButton.disabled = true;
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0);
    try {
      options = {
        mimeType: 'video/webm,codecs=vp9',
        bitsPerSecond: 100000
      };
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1);
      try {
        options = 'video/vp8'; // Chrome 47
        mediaRecorder = new MediaRecorder(window.stream, options);
      } catch (e2) {
        alert('MediaRecorder is not supported by this browser.\n\n' +
          'Try Firefox 29 or later, or Chrome 47 or later,'
          + ' with Enable experimental Web Platform features enabled '
          + ' from chrome://flags.');
        console.error('Exception while creating MediaRecorder:', e2);
        return;
      }
    }
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(1000); // collect 1000ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  for (var i = 0; i < input.length; i++) {
    input[i].setAttribute("max", recordedBlobs.length);
    input[i].removeAttribute("disabled");
  }
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
}

function play() {
  console.log(`playing ${input[0].value}s of getUserMedia video` 
             + `recorded by MediaRecorder from time ranges`
             , currentTimes.slice(0, input[0].value));
  // slice `input[0].value` amount, in seconds, from end of recorded video
  // for playback
  var file = recordedBlobs.slice(0, input[0].value);
  var superBuffer = new Blob(file, {
    type: 'video/webm'
  });
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
}

function download() {
    // slice `input[1].value` amount, in seconds, from end of recorded video
    // for download
  var file = recordedBlobs.slice(0, input[1].value);
  var blob = new Blob(file, {
    type: 'video/webm'
  });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}