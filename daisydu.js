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

var fs    = require('fs');
var path  = require('path');
var async = require('async');

var flatfolders = {};
var startPath = '/Users/alexis/Code/cli-daisydisk';
var level = 2;

var getFilesSize = function(folderPath, level) {
    fs.readdir(folderPath, function (err, files) {
        if (err) {
            throw err;
        }
        files.map(function (file) {
            return path.join(folderPath, file);
        }).forEach(function (file) {
            var statFile =  fs.statSync(file);
            if (statFile.isFile()) {
                flatfolders[level][folderPath].totalSize += statFile.size;
            }
        });
    });
};

function readSizeRecursive(item, reclevel, cb) {
    fs.lstat(item, function(err, stats) {

        if (!err && stats.isDirectory()) {
            if (flatfolders[reclevel] === undefined) {
                flatfolders[reclevel] = {};
            }
            flatfolders[reclevel][item] = {
                totalSize: 0
            };
            if (reclevel > 1) {
                getFilesSize(item, reclevel);
            }
            fs.readdir(item, function(err, list) {
                if (err) return cb(err);

                async.forEach(
                list,
                function(diritem, callback) {
                    var nextLevel = (reclevel -1);
                    if (nextLevel) {
                        readSizeRecursive(path.join(item, diritem), nextLevel, function(err) {
                            callback(err);
                        }); 
                    } else {
                        callback(err);
                    }
                },  
                function(err) {
                    cb(err);
                }   
                );  
            }); 
        }   
        else {
            cb(err);
        }   
    }); 
}

readSizeRecursive(startPath, level, function(err) {
    if (err) { 
        console.log('ERREUR : ' + err);
    }
  console.log('première étpae : la hiérarchie des dossiers');
  console.log(flatfolders);
});

