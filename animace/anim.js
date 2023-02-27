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

var Anim = OZ.Class();

Anim.prototype.init = function() {
	this._data = new B("anim");
	this._tiles = new Tiles();
	this._remain = 2;
	this._sets = [];

	OZ.Event.add(this._data, "load", this._load.bind(this));
	OZ.Event.add(this._tiles, "load", this._load.bind(this));
}

Anim.prototype._load = function() {
	this._remain--;
	if (!this._remain) { this._go(); }
}

Anim.prototype._go = function() {
	while (this._data.hasData()) {
		var set = new Anim.Set(this._data, this._tiles);
		this._sets.push(set);
	}

	for (var i=0;i<this._sets.length;i++) {
		this._sets[i].draw();
		this._sets[i].start();
	}
}

Anim.Set = OZ.Class();
Anim.Set.prototype.init = function(data, tiles) {
	var position = data.getBytes(2);

	var transparent = data.getBytes(2);
	this._tmp2 = [];

	var width = data.getByte(1);
	var height = data.getByte(1);

	this._delay = data.getByte();
	/*
	this._pause = data.getByte();
	this._random = data.getBytes(2);
	*/
	for (var i=0;i<6;i++) { this._tmp2.push(data.getByte().toString().lpad(3)); }

	this._frames = 0;
	this._frame = -1;

	var frames = [];

	while (1) {
		var tile = data.getBytes(2);
		if (!tile) {
			data.getByte();
			break;
		}
		frames.push(tile);
		this._frames++;
	}

	this._width = 16*width;
	this._height = 16*height;
	this._smallCanvas = OZ.DOM.elm("canvas", {width:this._width, height:this._height});

	this._largeCanvas = OZ.DOM.elm("canvas", {width:this._width*frames.length, height:this._height});
	var ctx = this._largeCanvas.getContext("2d");

	for (var i=0;i<frames.length;i++) {
		var frame = frames[i];
		var leftOffset = i*this._width;

		var count = 0;

		for (var y=0;y<height;y++) {
			for (var x=0;x<width;x++) {
				var left = leftOffset + x*16;
				var top = y*16;

				var tileData = tiles.getTile(frame + count);
				var tile = tileData[0];
				var tileOffset = tileData[1];
				count++;

				ctx.drawImage(tile, 0, tileOffset, 16, 16, left, top, 16, 16);
			}

		}

	}


}

Anim.Set.prototype.draw = function() {
	document.body.appendChild(OZ.DOM.text(this._frames.toString().lpad(2) + " frames, "));
	document.body.appendChild(OZ.DOM.text(this._tmp2.join(", ") + " "));
	document.body.appendChild(this._smallCanvas);
	document.body.appendChild(OZ.DOM.elm("br"));
}

Anim.Set.prototype.start = function() {
	var delay = 25 * this._delay;
	setInterval(this._step.bind(this), delay);
}

Anim.Set.prototype._step = function() {
	this._frame = (this._frame+1) % this._frames;
	var ctx = this._smallCanvas.getContext("2d");
	ctx.clearRect(0, 0, this._smallCanvas.width, this._smallCanvas.height);
	ctx.drawImage(this._largeCanvas, this._frame*this._width, 0, this._width, this._height, 0, 0, this._width, this._height);
}

