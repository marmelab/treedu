'use strict';

//TODO refactor as functionnal type

/**
 * Module dependencies.
 */
var fs    = require('fs');
var path  = require('path');
var async = require('async');
var getSize = require('get-folder-size');

/**
 * @param {int}
 */
function FolderAnalyser(folderPath) {
    this.path = folderPath;
    this.filesSize = 0;
    this.foldersSize = 0;
    this.totalSize =0;
    this.folders =[];
}

var getFilesSize = function(folderPath, cb) {
    fs.readdir(folderPath, function (err, files) {
        if (err) {
            throw err;
        }
        files.map(function (file) {
            return path.join(folderPath, file);
        }).forEach(function (file) {
            var statFile =  fs.statSync(file);
            if (statFile.isFile()) {
               cb(statFile.size);
            }
        });
    });
};

FolderAnalyser.prototype.addFileSize = function(size){
    //console.log(size);
    console.log(this);
    //this.filesSize += size;
};

FolderAnalyser.prototype.analyse = function(){
    //console.log(this.addFileSize);
    getFilesSize(this.path, this.addFileSize);
};



module.exports = FolderAnalyser;
