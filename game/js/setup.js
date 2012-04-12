Game.Setup = OZ.Class();
Game.Setup.prototype.init = function() {
	this._players = [
		{type:"D", active:true,  name:"Helmut Pohl"},
		{type:"U", active:true,  name:"Jane Blonda"},
		{type:"F", active:false, name:"Vera Cruise"},
		{type:"J", active:false, name:"Mikro Mawasaki"},
		{type:"E", active:false, name:"James Fond"},
		{type:"I", active:false, name:"Luigi Maserotti"},
		{type:"M", active:false, name:"Zora Meander"},
		{type:"V", active:false, name:"Armino Gesserti"}
	];
	
	this._build();
//	OZ.DOM.addClass(document.body, "setup");
	document.body.appendChild(this._node);
	
	OZ.Audio.background.queue = ["I"];
	OZ.Audio.background.play();
}

Game.Setup.prototype._build = function() {
	this._node = OZ.DOM.elm("div", {id:"setup", position:"relative"});
	
	var offsetX = [112, 548];
	var offsetY = 33;
	var offsetX = [94, 530];
	var offsetY = 21;
	var offsetX = [94, 530];
	var offsetY = 19;

	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		var node = OZ.DOM.elm("div", {width:"116px", height:"116px", position:"absolute"});
		node.style.left = offsetX[i % 2] + "px";
		node.style.top = (offsetY + 130*Math.floor(i/2)) + "px";
		p.node = node;
		
		var name = OZ.DOM.elm("input", {position:"absolute", value:p.name});
		name.style.left = (offsetX[i % 2] + 125) + "px";
		name.style.top = (offsetY + 130*Math.floor(i/2)) + "px";
		p.name = name;
		
		this._sync(p);
		this._node.appendChild(node);
		this._node.appendChild(name);
	}
	
	OZ.Touch.onActivate(this._node, this._click.bind(this));
	
	var done = OZ.DOM.elm("img", {id:"start", src:"img/setup/start.png", title:"Race!", alt:"Race!"});
	this._node.appendChild(done);
	OZ.Touch.onActivate(done, this._done.bind(this));

	var load = OZ.DOM.elm("img", {id:"load", src:"img/setup/load.png", title:"Load a saved race", alt:"Load a saved race"});
	this._node.appendChild(load);
	OZ.Touch.onActivate(load, this._load.bind(this));
}

Game.Setup.prototype._click = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	for (var i=0;i<this._players.length;i++) {
		var player = this._players[i];
		if (player.node == target) {
			player.active = !player.active;
			this._sync(player);
			return;
		}
	}
}

Game.Setup.prototype._sync = function(player) {
	player.node.style.backgroundImage = (player.active ? "url(img/setup/" + player.type + ".png)" : "none");
	player.name.style.display = (player.active ? "" : "none");
}

Game.Setup.prototype._done = function(e) {
	OZ.Event.stop(e);
	var count = 0;
	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		if (p.active && p.name.value) { count++; }
	}
	if (count == 0) { return; }

	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		if (p.active && p.name.value) { Game.createPlayer(p.type, p.name.value); }
	}

	this._close();
	Game.play(false);
}

Game.Setup.prototype._close = function() {
	OZ.DOM.removeClass(document.body, "setup");
	this._node.parentNode.removeChild(this._node);
}

Game.Setup.prototype._load = function(e) {
	OZ.Event.stop(e);
	this._close();
	Game.play(true);
}
