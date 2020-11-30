// changing sine to hex for rainbow cycle
function sin_to_hex(i, phase) {
    var sin = Math.sin(Math.PI / 720 * 2 * i + phase);
    var int = Math.floor(sin * 127) + 128;
    var hex = int.toString(16);
    return hex.length === 1 ? "0"+hex : hex;
}

// function create r, g, b
function _rainbow_(i){
    var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
    var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg
    return "#"+ red + green + blue;
}

// create color string
const rainbow = (i) =>  _rainbow_(i);

// keypress events
function key_press(event){
    let keyCode = event.which;
    if (keyCode === 65) {
        ship.rot_vel = 5;
    } 
    else if (keyCode === 68) {
        ship.rot_vel = -5;
    }
    else if (keyCode === 32 && !fired) {
        console.log("fire");
        fired = true;
        console.log(bullet_container);
        fire();
    }
}

// key release
// reset variables to default
function key_release(event){
    let keyCode = event.which;
    if (keyCode === 65 || keyCode === 68)
        ship.rot_vel = 0;
    if (keyCode === 32 && fired)
        fired = false;
}

// apply rotation to all vectors in array
function rotate_vec (v, rotation) {
    for (let i = 0; i < v.length; i++) {
        // calling vector rotation function
        v[i] = vector_rotation(v[i], rotation);
    }
    
    return v;
}

// draw polygon
function draw_poly (vec, centre) {
    // begin path
    ctx.beginPath();

    // move to first point
    ctx.moveTo(centre.x + vec[0].x, centre.y + vec[0].y);

    // iterate through each point of the polygon
    for (let i = 1; i < vec.length; i++){
        ctx.lineTo(centre.x + vec[i].x, centre.y + vec[i].y);
    }
    
    // close the shape
    ctx.lineTo(centre.x + vec[0].x, centre.y + vec[0].y);
    ctx.stroke();
}

// draw player
function draw_player (centre, rotation){
    // vector from center of ship
    let vec = [vector(0, -40), vector(20, 20), vector(-20, 20)];

    // rotate vectors for player sprite
    vec = rotate_vec(vec, rotation);
    ship.rot_vec = vec[0];

    // draw player
    draw_poly(vec, centre);
}

function draw_bullet (){
    // begin path
    ctx.beginPath();
    for (let i = 0; i < bullet_container.length; i++){
        // draw bullet
        console.log("%i, %i",bullet_container[i].centre.x,bullet_container[i].centre.y)
        ctx.arc(bullet_container[i].centre.x,bullet_container[i].centre.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    }

    // // stroke
    // ctx.stroke();
}

function fire(){
    // scale the vector by 0.2 -> original has magnitude of 40 px
    bullet.vec = vector_scale(ship.rot_vec, 0.2);

    // center the bullet object
    bullet.centre = point_translate(ship.centre, ship.rot_vec);

    // deepcopy the bullet
    let copy = JSON.parse(JSON.stringify(bullet));

    // append 
    bullet_container.push(copy);
}

// draw function
function draw (i) {
    // set color
    let color = rainbow(i);
    ctx.strokeStyle = color;

    // clear screen
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apply rotation 
    ship.rotation += ship.rot_vel;

    // apply ship movement vector 
    ship.centre = point_translate(ship.centre, ship.vec);

    for (let i = 0; i < bullet_container.length; i++){
        // apply bullet vector
        bullet_container[i].centre = point_translate(bullet_container[i].centre, bullet_container[i].vec);
    }
    // draw bullet  
    draw_bullet();

    // draw player
    draw_player(ship.centre, ship.rotation);
    window.requestAnimationFrame((i) => draw(i++));
}

// get window width/height
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
console.log("Window is %d by %d", windowWidth, windowHeight);

// get canvas object
const canvas = document.getElementById('mainCanvas');

// set canvas size
canvas.width = windowWidth - 20;
canvas.height = windowHeight - 20;
canvas.style.border = '1px solid black';

// set up context for the canvas
const ctx = canvas.getContext('2d');
ctx.lineWidth = 3;
ctx.fillStyle = '#000';
 
// point modificatoin functions 
const radian = (deg) => (deg * (Math.PI / 180));
const point  = (x = 0, y = 0) => ({x, y});
const vector = (x = 0, y = 0) => ({x, y});
const point_translate = (p, v)   => ({x: p.x + v.x, y: p.y + v.y});
const vector_rotation = (v, deg) => ({x: (v.x * Math.cos(radian(deg)) - v.y * Math.sin(radian(deg))), y:(v.x * Math.sin(radian(deg)) + v.y * Math.cos(radian(deg)))});
const vector_scale = (v, s) => ({x: v.x * s, y: v.y *s});
const vector_change = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y});

// create player
// centre point
let centre = point(windowWidth / 2, windowHeight / 2);
// create object
var ship = new Object();
ship.centre = centre;
ship.rotation = 0;
ship.velocity = 1;
ship.rot_vel = 0;
ship.vec = vector(0, 0);
ship.rot_vec = vector(0,-40);

// create bullet
var bullet = new Object();
bullet.centre = point_translate(centre, ship.rot_vec);
bullet.vec = vector(0,0);

var bullet_container = [];

// event listeners 
var fired = false;
document.addEventListener("keydown", key_press);
document.addEventListener("keyup", key_release);

// start animation engine
window.requestAnimationFrame(() => draw(0));