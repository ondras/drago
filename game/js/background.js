Game.Background = OZ.Class().extend(HAF.Actor);
Game.Background.prototype.init = function(tiles, map) {
	this._tiles = tiles;
	this._map = map;

	this._dirty = false;
	
	this._mapTiles = [];
	this._tileSize = 32; /* number of small tiles in a large tile */
	this._tilesPerSide = 0;
	
	Game.engine.addActor(this, Game.LAYER_BG);
	OZ.Event.add(null, "port-change", this._portChange.bind(this));

	this._build();
}

Game.Background.prototype.getSize = function() {
	return [this._tilesPerSide * this._tileSize * Game.TILE, this._tilesPerSide * this._tileSize * Game.TILE];
}

Game.Background.prototype.tick = function(dt) {
	var dirty = this._dirty;
	this._dirty = false;
	return dirty;
}

/**
 * Render visible mapTiles into port
 */
Game.Background.prototype.draw = function(context) {
	var offset = Game.port.getOffset();
	var size = Game.port.getSize();
	var tileSize = this._tileSize * Game.TILE; /* in pixels */
	
	var startX = Math.floor(offset[0]/tileSize)*tileSize;
	var startY = Math.floor(offset[1]/tileSize)*tileSize;
	
	for (var i=startX; i<offset[0]+size[0]; i+=tileSize) {
		for (var j=startY; j<offset[1]+size[1]; j+=tileSize) {
			var tileX = Math.floor(i / tileSize);
			var tileY = Math.floor(j / tileSize);
			var tile = this._mapTiles[tileX + tileY*this._tilesPerSide];
			var tileLeft = tileX * tileSize;
			var tileTop = tileY * tileSize;
			context.drawImage(tile, tileLeft - offset[0], tileTop - offset[1]);
		}
	}

}

Game.Background.prototype._portChange = function(e) {
	this._dirty = true;
}

Game.Background.prototype._build = function() {
	this._mapTiles = [];

	var data = this._map.getData();
	this._tilesPerSide = data.length / this._tileSize;

	this._buildTile();
/*	
	
	var size = this._map.getSize();
	this._canvas = OZ.DOM.elm("canvas", {width:size[0]*Game.TILE, height:size[1]*Game.TILE});
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
	*/
//	setTimeout(function(){	this.dispatch("load");}.bind(this), 100);

}

/**
 * Build one large tile
 */
Game.Background.prototype._buildTile = function() {
	var data = this._map.getData();

	var currentTile = this._mapTiles.length;
	var tilesTotal = this._tilesPerSide*this._tilesPerSide;
	
	if (currentTile >= tilesTotal) {
		this._dirty = true;
		this.dispatch("load");
		return;
	}
	
	var canvas = OZ.DOM.elm("canvas", {width:this._tileSize*Game.TILE, height:this._tileSize*Game.TILE});
	this._mapTiles.push(canvas);
	var context = canvas.getContext("2d");
	
	/* this tile's position in small tile coords */
	var x = this._tileSize * (currentTile % this._tilesPerSide);
	var y = this._tileSize * Math.floor(currentTile / this._tilesPerSide);
	var bigTile = [x, y];
	
	for (var i=0;i<this._tileSize;i++) {
		for (var j=0;j<this._tileSize;j++) {
			var obj = data[bigTile[0]+i][bigTile[1]+j];
			var smallTile = [i, j];
			for (var k=0;k<obj.images.length;k++) { this._processTile(obj, k, bigTile, smallTile, context); }
		}
	}
	
	
	setTimeout(this._buildTile.bind(this), 10);
}

/**
 * @param {object} obj Map tile object
 * @param {int} index First or second map layer
 * @param {int[]} bigTile Big Tile position in small tile coords
 * @param {int[]} smallTile Small Tile position withing big tile, in small tile coords
 * @param {object} context
 */
Game.Background.prototype._processTile = function(obj, index, bigTile, smallTile, context) {
	var absPx = [
		Game.TILE * (bigTile[0] + smallTile[0]),
		Game.TILE * (bigTile[1] + smallTile[1])
	];
	if (index && obj.ignore) { return; } /* already covered by an animation */
	
	var tileIndex = obj.images[index];
	if (tileIndex == 31) { return; } /* transparent */
	
	if (tileIndex in ANIMATIONS) { /* animation: create an animation object in bg/middle layer */
		var anim = ANIMATIONS[tileIndex];
		var sprite = this._tiles.createAnimation(tileIndex, anim);
		new Game.Animation.Map(absPx, sprite, anim);
		
		if (index) { /* mark further tiles in this animation; we don't need them */
			var data = this._map.getData();
			for (var i=0;i<anim.size[0];i++) {
				for (var j=0;j<anim.size[1];j++) {
					data[bigTile[0]+smallTile[0]+i][bigTile[1]+smallTile[1]+j].ignore = true;
				}
			}
		}
		
		return;
	}

	if (obj.top[index]) { /* create a separate tile object in top layer */
		var canvas = this._tiles.createTile(tileIndex, obj.mirror[index]);
		new Game.Tile(absPx, canvas);
	} else { /* render to big tile */
		var px = [
			Game.TILE * smallTile[0],
			Game.TILE * smallTile[1]
		];
		this._tiles.render(tileIndex, context, px, obj.mirror[index]);
	}

}
