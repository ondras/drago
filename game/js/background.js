Game.Background = OZ.Class().extend(HAF.Actor);

Game.Background.prototype.init = function(game, tiles, map) {
	this._game = game;
	this._tiles = tiles;
	this._map = map;

	this._offset = this._game.getPort().getOffset();
	this._dirty = false;
	this._canvas = null;
	this._context = null;
	
	this._remainingParts = [];
	this._build();
	
	this._game.getEngine().addActor(this, Game.LAYER_BG);

	OZ.Event.add(null, "port-change", this._portChange.bind(this));
}

Game.Background.prototype.getSize = function() {
	return [this._canvas.width, this._canvas.height];
}

Game.Background.prototype.tick = function(dt) {
	var dirty = this._dirty;
	this._dirty = false;
	return dirty;
}

Game.Background.prototype.draw = function(context) {
	context.drawImage(
		this._canvas,
		this._offset[0], this._offset[1], context.canvas.width, context.canvas.height,
		0, 0, context.canvas.width, context.canvas.height
	);
}

Game.Background.prototype._portChange = function(e) {
	this._offset = e.target.getOffset();
	this._dirty = true;
}

Game.Background.prototype._build = function(tiles, map) {
	var tile = 16;
	var size = this._map.getSize();
	this._canvas = OZ.DOM.elm("canvas", {width:size[0]*tile, height:size[1]*tile});
	this._context = this._canvas.getContext("2d");
	
	var partSize = 32;
	var data = this._map.getData();
	var count = Math.ceil(data.length / partSize);
	for (var i=0;i<count;i++) {
		this._remainingParts.push([
			i*partSize,
			Math.min((i+1)*partSize, data.length)
		]);
	}
	
	this._buildPart();
}

Game.Background.prototype._buildPart = function() {
	var tile = 16;
	var part = this._remainingParts.shift();
	var data = this._map.getData();

	for (var i=part[0];i<part[1];i++) {
		for (var j=0;j<data[i].length;j++) {
			var obj = data[i][j];
			var position = [i, j];
			var pxPosition = [i*tile, j*tile];
			for (var k=0;k<obj.images.length;k++) { this._buildTile(obj, k, position, pxPosition); }
		}
	}
	
	this._dirty = true;
	
	if (this._remainingParts.length) {
		setTimeout(this._buildPart.bind(this), 100);
	} else {
		this.dispatch("load");
	}
}

/**
 * @param {object} obj Map tile object
 * @param {int} index First or second map layer
 */
Game.Background.prototype._buildTile = function(obj, index, position, pxPosition) {
	if (index && obj.ignore) { return; } /* already covered by an animation */
	
	var tileIndex = obj.images[index];
	if (tileIndex == 31) { return; } /* transparent */
	
	if (tileIndex in ANIMATIONS) { /* animation: create an animation object in bg/middle layer */
		var anim = ANIMATIONS[tileIndex];
		var sprite = this._tiles.createAnimation(tileIndex, anim);
		new Game.Animation.Map(this._game, pxPosition, sprite, anim);
		
		if (index) { /* mark further tiles in this animation; we don't need them */
			var data = this._map.getData();
			for (var i=0;i<anim.size[0];i++) {
				for (var j=0;j<anim.size[1];j++) {
					data[position[0]+i][position[1]+j].ignore = true;
				}
			}
		}
		
		return;
	}

	if (obj.top[index]) { /* create a separate tile object in top layer */
		var canvas = this._tiles.createTile(tileIndex, obj.mirror[index]);
		new Game.Tile(this._game, pxPosition, canvas);
	} else { /* add to background */
		this._tiles.render(tileIndex, this._context, pxPosition, obj.mirror[index]);
	}

}
