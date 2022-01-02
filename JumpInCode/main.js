    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
//editor.session.setMode(new JavaScriptMode());
//editor.setReadOnly(false);
editor.insert("hello")
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];

const canvasCtx = canvasElement.getContext('2d');


const background = document.getElementById("uploadImage");
let i = 0
let temp = 0
let previousHorizontalPosition = 0
let previousVerticalPosition = 0
let keyPressedHorizonal = false
let keyPressedVertical = false


const image_input = document.querySelector("#image_input");
image_input.addEventListener("change", function() {
   const reader = new FileReader();
   reader.addEventListener("load", () => {
   const uploaded_image = reader.result;
   console.log(uploaded_image)
   background.src = uploaded_image
   //document.querySelector("#display_image").style.backgroundImage = `url(${uploaded_image})`;
});
   reader.readAsDataURL(this.files[0]);
});


document.addEventListener("keydown", function(event) {
  console.log(event.which);
  if(event.which == 68 || event.which == 65)
  {
  	keyPressedHorizonal = true
  	updateHorizontalPosition(event.which)
  }

    if(event.which == 87 || event.which == 83)
  {
  	keyPressedVertical = true
  	updateVerticalPosition(event.which)
  }

})

function updateHorizontalPosition(keycode)
{
	if (i == 0)
	{
	 i++
	 return previousHorizontalPosition				
	}

	//right
	if(keycode == 68 && keyPressedHorizonal)
	{
		previousHorizontalPosition = previousHorizontalPosition +5
		keyPressedHorizonal = false
	}

	//left
	if(keycode == 65 && keyPressedHorizonal)
	{
		previousHorizontalPosition = previousHorizontalPosition - 5
		keyPressedHorizonal = false
	}

	return previousHorizontalPosition
}

function updateVerticalPosition(keycode)
{
	if (i == 0)
	{
	 i++
	 return previousVerticalPosition				
	}

	//up
	if(keycode == 87 && keyPressedVertical)
	{
		previousVerticalPosition = previousVerticalPosition -5
		keyPressedVertical = false
	}

	//down
	if(keycode == 83 && keyPressedVertical)
	{
		previousVerticalPosition = previousVerticalPosition + 5
		keyPressedVertical = false
	}

	return previousVerticalPosition

}
function onResults(results) {


    //mode selection
const modeType = document.getElementById('modeType')
if(modeType.value == "drawing")
{
  console.log("in drwaring mode")
  document.getElementById("layer1").style.zIndex = "1";
  document.getElementById("layer2").style.zIndex = "2";
  document.getElementById("editor").style.zIndex = "-1";
}

if(modeType.value == "editor")
{
  console.log("in editor mode")
  document.getElementById("layer1").style.zIndex = "-1";
  document.getElementById("layer2").style.zIndex = "1";
  document.getElementById("editor").style.zIndex = "2";
}
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  let width = updateHorizontalPosition()
  let height = updateVerticalPosition()
  //this handles the segmentation mask
  canvasCtx.drawImage(results.segmentationMask, width, height,
                      canvasElement.width-600, canvasElement.height-500);



  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.

  //this handles the actual image/stream
  canvasCtx.drawImage(
      results.image, width, height, canvasElement.width-600, canvasElement.height-500);

    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
      background, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.restore();
}


const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
}});
selfieSegmentation.setOptions({
  modelSelection: 1,
  selfieMode: true,
});
selfieSegmentation.onResults(onResults);





const camera = new Camera(videoElement, {
  onFrame: async () => {
    await selfieSegmentation.send({image: videoElement});
    
  },
  width: 1280,
  height: 720
});
camera.start();


//drawing 

  const canvasElementDrawing = document.getElementById('layer2');
  const drawButton = document.getElementById('drawTool');
  const eraseButton = document.getElementById('eraseTool');
  const colorChoice = document.getElementById('penColor')
  drawButton.setAttribute("onclick","use_tool('draw');");
  eraseButton.setAttribute("onclick","use_tool('erase');");
  const canvasDrawingCtx = canvasElementDrawing.getContext('2d');
 var canvasx = $(canvasElementDrawing).offset().left;
var canvasy = $(canvasElementDrawing).offset().top;
var last_mousex = 0;
var last_mousey = 0;
var mousex = 0;
var mousey = 0;
var mousedown = false;
var tooltype = 'erase';
var penColor = 'black';

//Mousedown
$(canvasElementDrawing).on('mousedown', function(e) {
    last_mousex = mousex = parseInt(e.clientX-canvasx);
  last_mousey = mousey = parseInt(e.clientY-canvasy);
    mousedown = true;
});

//Mouseup
$(canvasElementDrawing).on('mouseup', function(e) {
    mousedown = false;
});

//Mousemove
$(canvasElementDrawing).on('mousemove', function(e) {
    mousex = parseInt(e.clientX-canvasx);
    mousey = parseInt(e.clientY-canvasy);
    if(mousedown) {
        canvasDrawingCtx.beginPath();
        if(tooltype=='draw') {
            canvasDrawingCtx.globalCompositeOperation = 'source-over';
            canvasDrawingCtx.strokeStyle = colorChoice.value;
            canvasDrawingCtx.lineWidth = 3;
            if(colorChoice.value == "highlight")
            {
              console.log("in here")
              canvasDrawingCtx.strokeStyle = 'rgba(255, 255, 0, 0.1)'
              canvasDrawingCtx.lineWidth = 30;
            }
        } else {
            canvasDrawingCtx.globalCompositeOperation = 'destination-out';
            canvasDrawingCtx.lineWidth = 50;
        }
        canvasDrawingCtx.moveTo(last_mousex,last_mousey);
        canvasDrawingCtx.lineTo(mousex,mousey);
        canvasDrawingCtx.lineJoin = 'round';
        canvasDrawingCtx.lineCap = 'round';
        canvasDrawingCtx.stroke();
    }
    last_mousex = mousex;
    last_mousey = mousey;
    //Output
    $('#output').html('current: '+mousex+', '+mousey+'<br/>last: '+last_mousex+', '+last_mousey+'<br/>mousedown: '+mousedown);



});

//Use draw|erase
use_tool = function(tool) {
    tooltype = tool; //update
} 

select_color = function(value)
{
  penColor = value;
}


