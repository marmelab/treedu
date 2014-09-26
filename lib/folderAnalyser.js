'use strict';

//TODO refactor as functionnal type

/**
 * Module dependencies.
 */
var fs    = require('fs');
var path  = require('path');
var async = require('async');

var Q= require('q');
var FS = require('q-io/fs');
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


FolderAnalyser.prototype.setFiles = function(files){
    this.files = files.map(this.generatePath.bind(this));
};

FolderAnalyser.prototype.generatePath = function(file) {
    return FS.join(this.path, file);
};

FolderAnalyser.prototype.addFileSize = function(size) {
    this.filesSize += size;
};

FolderAnalyser.prototype.addFolder= function(folder) {
    this.folders.push(folder);
};

FolderAnalyser.prototype.distinguishFilesAndDirectories = function(){
    var promises = [];

    this.files.forEach(function (file) {
        promises.push(fs.stat(file, function(error, statFile){
            var deferred = Q.defer();
            if (statFile.isFile()) {
                this.filesSize += statFile.size;
                deferred.resolve(true);
            }
            if (statFile.isDirectory()) {
                 this.folders.push(file);
                 deferred.resolve(true);
            }
            return deferred.promise;
        }.bind(this)));
    }.bind(this));
    return Q.all(promises);
};

FolderAnalyser.prototype.analyse = function(){
    var deferred = Q.defer();
    FS.list(this.path)
    .then(this.setFiles.bind(this))
    .then(this.distinguishFilesAndDirectories.bind(this))
    .then(function(){
        deferred.resolve(true);
    }, function (error) {
        deferred.reject(error);
    });
    return deferred.promise;
};

module.exports = FolderAnalyser;
