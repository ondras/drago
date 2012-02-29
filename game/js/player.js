Game.Player = OZ.Class().extend(Game.Animation);
Game.Player.prototype.init = function(game, index, type) {
	this._index = index;
	this._type = type;
	this._flight = GRAPH[this._index].air;
	this._orientation = 0;

	this._tile = [GRAPH[this._index].x, GRAPH[this._index].y];

	this._target = {
		index: null,
		tile: null
	}
	
	var o = {
		layer: Game.LAYER_PLAYERS,
		size: [3, 2]
	}
	Game.Animation.prototype.init.call(this, game, null, null, o);

	this._animation.frames = 4;
	this._updateImage();
	this._updatePosition();
}

Game.Player.prototype.setOrientation = function(orientation) {
	if (orientation == this._orientation) { return; }
	
	this._orientation = orientation;
	this._updateImage();
	
	return this;
}

Game.Player.prototype.setFlight = function(mode) {
	if (this._flight == mode) { return; }
	
	this._flight = mode;
	this._updateImage();
	this._updatePosition();

	return this;
}

Game.Player.prototype._updateImage = function() {
	var names = ["UP", "R", "DOWN", "L"];
	var flight = (this._flight ? "F" : "");
	var url = "img/player/" + this._type + "/" + this._type + flight + names[this._orientation] + ".png";

	var size = [
		this._sprite.size[0],
		this._sprite.size[1] * this._animation.frames
	]
	this._sprite.image = HAF.Sprite.get(url, size, 0, true);

	this._dirty = true;
}

Game.Player.prototype._updatePosition = function() {
	var t = 16;

	this._sprite.position = [
		(this._tile[0] + 0.5)*t - this._sprite.size[0]/2,
		this._tile[1]*t - this._sprite.size[1]/2 + 1
	];
	
	this._dirty = true;
	
	return this;
}
