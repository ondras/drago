Game.Player = OZ.Class().extend(Game.Animation);
Game.Player.prototype.init = function(index, type) {
	this._index = index;
	this._type = type;
	this._port = null;
	this._flight = GRAPH[this._index].air;
	this._orientation = 1;
	this._speed = 8; /* tiles per second */
	this._velocity = [
		[ 0, -1],
		[ 1,  0],
		[ 0,  1],
		[-1,  0]
	];

	this._tile = [GRAPH[this._index].x, GRAPH[this._index].y];

	this._target = {
		index: null,
		tile: null,
		distanceTotal: 0,		/* constant distance from current index to target index */
		distanceRemaining: 0,	/* remaining distance; <= distanceTotal */
		source: null
	}
	
	var o = {
		layer: Game.LAYER_PLAYERS,
		size: [3, 2]
	}
	
	var spriteSize = [
		16 * o.size[0] * 8,
		16 * o.size[1] * 4
	];
	var image = HAF.Sprite.get("img/player/" + type + ".png", spriteSize, 0, true);

	Game.Animation.prototype.init.call(this, [0, 0], image, o);

	this._animation.frames = 4;
	this._updateImage();
	this._updatePosition();
}

Game.Player.prototype.moveDirection = function(direction) {
	if (this._target.index !== null) { return; }

	var index = GRAPH[this._index].neighbors[direction];
	if (index === null) { return; }
	
	this._target.index = index;
	this._target.source = this._tile.clone();
	this._target.tile = [GRAPH[index].x, GRAPH[index].y];
	this._target.distanceTotal = this._distance(this._tile, this._target.tile);
	this._target.distanceTraveled = 0;
	
	var flight = GRAPH[this._index].flight[direction];
	if (flight && !this._flight) { this._flight = flight; }
	
	this._orientation = direction;
	this._updateImage();	
}

Game.Player.prototype.tick = function(dt) {
	if (this._target.index !== null) { /* movement */
		for (var i=0;i<2;i++) {
			this._tile[i] += this._velocity[this._orientation][i] * this._speed * dt / 1000;
		}
		
		this._target.distanceTraveled = this._distance(this._tile, this._target.source);
		if (this._target.distanceTraveled >= this._target.distanceTotal) { /* arrived at target */
			this._index = this._target.index;
			this._tile = this._target.tile;
			this._target.index = null;
			this._flight = GRAPH[this._index].air;
			this._updateImage();
			
			Game.movement.show(this._index);

			/* FIXME do something */
		}
		
		this._updatePosition();
	}
	
	return Game.Animation.prototype.tick.call(this, dt);
}

Game.Player.prototype._distance = function(tile1, tile2) {
	var dx = tile1[0] - tile2[0];
	var dy = tile1[1] - tile2[1];
	return Math.sqrt(dx*dx+dy*dy);
}

Game.Player.prototype._updateImage = function() {
	this._animation.column = this._orientation + (this._flight ? 4 : 0);
	this._dirty = true;
}

Game.Player.prototype._updatePosition = function() {
	var tile = 16;

	this._sprite.position[0] = Math.round((this._tile[0] + 0.5)*tile) - this._sprite.size[0]/2;
	this._sprite.position[1] = Math.round(this._tile[1]*tile) - this._sprite.size[1]/2;
	
	/* adjust viewport */
	var offsetChanged = false;
	var port = Game.port;
	var size = port.getSize();
	for (var i=0;i<2;i++) {
		var portPosition = this._sprite.position[i] - this._offset[i];
		var limit = Math.round(size[i]/6);

		if (portPosition < limit) {
			offsetChanged = true;
			this._offset[i] -= limit - portPosition;
		} else if (portPosition > size[i]-limit) {
			offsetChanged = true;
			this._offset[i] += portPosition - (size[i]-limit);
		}
	}
	if (offsetChanged) { port.setOffset(this._offset); }
	
	/* finetuning */
	var takeOff = (this._flight ? 1 : 0);
	if (this._target.index !== null && this._flight) { /* traveling */
		var threshold = 40/tile; /* 40 pixels far */
		
		var traveled = this._target.distanceTraveled;
		var remaining = this._target.distanceTotal - traveled;
		
		if (traveled <= threshold && !GRAPH[this._index].air) { /* take off */
			takeOff = traveled/threshold;
		} else if (remaining <= threshold && !GRAPH[this._target.index].air) { /* landing */
			takeOff = remaining/threshold;
		}
	}
	var yOffset = 2 - 24*takeOff;
	this._sprite.position[1] += Math.round(yOffset);
	this._dirty = true;
}

Game.Player.prototype._isVisible = function(size) {
	return true;
}
