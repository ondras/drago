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
	LAYER_WIN		: "win",
	TILE			: 16,

	INPUT_KEY		: 0,
	INPUT_LEFT		: 1,
	INPUT_RIGHT		: 2,
	INPUT_UP		: 3,
	INPUT_DOWN		: 4,
	INPUT_ENTER		: 5,
	INPUT_ESC		: 6,
	
	engine: null,
	port: null,
	map: null,
	background: null,
	keyboard: null,
	movement: null,
	status: null,
	race: null,
	players: [],
	cards: [],
	tiles: null,
	month: 0,

	_remain: 0
};

Game.init = function() {
	this.keyboard = new Game.Keyboard();
	this.movement = new Game.Movement();
	this.engine = new HAF.Engine();
	this.status = new Game.Status();
	this.port = new Game.Port();
	this.tiles = new Game.Tiles();
	this.map = new Game.Map();
	this.background = new Game.Background();
	
	this._initAudio();
	this._initEngine();
	this._initCards();
	this._initGraph();
	
	this.keyboard.push(this);

	this._remain = 2;
	
	OZ.Event.add(this.tiles, "load", this._load.bind(this));
	OZ.Event.add(this.map, "load", this._load.bind(this));
}

Game.handleInput = function(input, param) {
	if (input != Game.INPUT_KEY) { return false; }

	switch (param) {
		case "O".charCodeAt(0):
			OZ.Audio.background.previous();
		break;
		case "P".charCodeAt(0):
			OZ.Audio.background.next();
		break;
		default: 
			return false;
		break;
	}

	return true;
}

Game._load = function(e) {
	this._remain--;
	if (this._remain) { return; }
	document.body.innerHTML = "<h1>Drago</h1><h2><abbr title='previously known as'>pka</abbr> Dr. Drago's Madcap Chase</h2>";
	
	OZ.Audio.background.queue = ["I"];
	OZ.Audio.background.play();
	new Game.Menu.Main();
}

Game.play = function(load) {
	document.body.innerHTML = "";
	this.background.prepare();
	document.body.appendChild(this.port.getContainer());
	document.body.appendChild(this.status.getContainer());
	this.port.sync();
	//this._initDebug();

	OZ.Audio.background.queue = ["G0", "G1", "G2", "G3", "G4", "G5"].randomize();
	OZ.Audio.background.fadeOut();
	
	if (load) {
		this.load();
	} else {
		this.race = Game.Race.createFrom(399);
		this.race.start();
	}

	this.engine.start();
}

Game.createPlayer = function(type, name) {
	var player = new Game.Player(type, name);
	this.players.push(player);
	player.setIndex(399);
	player.addCard(this.cards.random());
}

Game.formatMoney = function(money) {
	return (money < 0 ? "-" : "") + "$" + Math.abs(money).toString().replace(/(\d{1,3}(?=(\d{3})+(?!\d)))/g, "$1.");
}

Game.save = function() {
	var data = this.toJSON();
	localStorage.dragoSave = JSON.stringify(data);
}

Game.load = function() {
	var data = localStorage.dragoSave;
	data = JSON.parse(data);
	
	var size = this.port.getSize();
	var offset = [data.center[0]-Math.round(size[0]/2), data.center[1]-Math.round(size[1]/2)];
	this.port.setOffset(offset);
	
	this.month = data.month;
	this.players = [];
	for (var i=0;i<data.players.length;i++) {
		var player = Game.Player.fromJSON(data.players[i]);
		this.players.push(player);
	}

	this.race = Game.Race.fromJSON(data.race);
}

Game.toJSON = function() {
	var obj = {};
	obj.month = this.month;
	obj.race = this.race.toJSON();
	obj.players = [];
	for (var i=0;i<this.players.length;i++) {
		obj.players.push(this.players[i].toJSON());
	}
	
	var offset = this.port.getOffset();
	var size = this.port.getSize();
	obj.center = [offset[0]+Math.round(size[0]/2), offset[1]+Math.round(size[1]/2)];
	
	return obj;
}

Game._initAudio = function() {
	OZ.Audio.template = "sound/fx/{format}/{name}.{format}";
	OZ.Audio.background.template = "sound/music/{format}/{name}.{format}";
}

Game._initEngine = function() {
	this.engine.addLayer(this.LAYER_BG, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_PLAYERS, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_TOP, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_WIN, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_ALL, sync:false});
	this.engine.setSize([0, 0,], this.LAYER_WIN);
	
	var layer = this.engine.getLayer(this.LAYER_WIN);
	OZ.Touch.onStart(layer, OZ.Event.stop);
}

Game._initDebug = function() {
	var monitor1 = new HAF.Monitor.Sim(this.engine, [220, 100], {textColor:"#fff"}).getContainer();
	monitor1.style.position = "absolute";
	monitor1.style.left = "0px";
	monitor1.style.bottom = "0px";
	document.body.appendChild(monitor1);

	var monitor2 = new HAF.Monitor.Draw(this.engine, [220, 100], {textColor:"#fff"}).getContainer();
	monitor2.style.position = "absolute";
	monitor2.style.left = "0px";
	monitor2.style.bottom = monitor1.offsetHeight + "px";
	document.body.appendChild(monitor2);
}

Game._initCards = function() {
	this.cards.push(new Game.Card.Slot(2));
	this.cards.push(new Game.Card.Slot(3));
	this.cards.push(new Game.Card.Slot(4));
	this.cards.push(new Game.Card.Slot(5));

	this.cards.push(new Game.Card.Move(1));
	this.cards.push(new Game.Card.Move(2));
	this.cards.push(new Game.Card.Move(3));
	this.cards.push(new Game.Card.Move(4));
	this.cards.push(new Game.Card.Move(5));
	this.cards.push(new Game.Card.Move(6));
}

/**
 * Merge views into graph
 */
Game._initGraph = function() {
	for (var i=0;i<VIEWS.length;i++) {
		var view = VIEWS[i];
		var viewNode = {
			x: view.x,
			y: view.y,
			air: 0,
			neighbors: [null, null, null, null],
			flight: [0, 0, 0, 0],
			type: "view",
			name: "",
			text: view.text
		};
		
		this._addViewNode(viewNode);
		
	}
}

Game._addViewNode = function(viewNode) {
	var viewIndex = GRAPH.length;
	GRAPH.push(viewNode);
	
	for (var i=0;i<viewIndex;i++) {
		var node = GRAPH[i];
		
		if (node.x == viewNode.x) { /* vertical test */
			if (node.y > viewNode.y && node.neighbors[0] !== null && GRAPH[node.neighbors[0]].y < viewNode.y) { /* test up */
				this._insertViewNode(i, 0, viewIndex);
			}
			
			if (node.y < viewNode.y && node.neighbors[2] !== null && GRAPH[node.neighbors[2]].y > viewNode.y) { /* test down */
				this._insertViewNode(i, 2, viewIndex);
			}
		} else if (node.y == viewNode.y) { /* horizontal test */
			if (node.x > viewNode.x && node.neighbors[3] !== null && GRAPH[node.neighbors[3]].x < viewNode.x) { /* test left */
				this._insertViewNode(i, 3, viewIndex);
			}
			
			if (node.x < viewNode.x && node.neighbors[1] !== null && GRAPH[node.neighbors[1]].x > viewNode.x) { /* test right */
				this._insertViewNode(i, 1, viewIndex);
			}
		}
		
		
	}
	
}

/**
 * Insert a new node + new edge
 * @param {int} nodeIndex tested node
 * @param {int} direction tested direction
 * @param {int} viewIndex new node
 */
Game._insertViewNode = function(nodeIndex, direction, viewIndex) {
	var viewNode = GRAPH[viewIndex];
	var node = GRAPH[nodeIndex];
	
	viewNode.neighbors[direction] = node.neighbors[direction];
	node.neighbors[direction] = viewIndex;
}
