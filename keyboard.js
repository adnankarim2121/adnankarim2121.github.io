const keys = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const phrases = ["CV", "RESEARCH PUBLICATIONS"];
var i = 0
var j = 0
const timestamps = [];

timestamps.unshift(getTimestamp());

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey() {
  var element = keys[i]
  i++
  return element
}

function targetKey(letter) {
  const key = document.getElementById(letter);
  console.log(key)
  key.classList.add("selected");
  let start = Date.now()
}

function getTimestamp() {
  return Math.floor(Date.now() / 1000)
}

function isPhraseEnteredValid(currentResult, keyPressed)
{
  var el = currentResult.innerHTML
  if (phrases.includes(el) && keyPressed === "Enter")
  {
    console.log("this works")
    var x = document.getElementById("mycv")
    x.style.display = "block";
  }

  else
  {
    var x = document.getElementById("mycv")
    x.style.display = "none";
    console.log("no")
  }
}

function deleteLetter()
{

  var currentResult = document.getElementById("result")
  if(currentResult.innerHTML.length !== 0)
  {
    var newText = currentResult.innerHTML.slice(0,-1)

    if(newText === "")
    {
      currentResult.innerHTML = "Typed Letters Shown Here:"
      j = 0
    }

    else{
    currentResult.innerHTML = newText

    }
  }

  isPhraseEnteredValid(currentResult, "None")



}

function updateHeader(letter)
{
  var updateHeaderInfo = document.getElementById("result");
  if (j == 0)
  {
    updateHeaderInfo.innerHTML = letter
    j++


  }
  else
  {
    updateHeaderInfo.innerHTML = updateHeaderInfo.innerHTML + letter
  }
}

document.addEventListener("keyup", event => {

  console.log(event.key)

  if(event.key === "Enter")
  {
    var cv = document.getElementById("cv")
    var currentResult = document.getElementById("result")
    isPhraseEnteredValid(currentResult, event.key)

    const highlightedKey = document.querySelector(".selected");
  const keyElement = document.getElementById("enter");
  keyElement.classList.add("hit")
  keyElement.addEventListener('animationend', () => {
    keyElement.classList.remove("hit")
  })
    //cv.style.display = "block";
  }

  else if(event.key === "Backspace")
  {
    deleteLetter()
    const highlightedKey = document.querySelector(".selected");
  const keyElement = document.getElementById("back");
  keyElement.classList.add("hit")
  keyElement.addEventListener('animationend', () => {
    keyElement.classList.remove("hit")
  })
  }

  else
  {
    const keyPressed = String.fromCharCode(event.keyCode);
    updateHeader(keyPressed)

    var currentResult = document.getElementById("result")
    isPhraseEnteredValid(currentResult, event.key)
    const keyElement = document.getElementById(keyPressed);

      const highlightedKey = document.querySelector(".selected");
  
  keyElement.classList.add("hit")
  keyElement.addEventListener('animationend', () => {
    keyElement.classList.remove("hit")
  })
  
  // if (keyPressed === highlightedKey.innerHTML) {
  //   timestamps.unshift(getTimestamp());
  //   const elapsedTime = timestamps[0] - timestamps[1];
  //   console.log(`Character per minute ${60/elapsedTime}`)
  //   highlightedKey.classList.remove("selected");
  //   targetKey();

  // } 

  }

})

//targetKey();