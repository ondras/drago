Game.Status = OZ.Class();
Game.Status.prototype.init = function() {
	this._months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	this._turns = 0;
	this._player = null;

	this._dom = {
		container: OZ.DOM.elm("div", {id:"status"}),
		bottom: OZ.DOM.elm("div", {id:"bottom"}),
		portrait: OZ.DOM.elm("div", {id:"portrait"}),
		name: OZ.DOM.elm("div", {id:"name"}),
		target: OZ.DOM.elm("div", {className:"label"}),
		nodeType: OZ.DOM.elm("div", {className:"label"}),
		nodeImage: OZ.DOM.elm("img", {id:"node-image"}),
		cards: OZ.DOM.elm("div", {id:"cards"}),
		turn: OZ.DOM.elm("h2"),
		money: OZ.DOM.elm("h2"),
		moves: [],
		remain: []
	};
	OZ.DOM.append([this._dom.container, this._dom.portrait, this._dom.name, this._dom.cards, this._dom.bottom]);
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
	this._player = e.target;
	var months = this._months.length;
	this._turns++;
	if (this._turns > Game.players.length) {
		this._turns = 1;
		Game.month++;
	}
	
	var month = Game.month % months;
	var year = Math.floor(Game.month / months) + 1;
	this._dom.turn.innerHTML = this._months[month] + " (" + year + ")";
	
	/* change tileset? */
	var season = Math.floor(((month + months - 2) % months)/3);
	Game.tiles.setType(season);
	
	this._border.update();
	var player = e.target;
	var type = player.getType();
	var name = player.getName();

	this._dom.portrait.style.backgroundImage = "url(img/player/portrait/" + type + ".png)";
	this._dom.name.innerHTML = "<div>" + name + "</div>"; /* IE shadow */
	
	this._playerChange(e);
}

Game.Status.prototype._playerChange = function(e) {
	var player = e.target;
	if (player != this._player) { return; }

	this._setMoney(player);
	this._setMoves(player);
	this._setRemain(player);
	this._setNode(player);
	this._setCards(player);
}

Game.Status.prototype._setCards = function(player) {
	var cards = player.getCards();
	OZ.DOM.clear(this._dom.cards);
	for (var i=0;i<cards.length;i++) {
		var card = cards[i];
		var img = OZ.DOM.elm("img", {position:"absolute", src:"img/cards/" + card.getImage() + ".png"});
		img.title = card.getName() + ": " + card.getDescription() + ".";
		this._dom.cards.appendChild(img);
		img.style.top = (3*i) + "px";
		var left = this._dom.cards.offsetWidth/2 - img.offsetWidth/2;
		left -= 3*i;
		img.style.left = left + "px";
	}
}

Game.Status.prototype._setNode = function(player) {
	var node = GRAPH[player.getIndex()];
	
	if (node.name) {
		this._dom.nodeType.innerHTML = node.name;
		this._dom.nodeImage.style.display = "none";
	} else if (node.type == "view") {
		this._dom.nodeImage.style.display = "none";
		this._dom.nodeType.innerHTML = "";
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
	this._dom.money.innerHTML = Game.formatMoney(money);
	this._dom.money.innerHTML = (money < 0 ? "-" : "") + "$" + Math.abs(money).toString().replace(/(\d{1,3}(?=(\d{3})+(?!\d)))/g, "$1.");;
}

Game.Status.prototype._setMoves = function(player) {
	var moves = player.getMoves();
	this._setDigit(this._dom.moves[0], Math.floor(moves/10));
	this._setDigit(this._dom.moves[1], moves%10);
}

Game.Status.prototype._setRemain = function(player) {
	var node = GRAPH[player.getIndex()];
	if (node.type == "view") { return; } /* do not change distance on views */
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
