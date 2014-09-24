'use strict';

var Canvas = require('drawille-canvas');

var c = new Canvas(160, 160);

var  drawLeft = function(c) {
    c.beginPath();
    c.moveTo(0,30);
    c.lineTo(0,90);
    c.lineTo(30,110);
    c.lineTo(30,80);
    c.lineTo(60,100);
    c.lineTo(60,70);
    c.lineTo(0,30);
    c.closePath();
    c.stroke();
};

var  drawRight= function(c) {
    c.beginPath();
    c.moveTo(60,100);
    c.lineTo(90,80);
    c.lineTo(90,110);
    c.lineTo(120,90);
    c.lineTo(120,30);
    c.lineTo(60,70);
    c.closePath();
    c.stroke();
};
var  drawTop= function(c) {
    c.beginPath();
    c.moveTo(0,30);
    c.lineTo(30,10);
    c.lineTo(60,30);
    c.lineTo(90,10);
    c.lineTo(120,30);
    c.closePath();
    c.stroke();
};


function draw() {
  var now = Date.now();
  c._canvas.clear();
  c.save();
  c.rotate(now/1000*360/5);
  c.translate(20, 20);
  drawLeft(c);
  drawRight(c);
  drawTop(c);
  c.restore();

  console.log(c._canvas.frame());
}

setInterval(draw, 1000/24);
