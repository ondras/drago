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

var Game = {
	LAYER_BG		: "bg",
	LAYER_PLAYERS	: "players",
	LAYER_TOP		: "top",
	
	engine: null,
	port: null,
	background: null,
	keyboard: null,
	movement: null,
	
	_tiles: null,
	_map: null,
	_remain: 0
};

Game.init = function() {
	this.keyboard = new Game.Keyboard();
	this.movement = new Game.Movement();
	this.engine = new HAF.Engine();
	this.port = new Game.Port();
	this.engine.addLayer(this.LAYER_BG, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_PLAYERS, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_TOP, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});

	document.body.innerHTML = "Loading&hellip;";

	this._tiles = new Game.Tiles(1);
	this._map = new Game.Map();
	this._remain = 2;
	
	OZ.Event.add(this._tiles, "load", this._load.bind(this));
	OZ.Event.add(this._map, "load", this._load.bind(this));
}

Game._load = function(e) {
	this._remain--;
	if (this._remain) { return; }
	
	this.background = new Game.Background(this._tiles, this._map);
	
	OZ.Event.add(this.background, "load", this._loadBackground.bind(this));
}

Game._loadBackground = function() {
	document.body.innerHTML = "";
	document.body.appendChild(this.port.getContainer());
	this.port.sync();

	var player = new Game.Player(399, "D");
	
	this._computePath(GRAPH.length-1);
	player.moveBy(5);

/* */
	var monitor1 = new HAF.Monitor.Sim(this.engine, [220, 100], {textColor:"#fff"}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.right = "0px";
	monitor1.style.top = "0px";
	document.body.appendChild(monitor1);

	var monitor2 = new HAF.Monitor.Draw(this.engine, [220, 100], {textColor:"#fff"}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.right = "0px";
	monitor2.style.top = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
/* */

	this.engine.start();
	
	OZ.Audio.template = "sound/fx/{format}/{name}.{format}";
	OZ.Audio.Background.queue = ["G0", "G1", "G2", "G3", "G4", "G5"].randomize();
	OZ.Audio.Background.template = "sound/music/{format}/{name}.{format}";
	OZ.Audio.Background.play();
}

/**
 * Compute shortest path to a given index
 */
Game._computePath = function(index) {
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
			if (neighbor === null) { continue; }
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
