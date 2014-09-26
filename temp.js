// var fs = require('fs'),
//     path = require('path');

// function readDir(start, callback) {
//     // Use lstat to resolve symlink if we are passed a symlink
//     fs.lstat(start, function(err, stat) {
//         if(err) {
//             return callback(err);
//         }
//         var found = {dirs: [], files: []},
//             total = 0,
//             processed = 0;
//         function isDir(abspath) {
//             fs.stat(abspath, function(err, stat) {
//                 if(stat.isDirectory()) {
//                     found.dirs.push(abspath);
//                     // If we found a directory, recurse!
//                     readDir(abspath, function(err, data) {
//                         found.dirs = found.dirs.concat(data.dirs);
//                         found.files = found.files.concat(data.files);
//                         if(++processed == total) {
//                             callback(null, found);
//                         }
//                     });
//                 } else {
//                     found.files.push(abspath);
//                     if(++processed == total) {
//                         callback(null, found);
//                     }
//                 }
//             });
//         }
//         // Read through all the files in this directory
//         if(stat.isDirectory()) {
//             fs.readdir(start, function (err, files) {
//                 total = files.length;
//                 if (total === 0) {
//                     callback(null, found);
//                 }
//                 for(var x=0, l=files.length; x<l; x++) {
//                     isDir(path.join(start, files[x]));
//                 }
//             });
//         } else {
//             return callback(new Error("path: " + start + " is not a directory"));
//         }
//     });
// }

// readDir('/Users/alexis/Code/cli-daisydisk', function(error, result){
//     console.log(result);
// });

// var getSize = require('get-folder-size');

// var fs = require('fs'),
//     path = require('path'),
//     async = require('async');

// getSize('/Users/alexis/Code/cli-daisydisk', function(err, size) {
//   if (err) { throw err; }

//   console.log(size + ' bytes');
//   console.log((size / 1024 / 1024).toFixed(2) + ' Mb');
// });


var fs = require('fs'),
    path = require('path'),
    async = require('async');

function readSizeRecursive(item, cb) {
    fs.lstat(item, function(err, stats) {
        var total = stats.size;

        if (!err && stats.isDirectory()) {
            fs.readdir(item, function(err, list) {
                if (err) return cb(err);

                async.forEach(
                list,
                function(diritem, callback) {
                    readSizeRecursive(path.join(item, diritem), function(err, size) {
                        total += size;
                        callback(err);
                    }); 
                },  
                function(err) {
                    cb(err, total);
                }   
                );  
            }); 
        }   
        else {
            cb(err, total);
        }   
    }); 
}

// readSizeRecursive('/Users/alexis/Code/cli-daisydisk', function(err, size) {
//   if (err) { throw err; }

//   console.log(size + ' bytes');
//   console.log((size / 1024 / 1024).toFixed(2) + ' Mb');
// });

function readFolderContent(item, cb) {
    fs.lstat(item, function(err, stats) {
        var total = stats.size;
        console.log(total);

        if (!err && stats.isDirectory()) {
            console.log(stats);
        }   
        else {
            cb(err, total);
        }   
    }); 
}

readFolderContent('/Users/alexis/Code/cli-daisydisk', function(err, size) {
  if (err) { throw err; }
});

var p = '/Users/alexis/Code/cli-daisydisk';
fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }
    console.log(files);
    files.map(function (file) {
        return path.join(p, file);
    }).forEach(function (file) {
        var statFile =  fs.statSync(file);
        if (statFile.isFile()) {
            console.log("%s (%s) size : %s", file, path.extname(file), statFile.size);
        }
        if (statFile.isDirectory()) {
            console.log("REP : %s (%s) ", file, path.extname(file));
        }
    });
});

/*
if (err) {
  process.exit(1);
} else {
  process.exit(0);
}
 */

// TODO
// 1) On choppe la taille du repertoire
// 2) Pour chaque repertoire de ce repertoire, on fait la même chose, 1* pour le moment
// 
