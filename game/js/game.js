Array.prototype.clone = function() {
	var c = [];
	var len = this.length;
	for (var i=0;i<len;i++) { c.push(this[i]); }
	return c;
}

Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.randomize = function() {
	var result = [];
	while (this.length) {
		var index = this.indexOf(this.random());
		result.push(this.splice(index, 1)[0]);
	}
	return result;
}

var Game = OZ.Class();
Game.LAYER_BG		= "bg";
Game.LAYER_PLAYERS	= "players";
Game.LAYER_TOP		= "top";

Game.prototype.init = function() {
	this._port = null;
	this._keyboard = new Game.Keyboard();
	this._engine = new HAF.Engine();
	this._engine.addLayer(Game.LAYER_BG, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_CHANGED});
	this._engine.addLayer(Game.LAYER_PLAYERS, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this._engine.addLayer(Game.LAYER_TOP, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});

	document.body.innerHTML = "Loading&hellip;";

	this._tiles = new Game.Tiles(1);
	this._map = new Game.Map();
	this._remain = 2;
	
	OZ.Event.add(this._tiles, "load", this._load.bind(this));
	OZ.Event.add(this._map, "load", this._load.bind(this));
}

Game.prototype.getEngine = function() {
	return this._engine;
}

Game.prototype.getPort = function() {
	return this._port;
}

Game.prototype.getBackground = function() {
	return this._background;
}

Game.prototype._load = function(e) {
	this._remain--;
	if (this._remain) { return; }
	
	document.body.innerHTML = "";

	this._port = new Game.Port(this, document.body);
	this._background = new Game.Background(this, this._tiles, this._map);
	
	OZ.Event.add(this._background, "load", this._loadBackground.bind(this));
}

Game.prototype._loadBackground = function() {
	var player = new Game.Player(this, 50, "D");
	this._keyboard.setPlayer(player);

/* */
	var monitor1 = new HAF.Monitor.Sim(this._engine, [220, 100], {textColor:"#000"}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.left = "0px";
	monitor1.style.top = "0px";
	document.body.appendChild(monitor1);

	var monitor2 = new HAF.Monitor.Draw(this._engine, [220, 100], {textColor:"#000"}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.left = "0px";
	monitor2.style.top = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
/* */

//	this._engine.start();
	
//	Game.Audio.playBackground();
	OZ.Audio.Background.queue = ["G0", "G1", "G2", "G3", "G4", "G5"].randomize();
	OZ.Audio.Background.template = "sound/music/{format}/{name}.{format}";
	OZ.Audio.Background.play();
}

/**
 * Compute shortest path to a given index
 */
Game.prototype._computePath = function(index) {
	for (var i=0;i<GRAPH.length;i++) { 
		GRAPH[i].path = null;
		GRAPH[i].distance = Infinity;
	}
	
	var target = GRAPH[index];
	target.distance = 0;
	var TODO = [target];
	
	while (TODO.length) { /* there are nodes remaining */
		var node = TODO.shift(); /* pick first node with neighbors that need to be adjusted */
		var dist = node.distance + 1;

		for (var i=0;i<node.neighbors.length;i++) {
			var neighbor = node.neighbors[i];
			if (!neighbor) { continue; }
			neighbor = GRAPH[neighbor];
			
			if (neighbor.distance > dist) { /* we can score better this way */
				neighbor.distance = dist;
				neighbor.path = [false, false, false, false];
				TODO.push(neighbor);
			}
			
			if (neighbor.distance == dist) { /* same score */
				var dir = (i+2) % 4;
				neighbor.path[dir] = true;
			}
		} /* for all neighbors*/
	}
	
}
