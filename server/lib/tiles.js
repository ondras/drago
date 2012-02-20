var GD = require("gd");

/* FIXME. */
var Tiles = function() {
	this._images = [];
	this._remain = 0;
	this._data = [];
	
	for (var i=0;i<18;i++) { 
		this._remain++;
		var name = i + "";
		if (name.length < 2) { name = "0"+name; }
		name = "../MAP/1/PART00" + name + ".gif";
		var img = OZ.DOM.elm("img");
		OZ.Event.add(img, "load", this._load.bind(this));
		this._images.push(img); 
		img.src = name;
	}
}

Tiles.prototype.getTile = function(index) {
	var tilesPerImage = 192;
	var image = this._images[Math.floor(index / tilesPerImage)];
	var imageOffset = index % tilesPerImage;
	
	return [
		image,
		imageOffset * 16
	];
}

exports.Tiles = Tiles;
