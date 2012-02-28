Game.Animation = OZ.Class().extend(Game.Tile);

Game.Animation.prototype.init = function(game, position, image, options) {
	Game.Tile.prototype.init.call(this, game, position, image, options);
	
	this._animation = {
		time: 0,
		fps: 8,
		frame: -1,
		frames: 0
	}

}

Game.Animation.prototype.tick = function(dt) {
	this._animation.time += dt;
	var frame = Math.floor(this._animation.time * this._animation.fps / 1000) % this._animation.frames;
	
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
