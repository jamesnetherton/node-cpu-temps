require('array.prototype.find');
var exec = require('child_process').exec;
var blessed = require('blessed')
var contrib = require('blessed-contrib')
var screen = blessed.screen()
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Define a Sensor type
function Sensor() {
  this.adapters = []
  this.fanSpeed = ""
  this.xAxis = ['0']
  this.grid = undefined
}

Sensor.prototype.findAdapter = function(adapterName) {
  return this.adapters.find(function(adapter) {
    return adapter.name == adapterName;
  });
}

Sensor.prototype.addAdapter = function(adapter) {
  this.adapters.push(adapter)
}

Sensor.prototype.graph = function() {
  for(var i = 0; i < this.adapters.length; i++) {
    var adapter = this.adapters[i]

    if(adapter.cores.length > 0) {
      if(this.grid == undefined) {
        var rows = adapter.cores.length / 2
        this.grid = new contrib.grid({rows: rows, cols: 2})
      }

      for(var j = 0; j < adapter.cores.length; j++) {
        var core = adapter.cores[j]
        var cpuGraph = this.grid.get(core.row, core.col)

        if(cpuGraph == undefined) {
          this.grid.set(core.row, core.col, contrib.line, {
            style: {
              line: "red",
              text: "white",
              baseline: "black",
            },
            label: core.name,
            maxY: 100
          })
        } else {
          cpuGraph.setData(this.xAxis, core.temperatures)
          screen.render()
        }
      }

      this.grid.applyLayout(screen)
    }
  }

  this.xAxis.push(String(Number(this.xAxis[this.xAxis.length - 1]) + 2))
}

// Define a Adapter type
function Adapter(name) {
  this.name = name
  this.cores = []
}

Adapter.prototype.findCore = function(coreName) {
  return this.cores.find(function(core) {
      return core.name == coreName
  });
}

Adapter.prototype.addCore = function(core) {
  core.row = Math.floor(this.cores.length / 2)
  core.col = this.cores.length % 2 == 0 ? 0 : 1
  this.cores.push(core)
}

// Define a Core type
function Core(name) {
  this.name = name
  this.temperatures = []
  this.row
  this.col
}

Core.prototype.addTemperature = function(temperature) {
  this.temperatures.push(temperature)
}

var sensor = new Sensor()

function updateSensor(error, stdout, stderr) {
  parseSensorData(stdout)
  sensor.graph()
}

function parseSensorData(data) {
  var lines = data.split("\n")
  var processing = ""
  var currentAdapter = ""

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("Adapter") > -1) {
      var adapterName = lines[i].split(":")[1]

      if(sensor.findAdapter(adapterName) == undefined) {
        sensor.addAdapter(new Adapter(adapterName))
      }

      processing = 'adapter'
      currentAdapter = adapterName
    }

    if(lines[i].indexOf("Core") > -1) {
      var adapter = sensor.findAdapter(currentAdapter)
      var coreName = lines[i].split(":")[0]

      if(adapter.findCore(coreName) == undefined) {
        adapter.addCore(new Core(coreName))
      }

      processing = coreName
    }

    if(lines[i].indexOf("temp") > -1 && lines[i].indexOf("input") > -1 && processing.indexOf("Core") > -1) {
      var adapter = sensor.findAdapter(currentAdapter)
      var core = adapter.findCore(coreName)
      var temperature = lines[i].split(":")[1]

      if(core != undefined) {
        core.addTemperature(parseInt(temperature))
      }
    }

    if(lines[i].indexOf("fan") > -1) {
      processing = "fan"
    }

    if(lines[i].indexOf("fan") > -1 && processing.indexOf("fan") > -1) {
      var adapter = sensor.findAdapter(currentAdapter)
      adapter.fanSpeed = lines[i].split(":")[1]
    }
  }
}

function getSensorData() {
  exec("sensors -u", updateSensor);
}

setInterval(getSensorData, 2000)
