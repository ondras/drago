var Game = OZ.Class();
Game.LAYER_BG	= "bg";
Game.LAYER_PLAYERS	= "players";
Game.LAYER_TOP	= "top";

Game.prototype.init = function() {
	this._port = null;
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

Game.prototype._load = function(e) {
	this._remain--;
	if (this._remain) { return; }
	
	this._background = new Game.Background(this, this._tiles, this._map);
	document.body.innerHTML = "";

	var player = new Game.Player(this, 0, "D");
	player.setOrientation(1);

	this._port = new Game.Port(this, document.body, this._background);

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

	this._engine.start();
}
