/*
animation structure (starting at 2 a5f8, ending at af64):

2B tile position
2B transparency 1/0
1B area width
1B area height
7B unknown (
				grandfather:04 FF 00 00 00 00 00 repeat
				beacon:     06 14 00 00 1A 00 06 repeat?
				mill: 	    04 FF 0A 00 00 00 00 repeat
				camel: 	    03 00 C8 00 00 00 00
				fish: 	    04 00 F4 01 00 00 00 not repeat, random
				             |  |  |  |  |  |  \-
				             |  |  |  |  |  \---- always 0
				             |  |  |  |  \-------
				             |  |  |  \---------\ max. length for random pause (2 bytes)
				             |  |  \------------/
				             |  \---------------- there is a pause between repetitions: 255 back, 0 random, otherwise the number of things
				             \------------------- speed - number of 25ms parts between frames
 			)

X-times 2B position of the next set of tiles
2B 0
1B 0 padding for multiples of 2B
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
	this._transparent = data.getBytes(2);
	this._tmp2 = [];
	this._size = [data.getByte(), data.getByte()];

	this._delay = data.getByte();
	this._wait = data.getByte();
	if (this._wait == 255) {
		this._wait = 0;
	} else if (this._wait == 0) {
		this._wait = -1;
	}
	this._random = data.getBytes(2);

	for (var i=0;i<3;i++) { this._tmp2.push(data.getByte()); }

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
		size: this._size,
		transparent: this._transparent,
		delay: this._delay,
		wait: this._wait,
		random: this._random,
		tmp2: this._tmp2,
		frames: this._frames
	}
}

exports.Animations = Animations;
