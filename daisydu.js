#!/usr/bin/env node

'use strict';

var d3 = require('./lib/d3Canvas');
var canvas = require('drawille-canvas');
var width = 160;
var height = 160;
var context = new canvas(width, height);
var FolderAnalyzer = require('./lib/folderAnalyzer');
var startPath = './';

var folder = new FolderAnalyzer(startPath);
folder.analyse().then(function(){

    var treemapData = folder.getTreemapDatas();

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sort(function(a, b) {
            return a.value - b.value;
        }).mode('squarify');

    var treemap = d3.layout.treemap()
        .children(function (d) {return d.children})
        .size([width,height])
        .value(function (d) {return d.size})
        .mode('squarify')
        .nodes(treemapData);

    function position(d, i) {
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

