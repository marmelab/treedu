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

    /**
     * Instance of blessed screen, and the charts object
     */
    var screen,
         loadedTheme;


    var width = 120;
    var height = 120;
    var context = new Canvas(width, height);

    // Private functions

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

    /**
     * This draws a chart
     * @param  {array} the dats of folder analysed.
     * @return {string}       The text output to draw.
     */
     var drawChart = function(treemapData) {

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

      return context._canvas.frame();
  };

    // Public function (just the entry point)
    return {

        init: function() {

            var theme;
            if (typeof process.theme != 'undefined') {
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
            graph.setLabel(cli.path);

            screen.append(graph);

            screen.key(['escape', 'q', 'C-c'], function(ch, key) {
              return process.exit(0);
            });
            // Render the screen.
            screen.render();

            var folder = new FolderAnalyzer(cli.path);
            folder.analyse().then(function(){
                graph.setContent(drawChart(folder.getTreemapDatas()));
                screen.render();
            },function (error) {
                graph.setContent(error);
                screen.render();
            });
        }
    };
}();

App.init();
