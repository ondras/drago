Game.Player = OZ.Class().extend(Game.Animation);
Game.Player.FLIGHT_OFFSET = -24;
Game.Player.prototype.init = function(index, type) {
	this._index = index;
	this._type = type;

	this._flight = GRAPH[this._index].air;
	this._orientation = 1;
	this._moves = 0;
	this._path = [];
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
	this._computePosition();
}

Game.Player.prototype.getIndex = function() {
	return this._index;
}

Game.Player.prototype.makeVisible = function() {
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
}

Game.Player.prototype.moveBy = function(moves) {
	this._moves = moves;
	this._path = [this._index];
	Game.keyboard.setPlayer(this);
	Game.movement.show(this);
}

Game.Player.prototype.moveDirection = function(direction) {
	if (this._target.index !== null) { return; } /* already moving */
	var index = GRAPH[this._index].neighbors[direction];
	if (index === null) { return; } /* edge does not exist */
	if (this._moves == 0 && this._path[this._path.length-2] != index) { return; } /* can move only backwards */
	
	Game.movement.hide();

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
			this._arrived();
		}
		
		this._computePosition();
	}
	
	return Game.Animation.prototype.tick.call(this, dt);
}

Game.Player.prototype._arrived = function() {
	this._flight = GRAPH[this._index].air;
	this._updateImage();
	if (this._path.length > 1 && this._path[this._path.length-2] == this._index) {
		this._moves++;
		this._path.pop();
	} else {
		this._moves--;
		this._path.push(this._index);
	}
	
	if (this._moves) {
		OZ.Audio.play("move-through");
	} else {
		OZ.Audio.play("move-stop");
	}
	
	Game.movement.show(this);
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

/**
 * Convert tile coords to sprite pixel coords
 */
Game.Player.prototype._computePosition = function() {
	var tile = 16;

	this._sprite.position[0] = (this._tile[0] + 0.5)*tile - this._sprite.size[0]/2;
	this._sprite.position[1] = this._tile[1]*tile - this._sprite.size[1]/2;
	
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
	var yOffset = 2 + Game.Player.FLIGHT_OFFSET*takeOff;
	this._sprite.position[1] += yOffset;
	
	/* round */
	for (var i=0;i<2;i++) { this._sprite.position[i] = Math.round(this._sprite.position[i]); }

	/* adjust port if necessary */
	this.makeVisible();
	
	/* needs redrawing */
	this._dirty = true;
}

Game.Player.prototype._isVisible = function(size) {
	return true;
}
