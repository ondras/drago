Game.Status = OZ.Class();
Game.Status.prototype.init = function() {
	this._turns = 0;

	this._dom = {
		container: OZ.DOM.elm("div", {id:"status"}),
		bottom: OZ.DOM.elm("div", {id:"bottom"}),
		portrait: OZ.DOM.elm("div", {id:"portrait"}),
		name: OZ.DOM.elm("div", {id:"name"}),
		target: OZ.DOM.elm("div", {className:"label"}),
		nodeType: OZ.DOM.elm("div", {className:"label"}),
		nodeImage: OZ.DOM.elm("img", {id:"node-image"}),
		turn: OZ.DOM.elm("h2"),
		money: OZ.DOM.elm("h2"),
		moves: [],
		remain: []
	};
	OZ.DOM.append([this._dom.container, this._dom.portrait, this._dom.name, this._dom.bottom]);
	this._border = new Game.Border(this._dom.portrait);
	
	this._buildBottom();

	OZ.Event.add(null, "turn", this._turn.bind(this));
	OZ.Event.add(null, "player-change", this._playerChange.bind(this));
	OZ.Event.add(null, "race-ready", this._raceReady.bind(this));
}

Game.Status.prototype.getContainer = function() {
	return this._dom.container;
}

Game.Status.prototype._buildBottom = function() {
	this._dom.bottom.appendChild(this._dom.turn);
	this._dom.bottom.appendChild(this._dom.money);
	
	this._dom.target.style.top = "85px";
	this._dom.bottom.appendChild(this._dom.target);
	
	var moves = OZ.DOM.elm("div", {className:"label", top:"114px", innerHTML:"Moves"});
	this._dom.bottom.appendChild(moves);

	for (var i=0;i<2;i++) {
		var right = 22 + (1-i)*24;

		var top = 82;
		var digit = OZ.DOM.elm("div", {className:"digit", right:right+"px", top:top+"px"});
		this._dom.remain.push(digit);
		this._dom.bottom.appendChild(digit);
		
		top += 29;
		var digit = OZ.DOM.elm("div", {className:"digit", right:right+"px", top:top+"px"});
		this._dom.moves.push(digit);
		this._dom.bottom.appendChild(digit);
	}
	
	this._dom.nodeType.style.top = "152px";
	this._dom.bottom.appendChild(this._dom.nodeType);
	this._dom.bottom.appendChild(this._dom.nodeImage);
}

/**
 * Change player
 */
Game.Status.prototype._turn = function(e) {
	this._turns++;
	
	var globalTurn = Math.ceil(this._turns / Game.players.length);
	this._dom.turn.innerHTML = "Turn " + globalTurn;
	
	this._border.update();
	var player = e.target;
	var type = player.getType();
	var name = player.getName();

	this._dom.portrait.style.backgroundImage = "url(img/player/portrait/" + type + ".png)";
	this._dom.name.innerHTML = name;
	
	this._playerChange(e);
}

Game.Status.prototype._playerChange = function(e) {
	var player = e.target;
	this._setMoney(player);
	this._setMoves(player);
	this._setRemain(player);
	this._setNode(player);
}

Game.Status.prototype._setNode = function(player) {
	var node = GRAPH[player.getIndex()];
	
	if (node.name) {
		this._dom.nodeType.innerHTML = node.name;
		this._dom.nodeImage.style.display = "none";
	} else {
		var map = {
			"blue": "Win",
			"red": "Lose",
			"yellow": "Get card",
			"purple": "Buy cards"
		};
		this._dom.nodeType.innerHTML = map[node.type];
		this._dom.nodeImage.src = "img/status/node-" + node.type + ".png";
		this._dom.nodeImage.style.display = "";
	}
}

Game.Status.prototype._setMoney = function(player) {
	var money = player.getMoney();
	this._dom.money.innerHTML = (money < 0 ? "-" : "") + "$" + Math.abs(money).toString().replace(/(\d{1,3}(?=(\d{3})+(?!\d)))/g, "$1.");;
}

Game.Status.prototype._setMoves = function(player) {
	var moves = player.getMoves();
	this._setDigit(this._dom.moves[0], Math.floor(moves/10));
	this._setDigit(this._dom.moves[1], moves%10);
}

Game.Status.prototype._setRemain = function(player) {
	var node = GRAPH[player.getIndex()];
	var remain = node.distance;
	this._setDigit(this._dom.remain[0], Math.floor(remain/10));
	this._setDigit(this._dom.remain[1], remain%10);
}

Game.Status.prototype._setDigit = function(node, digit) {
	var height = 24;
	node.style.backgroundPosition = "0px -" + (digit*height) + "px";
}

/**
 * New race target
 */
Game.Status.prototype._raceReady = function(e) {
	var node = GRAPH[e.target.getTarget()];
	this._dom.target.innerHTML = node.name;
	this._turns = 0;
}
