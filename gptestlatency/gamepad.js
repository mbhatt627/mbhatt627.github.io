const haveEvents = 'ongamepadconnected' in window;
const controllers = {};

function rumble() {
  controllers[0].vibrationActuator.playEffect('dual-rumble', {
    startDelay: 0,
    duration: 200,
    weakMagnitude: 1.0,
    strongMagnitude: 1.0,
  }); 
}

function rumbleH() {
  controllers[0].hapticActuators[0].pulse(1.0, 200);
}

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;

  const d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);

  const t = document.createElement("h1");
  t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
  d.appendChild(t);

  const b = document.createElement("div");
  b.className = "buttons";
  for (let i = 0; i < gamepad.buttons.length; i++) {
    const e = document.createElement("span");
    e.className = "button";
    //e.id = "b" + i;
    e.innerHTML = i;
    b.appendChild(e);
  }

  d.appendChild(b);

  const a = document.createElement("div");
  a.className = "axes";

  for (let i = 0; i < gamepad.axes.length; i++) {
    const p = document.createElement("progress");
    p.className = "axis";
    //p.id = "a" + i;
    p.setAttribute("max", "2");
    p.setAttribute("value", "1");
    p.innerHTML = i;
    a.appendChild(p);
  }

  d.appendChild(a);

  if ( gamepad.vibrationActuator )  {
    const h = document.createElement("h1");
    h.appendChild(document.createTextNode("haptic: " + gamepad.vibrationActuator.type ));
    const btn = document.createElement("button");
    btn.innerHTML = "Haptic Vibration";
    btn.setAttribute("onclick", "rumble()")
    d.appendChild(btn);

    d.appendChild(h);
  } else {
    const h = document.createElement("h1");
    h.appendChild(document.createTextNode("haptic: No gamepad.vibrationActuator support"  ));
    d.appendChild(h);
  }

   if ( gamepad.hapticActuator )  {
    const h = document.createElement("h1");
    h.appendChild(document.createTextNode("haptic: hapticActuator" ));
    const btn = document.createElement("button");
    btn.innerHTML = "Haptic Rumbler";
    btn.setAttribute("onclick", "rumbleH()")
    d.appendChild(btn);

    d.appendChild(h);
  } else {
    const h = document.createElement("h1");
    h.appendChild(document.createTextNode("haptic: No gamepad.hapticActuator support"  ));
    d.appendChild(h);
  }
  
  // See https://github.com/luser/gamepadtest/blob/master/index.html
  const start = document.getElementById("start");
  if (start) {
    start.style.display = "none";
  }

  document.body.appendChild(d);
  requestAnimationFrame(updateStatus);
  
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  const d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}
let start, previousTimeStamp;

function updateStatus(timeStamp) {
  if (!haveEvents) {
    scangamepads();
  }

  let i = 0;
  let j;
  
  if (start === undefined) {
    start = timeStamp;
  }
  const elapsed = timeStamp - start;
  //console.log("elapsed time: " + elapsed);
  for (j in controllers) {
    const controller = controllers[j];
    const d = document.getElementById("controller" + j);
    const buttons = d.getElementsByClassName("button");

    for (i = 0; i < controller.buttons.length; i++) {
      let b = buttons[i];
      let val = controller.buttons[i];
      let pressed = val == 1.0;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        val = val.value;
        
      }

      const pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;

      if (pressed) {
        b.className = "button pressed";
        console.log("button pressed. ev timestamp: " + controller.timestamp + " epoch time: " + Date.now() + " value: " + val);
      } else {
        b.className = "button";
      }
    }

    const axes = d.getElementsByClassName("axis");
    for (let i = 0; i < controller.axes.length; i++) {
      const a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i] + 1);
    }
  }
  previousTimeStamp = timeStamp;
  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
 setInterval(scangamepads, 500);
}


let nIntervId;
const oTimerElem = document.getElementById("timer");

function startTimer() {
  // check if an interval has already been set up
  if (!nIntervId) {
    nIntervId = setInterval(updateTime, 2000);
  }
}

function updateTime() {
  
  oTimerElem.innerText = Date.now();
  
}

function stopTimer() {
  clearInterval(nIntervId);
  // release our intervalID from the variable
  nIntervId = null;
}

//document.getElementById("start").addEventListener("click", startTimer);
//document.getElementById("stop").addEventListener("click", stopTimer);