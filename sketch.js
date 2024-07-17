const selectCameraIndex=1; // If you think there's more than one camera, pass in the index that you expect the desired one to be.
var capture;
var captureReady = false;
var tracker;
const devices = [];

let song;

Balloon1 = "Balloon1.png";
Balloon2 = "Balloon2.png";
Balloon3 = "Balloon3.png";
let displayImg = [];
var w = 640,
    h = 480, 
    x = 17,
    y = 17;

var displayText = false;

// Pointers for every finger [thumb, pointer, middle, ring, pinky]
let prevPointer = [
  // Left hand
  [{x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}],
  // Right hand
  [{x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}]
]

// Landmark indexes for fingertips [pointer, middle, ring, pinky]
let fingertips = [4, 8, 12, 16, 20]

function setup() {
  song = loadSound("assets/soft-balloon-pop.mp3")
  navigator.mediaDevices.enumerateDevices().then(gotDevices);

  sketch = createCanvas (640, 480);
 
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  // canvas.parent('sketch-holder');

  // initialize visuals
  img1 = loadImage(Balloon1);
  img2 = loadImage(Balloon2);
  img3 = loadImage (Balloon3);

  //----------------------------//
  for(let i = 0; i < 1; i++){
    displayImg.push(new Balloon());
  }

  // Colors for each fingertip
  colorMap = [
    // Left fingertips
    [color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186)],
    
    // Right fingertips
    [color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186)]
  ]
  
  textSize(25);

}

function draw() {
  if (!captureReady) return;

  background(248, 229, 187);
  drawHands();
  
  for(let i = 0; i < displayImg.length; i++){
    displayImg[i].display();
  }

  // Log the original point of pinch
  handsfree.on('finger-pinched-1-0', () => {
    let xcor = int (w - handsfree.data.hands.curPinch[1][0].x* w);
    let ycor = int (handsfree.data.hands.curPinch[1][0].y * h);
    // text('Fingers Pinched' + xcor + ',' + ycor, 1, 100, 90);
    
    
    for(let i = 0; i < displayImg.length; i++){
      if (displayImg[i].contains(xcor, ycor)){
        displayImg.splice(i, 1);
        console.log("Song:" + song);
        song.play();
      }
    } 

})
  
  if (displayImg.length == 0){
      text ('You popped all the balloons! ᕦʕ •`ᴥ•´ʔᕤ', w/7, h/2, 2000, 2000);
    setTimeout(addBalloons, 1000);
    } 

  
    
    
}

function addBalloons(){
      for(let i = 0; i < 1; i++){
          displayImg.push(new Balloon());
      }
}

class Balloon {

  constructor (){
    let balloons = [img1, img2, img3];
    let choice = random(balloons);
    this.img = choice;
    this.x = random(w-100);
    this.y = random(h-100);
    this.diameter = 100;
    // this.diameter = random(50, 100);
  }

  getX(){
    return this.x;
  }

  getY(){
    return this.y;
  }

  display() {
    image(this.img, this.x, this.y, this.diameter, this.diameter);
  }

  contains(px,py){
    let d = dist(px,py, this.x + this.diameter/2,this.y+ this.diameter/2); //distance between the mouse and the circle
    //return d;
    if(d < 50){
      return true;
    }
    return false;
    }
}

// Draw the hands into the P5 canvas
function drawHands(){
  const hands = handsfree.data?.hands
  
  // Bail if we don't have anything to draw
  if (!hands?.landmarks) return
  
  // Draw keypoints
  hands.landmarks.forEach((hand, handIndex) => {
    hand.forEach((landmark, landmarkIndex) => {
      // Set color
      if(colorMap[handIndex]){
        switch(landmarkIndex){
          case 4: fill(colorMap[handIndex][0])
          case 8: fill(colorMap[handIndex][1]); break
          case 12: fill(colorMap[handIndex][2]); break
          case 16: fill(colorMap[handIndex][3]); break
          case 20: fill(colorMap[handIndex][4]); break
          default:
            fill(color(255, 255, 255))
        }
      }
      
      stroke(color(0, 0, 0))
      strokeWeight(0)
      circleSize = 10
      
      circle(
      //Flip horizontally
      sketch.width - landmark.x * sketch.width,
      landmark.y * sketch.height,
      circleSize
      )
    })
  })
  }


function startVideoAnalysis()
{
    // Turn on some models (hand tracking ) and the show debugger
  handsfree = new Handsfree({
    showDebug: true, // Comment this out to hide the default webcam feed with landmarks
    hands: true});
  
  handsfree.enablePlugins('browser')
  handsfree.plugin.pinchScroll.disable()
  
  // put the debug-video in a wrapper div  
  // (first) remove the existing text
  document.querySelector('#debug-wrap').innerHTML = "";
  document.querySelector('#debug-wrap').appendChild(document.querySelector('.handsfree-debugger'));
  
  // Listen for the event
document.addEventListener('handsfree-gotUserMedia', (event) => {
  console.log("EVENT: handsfree-gotUserMedia" );
  console.log(event.detail)
})
handsfree.on('gotUserMedia', (event) => {
  console.log("EVENT: gotUserMedia" );
  console.log(event)
})
  
  // Add webcam buttons under the canvas
  buttonStart = createButton('Start Webcam')
  buttonStart.class('handsfree-show-when-stopped')
  buttonStart.class ('handsfree-hide-when-loading')
  buttonStart.mousePressed(() => handsfree.start())
  
  // Create a "loading..." butoon
  buttonLoading = createButton('...loading...')
  buttonLoading.class('handsfree-show-when-loading')
  
  // Create a stop button
  buttonStop = createButton('Stop Webcam')
  buttonStop.class('handsfree-show-when-started')
  buttonStop.mousePressed(() => handsfree.stop())  

}

/***** CAMERA FUNCTION STUFF ******/
// function that gets "called back" (invoked) when devices have been discovered
// will be passed an array of device info
function gotDevices(deviceInfos) {

  // iterate over the discovered devices to populate a dictionary of label, id info
  for (let i = 0; i < deviceInfos.length; i++) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == 'videoinput') {
      devices.push({
        label: deviceInfo.label,
        id: deviceInfo.deviceId
      });
    }
  }
  
  // print out the discovered devices
  console.log(devices);

  // let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  // console.log(supportedConstraints);
  
  // check if we have camera permissions
  navigator.permissions.query({ name: 'camera' })
  .then(function(permissionStatus) {
    if (permissionStatus.state === 'granted') {
      // Camera access is granted
      console.log( "camera access granted!");
      
      // start the video capture
      initCapture();
    } else {
      // Camera access is not granted; request permission as needed
      console.log( "camera access not granted");

      navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        // Handle the camera stream now that we succeeded
        // use the discovered camera information to initialize the capture video stream
        initCapture();
      })
      .catch(function(error) {
        // Handle errors, such as permission denied
        console.log( error );
      });
    }
  });  
}

function initCapture()
{  
  var constraints = {
        audio: false,
        video: {
            width: w,
            height: h,
            deviceId: {
              exact: devices[selectCameraIndex].id // chooses the webcam to use for input
            }
        }
      };
  console.log( constraints);
  
    // p5 offers createCapture function, creates an HTML element that shows video stream
    
  
    // p5 offers createCapture function, creates an HTML element that shows video stream
    capture = createCapture( constraints, 
                            function() {
                                  console.log('capture ready: ' )
                                  capture.elt.id = "captured-video";
                                  console.log(capture.elt);
                                  captureReady = true;
                                  startVideoAnalysis(); // custom callback 
                            });
    
  
    capture.elt.setAttribute('playsinline', '');
    capture.size(w, h);
    capture.hide();
}


/***** END CAMERA FUNCTION STUFF ******/