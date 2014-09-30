'use strict';

//TODO refactor as functionnal type

/**
 * Module dependencies.
 */
var q= require('q');
var fs = require('q-io/fs');
var getSize = require('get-folder-size');

/**
 * @param {int}
 */
function FolderAnalyzer(folderPath) {
    this.path = folderPath;
    this.absolutePath = fs.absolute(folderPath);
    this.filesSize = 0;
    this.totalSize =0;
    this.foldersPath =[];
    this.folders= [] ;
}


FolderAnalyzer.prototype.setFiles = function(files){
    this.files = files.map(this.generatePath.bind(this));
};

FolderAnalyzer.prototype.generatePath = function(file) {
    return fs.join(this.path, file);
};

FolderAnalyzer.prototype.addFileSize = function(size) {
    this.filesSize += size;
};

FolderAnalyzer.prototype.addFolder= function(folder) {
    this.folders.push(folder);
};

FolderAnalyzer.prototype.sortFilesAndFolders = function(){
    var promises = [];
    var self = this;
    self.files.forEach(function (file) {
        promises.push(fs.stat(file).then(function(statFile){
            if (statFile.isFile()) {
                self.filesSize += statFile.size;
            }
            if (statFile.isDirectory()) {
                 self.foldersPath.push({ path: file});
            }
            return true;
        }, function(error) { return error; }));
    });
    return q.all(promises);
};

FolderAnalyzer.prototype.getFoldersSize = function(){
    var promises = [];
    var self = this;
    self.foldersPath.forEach(function (folder) {
        var deferred = q.defer();
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
    return q.all(promises);
};

FolderAnalyzer.prototype.getTotalSize = function(){
    var deferred = q.defer();
    var self = this;
    self.totalSize = self.filesSize;
    self.folders.forEach(function(folder){
        self.totalSize += folder.size;
    });
        
    deferred.resolve(true);
    return deferred.promise;
};

FolderAnalyzer.prototype.clean = function(){
    var deferred = q.defer();
    var self = this;
    delete self.files;
    delete self.foldersPath;

    deferred.resolve(true);
    return deferred.promise;
};

FolderAnalyzer.prototype.analyse = function(){
    return fs.list(this.path)
    .then(this.setFiles.bind(this))
    .then(this.sortFilesAndFolders.bind(this))
    .then(this.getFoldersSize.bind(this))
    .then(this.getTotalSize.bind(this))
    .then(this.clean.bind(this));
};

FolderAnalyzer.prototype.getTreemapDatas = function(){
    var self = this;
    var datas = {
        name: this.absolutePath,
        size: this.totalSize,
        children: []
    };
    self.folders.forEach(function(folder){
        datas.children.push({name: folder.path, size: folder.size});
    });

    return datas;
};

module.exports = FolderAnalyzer;
