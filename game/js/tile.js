Game.Tile = OZ.Class().extend(HAF.Actor);
Game.Tile.prototype.init = function(position, image, options) {
	this._offset = Game.port.getOffset();
	
	this._sprite = {
		position: position,
		image: image,
		size: []
	}
	
	this._options = {
		layer: Game.LAYER_TOP,
		insert: false,
		size: [1, 1]
	}
	for (var p in options) { this._options[p] = options[p]; }

	this._dirty = false;
	this._visible = false;

	for (var i=0;i<2;i++) { this._sprite.size.push(Game.TILE*this._options.size[i]); }
	
	this._event = OZ.Event.add(null, "port-change", this._portChange.bind(this));
	this._updateVisibility();
}

Game.Tile.prototype.destroy = function() {
	OZ.Event.remove(this._event);
	if (this._visible) { Game.engine.removeActor(this, this._options.layer); }
}

Game.Tile.prototype.tick = function(dt) {
	var changed = this._dirty;
	this._dirty = false;
	return changed;
}


Game.Tile.prototype.draw = function(context) {
	var position = [
		this._sprite.position[0]-this._offset[0], 
		this._sprite.position[1]-this._offset[1]
	];
	context.drawImage(this._sprite.image, position[0], position[1]);
}

Game.Tile.prototype.getBox = function() {
	var position = [
		this._sprite.position[0]-this._offset[0], 
		this._sprite.position[1]-this._offset[1]
	];
	return [position, this._sprite.size];
}

Game.Tile.prototype._updateVisibility = function() {
	var size = Game.port.getSize();
	
	var visible = this._isVisible(size);
	if (visible || this._visible) { this._dirty = true; }

	if (visible && !this._visible) {
		Game.engine.addActor(this, this._options.layer, this._options.insert);
	} else if (!visible && this._visible) {
		Game.engine.removeActor(this, this._options.layer);
	}
	
	this._visible = visible;
}

Game.Tile.prototype._portChange = function(e) {
	this._offset = e.target.getOffset();
	this._updateVisibility();
}

Game.Tile.prototype._isVisible = function(size) {
	var result = true;
	for (var i=0;i<2;i++) {
		if (this._sprite.position[i] > this._offset[i]+size[i]) { result = false; }
		if (this._sprite.position[i] + this._sprite.size[i] < this._offset[i]) { result = false; }
	}
	return result;
}

