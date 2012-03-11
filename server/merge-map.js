#!/usr/bin/env v8cgi

var GD = require("gd");
var images = [];

if (system.args.length < 2) {
	system.stdout.writeLine("./merge-map.js dir_with_tiles");
	exit();
}

var dir = system.args[1];
var width = 16*18;
var height = 3072;

var out = new GD.Image(GD.Image.TRUECOLOR, width, height);
out.alphaBlending(false);
out.saveAlpha(true);
var empty = out.colorAllocateAlpha(0, 0, 0, 127);
out.fill(0, 0, empty);
	
for (var i=0;i<18;i++) {
	var num = i;
	if (i < 10) { num = "0" + num; }
	var name = dir + "/PART00" + num + ".gif";
	system.stdout.writeLine("adding " + name);
	var src = new GD.Image(GD.Image.GIF, name);
	out.copy(src, 16*i, 0, 0, 0, src.sx(), src.sy());
}

out.save(GD.Image.PNG, dir+"/map.png");
