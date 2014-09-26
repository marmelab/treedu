'use strict';

//TODO refactor as functionnal type

/**
 * Module dependencies.
 */
var Q= require('q');
var FS = require('q-io/fs');
var getSize = require('get-folder-size');

/**
 * @param {int}
 */
function FolderAnalyser(folderPath) {
    this.path = folderPath;
    this.absolutePath = FS.absolute(folderPath);
    this.filesSize = 0;
    this.totalSize =0;
    this.foldersPath =[];
    this.folders= [] ;
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
    var self = this;
    self.files.forEach(function (file) {
        promises.push(FS.stat(file).then(function(statFile){
            if (statFile.isFile()) {
                self.filesSize += statFile.size;
            }
            if (statFile.isDirectory()) {
                 self.foldersPath.push({ path: file});
            }
            return true;
        }));
    });
    return Q.all(promises);
};

FolderAnalyser.prototype.getFoldersSize = function(){
    var promises = [];
    var self = this;
    self.foldersPath.forEach(function (folder) {
        var deferred = Q.defer();
        getSize(folder.path, function(err, size) {
            if (err) { 
                deferred.reject(err); 
            } else {
                self.folders.push({ path: folder.path, size: size});
                deferred.resolve(true);
            }
        });
        promises.push(deferred.promise);
    });
    return Q.all(promises);
};

FolderAnalyser.prototype.getTotalSize = function(){
    var deferred = Q.defer();
    var self = this;
    self.totalSize = self.filesSize;
    self.folders.forEach(function(folder){
        self.totalSize += folder.size;
    });
        
    deferred.resolve(true);
    return deferred.promise;
};

FolderAnalyser.prototype.clean = function(){
    var deferred = Q.defer();
    var self = this;
    delete self.files;
    delete self.foldersPath;

    deferred.resolve(true);
    return deferred.promise;
};

FolderAnalyser.prototype.analyse = function(){
    return FS.list(this.path)
    .then(this.setFiles.bind(this))
    .then(this.distinguishFilesAndDirectories.bind(this))
    .then(this.getFoldersSize.bind(this))
    .then(this.getTotalSize.bind(this))
    .then(this.clean.bind(this));
};

module.exports = FolderAnalyser;
