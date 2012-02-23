Game.TopTile = OZ.Class().extend(HAF.Actor);

Game.TopTile.prototype.init = function(game, position, image) {
	this._game = game;
	this._offset = null;
	this._dirty = false;
	this._visible = false;
	this._size = [16, 16];
	
	this._position = position;
	this._image = image;

	OZ.Event.add(null, "port-change", this._portChange.bind(this));
}

Game.TopTile.prototype.tick = function(dt) {
	var dirty = this._dirty;
	this._dirty = false;
	return dirty;
}

Game.TopTile.prototype.draw = function(context) {
	var position = [
		this._position[0]-this._offset[0], 
		this._position[1]-this._offset[1]
	];
	context.drawImage(this._image, position[0], position[1]);
}

Game.TopTile.prototype._portChange = function(e) {
	this._offset = e.target.getOffset();
	var size = e.target.getSize();
	
	var visible = this._isVisible(size);
	if (visible || this._visible) { this._dirty = true; }
	
	if (visible && !this._visible) {
		this._game.getEngine().addActor(this, Game.LAYER_TOP);
	} else if (!visible && this._visible) {
		this._game.getEngine().removeActor(this, Game.LAYER_TOP);
	}
	
	this._visible = visible;
}

Game.TopTile.prototype._isVisible = function(size) {
	var result = true;
	for (var i=0;i<2;i++) {
		if (this._position[i] > this._offset[i]+size[i]) { result = false; }
		if (this._position[i] + this._size[i] < this._offset[i]) { result = false; }
	}
	return result;
}
