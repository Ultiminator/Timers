
// TODO: add estimated time Div
// TODO: add stop watch

//I will save timers info in a map
var timersMap = new Map();
var savedMap = new Map();
var gInterval = "";


// load saved timers onloadin the document body
function loadTimers() {
  // create some initial timers
  timersMap.set("5555", {id: "5555", name: "5mins",hours: 0, mins: 5,
                          secs: 0, counting: false, interval: 0});
  timersMap.set("1111", {id: "1111", name: "1min", hours: 0, mins: 1,
                         secs: 0, counting: false, interval: 0});
  timersMap.set("1010", {id: "1010", name: "10secs", hours: 0, mins: 0,
                           secs: 10, counting: false, interval: 0});
  timersMap.forEach(function(value, key) {
    // call a function that creates Html elements for each timer
    addTimer(key, value.name, value.hours, value.mins, value.secs);
  })
}
// function to remove the specific timer
function removeTimer(item) {
  let timerid = item.parentNode.id;
  let timerobj = timersMap.get(timerid);
  clearInterval(timerobj.interval);
  timersMap.delete(timerid);
  item.parentNode.remove();
}
// remove all timers at once
function removeAll(item){
  //remove every timer element
  const timersCollection = document.getElementsByClassName("timer");
  let size = timersCollection.length;
  for (var i = 0; i < size; i++) {
    timersCollection[0].remove();
  }
  //clear all interval first befor deleteing
  // there was a bug that the interval still counting after deletion
  timersMap.forEach(function(value, key) {
    clearInterval(value.interval);
  })
  // clear all timers from the maps
  timersMap.clear();
  savedMap.clear();
}
function showAdding(){
  document.getElementById("AddWindow").style.display = "flex";
}
function cancelAdding() {
  document.getElementById("AddWindow").style.display = "none";
}
function createTimer() {
  let timerId = "";
  let name = document.getElementById("timerName").value;
  let hours = Number(document.getElementById("hours").value);
  let mins = Number(document.getElementById("mins").value);
  let secs = Number(document.getElementById("secs").value);
  //create Name
  for (let i = 0; i < 10; i++) {
    let random = Math.floor(Math.random() * 26) + 97;
    timerId += String.fromCharCode(random);
  }
  //put them into an object and add it to the timers map
  timersMap.set(timerId, {id: timerId, name: name, hours: hours, mins: mins,
                          secs: secs, counting: false, interval: 0});
  //call to create a timer element
  addTimer(timerId, name, hours, mins, secs);
  cancelAdding();
}

//function to add 0 before numbers less than 10
function addZero(i) {
  i = Number(i);
  if (i < 0){
    i = 0;
  }
  if (i < 10) {
    i = "0" + i;
  }
  return i.toString(); //is it necessary to convert to String?
}
// function to calculate the number of seconds in an object
function calculateSecs(obj){
  let x = obj.secs + (obj.mins * 60) + (obj.hours * 3600);
  return x;
}

//function to create a timer element from timer info
function addTimer(timerId, timerName, hours, mins, secs) {

  // create timer div
  const timer = document.createElement("div");
  timer.className = "timer";
  timer.id = timerId;

  // create timer name
  const title = document.createElement("div");
  title.className = "title";
  const titleText = document.createTextNode(timerName);
  title.appendChild(titleText);
  timer.appendChild(title);

  // create remove button
  const remove = document.createElement("div");
  remove.className = "remove";
  remove.setAttribute("onclick",
                      "showConfirm(this, removeTimer, 'remove one')");
  const removeImg = document.createElement("img");
  removeImg.src = "icons/remove.png";
  remove.appendChild(removeImg);
  timer.appendChild(remove);

  // create time viewer
  const timeContainer = document.createElement("div");
  timeContainer.className = "timeContainer";
  const time = document.createElement("div");
  time.className = "time";
  const timeTime = document.createTextNode(addZero(hours) + ":"
                                           + addZero(mins) + ":"
                                           + addZero(secs));
  time.appendChild(timeTime);
  const estimated = document.createElement("div");
  estimated.className = "estimated";
  const estimatedTime = document.createTextNode("");
  estimated.appendChild(estimatedTime);
  timeContainer.appendChild(time);
  timeContainer.appendChild(estimated);
  timer.appendChild(timeContainer);

  // create start/pause button
  const startButton = document.createElement("button");
  startButton.className = "start";
  startButton.setAttribute("onclick", "startTimer(this)");
  const startImge = document.createElement("img");
  startImge.src = "icons/start.png";
  startButton.appendChild(startImge);
  timer.appendChild(startButton);

  // create reset button
  const resetButton = document.createElement("button");
  resetButton.className = "reset";
  resetButton.disabled = true;
  resetButton.setAttribute("onclick",
                           "showConfirm(this, resetTimer, 'reset')");
  const resetImge = document.createElement("img");
  resetImge.src = "icons/reset.png";
  resetButton.appendChild(resetImge);
  timer.appendChild(resetButton);

  // finally add the div the nodes
  document.getElementById('timers').appendChild(timer);
}

function startTimer(id){
  // get important objects
  let timeDiv = id.parentNode.children[2];
  let timeDivTime = timeDiv.children[0];
  let timeDivEst = timeDiv.children[1];
  let timerid = id.parentNode.id;
  let timerobj = timersMap.get(timerid);
  timerobj.counting = true;
  //save the original time into the savedmap to use it during reseting
  //the if condition is to avoid changing it after some counting and pausing
  if (!savedMap.has(timerid)) {
    savedMap.set(timerid, {id: timerobj.id, name: timerobj.name,
                           hours: timerobj.hours, mins: timerobj.mins,
                           secs: timerobj.secs});
  }
  //change some styles
  timeDiv.style.border = "10px solid #1AC989";
  id.className = "pause";
  id.children[0].src = "icons/pause.png";
  id.parentNode.children[4].disabled = false;
  id.setAttribute("onclick", "pauseTimer(this)");
  //show estimated time
  let estDate = new Date();
  let seconds = calculateSecs(timerobj);
  estDate.setSeconds(estDate.getSeconds() + seconds);
  timeDivEst.innerHTML = addZero(estDate.getHours()) + ":"
                       + addZero(estDate.getMinutes());
  timeDivEst.style.display = "block";
  // set the interval
  timerobj.interval = setInterval(counting, 1000);
  function counting() {
    if (timerobj.secs > 0) {
      timerobj.secs = timerobj.secs - 1;
    }else {
      if (timerobj.mins > 0) {
        timerobj.mins = timerobj.mins - 1;
        timerobj.secs = 59;
      }else {
        if (timerobj.hours > 0) {
          timerobj.hours = timerobj.hours - 1;
          timerobj.mins = 59; // TODO: i think there is a bug here
        }else {
          clearInterval(timerobj.interval);
          timerobj.counting = false;
          //try playing audio
          let myaudio = document.createElement("audio");
          let audioSource = document.createElement("source");
          audioSource.src = "media/Alarm.mp3";
          audioSource.setAttribute("type","audio/mpeg");
          myaudio.appendChild(audioSource);
          id.parentNode.appendChild(myaudio);
          timerobj.interval = setInterval(playingSound,500);
          function playingSound() {
            myaudio.play();
          }
          //end
          id.children[0].src = "icons/stop.png";
          id.setAttribute("onclick", "stopTimer(this)");
        }
      }
    }
    timeDivTime.innerHTML = addZero(timerobj.hours) + ":"
                      + addZero(timerobj.mins) + ":"
                      + addZero(timerobj.secs);
  }
}
// when pause button is clicked
function pauseTimer(id){
  let timeDiv = id.parentNode.children[2];
  let timeDivEst = timeDiv.children[1];
  let timerid = id.parentNode.id;
  let timerobj = timersMap.get(timerid);
  timerobj.counting = false;
  clearInterval(timerobj.interval);
  id.className = "start";
  id.children[0].src = "icons/start.png";
  id.setAttribute("onclick", "startTimer(this)");
  timeDiv.style.border = "10px solid lightgray";
  timeDivEst.style.display = "none";
}
//function to stop playing alarm playing sound
function stopTimer(id) {
  let timeDiv = id.parentNode.children[2];
  let timeDivEst = timeDiv.children[1];
  let timerid = id.parentNode.id;
  let timerobj = timersMap.get(timerid);
  clearInterval(timerobj.interval);
  id.className = "start";
  id.children[0].src = "icons/start.png";
  id.setAttribute("onclick", "startTimer(this)");
  timeDiv.style.border = "10px solid lightgray";
  timeDivEst.style.display = "none";
  let myaudio = id.parentNode.children[5];
  myaudio.remove();
  // making stop button also rset the timer as it is finished
  // first to get the reset button object to use it  for calling resetTimer
  let resetButton = id.parentNode.children[4];
  resetTimer(resetButton);
}
//reset the timer
function resetTimer(id) {
  let timeDivTime = id.parentNode.children[2].children[0];
  let timeDivEst = id.parentNode.children[2].children[1];
  let timerid = id.parentNode.id;
  let timerobj = timersMap.get(timerid);
  let savedTimerobj = savedMap.get(timerid);
  timerobj.hours = savedTimerobj.hours;
  timerobj.mins = savedTimerobj.mins;
  timerobj.secs = savedTimerobj.secs;
  timeDivTime.innerHTML = addZero(savedTimerobj.hours) + ":"
                    + addZero(savedTimerobj.mins) + ":"
                    + addZero(savedTimerobj.secs);
  //calculate estimated time again
  let estDate = new Date();
  let seconds = calculateSecs(timerobj);
  estDate.setSeconds(estDate.getSeconds() + seconds);
  timeDivEst.innerHTML = addZero(estDate.getHours()) + ":"
                       + addZero(estDate.getMinutes());
  // remove the timer from saved map to free some memory
  // but only if not counting to avoid adding it again during resuming
  if (!timerobj.counting) {
    savedMap.delete(timerid);
    id.disabled = true;
  }
}
// function to show the confirm box
function showConfirm(id, callback, type) {
  // get the objects
  let confirm = document.getElementById('confirm');
  let confirmBox = document.getElementById('confirm-box');
  let confirmMsg = confirmBox.children[1];
  let okBtn = confirmBox.children[2];
  let cancelBtn = confirmBox.children[3];
  // decide the messagge
  if (type == "remove one") {
    let timerid = id.parentNode.id;
    let timerobj = timersMap.get(timerid);
    confirmBox.children[1].innerHTML = "you want to delete this timer:<br>"
                                     + timerobj.name;
  }else if (type == "remove all") {
    let timersNumber = timersMap.size;
    confirmMsg.innerHTML = "you want to delete all " + timersNumber + " timers?";
  }else if (type == "reset") {
    let timerid = id.parentNode.id;
    let timerobj = timersMap.get(timerid);
    confirmBox.children[1].innerHTML = "you want to reset this timer:<br>"
                                     + timerobj.name;
  }
  // set onclick functions and show the message
  okBtn.addEventListener("click", okFunction);
  cancelBtn.addEventListener("click", cancelFunction);
  function okFunction() {
    callback(id);
    okBtn.removeEventListener("click", okFunction);
    cancelBtn.removeEventListener("click", cancelFunction);
    confirm.style.display = "none";
  }
  function cancelFunction() {
    okBtn.removeEventListener("click", okFunction);
    cancelBtn.removeEventListener("click", cancelFunction);
    confirm.style.display = "none";
  }
  confirm.style.display = "flex";
}
// incrementing time picker
function upvalue(inputId, btn){
  let input = document.getElementById(inputId);
  let value = input.value;
  let max = input.max;
  function incrementUp(){
    if (value != max){
      value ++;
    }else {
      value = 0;
    }
    input.value = addZero(value);
  }
  incrementUp();//calling it to ensure it runs at least one time when clicking
  btn.onmouseup = function() { clearInterval(gInterval) };
  btn.onmouseout = function() { clearInterval(gInterval) };
  gInterval = setTimeout(function() {
    clearTimeout(gInterval);
    gInterval = setInterval(incrementUp, 100);
  }, 300);
}
function downvalue(inputId, btn){
  let input = document.getElementById(inputId);
  let value = input.value;
  let max = input.max;
  function incrementUp(){
    if (value != 0){
      value --;
    }else {
      value = max;
    }
    input.value = addZero(value);
  }
  incrementUp();//calling it to ensure it runs at least one time when clicking
  btn.onmouseup = function() { clearInterval(gInterval) };
  btn.onmouseout = function() { clearInterval(gInterval) };
  gInterval = setTimeout(function() {
    clearTimeout(gInterval);
    gInterval = setInterval(incrementUp, 100);
  }, 300);
}
