#!/usr/bin/env v8cgi

var FS = require("fs");
var dir = new FS.Directory("../game/img/finish/capitals");
var files = dir.listFiles();

var graph = new FS.File("graph.json").open("r");
graph = graph.read().toString("utf-8");
eval(graph);


var fixNode = function(name) {
	for (var i=0;i<files.length;i++) {
		var file = files[i].split(".");
		if (file[0].toLowerCase() == name.toLowerCase()) {
			system.stdout.writeLine(name + " => #1 " + file.join("."));
			return;
		}
		
		if (file[0].toLowerCase().indexOf(name.toLowerCase()) != -1) {
			system.stdout.writeLine(name + " => #2 " + file.join("."));
			return;
		}

		if (name.toLowerCase().indexOf(file[0].toLowerCase()) != -1) {
			system.stdout.writeLine(name + " => #3 " + file.join("."));
			return;
		}
	}
	
	system.stdout.writeLine(name + " => ??? FIXME");
}

for (var i=0;i<GRAPH.length;i++) {
	var node = GRAPH[i];
	if (node.type != "capital") { continue; }
	fixNode(node.name);
}


