#!/usr/bin/env v8cgi

var GD = require("gd");
var FS = require("fs");
var GO = require("getopt");
var images = [];

var options = new GO.GetOpt();
options.add("vertical", "Vertical merge", true, "v", "vertical", GO.GetOpt.NO_ARGUMENT);
options.add("horizontal", "Horizontal merge", false, "h", "horizontal", GO.GetOpt.NO_ARGUMENT);

try {
	options.parse(system.args);
	var args = options.get().slice(1);
} catch (e) {
	system.stdout.writeLine(options.help());
}

if (args.length < 1) {
	var files = new FS.Directory(".").listFiles();

	for (var i=0;i<files.length;i++) {
		var file = files[i];
		if (file.indexOf(".png") != -1) { images.push(file); }
	}

	images.sort();
} else {
	images = args;
}

if (!images.length) { 
	system.stdout.writeLine("Nothing to do.");
	exit(); 
}

system.stdout.writeLine("Merging " + images.join(", "));
var test = new GD.Image(GD.Image.PNG, images[0]);

var width = test.sx();
var height = test.sy();
if (options.get("horizontal")) {
	width *= images.length;
} else {
	height *= images.length;
}

var out = new GD.Image(GD.Image.TRUECOLOR, width, height);
out.alphaBlending(false);
out.saveAlpha(true);

for (var i=0;i<images.length;i++) {
	system.stdout.writeLine("adding " + images[i]);
	var src = new GD.Image(GD.Image.PNG, images[i]);
	var left = 0;
	var top = 0;
	
	if (options.get("horizontal")) {
		left = i*test.sx();
	} else {
		top = i*test.sy();
	}
	
	out.copy(src, left, top, 0, 0, src.sx(), src.sy());
}

out.save(GD.Image.PNG, images[0]+".out.png");
