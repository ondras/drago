#!/usr/bin/env v8cgi

var Graph = require("./lib/graph");
var g = new Graph.Graph("MAP/EUROPE.STR");

var data = [];

var nodes = g.getNodes();
for (var i=0;i<nodes.length;i++) {
	data.push(nodes[i].toJSON());
}

var str = JSON.stringify(data, null, "\t");
system.stdout.write("var GRAPH = ");
system.stdout.writeLine(str);
