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

function draw() {
  if(mouseIsPressed){
    background(255);
  } else {
    const frequency = 0.05
    var red   = Math.sin(frequency*mouseX + 0) * 127 + 128;
    var green = Math.sin(frequency*mouseX + 2) * 127 + 128;
    var blue  = Math.sin(frequency*mouseX + 4) * 127 + 128;
    fill(red, green, blue);
    ellipse(mouseX, mouseY, randInt(25, 40), randInt(25, 40));
  }
}