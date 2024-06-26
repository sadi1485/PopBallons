
const selectCameraIndex=1; // If you think there's more than one camera, pass in the index that you expect the desired one to be.
var capture;
var captureReady = false;
var tracker;
const devices = [];

BearImage = "BearEmoji.png";
Ballon1 = "Ballon1.png";
Ballon2 = "Ballon2.png";
Ballon3 = "Ballon3.png";
let displayImg = [];
var w = 640,
    h = 480, 
    x = 17,
    y = 17;

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
  navigator.mediaDevices.enumerateDevices().then(gotDevices);


  img = loadImage(BearImage);
  img1 = loadImage(Ballon1);
  img2 = loadImage(Ballon2);
  img3 = loadImage (Ballon3);

  sketch = createCanvas (640, 480);

  // Colors for each fingertip
  colorMap = [
    // Left fingertips
    [color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186)],
    
    // Right fingertips
    [color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186), color(255, 179, 186)]
  ]
  
  // Turn on some models (hand tracking ) and the show debugger
  handsfree = new Handsfree({
    showDebug: true, // Comment this out to hide the default webcam feed with landmarks
    hands: true
  })
  handsfree.enablePlugins('browser')
  handsfree.plugin.pinchScroll.disable()
  
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
  

  //----------------------------//
  for(let i = 0; i < 30; i++){
    displayImg.push(new Ballon());
  }

}

function draw() {

  // if the video stream isn't set up yet, don't do anything
  //if (!captureReady) return;

  // draw the current frame of video stream
  //image(capture, 0, 0, w, h);

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
        // text('On Ballon', 5, 50, 90);
        displayImg.splice(i, 1);
      }
      // text('Coordinates' + displayImg[i].getX() + ',' + displayImg[i].getY(), 1, 150, 90);
    
      // text('distance' + displayImg[i].contains(xcor, ycor), 10, 50, 90);
    }

})
}

class Ballon {
  
  constructor (){
    let ballons = [img1, img2, img3];
    let choice = random(ballons);
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

  function changePicture(){
    //if (hands?.pinchState) {return}

    // Since the canvas is inside an Iframe, we reach out and get it's containing iframe's bounding rect
    let bounds = document.querySelector('canvas').getClientRects()[0]
    // Check for pinches and create dots if something is pinched
    const hands = handsfree.data?.hands

    // Paint with fingers
    if (hands?.pinchState) {
      
      //Clear everything if the left [0] pinky [3] is pinched
      if (hands.pinchState[0][0] === 'released') {
        img = loadImage("fox.png");
      } else if(hands.pinchState[0][1] === 'released'){
        img = loadImage("Ballon1.png");
      }else if(hands.pinchState[0][2] === 'released'){
        img = loadImage("Ballon2.png");
      }else if(hands.pinchState[0][3] === 'released'){
        img = loadImage("Ballon3.png");
      }
    }
  }

  /***** CAMERA FUNCTION STUFF ******/
// function that gets "called back" (invoked) when devices have been discovered
// will be passed an array of device info
function gotDevices(deviceInfos) {
  for (let i = 0; i < deviceInfos.length; i++) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == 'videoinput') {
      devices.push({
        label: deviceInfo.label,
        id: deviceInfo.deviceId
      });
    }
  }
  console.log(devices);
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  console.log(supportedConstraints);
  
  // use the discovered camera information to initialize the capture video stream
  initCapture();
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
  
    // p5 offers createCapture function, creates an HTML element that shows video stream
    capture = createCapture( constraints, 
                        function() {
                            console.log('capture ready.');
                            captureReady = true;
                            initTracker();
                        } );
  
    capture.elt.setAttribute('playsinline', '');
    createCanvas(w, h);
    capture.size(w, h);
    capture.hide();
}
/***** END CAMERA FUNCTION STUFF ******/