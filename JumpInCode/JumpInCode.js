// dragDrop('#transcriptBox', {

//   onDropText: (text, pos) => {
//     console.log('Here is the dropped text:', text)
//     console.log('Dropped at coordinates', pos.x, pos.y)
//   }

// })


var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
var vidElementOnly = document.getElementById('videoElement')
var cameraReady = 0
var canSelectWords = false
var keyWordBox = document.getElementById("keyWordsBox")
var model;
let videoInterval = 100
var updatedPose;
var updatePoseOnce = 0
var leftIndexFingerSinceCamFlipped;

const modelParams = {
  flipHorizontal: true,   // flip e.g for video 
  imageScaleFactor: 0.7,  // reduce input image size .
  maxNumBoxes: 20,        // maximum number of boxes to detect
  iouThreshold: 0.5,      // ioU threshold for non-max suppression
  scoreThreshold: 0.79,    // confidence threshold for predictions.
}

const canvasCtx = canvasElement.getContext('2d');

// fetch("https://type.fit/api/quotes")
//   .then(function(response) {
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);
//   });


// const background = document.getElementById("uploadImage");
let i = 0
let temp = 0
let previousHorizontalPosition = 0
let previousVerticalPosition = 0

let previousHorizontalIndexLeftPosition = 0
let keyPressedHorizonal = false
let keyPressedVertical = false


// const image_input = document.querySelector("#image_input");
// image_input.addEventListener("change", function() {
//    const reader = new FileReader();
//    reader.addEventListener("load", () => {
//    const uploaded_image = reader.result;
//    console.log(uploaded_image)
//    background.src = uploaded_image
//    //document.querySelector("#display_image").style.backgroundImage = `url(${uploaded_image})`;
// });
//    reader.readAsDataURL(this.files[0]);
// });



//speech


const resultDiv = document.getElementById('transcriptBox')
let finalTranscript = ''
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
var recognition = new webkitSpeechRecognition()
recognition.lang = 'en-US'
recognition.interimResults = true
recognition.continuous = true


 const saveTranscriptButton = document.getElementById('saveTranscript')
saveTranscriptButton.setAttribute("onclick","save_transcript('transcript');");



save_transcript = function(value)
{

var loc = window.location.pathname;
var dir = loc.substring(0, loc.lastIndexOf('/'));
let data = finalTranscript
console.log("data is:" + data)
    var textToWrite = finalTranscript
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = "Transcript"
      var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();

}


recognition.onresult = (event) => {
  var newLineCount = 0
  for (let i = event.resultIndex; i < event.results.length; i++) {
    let transcript = event.results[i][0].transcript
    if (event.results[i].isFinal) {
      if(finalTranscript.split(' ').length % 5 == 0)
      {
        finalTranscript = finalTranscript + transcript + "\n"
      }
      else
      {
        finalTranscript += transcript
      }
      
      interimTranscript = ''
    } else {
      interimTranscript = transcript
    }
    let html = getHTML(finalTranscript)
    html += '<i style="color:#777;">' + interimTranscript + '</i>'
    resultDiv.innerHTML = html
    console.log(finalTranscript)
    console.log(finalTranscript.split(' ').length)
  }
}


function getHTML(transcript) {
  let html = ''
  let words = transcript.split(' ')
  for (let j = 0; j < words.length; j++) {
    let word = words[j]
    html += `<i class="draggable" \
                id="word-${j}-${word}"\
                draggable="true" \
                ondragstart="onDragStart(event)" \
                >` + word + '</i>' + ' '
  }
  return html
}

recognition.start()


const muteButton = document.getElementById('muteButton')


muteButton.onclick = function()
{
  value = muteButton.value
  console.log(value)
  if (value == "Mute")
  {
    recognition.stop()
    muteButton.value = "Unmute"
  }

  else
  {
    recognition.start()
    muteButton.value = "Mute"
  }


}

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
 // runDetection()

//mode selection

const modeType = document.getElementById('modeType')

if(modeType.value == "drawing")
{
  //console.log("in drwaring mode")
  canSelectWords = false
  document.getElementById("layer1").style.zIndex = "1";
  document.getElementById("layer2").style.zIndex = "2";
  document.getElementById("editor").style.zIndex = "-1";

  document.getElementById("drawTool").disabled = false;
  document.getElementById("eraseTool").disabled = false;
  document.getElementById("clearDrawings").disabled = false;
}

if(modeType.value == "editor")
{
  //console.log("in editor mode")
  canSelectWords = false
  document.getElementById("layer1").style.zIndex = "-1";
  document.getElementById("layer2").style.zIndex = "1";
  document.getElementById("editor").style.zIndex = "2";

  document.getElementById("drawTool").disabled = true;
  document.getElementById("eraseTool").disabled = true;
  document.getElementById("clearDrawings").disabled = true;

  editor.setReadOnly(false);
}


if(modeType.value == "highlightMode")
{
  canSelectWords = true
  document.getElementById("layer1").style.zIndex = "-1";
  document.getElementById("layer2").style.zIndex = "1";
  document.getElementById("editor").style.zIndex = "2";


    document.getElementById("drawTool").disabled = true;
  document.getElementById("eraseTool").disabled = true;
  document.getElementById("clearDrawings").disabled = true;

  editor.setReadOnly(true);


}



function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
        console.log(text)
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function doSomethingWithSelectedText() {

    var selectedText = editor.getSelectedText();
    
    if (selectedText != "" && canSelectWords)
    {
  //       alertify.confirm("This is a confirm dialog.",
  // function(){
  //   alertify.success('Ok');
  // },
  // function(){
  //   alertify.error('Cancel');
  // });
      var lineNumber = editor.selection.getCursor().row + 1
      keyWordBox.innerHTML += "Line number " +  lineNumber + ": " + selectedText + "<br />" 
    }
    
}

document.onmouseup = doSomethingWithSelectedText;
//document.onkeyup = doSomethingWithSelectedText;



 const saveKeyWordButton = document.getElementById('saveKeyWords')
saveKeyWordButton.setAttribute("onclick","save_keywords('transcript');");

save_keywords = function(value)
{

var loc = window.location.pathname;
var dir = loc.substring(0, loc.lastIndexOf('/'));
let data = keyWordBox.textContent
console.log("data is:" + data)
    var textToWrite = keyWordBox.innerHTML
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = "Keywords"
      var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();

}

//language selection
const languageType = document.getElementById('editorLanguageSelect')
if(editorLanguageSelect.value == "javascript")
{
  editor.session.setMode("ace/mode/javascript");
}

if(editorLanguageSelect.value == "python")
{
  editor.session.setMode("ace/mode/python");
}

if(editorLanguageSelect.value == "cpp")
{
  editor.session.setMode("ace/mode/c_cpp");
}

if(editorLanguageSelect.value == "java")
{
  editor.session.setMode("ace/mode/java");
}

if(editorLanguageSelect.value == "txt")
{
  editor.session.setMode("ace/mode/text");
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

    
    // canvasCtx.drawImage(
    //   background, 0, 0, canvasElement.width, canvasElement.height);
 canvasCtx.globalCompositeOperation = 'source-over';
      // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      //            {color: '#00FF00', lineWidth: 4});
      //console.log(typeof(results.poseLandmarks[20]))
      //leftIndexFingerSinceCamFlipped = {x:results.poseLandmarks[20].x,y:results.poseLandmarks[20].y-0.1,z:results.poseLandmarks[20].z}
  // drawLandmarks(canvasCtx, [leftIndexFingerSinceCamFlipped],
  //               {color: '#FF0000', lineWidth: 2});

  canvasCtx.restore();
}


// const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
//   return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
// }});
// selfieSegmentation.setOptions({
//   modelSelection: 1,
//   selfieMode: true,
// });
// selfieSegmentation.onResults(onResults);


const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
  modelComplexity: 1,
  selfieMode: true,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);




const camera = new Camera(videoElement, {
  onFrame: async () => {

    await pose.send({image: videoElement});
    if(cameraReady == 0)
    {
      //alert("Camera Ready! You can start using the application now ☺️")
      document.getElementById('loader').style.visibility="hidden";
      cameraReady++
      
    }
    
  },
  width: 1280,
  height: 720
});
// const modeType = document.getElementById('modeType')
// // //by default, set to editor mode
// modeType.value = "editor"
camera.start();






function runDetection() {
  console.log("in here")
    model.detect(videoElement).then(predictions => {
        // console.log("Predictions: ", predictions);
        // get the middle x value of the bounding box and map to paddle location
        console.log(predictions[0])
        if (videoButton.value == "On") {
            setTimeout(() => {
                runDetection(videoElement)
            }, videoInterval);
        }
    });
}









const videoButton = document.getElementById('videoButton')


videoButton.onclick = function()
{
  value = videoButton.value
  console.log(value)
  if (value == "Off")
  {
    camera.stop()
    videoButton.value = "On"
  }

  else
  {
    camera.start()
    videoButton.value = "Off"
  }


}


//drawing 

  const canvasElementDrawing = document.getElementById('layer2');
  const drawButton = document.getElementById('drawTool');
  const eraseButton = document.getElementById('eraseTool');
  const clearDrawingsButton = document.getElementById('clearDrawings');
  const colorChoice = document.getElementById('penColor')
  drawButton.setAttribute("onclick","use_tool('draw');");
  eraseButton.setAttribute("onclick","use_tool('erase');");
  clearDrawingsButton.setAttribute("onclick","clearDrawings();");
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
              canvasDrawingCtx.strokeStyle = 'rgba(253, 255, 50, 0.5)'
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

clearDrawings = function()
{
  canvasDrawingCtx.clearRect(0, 0, canvasElementDrawing.width, canvasElementDrawing.height);
}



//Use draw|erase
use_tool = function(tool) {
    tooltype = tool; //update



} 

select_color = function(value)
{
  penColor = value;
}


function handleFileSelect(evt) {
    let files = evt.target.files; // FileList object

    // use the 1st file from the list
    let f = files[0];
    
    let reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
          
         // jQuery( '#ms_word_filtered_html' ).val( e.target.result );
         if (f.name.split('.').pop() == "js" || f.name.split('.').pop() == "py" || f.name.split('.').pop() == "cpp" || f.name.split('.').pop() == "java"
          || f.name.split('.').pop() == "txt")
         {
          editor.setValue( e.target.result);

         }

         else
         {
          alert("File not supported! You can upload .py, .js, .cpp files, .txt, or .java file extensions.")
         }
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(f);
  }

  document.getElementById('upload').addEventListener('change', handleFileSelect, false);


