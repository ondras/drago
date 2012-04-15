#!/usr/bin/env v8cgi

var SBS = require("./lib/sbs");
var GD = require("gd");
var FS = require("fs");
var GO = require("getopt");

var options = new GO.GetOpt();
options.add("transparent", "Transparent byte", 0, "t", "transparent", GO.GetOpt.REQUIRED_ARGUMENT);

try {
	options.parse(system.args);
	var args = options.get().slice(1);
} catch (e) {
	system.stdout.writeLine(options.help());
}

if (args.length < 1) {
	system.stdout.writeLine("no SBS file specified, exitting");
	exit();
}

var file = args[0];
var base = file.split(".");
base.pop();
base = base.join(".");
var dir = new FS.Directory(base);
if (dir.exists()) {
	system.stdout.writeLine("directory " + base + " already exists, exitting");
	exit();
}
dir.create();

var sbs = new SBS.SBS(file, options.get("transparent"));

var records = sbs.getRecords();
for (var i=0;i<records.length;i++) {
	var image = records[i].getImage();
	image.save(GD.Image.PNG, base+"/" + records[i].getName() + ".png");
}
