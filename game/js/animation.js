Game.Animation = OZ.Class().extend(Game.Tile);

Game.Animation.prototype.init = function(game, position, image, conf, layer) {
	Game.Tile.prototype.init.call(this, game, position, image);
	
	this._conf = conf;
	this._layer = layer;

	this._size[0] *= conf.width;
	this._size[1] *= conf.height;
	this._time = 0;
	this._fps = 8;
	this._frame = 0;
}

Game.Animation.prototype.tick = function(dt) {
	this._time += dt;
	var frame = Math.floor(this._time * this._fps / 1000) % this._conf.frames.length;
	
	var changed = (this._dirty || (this._frame != frame));
	this._frame = frame;
	this._dirty = false;
	
	return changed;
}

Game.Animation.prototype.draw = function(context) {
	var position = [
		this._position[0]-this._offset[0], 
		this._position[1]-this._offset[1]
	];
	context.drawImage(
		this._image, 
		0, this._frame * this._size[1], this._size[0], this._size[1],
		position[0], position[1], this._size[0], this._size[1]
	);
}
