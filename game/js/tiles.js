Game.Tiles = OZ.Class();


Game.Tiles.prototype.init = function(type) {
	this._images = [];
	this._remain = 0;
	this._cache = {
		tiles: {},
		animations: {}
	};

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

Game.Tiles.prototype.createTile = function(index, mirror) {
	var key = index + "-" + (mirror ? 1 : 0);
	var tile = 16;
	if (!(key in this._cache.tiles)) {
		var canvas = OZ.DOM.elm("canvas", {width:tile, height:tile});
		var context = canvas.getContext("2d");
		this.render(index, context, [0, 0], mirror);
		this._cache.tiles[key] = canvas;
	}
	return this._cache.tiles[key];
}

Game.Tiles.prototype.createAnimation = function(id, conf) {
	var tile = 16;
	if (!(id in this._cache.animations)) {
		var width = conf.size[0];
		var height = conf.size[1];
		var canvas = OZ.DOM.elm("canvas", {width:width*tile, height:height*tile*conf.frames.length});
		var context = canvas.getContext("2d");
		
		for (var i=0;i<conf.frames.length;i++) {
			var frame = conf.frames[i];
			var topOffset = i*height;
			
			var count = 0;
			
			for (var y=0;y<height;y++) {
				for (var x=0;x<width;x++) {
					var left = x*tile;
					var top = (y + topOffset)*tile;
					this.render(frame+count, context, [left, top], false);
					count++;
				}
			}
			
		} /* for all frames */		
		this._cache.animations[id] = canvas;
		window.a = canvas;
	}

	return this._cache.animations[id];
}

Game.Tiles.prototype._load = function(e) {
	this._remain--;
	if (!this._remain) { this.dispatch("load"); }
}
