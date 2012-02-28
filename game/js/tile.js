Game.Tile = OZ.Class().extend(HAF.Actor);

Game.Tile.prototype.init = function(game, position, image, options) {
	this._game = game;
	this._position = position;
	this._image = image;
	
	this._options = {
		layer: Game.LAYER_TOP,
		size: [1, 1]
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._offset = null;
	this._dirty = false;
	this._visible = false;
	this._size = [];

	var px = 16;
	for (var i=0;i<2;i++) { this._size.push(px*this._options.size[i]); }
	
	OZ.Event.add(null, "port-change", this._portChange.bind(this));
}

Game.Tile.prototype.tick = function(dt) {
	var changed = this._dirty;
	this._dirty = false;
	return changed;
}


Game.Tile.prototype.draw = function(context) {
	var position = [
		this._position[0]-this._offset[0], 
		this._position[1]-this._offset[1]
	];
	context.drawImage(this._image, position[0], position[1]);
}

Game.Tile.prototype.getBox = function() {
	var position = [
		this._position[0]-this._offset[0], 
		this._position[1]-this._offset[1]
	];
	return [position, this._size];
}

Game.Tile.prototype._portChange = function(e) {
	this._offset = e.target.getOffset();
	var size = e.target.getSize();
	
	var visible = this._isVisible(size);
	if (visible || this._visible) { this._dirty = true; }

	if (visible && !this._visible) {
		this._game.getEngine().addActor(this, this._options.layer);
	} else if (!visible && this._visible) {
		this._game.getEngine().removeActor(this, this._options.layer);
	}
	
	this._visible = visible;
}

Game.Tile.prototype._isVisible = function(size) {
	var result = true;
	for (var i=0;i<2;i++) {
		if (this._position[i] > this._offset[i]+size[i]) { result = false; }
		if (this._position[i] + this._size[i] < this._offset[i]) { result = false; }
	}
	return result;
}

