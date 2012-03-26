Game.Background = OZ.Class().extend(HAF.Actor);
Game.Background.prototype.init = function() {
	this._dirty = false;
	this._animations = [];
	this._topTiles = [];
	
	this._tileSize = 32; /* number of small tiles in a large tile */
	this._tilesPerSide = 0;
	this._mapTiles = [];
	this._tilesReady = [];

	OZ.Event.add(null, "port-change", this._portChange.bind(this));
	OZ.Event.add(null, "tiles-change", this._tilesChange.bind(this));
}

Game.Background.prototype.prepare = function() {
	Game.engine.addActor(this, Game.LAYER_BG);

	this._tilesPerSide = Game.map.getData().length / this._tileSize;
	
	for (var i=0;i<this._tilesPerSide;i++) {
		this._mapTiles.push([]);
		this._tilesReady.push([]);
		for (var j=0;j<this._tilesPerSide;j++) {
			this._mapTiles[i].push(null);
			this._tilesReady[i].push(false);
		}
	}
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
			var tile = this._getLargeTile(tileX, tileY);
			var tileLeft = tileX * tileSize;
			var tileTop = tileY * tileSize;
			context.drawImage(tile, tileLeft - offset[0], tileTop - offset[1]);
		}
	}

}

Game.Background.prototype._portChange = function(e) {
	this._dirty = true;
}

Game.Background.prototype._tilesChange = function(e) {
	/* needs redraw */
	this._dirty = true;
	
	/* all big tiles need to be updated */
	for (var i=0;i<this._tilesReady.length;i++) {
		for (var j=0;j<this._tilesReady[i].length;j++) {
			this._tilesReady[i][j] = false;
		}
	}
	
	/* reset animation ignore state */
	var data = Game.map.getData();
	for (var i=0;i<data.length;i++) {
		for (var j=0;j<data[i].length;j++) {
			data[i][j].ignore = false;
		}
	}
	
	/* remove animations */
	while (this._animations.length) { this._animations.pop().destroy(); }
	
	/* remove top tiles */
	while (this._topTiles.length) { this._topTiles.pop().destroy(); }
}

Game.Background.prototype._getLargeTile = function(x, y) {
	if (!this._mapTiles[x][y]) {
		var canvas = OZ.DOM.elm("canvas", {width:this._tileSize*Game.TILE, height:this._tileSize*Game.TILE});
		this._mapTiles[x][y] = canvas;
	}
	
	var canvas = this._mapTiles[x][y];

	if (!this._tilesReady[x][y]) { 
		this._buildTile(canvas, [x, y]); 
		this._tilesReady[x][y] = true;
	}
	
	return canvas;
}

/**
 * Build one large tile
 */
Game.Background.prototype._buildTile = function(canvas, bigPosition) {
	var data = Game.map.getData();
	var context = canvas.getContext("2d");
	
	/* this tile's position in small tile coords */
	var bigTile = [bigPosition[0]*this._tileSize, bigPosition[1]*this._tileSize];
	
	for (var i=0;i<this._tileSize;i++) {
		for (var j=0;j<this._tileSize;j++) {
			var obj = data[bigTile[0]+i][bigTile[1]+j];
			var smallTile = [i, j];
			for (var k=0;k<obj.images.length;k++) { this._processTile(obj, k, bigTile, smallTile, context); }
		}
	}
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
		var sprite = Game.tiles.createAnimation(tileIndex, anim);
		this._animations.push(new Game.Animation.Map(absPx, sprite, anim));
		
		if (index) { /* mark further tiles in this animation; we don't need them */
			var data = Game.map.getData();
			for (var i=0;i<anim.size[0];i++) {
				for (var j=0;j<anim.size[1];j++) {
					data[bigTile[0]+smallTile[0]+i][bigTile[1]+smallTile[1]+j].ignore = true;
				}
			}
		}
		
		return;
	}

	if (obj.top[index]) { /* create a separate tile object in top layer */
		var canvas = Game.tiles.createTile(tileIndex, obj.mirror[index]);
		this._topTiles.push(new Game.Tile(absPx, canvas));
	} else { /* render to big tile */
		var px = [
			Game.TILE * smallTile[0],
			Game.TILE * smallTile[1]
		];
		Game.tiles.render(tileIndex, context, px, obj.mirror[index]);
	}

}
