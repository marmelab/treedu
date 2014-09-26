#!/usr/bin/env node

'use strict';

// var d3 = require('./lib/d3Canvas');
// var canvas = require('drawille-canvas');
// var context = new canvas(160, 160);
// var jsdom = require('jsdom');
// var  htmlStub = '<html><body><div id="canvas"></div></body></html>';

// jsdom.env({ features : { QuerySelector : true }, html : htmlStub,
//     done : function(errors, window) {
//         var canvasDom = window.document.querySelector('#canvas');

//         var line = d3.canvas.line(context);
//         context.translate(30, 20);
//         var leftSide = [[0,30], [0,90], [30,110], [30,80], [60,100], [60,70], [0,30]];
//         var rightSide = [[60,100], [90,80], [90,110], [120,90], [120,30], [60,70]];
//         var top = [[0,30], [30,10], [60,30], [90,10], [120,30]];
//         d3.select(canvasDom).call(line, leftSide);
//         d3.select(canvasDom).call(line, rightSide);
//         d3.select(canvasDom).call(line, top);

//         console.log(context._canvas.frame());
//         process.exit(0);
//     }
// });

var FolderAnalyser = require('./lib/folderAnalyser');
var startPath = '/Users/alexis/Code/cli-daisydisk';

var folder = new FolderAnalyser(startPath);
//console.log(folder);
folder.analyse();
//console.log(folder);
