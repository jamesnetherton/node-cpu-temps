# node-cpu-temps

My first attempt at nodejs hackery using [blessed-contrib](https://github.com/yaronn/blessed-contrib) to graph CPU temperatures.

## Prerequsites

* [nodejs](http://nodejs.org/)
* [lm-sensors](http://www.lm-sensors.org/)

For RHEL, CentOS, Fedora do:

```
sudo yum install npm nodejs lm-sensors
```

For Debian based distros do:

```
sudo apt-get install npm nodejs lm-sensors
```

## Running the code

Clone this project and run cpu-temps.js with nodejs:

```
git clone https://github.com/jamesnetherton/node-cpu-temps.git
cd node-cpu-temps
npm install
node ./node-cpu-temps.js
```
