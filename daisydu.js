#!/usr/bin/env node

'use strict';

var d3 = require('./lib/d3Canvas');
var canvas = require('drawille-canvas');
var width = 160,
    height = 160;
var context = new canvas(width, height);
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
var startPath = './';

var folder = new FolderAnalyser(startPath);
folder.analyse().then(function(){
    //console.log('This folder (' + folder.absolutePath + ') size is ' + (folder.totalSize / 1024 / 1024).toFixed(2) + ' Mb');
    var treemapData = folder.getTreemapDatas();
    //console.log(treemapData);


    var treemap = d3.layout.treemap()
        .size([width, height])
        .sort(function(a, b) {
            return a.value - b.value;
        }).mode('squarify');

    var treemap = d3.layout.treemap()
        //.children(function(d) { return d.text})
        //.children(function (d) {return d.array})
        .children(function (d) {return d.children})
        .size([width,height])
        .value(function (d) {return d.size})
        // .sort(function(a, b) {
        //     return a.value - b.value;
        // })
        .mode('squarify')
        .nodes(treemapData);

    //console.log(treemap);

    //     var testit = treemapData.map(function(r) {
    //         return { value: r };
    //     });
    //     console.log(testit);

    // var data = {
    //     value:0,
    //     children: treemapData
    // };
    

    //var map = treemap.nodes(treemapData);
    
    //context.fillRect(0, 0, width, height);
    function position(d, i) {
      //if (d.children) return;
      //context.fillStyle = (d.children) ? '#fff' : color(i);
      context.fillRect(~~d.x, ~~d.y,
          ~~Math.max(0, d.dx),
          ~~Math.max(0, d.dy));
      context.clearRect(~~d.x + 1, ~~d.y + 1,
          ~~Math.max(0, d.dx) - 3,
          ~~Math.max(0, d.dy) -3);
    }
     
     treemap.forEach(position);
     console.log(context._canvas.frame());


},function (error) {
    console.log(error);
});

