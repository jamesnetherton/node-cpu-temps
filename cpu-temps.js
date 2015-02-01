var util = require('util')
var exec = require('child_process').exec;
var blessed = require('blessed')
var contrib = require('blessed-contrib')
var screen = blessed.screen()
var grid3 = new contrib.grid({rows: 1, cols: 1})
grid3.set(0, 0, contrib.bar, { label: 'CPU Temperatures'
  , barWidth: 4
  , barSpacing: 15
  , xOffset: 0
  , maxHeight: 10
})
grid3.applyLayout(screen)

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
screen.render()

function parseSensors(error, stdout, stderr) {
  var lines = stdout.split("\n")
  var processing = ""
  var bar = grid3.get(0, 0)
  var sensors = []
  var titles = []
  var data = []

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("Adapter") > -1) {
      var adapter = {}
      var apdapterName = lines[i].split(":")[1]
      adapter['name'] = apdapterName
      adapter['cores'] = []
      sensors.push(adapter)
      processing = apdapterName
    }

    if(lines[i].indexOf("Core") > -1) {
      var adapter = sensors[sensors.length -1]
      var core = lines[i].split(":")[0]
      adapter['cores'].push({})
      processing = core
    }

    if(lines[i].indexOf("temp") > -1 && lines[i].indexOf("input") > -1 && processing.indexOf("Core") > -1) {
      var adapter = sensors[sensors.length -1]
      var cores = sensors[sensors.length -1]['cores']
      var core = cores[cores.length -1]
      var temp = lines[i].split(":")
      core[temp[0]] = parseInt(temp[1])
    }
  }

  for(var i = 0; i < sensors[0]['cores'].length; i++) {
    for(x in sensors[0]['cores'][i]) {
      titles.push("Core " + (i + 1))
      data.push(sensors[0]['cores'][i][x])
    }
  }

  bar.setData({titles: titles, data: data})
  screen.render()
}

function renderGrid() {
  exec("sensors -u", parseSensors);
}

setInterval(renderGrid, 2000)
