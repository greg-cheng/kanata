//***************************************//
//                                       //
//            ASTEROID REBOOT            //
//                                       //
//***************************************//

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

// keypress events
function key_press(event){
    // get ascii
    let keyCode = event.which;

    // apply rotation velocity
    if (keyCode === 65) {
        ship.rot_vel = 10;
    } 
    if (keyCode === 68) {
        ship.rot_vel = -10;
    }

    // fire bullet
    if (keyCode === 32 && !fired && !cool_down) {
        fire();
        fire();
        fire_timer = 0;
        fired = true;
        // console.log(bullet_container);
    }
}

// create color code string
const rainbow = (i) =>  _rainbow_(i);

// key release
// reset variables to default
function key_release(event){
    // get ascii 
    let keyCode = event.which;

    // when releasing rotation key
    if (keyCode === 65 || keyCode === 68)
        ship.rot_vel = 0;

    // when releasing space key, start cool down timer
    if (keyCode === 32)
        fired = false;
        cool_down = true;
        cool_down_timer = fire_rate - fire_timer;
        fire_timer = 0;
}

// collision check (line segment intersection checking) 

// max/min helper function
const max = (a, b) => (a > b ? a:b);
const min = (a, b) => (a < b ? a:b);

// check if q lies on the line pq
function on_segment (p, q, r) {
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) && q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y)) 
       return true; 
    return false; 
}

function point_orientation(p, q, r) {
    // formula for calculating point orientation of three points
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    // 0 means the points are collinear
    if (val == 0) {
        return 0
    }

    // 1 -> clockwise, 2 -> counter clockwise
    return val > 0 ? 1:2 
}

function check_intersect(p1, q1, p2, q2) { 
    // check all points
    let o1 = point_orientation(p1, q1, p2); 
    let o2 = point_orientation(p1, q1, q2); 
    let o3 = point_orientation(p2, q2, p1); 
    let o4 = point_orientation(p2, q2, q1); 
  
    // normal intersection
    if (o1 != o2 && o3 != o4) 
        return true; 
  
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
    if (o1 == 0 && on_segment(p1, p2, q1)) 
        return true; 
  
    // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
    if (o2 == 0 && on_segment(p1, q2, q1)) 
        return true; 
  
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
    if (o3 == 0 && on_segment(p2, p1, q2)) 
        return true; 
  
     // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
    if (o4 == 0 && on_segment(p2, q1, q2)) 
        return true; 
  
    // no intersection
    return false;
} 

// check intersection for each box
function check_box (p1, q1, v, ast){
    // only need to check three because at least two sides has to be intersected if it is intersecting
    
    let p2 = point_translate(ast.centre, v[0]);
    let q2 = point_translate(ast.centre, v[1]);
    if (check_intersect(p1, q1, p2, q2)) {
        return true;
    }
    p2 = point_translate(ast.centre, v[1]);
    q2 = point_translate(ast.centre, v[2]);
    if (check_intersect(p1, q1, p2, q2)) {
        return true;
    }
    p2 = point_translate(ast.centre, v[2]);
    q2 = point_translate(ast.centre, v[3]);
    if (check_intersect(p1, q1, p2, q2)) {
        return true;
    }
    p2 = point_translate(ast.centre, v[3]);
    q2 = point_translate(ast.centre, v[0]);
    if (check_intersect(p1, q1, p2, q2)) {
        return true;
    }

    return false;
}



// apply rotation to all vectors in array
function rotate_vec (v, rotation) {
    let vec_list = v;
    for (let i = 0; i < vec_list.length; i++) {
        // calling vector rotation function
        vec_list[i] = vector_rotation(vec_list[i], rotation);
    }
    
    return vec_list;
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
    // vector from centre of ship
    let vec = [vector(0, -30), vector(15, 15), vector(6,12), vector(-6,12), vector(-15, 15)];

    // rotate vectors for player sprite
    vec = rotate_vec(vec, rotation);
    ship.fire_vec = vec[0];

    // draw player
    draw_poly(vec, centre);
}

function draw_bullet (){
    // begin path
    ctx.beginPath();
    let prev = bullet_container[0].centre;
    ctx.arc(bullet_container[0].centre.x,bullet_container[0].centre.y, 2, 0, 2 * 3);
    for (let i = 1; i < bullet_container.length; i++){
        // draw bullet
        let cur = bullet_container[i].centre;
        for (let i = 0; i < asteroid_container.length; i++) {
            if(check_box(prev, cur, asteroid_container[i].box, asteroid_container[i])){
                asteroid_container[i].alive = false;
            }
        }
        ctx.arc(bullet_container[i].centre.x,bullet_container[i].centre.y, 1, 0, 2 * 3);
        prev = cur;
    }
    ctx.stroke();

    // // stroke
    // ctx.stroke();
}

function draw_astroid(){
    for (let i = 0; i < asteroid_container.length; i++){
        if (!asteroid_container[i].alive){
            asteroid_container.splice(i, 1);
            console.log("destroyed");
        }
    }
    for (let i = 0; i < asteroid_container.length; i++){
        draw_poly(asteroid_container[i].vec, asteroid_container[i].centre);
        draw_poly(asteroid_container[i].box, asteroid_container[i].centre);
    }
}

function spawn_asteroid(num, speed){
    let dir, x, y, random_speed, delta;
    for (let i = 0; i < num; i++) {
        dir = Math.random() * 360;
        console.log(dir);
        x = Math.random() * (windowWidth - 60);
        y = Math.random() * (windowHeight - 60);
        random_speed = Math.random() * 0.1;
        delta = vector_scale(vector_rotation(vector(-1,-1), dir), speed + random_speed);
        let ast = asteroid(point(x, y), rotate_vec(asteroid_vec, dir), true, rotate_vec(asteroid_box, dir), delta, 3);
        asteroid_container.push(ast);
        console.log(ast);
    }
}

function fire(){
    let _bullet_ = bullet(point_translate(ship.centre, ship.fire_vec), vector_scale(ship.fire_vec, bullet_speed), 0);
    // append 
    bullet_container.push(_bullet_);
}

function check_boundary(obj){
    if (obj.centre.x > canvas.width){
        return point_flip_right(obj.centre);
    } 
    else if (obj.centre.x < 0){
        return point_flip_left(obj.centre);
    } 
    else if (obj.centre.y > canvas.height){
        return point_flip_bot(obj.centre);
    } 
    else if (obj.centre.y < 0){
        return point_flip_top(obj.centre);
    }
    else {
        return obj.centre;
    }
}

// draw function
function draw (cnt) {
    // set color
    let color = rainbow(cnt);
    ctx.strokeStyle = color;

    // clear screen
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apply rotation by applying angular velocity
    ship.rotation += ship.rot_vel;

    // apply ship movement vector 
    ship.centre = point_translate(ship.centre, ship.vec);

    for (let i = 0; i < bullet_container.length; i++){
        // apply bullet vector
        bullet_container[i].centre = point_translate(bullet_container[i].centre, bullet_container[i].vec);
        bullet_container[i].timer ++;
        bullet_container[i].centre = check_boundary(bullet_container[i]);
    }

    for (let i = 0; i < asteroid_container.length; i++) {
        asteroid_container[i].centre = point_translate(asteroid_container[i].centre, asteroid_container[i].delta);
        asteroid_container[i].centre = check_boundary(asteroid_container[i]);
    }

    // shift the first element when it stays alive for over 120 frames
    if (bullet_container.length && bullet_container[0].timer >= bullet_lifetime) {
        bullet_container.shift();
    }

    // fire key held
    if (fired){
        if (fire_timer < fire_rate) {
            fire_timer ++;
        } else {
            fire();
            fire_timer = 0;
        }
    }

    // cool down for firing again
    if (cool_down) {
        if (cool_down_timer < fire_rate){
            cool_down_timer ++;
        } else {
            cool_down_timer = 0;
            cool_down = false;
        }
    }

    // // test
    // test_ast.centre = point_translate(test_ast.centre, test_vec); 
    // test_ast.centre = check_boundary(test_ast);
    

    // draw bullet  
    if (bullet_container.length){
        draw_bullet();
    }

    // draw asteroid  
    if (asteroid_container.length){
        draw_astroid();
    } else{
        num_of_ast += 3;
        ast_spd += 0.5;
        spawn_asteroid(num_of_ast, ast_spd);
    }

    // draw player
    draw_player(ship.centre, ship.rotation);
    window.requestAnimationFrame((cnt) => draw(cnt++));
}

// get window width/height
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
console.log("Window is %d by %d", windowWidth, windowHeight);

// get canvas object
const canvas = document.getElementById('mainCanvas');

// set canvas size
canvas.width = windowWidth - 30;
canvas.height = windowHeight - 30;
canvas.style.border = '1px solid black';

// set up context for the canvas
const ctx = canvas.getContext('2d');
ctx.lineWidth = 2;
ctx.fillStyle = '#000009';
 
// point modificatoin functions 
const radian = (deg) => (deg * (Math.PI / 180));
const point  = (x = 0, y = 0) => ({x, y});
const vector = (x = 0, y = 0) => ({x, y});
const point_translate = (p, v)   => ({x: p.x + v.x, y: p.y + v.y});
const vector_rotation = (v, deg) => ({x: (v.x * Math.cos(radian(deg)) - v.y * Math.sin(radian(deg))), y:(v.x * Math.sin(radian(deg)) + v.y * Math.cos(radian(deg)))});
const vector_scale = (v, s) => ({x: v.x * s, y: v.y *s});
const vector_change = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y});

// teleport on edge
const point_flip_top = (p) => ({x: windowWidth - p.x, y: canvas.height});
const point_flip_bot = (p) => ({x: windowWidth - p.x, y: 0});
const point_flip_left = (p) => ({x: canvas.width, y: windowHeight - p.y});
const point_flip_right = (p) => ({x: 0, y: windowHeight - p.y});

// game object functions: bullet, asteroid
const bullet = (centre, vec, timer) => ({centre, vec, timer});
const asteroid = (centre, vec, alive, box, delta, level) => ({centre, vec, alive, box, delta, level});

// centre point
const centre = point(windowWidth / 2, windowHeight / 2);

// bounding box is 60px x 60px
const asteroid_vec = [vector(26, -27), vector(13, -30), vector(0, -27), vector(-12, -30), vector(-20, -27), vector(-27, -23), vector(-30, -10), vector(-24, -2), vector(-30, 8), vector(-20,30), vector(0,26), vector(17, 30), vector(21, 19), vector(28,18), vector(25, 3), vector(30, -10)];
const asteroid_box = [vector(30, 30), vector(-30, 30), vector(-30, -30), vector(30, -30)];
const bound_box_mod = (box, s, r) => {
    box.forEach((vec, index) => {
        box[index] = vector_scale(vec, s);
        box[index] = vector_rotation(vec, r);
    });
    return box;
};

// // test asteroid
// var rot = Math.floor((Math.random() * 360) + 1)
// const test_ast = asteroid(point(windowWidth / 2 - 50, windowHeight / 2 - 50), rotate_vec(asteroid_vec, rot), true);
// const test_vec = vector_rotation(vector(-1,-1), rot);

// create ship(player) object
const ship = new Object();
ship.centre = centre;
ship.rotation = 0;
ship.rot_vel = 0;
ship.fire_vec = vector(0, -30);
ship.thrust = 0;
ship.vec = vector(0, 0);

// // create bullet
// const bullet = new Object();
// bullet.centre = point_translate(centre, ship.fire_vec);
// bullet.vec = vector(0,0);

// contains all of the bullets on screen
var bullet_container = [];

// contains all of the asteriods
var asteroid_container = [];

var num_of_ast = 20;
var ast_spd = 0.5;
spawn_asteroid(num_of_ast, ast_spd);

// firing boolean, and firing timer -> controlled by the firing rate
var fired = false;
var fire_timer = 0;
const fire_rate = 3;

// cool down timer to track instead of fire timer after fire key release
var cool_down = false;
var cool_down_timer = 0;

// bullet constants
const bullet_lifetime = 500;
const bullet_speed = 3;

// event listeners
document.addEventListener("keydown", key_press);
document.addEventListener("keyup", key_release);

// start animation engine
window.requestAnimationFrame(() => draw(0));