Game.Animation = OZ.Class().extend(Game.Tile);

Game.Animation.prototype.init = function(game, position, image, options) {
	Game.Tile.prototype.init.call(this, game, position, image, options);
	
	this._animation = {
		time: 0,
		fps: 8,
		frame: -1,
		frames: 0,
		wait: 0, /* time to wait before starting an animation cycle */
		random: 0
	}
	
	this._wait();
}

Game.Animation.prototype.tick = function(dt) {
	this._animation.time += dt;
	
	var frame = 0;
	
	if (this._animation.time >= 0) { /* animate only in positive time */
		frame = Math.floor(this._animation.time * this._animation.fps / 1000);
		if (frame >= this._animation.frames) {
			this._wait();
			frame = 0;
		}
	}
	
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

Game.Animation.prototype._wait = function() {
	var amount = this._animation.wait;
	if (amount == -1) { amount = Math.random() * this._animation.random * 32; }
	this._animation.time = -amount;
}
