Game.Background = OZ.Class().extend(HAF.Actor);

Game.Background.prototype.init = function(game, tiles, map) {
	this._game = game;
	this._dirty = false;
	this._canvas = null;
	this._offset = null;
	
	this._build(tiles, map);
	OZ.Event.add(null, "port-change", this._portChange.bind(this));
	
	var engine = game.getEngine();
	engine.addActor(this, Game.LAYER_BG);
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
	var engine = this._game.getEngine();
	var tile = 16;
	var size = map.getSize();
	this._canvas = OZ.DOM.elm("canvas", {width:size[0]*tile, height:size[1]*tile});
	var context = this._canvas.getContext("2d");
	
	var data = map.getData();
	for (var i=0;i<data.length;i++) {
		for (var j=0;j<data[i].length;j++) {
			var obj = data[i][j];
			for (var k=0;k<obj.images.length;k++) {
				var index = obj.images[k];
				if (index == 31) { continue; } /* transparent */
				
				if (obj.top[k]) {
					var toptile = new Game.TopTile([i*tile, j*tile], tiles, index, obj.mirror[j]);
					engine.addActor(toptile, Game.LAYER_TOP);
				} else {
					tiles.render(index, context, [i*tile, j*tile], obj.mirror[k]);
				}
				
			}
		}
	}
}
