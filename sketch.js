function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function setup() {
  createCanvas(displayWidth, displayHeight);
  describe("Fun graphing calculator");
  frameRate(60)
  background(255);
  noStroke();
}
var count = 1750;
function draw() {
  if(mouseIsPressed){
    count = 1750;
    background(255);
  }
  const frequency = 0.05
  var red   = Math.sin(frequency*count + 0) * 127 + 128;
  var green = Math.sin(frequency*count + 2) * 127 + 128;
  var blue  = Math.sin(frequency*count + 4) * 127 + 128;
  fill(red, green, blue);
  count -= 3;
  ellipse(displayWidth / 2, displayHeight / 2, count);
}