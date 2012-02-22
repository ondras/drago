Game.Tiles = OZ.Class();

Game.Tiles.prototype.init = function(type) {
	this._images = [];
	this._remain = 0;

	for (var i=0;i<18;i++) { 
		this._remain++;
		var name = i + "";
		if (name.length < 2) { name = "0"+name; }
		name = "map/" + type + "/PART00" + name + ".gif";
		var img = OZ.DOM.elm("img");
		OZ.Event.add(img, "load", this._load.bind(this));
		this._images.push(img); 
		img.src = name;
	}
}

Game.Tiles.prototype.render = function(index, context, offset, mirror) {
	var cellsPerImage = 192;
	var tile = 16;
	var image = this._images[Math.floor(index / cellsPerImage)];
	var imageOffset = index % cellsPerImage;
	
	if (mirror) {
		context.save();
		context.translate(2*offset[0] + tile, 0);
		context.scale(-1, 1); 
	}

	context.drawImage(
		image,
		0, imageOffset*tile, tile, tile, 
		offset[0], offset[1], tile, tile
	);
	
	if (mirror) { context.restore(); }
}

Game.Tiles.prototype._load = function(e) {
	this._remain--;
	if (!this._remain) { this.dispatch("load"); }
}
