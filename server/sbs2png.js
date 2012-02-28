#!/usr/bin/env v8cgi

var SBS = require("./lib/sbs");
var GD = require("gd");
var FS = require("fs");

if (system.args.length < 2) {
	system.stdout.writeLine("no SBS file specified, exitting");
	exit();
}

var file = system.args[1];
var base = file.split(".");
base.pop();
base = base.join(".");
var dir = new FS.Directory(base);
if (dir.exists()) {
	system.stdout.writeLine("directory " + base + " already exists, exitting");
	exit();
}
dir.create();

var sbs = new SBS.SBS(file);

var records = sbs.getRecords();
for (var i=0;i<records.length;i++) {
	var image = records[i].getImage();
	image.save(GD.Image.PNG, base+"/" + records[i].getName() + ".png");
}
