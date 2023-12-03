let canvasWidth;
let canvasHeight;

let resolution = 2500;
let spacing = 15;

let xRange = 50;
let yRange = 50;

let centerPoint = {
    x: 0,
    y: 0
}

let mouseInit = {
    x: 0,
    y: 0,
    centerX: centerPoint.x,
    centerY: centerPoint.y
}

let input_elem = document.getElementById("func-input");

input_elem.oninput = (e) => {
    console.log(input_elem.value)
    if(f) userFunction = f;
};

function userFunction(x){
    return x * x;
}

function xInput(val){
  let pixel = val * canvasWidth;
  let delta = pixel - centerPoint.x;
  return xRange * delta / canvasWidth;
}

function setup(){
    createCanvas(windowWidth, windowHeight);
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    centerPoint.x = canvasWidth / 2;
    centerPoint.y = canvasHeight / 2;
}

function mousePressed(){
    mouseInit.x = mouseX;
    mouseInit.y = mouseY;
    mouseInit.centerX = centerPoint.x;
    mouseInit.centerY = centerPoint.y;
}

function keyPressed(){
    if(keyCode == 107 || (keyCode == 187 && keyIsDown(16))){
        xRange /= 1.5;
        yRange /= 1.5;
    }
    else if(keyCode == 189 || keyCode == 109){
        xRange *= 1.5;
        yRange *= 1.5;
    }
}

function mouseWheel(e){
    if(Math.sign(e.delta) < 0){
        xRange /= 1.25;
        yRange /= 1.25;
    }
    else{
        xRange *= 1.25;
        yRange *= 1.25;
    }
}

function draw(){
    background(30, 30, 40);
    noFill();

    // X, Y OS
    stroke(70);
    strokeWeight(1);
    line(centerPoint.x, windowHeight, centerPoint.x, 0);
    line(0, centerPoint.y, windowWidth, centerPoint.y);
    // TODO - numbers
    
    // Funkcia
    stroke(255);
    strokeWeight(3);
    if(userFunction){
        for(let i = 0; i < resolution; i++){
            let x0 = xInput(i / resolution);
            let x1 = xInput((i+1) / resolution);
            line(
                i * canvasWidth / resolution,
                centerPoint.y - (canvasHeight / yRange) * userFunction(x0),
                (i+1) * canvasWidth / resolution,
                centerPoint.y - (canvasHeight / yRange) * userFunction(x1),
            );
        }
    }

    // dragging the graph around
    if(mouseIsPressed && document.activeElement !== input_elem){
        centerPoint.x = mouseInit.centerX + mouseX - mouseInit.x;
        centerPoint.y = mouseInit.centerY + mouseY - mouseInit.y;
    }
}
