// The first two coordinates are one end, the second two are the other end.
// var line = [0, 0, 0, 0];


function sin_to_hex(i, phase) {
    var sin = Math.sin(Math.PI / 50 * 2 * i + phase);
    var int = Math.floor(sin * 127) + 128;
    var hex = int.toString(16);
  
    return hex.length === 1 ? "0"+hex : hex;
  }
  
  function applyVel(cord, vel){
    for(var i = 0; i < cord.length; i++){
      cord[i] += vel[i]
    }
  }
  
  function release(event){
    change = [0,0,0];
  }
  
  function keyEvent(event){
    keyCode = event.which;
    console.log(change[1]);
    if (keyCode === 87) {
      change[1] += -5;
    }
    else if (keyCode === 83) {
      change[1] += 5;
    }
    if (keyCode === 32) {
      change[2] *= -1;
    }
    if (keyCode === 65) {
      change[1] *= -1;
    }
  }
  
  function drawAll()
  /*
    Purpose: This is the main drawing loop.
    Inputs: None, but it is affected by what the other functions are doing
    Returns: None, but it calls itself to cycle to the next frame
  */
  {
    // Change the line endpoints some.
    // line[0] += lineChange[0];
    // line[1] += lineChange[1];
    // line[2] += lineChange[2];
    // line[3] += lineChange[3];
    i++;
    // coord[0] += change[0];
    // coord[1] += change[1];
    applyVel(coord, change)
    applyVel(coord_1, change_1)
    // radius += change[2] ;
  
    // Draw the line
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
    var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
  
  
  
    var color = "#"+ red + green + blue;
    context.lineWidth = 10;
    // console.log(color)
  
    context.beginPath();
    context.arc(coord[0], coord[1], coord[2], 0, 2 * Math.PI);
    context.strokeStyle = color;
    context.stroke();
  
    context.beginPath();
    context.arc(coord_1[0], coord_1[1], coord_1[2], 0, 2 * Math.PI);
    context.strokeStyle = color;
    context.stroke();
    
    if ((coord[0] + coord[2] + 5 >= canvas.width) || (coord[0] - coord[2] - 5 <= 0)) {
      change[0] *= -1;
      change[2] *= -1;
      // console.log(lineChange);
    }
    else if ((coord[1] + coord[2] + 5 >= canvas.height) || (coord[1] - coord[2] - 5 <= 0)) {
      change[1] *= -1;
      change[2] *= -1;
      // console.log(lineChange);
    }
    else if(coord[2] <= 1)
      change[2] *= -1;
    
    if ((coord_1[0] + coord_1[2] + 5 >= canvas.width) || (coord_1[0] - coord_1[2] - 5 <= 0)) {
      change_1[0] *= -1;
      change_1[2] *= -1;
      // console.log(lineChange);
    }
    else if ((coord_1[1] + coord_1[2] + 5 >= canvas.height) || (coord_1[1] - coord_1[2] - 5 <= 0)) {
      change_1[1] *= -1;
      change_1[2] *= -1;
      // console.log(lineChange);
    }
    else if(coord_1[2] <= 1)
      change_1[2] *= -1;
    // context.moveTo(line[0], line[1]);
    // context.lineTo(line[2], line[3]);
    // context.stroke();
    
    // Loop the animation to the next frame.
    window.requestAnimationFrame(drawAll);
  }
  
  // Get width/height of the browser window
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  console.log("Window is %d by %d", windowWidth, windowHeight);
  
  // Get the canvas, set the width and height from the window
  const canvas = document.getElementById("mainCanvas");
  // I found that - 20 worked well for me, YMMV
  canvas.width = windowWidth - 20;
  canvas.height = windowHeight - 20;
  canvas.style.border = "1px solid black";
  
  // Set up the context for the animation
  const context = canvas.getContext("2d");
  
  var change = [0, 0, 0];
  var coord = [canvas.width/2,canvas.height/2, 3];
  // var radius = 1;
  
  var change_1 = [-2, 4, 3];
  var coord_1 = [canvas.width/3,canvas.height/3, 3];
  // var radius_1 = 1;
  
  var i = 0;
  
  // event listeners
  document.addEventListener("keydown", keyEvent);
  document.addEventListener("keyup", release);
  // Fire up the animation engine
  window.requestAnimationFrame(drawAll);
  