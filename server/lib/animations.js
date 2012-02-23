/*
struktura animaci (zacinaji na 2 a5f8, konci na af64):

2B pozice dlazdice
2B nuly - pozor, ryba tam ma 01 00
1B sirka oblasti
1B vyska oblasti
7B neznamo (
				deda: 		04 FF 00 00 00 00 00 repeat
				majak: 		06 14 00 00 1A 00 06 repeat?
				mlyn: 		04 FF 0A 00 00 00 00 repeat
				velbloud: 	03 00 C8 00 00 00 00
				ryba: 		04 00 F4 01 00 00 00 not repeat, random
			)

Xkrat 2B pozice nasledne sady dlazdic
2B 0
1B 0 padding na nasobek 2B
*/

var File = require("./file");

var Animations = function() {
	var palName = module.id.split("/");
	palName.pop();
	palName.push("anim");
	palName = palName.join("/");
	this._animations = {};
	this._data = new File.File(palName);
	
	while (this._data.hasData()) {
		var animation = new Animation(this._data, this._tiles);
		this._animations[animation.getPosition()] = animation;
	}
}

Animations.prototype.getAnimations = function() {
	return this._animations;
}

var Animation = function(data) {
	this._position = data.getBytes(2);
	this._tmp1 = data.getBytes(2);
	this._tmp2 = [];
	this._width = data.getByte();
	this._height = data.getByte();
	
	for (var i=0;i<7;i++) { this._tmp2.push(data.getByte()); }
	
	this._frames = [];
	while (1) {
		var tile = data.getBytes(2);
		if (!tile) {
			data.getByte();
			break;
		}
		this._frames.push(tile);
	}
}

Animation.prototype.getPosition = function() {
	return this._position;
}

Animation.prototype.toJSON = function() {
	return  {
		width: this._width,
		height: this._height,
		tmp1: this._tmp1,
		tmp2: this._tmp2,
		frames: this._frames
	}
}

exports.Animations = Animations;
