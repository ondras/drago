#!/usr/bin/env v8cgi

var FS = require("fs");
var dir = system.args[1];
dir = new FS.Directory(dir);

var files = dir.listFiles();
var data = [];

for (var i=0;i<256;i++) {
	for (var j=0;j<256;j++) {
		var name = i+"_"+j+".TXT";
		var index = files.indexOf(name);
		if (index == -1) { continue; }
		var f = new FS.File(dir + "/" + files[index]);
		f.open("r");
		var text = f.read().toString("ascii").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
		f.close();
		data.push({
			x: i,
			y: j,
			text: text
		});
	}
}

var str = JSON.stringify(data, null, "\t");
system.stdout.write("var VIEWS = ");
system.stdout.writeLine(str);
