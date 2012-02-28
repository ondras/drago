#!/usr/bin/env v8cgi

var Animations = require("./lib/animations");
var a = new Animations.Animations("MAP/EUROPE.STR");

var data = {};

var animations = a.getAnimations();
for (var p in animations) {
	var animation = animations[p].toJSON();
	data[p] = animation;
}

var str = JSON.stringify(data, null, "\t");
system.stdout.write("var ANIMATIONS = ");
system.stdout.writeLine(str);
