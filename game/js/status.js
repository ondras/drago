Game.Status = OZ.Class();
Game.Status.prototype.init = function() {
	this._dom = {
		container: OZ.DOM.elm("div", {id:"status"}),
		bottom: OZ.DOM.elm("div", {id:"bottom"}),
		portrait: OZ.DOM.elm("div", {id:"portrait"}),
		name: OZ.DOM.elm("div", {id:"name"}),
		moves: [],
		remain: []
	};
	OZ.DOM.append([this._dom.container, this._dom.portrait, this._dom.name, this._dom.bottom]);
	this._border = new Game.Border(this._dom.portrait);
	
	for (var i=0;i<2;i++) {
		var right = 22 + (1-i)*24;
		var top = 82;
		
		var digit = OZ.DOM.elm("div", {className:"digit", right:right+"px", top:top+"px"});
		this._dom.moves.push(digit);
		this._dom.bottom.appendChild(digit);
		
		top += 29;
		var digit = OZ.DOM.elm("div", {className:"digit", right:right+"px", top:top+"px"});
		this._dom.remain.push(digit);
		this._dom.bottom.appendChild(digit);
	}
	
	
	OZ.Event.add(null, "turn", this._turn.bind(this));
	OZ.Event.add(null, "change", this._change.bind(this));
}

Game.Status.prototype.getContainer = function() {
	return this._dom.container;
}

Game.Status.prototype._turn = function(e) {
	this._border.update();
	var player = e.target;
	var type = player.getType();
	var name = player.getName();

	this._dom.portrait.style.backgroundImage = "url(img/player/portrait/" + type + ".png)";
	this._dom.name.innerHTML = name;
	
	this._setMoves(0);
	this._setRemain(99); /* FIXME */
}

Game.Status.prototype._change = function(e) {
	var player = e.target;
	var moves = player.getMoves();
	this._setMoves(moves);
}

Game.Status.prototype._setMoves = function(moves) {
	this._setDigit(this._dom.moves[0], Math.floor(moves/10));
	this._setDigit(this._dom.moves[1], moves%10);
}

Game.Status.prototype._setRemain = function(remain) {
	this._setDigit(this._dom.remain[0], Math.floor(remain/10));
	this._setDigit(this._dom.remain[1], remain%10);
}

Game.Status.prototype._setDigit = function(node, digit) {
	var height = 24;
	node.style.backgroundPosition = "0px -" + (digit*height) + "px";
}
