Game.Background = OZ.Class().extend(HAF.Actor);

Game.Background.prototype.init = function(game, tiles, map) {
	this._game = game;
	this._tiles = tiles;
	this._map = map;

	this._offset = this._game.getPort().getOffset();
	this._dirty = false;
	this._canvas = null;
	
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
	var context = this._canvas.getContext("2d");
	var data = this._map.getData();

	for (var i=part[0];i<part[1];i++) {
		for (var j=0;j<data[i].length;j++) {
			var obj = data[i][j];
			for (var k=0;k<obj.images.length;k++) {

				if (k && obj.ignore) { continue; } /* part of a previous animation */
				var index = obj.images[k];
				if (index == 31) { continue; } /* transparent */
				
				var position = [i*tile, j*tile];
				
				if (index in ANIMATIONS) { /* animation - do not render normal tile */
					var anim = ANIMATIONS[index];
					var sprite = this._tiles.createAnimation(index, anim);
					new Game.Animation.Map(this._game, position, sprite, anim);
					
					for (var x=0;x<anim.size[0];x++) {
						for (var y=0;y<anim.size[1];y++) {
							data[i+x][j+y].ignore = true;
						}
					}
					
					if (k) { continue; }
				}


				if (obj.top[k]) {
					var canvas = this._tiles.createTile(index, obj.mirror[k]);
					new Game.Tile(this._game, position, canvas);
				} else {
					this._tiles.render(index, context, position, obj.mirror[k]);
				}
				
				
			}
		}
	}
	
	this._dirty = true;
	
	if (this._remainingParts.length) {
		setTimeout(this._buildPart.bind(this), 100);
	}
	
	
}
