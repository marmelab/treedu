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
    Canvas = require('drawille-canvas'),
    FolderAnalyzer = require('./lib/folderAnalyzer'),
    blessed = require('blessed'),
    cli = require('commander'),
    os = require('os'),
    glob = require('glob'),
    VERSION = require('./package.json').version,
    themes = '';

    var files = glob.sync(__dirname + '/themes/*.json');
    for (var i = 0; i < files.length; i++) {
        var themeName = files[i].replace(__dirname + '/themes/', '').replace('.json', '');
        themes += themeName + '|';
    }
    themes = themes.slice(0, -1);

    // Set up the commander instance and add the required options
    cli
    .option('-p, --path  [absolutePath]', 'path to display', './')
    .option('-t, --theme  [name]', 'set the vtop theme [' + themes + ']', 'monokai')
    .version(VERSION)
    .parse(process.argv);


    var screen,
         loadedTheme,
         activeFolder ='';


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
            'q': 'Quit'
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
            listToDisplay.push( folder.path.replace(cli.path + '/', ' * ') + ' (' + (folder.size / 1024 / 1024).toFixed(2) + ' Mb)' );
        });

        return listToDisplay;
    };

    return {

        init: function() {

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
            // Create a screen object.
            screen = blessed.screen();

            drawHeader();
            drawFooter();

            var graph = blessed.box({
                top: 2,
                left: 'left',
                width: '70%',
                height: '90%',
                content: '',
                fg: loadedTheme.chart.fg,
                tags: true,
                border: loadedTheme.chart.border
            });
            graph.setLabel(' Current path: ' + cli.path + ' ');
            screen.append(graph);

            var folderList = blessed.list({
                top: 2,
                left: '70%',
                width: screen.width - graph.width,
                height: graph.height,
                keys: true,
                mouse: true,
                fg: loadedTheme.table.fg,
                tags: true,
                border: loadedTheme.table.border
            });
            folderList.setLabel(' Folders list ');
            screen.append(folderList);

            screen.key(['escape', 'q', 'C-c'], function(ch, key) {
              return process.exit(0);
            });

            // Render an empty screen.
            screen.render();

            // TODO launch something while folder size is compute
            var folder = new FolderAnalyzer(cli.path);
            folder.analyse().then(function(){
                folderList.setItems(getFolderListBySize(folder.folders));
                size.pixel.width = (graph.width - 3) * 2;
                size.pixel.height = (graph.height - 2) * 4;
                var currentCanvas = new Canvas(size.pixel.width, size.pixel.height);
                graph.setContent(drawChart(folder.getTreemapDatas(), currentCanvas));
                folderList.focus();
                screen.render();
            },function (error) {
                graph.setContent(error);
                screen.render();
            });
        }
    };
}();

App.init();
