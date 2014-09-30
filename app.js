/**
 * treedu – du with d3 treemap
 *
 * (c) 2014 Marmelab
 *  
 * @license MIT
 */
'use strict';

var App = function() {
    
    var d3 = require('./lib/d3Canvas'),
        fs = require('q-io/fs'),
        Canvas = require('drawille-canvas'),
        FolderAnalyzer = require('./lib/folderAnalyzer'),
        blessed = require('blessed'),
        cli = require('commander'),
        os = require('os'),
        glob = require('glob'),
        q= require('q'),
        VERSION = require('./package.json').version;

    var themes;
    var files = glob.sync(__dirname + '/themes/*.json');
    for (var i = 0; i < files.length; i++) {
        var themeName = files[i].replace(__dirname + '/themes/', '').replace('.json', '');
        themes += themeName + '|';
    }
    themes = themes.slice(0, -1);

    // Set up the commander instance and add the required options
    cli.option('-p, --path  [path to folder]', 'folder path to display', './')
        .option('-t, --theme  [name]', 'set the treedu theme [' + themes + ']', 'marmelab')
        .version(VERSION)
        .parse(process.argv);

    var screen,
         loadedTheme,
         currentPath,
         activeFolder = '',
         graph,
         foldersAnalyse,
         folderList,
         waiter;


    var size = {
            pixel: {
                width: 0,
                height: 0
            },
            character: {
                width: 0,
                height: 0
            }
        };

    var drawHeader = function() {
        var headerText, headerTextNoTags;
        headerText = ' {bold}treedu{/bold}{white-fg} for ' + os.hostname() + ' ';
        headerTextNoTags = ' treedu for ' + os.hostname() + ' ';
        var header = blessed.text({
            top: 'top',
            left: 'left',
            width: headerTextNoTags.length,
            height: '1',
            fg: loadedTheme.title.fg,
            content: headerText,
            tags: true
        });
        screen.append(header);
    };

    var drawFooter = function() {
        var commands = {
            'q': 'Quit',
            'up,down' : 'select subdirectory'
        };
        var text = '';
        for (var c in commands) {
            var command = commands[c];
            text += '  {white-bg}{black-fg}' + c + '{/black-fg}{/white-bg} ' + command;
        }
        var footerRight = blessed.text({
            bottom: '0',
            left: '0%',
            width: '100%',
            align: 'right',
            tags:true,
            content: text,
            fg: loadedTheme.footer.fg
        });
        screen.append(footerRight);
    };

    var drawChart = function(treemapData, currentCanvas) {
        var treemap = d3.layout.treemap()
        .children(function (d) {return d.children;})
        .size([size.pixel.width,size.pixel.height])
        .value(function (d) {return d.size;})
        .mode('squarify')
        .nodes(treemapData);

        function position(d) {
          currentCanvas.fillRect(d.x, d.y,
              Math.max(0, d.dx),
              Math.max(0, d.dy));
          if (d.name !== activeFolder) {
              currentCanvas.clearRect(d.x + 1, d.y + 1,
                  Math.max(0, d.dx) - 3,
                  Math.max(0, d.dy) -3);
          }
        }
        treemap.forEach(position);

        return currentCanvas._canvas.frame();
    };

    var getFolderListBySize = function (folderList) {
        folderList.sort(function (a, b) {
        if (a.size > b.size) return -1;
        if (a.size < b.size) return 1;
        return 0;
        });
        var listToDisplay = [];
        folderList.forEach(function(folder){
            if (activeFolder === '') {
                activeFolder = folder.path;
            }
            listToDisplay.push( folder.path.replace(currentPath , '') + ' (' + (folder.size / 1024 / 1024).toFixed(2) + ' Mb)' );
        });

        return listToDisplay;
    };

    var waiting = function() {
            var n = 10;
            var a = 20;
            var w = 40;
            var c = new Canvas(w*2, w);
            var t = 2;
            var pi = Math.PI;
            var pi2 = pi/2;
            var sin = Math.sin;
            var cos = Math.cos;

            var flush = function() {
                var waitingData = c._canvas.frame();
                graph.setContent('{center}'+ waitingData + '{/center}');
                screen.render();
            };

            function draw() {
                var now = Date.now()/1000;
                c.clearRect(0, 0, w*2, w*2);
                c.save();
                c.translate(w, w);
                for(var i = 1; i < n; i++) {
                    var r = i*(w/n);
                    c.beginPath();
                    c.moveTo(-r, 0);
                    var tt = now*pi/t;
                    var p = (sin(tt-pi*(cos(pi*i/n)+1)/2)+1)*pi2;
                    for(var j = 0; j < a; j++) {
                        var ca = pi*j/(a-i);
                        if(p > ca) {
                            c.lineTo(-cos(ca)*r, -sin(ca)*r);
                        } else {
                            c.lineTo(-cos(p)*r, -sin(p)*r);
                        }
                    }
                    c.stroke();
                }
                c.restore();
                flush();
            }
            graph.setLabel(' Waiting... ');
            waiter = setInterval(draw, 1000/20);
    };

    return {

        init: function() {

            currentPath = cli.path;
            if (currentPath === './') {
                currentPath = fs.absolute(cli.path);
            }

            var theme;
            if (typeof process.theme !== 'undefined') {
                theme = process.theme;
            } else {
                theme = cli.theme;
            }
            try {
                loadedTheme = require('./themes/' + theme + '.json');
            } catch(e) {
                console.log('The theme \'' + theme + '\' does not exist.');
                process.exit(1);
            }

            screen = blessed.screen();

            var drawBoxes = function() {
                drawHeader();
                drawFooter();

                graph = blessed.box({
                    top: 2,
                    left: 'left',
                    width: '70%',
                    height: '90%',
                    content: '',
                    fg: loadedTheme.chart.fg,
                    tags: true,
                    border: loadedTheme.chart.border
                });
                screen.append(graph);

                folderList = blessed.list({
                    top: 2,
                    left: '70%',
                    width: screen.width - graph.width,
                    height: graph.height,
                    scrollable: true,
                    keys: true,
                    mouse: true,
                    vi: true,
                    fg: loadedTheme.table.fg,
                    tags: true,
                    border: loadedTheme.table.border,
                    selectedBg: '#EB8118',
                    selectedBold: true
                });
                folderList.setLabel(' Folders list ');

                folderList.on('select', function(data){
                          var itemContent = data.content.split(' ');
                          activeFolder = currentPath + itemContent[0];
                          setfetchFoldersDatas();
                });

                screen.append(folderList);
                screen.render();
            };

            screen.key(['escape', 'q', 'C-c'], function() {
                return process.exit(0);
            });

            drawBoxes();
            waiting();
            
            var fetchFolders = function () {
                var deferred = q.defer();
                foldersAnalyse = new FolderAnalyzer(currentPath);
                foldersAnalyse.analyse().then(function(){
                    clearInterval(waiter);
                    graph.setLabel(' Current path: ' + currentPath + ' ');
                    deferred.resolve(true);
                },function (error) {
                    deferred.reject(error); 
                });
                return deferred.promise;
            };

            var setfetchFoldersDatas = function() {
                size.pixel.width = (graph.width - 3) * 2;
                size.pixel.height = (graph.height - 2) * 4;

                folderList.setItems(getFolderListBySize(foldersAnalyse.folders));
                folderList.width = screen.width - graph.width;
                folderList.height = graph.height;

                var currentCanvas = new Canvas(size.pixel.width, size.pixel.height);
                graph.setContent(drawChart(foldersAnalyse.getTreemapDatas(), currentCanvas));
                folderList.focus();

                screen.render();
            };

            fetchFolders().then(setfetchFoldersDatas);

            screen.on('resize', setfetchFoldersDatas);

        }
    };
}();

App.init();
