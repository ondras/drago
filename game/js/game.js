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
	LAYER_SLOT		: "slot",
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
	document.body.innerHTML = "";
	
	new Game.Setup();
}

Game.play = function() {
	this.background.prepare();
	document.body.appendChild(this.port.getContainer());
	document.body.appendChild(this.status.getContainer());
	this.port.sync();
	//this._initDebug();
	this.engine.start();

	OZ.Audio.background.queue = ["G0", "G1", "G2", "G3", "G4", "G5"].randomize();
	OZ.Audio.background.fadeOut();
	this.race = Game.Race.createFrom(399);
}

Game.createPlayer = function(type, name) {
	var player = new Game.Player(type, name);
	this.players.push(player);
	player.setIndex(399);
	player.addCard(this.cards[0]);
	player.addCard(this.cards[1]);
}

Game.formatMoney = function(money) {
	return (money < 0 ? "-" : "") + "$" + Math.abs(money).toString().replace(/(\d{1,3}(?=(\d{3})+(?!\d)))/g, "$1.");
}

Game._initAudio = function() {
	OZ.Audio.template = "sound/fx/{format}/{name}.{format}";
	OZ.Audio.background.template = "sound/music/{format}/{name}.{format}";
}

Game._initEngine = function() {
	this.engine.addLayer(this.LAYER_BG, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_PLAYERS, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_TOP, {clear:HAF.CLEAR_ACTORS, dirty:HAF.DIRTY_CHANGED});
	this.engine.addLayer(this.LAYER_SLOT, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_ALL, sync:false});
	this.engine.setSize([0, 0,], this.LAYER_SLOT);
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
