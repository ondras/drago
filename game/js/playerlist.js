Game.PlayerList = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync);
Game.PlayerList.prototype.init = function(exclude) {
	this._players = [];
	this._cb = {done: null, abort: null};
	this._current = -1;
	this._events = [];
	
	this._node = OZ.DOM.elm("div", {id:"players", position:"absolute"});
	
	for (var i=0;i<Game.players.length;i++) {
		var player = Game.players[i];
		if (player == exclude) { continue; }
		var node = OZ.DOM.elm("img", {className:"player", src:"img/player/portrait/" + player.getType() +".png"});
		
		this._events.push(OZ.Touch.onActivate(node, this._activate.bind(this)));
		
		this._players.push({
			player: player,
			node: node
		});
		
		this._node.appendChild(node);
	}
	
	this._name = OZ.DOM.elm("div", {innerHTML:"&nbsp;"});
	this._node.appendChild(this._name);
	
	document.body.appendChild(this._node);
	new Game.Border(this._node);
	var win = OZ.DOM.win(true);
	this._node.style.left = Math.round((win[0]-this._node.offsetWidth)/2) + "px";
	this._node.style.top = Math.round((win[1]-this._node.offsetHeight)/2) + "px";
	
	this._select(0);
	Game.keyboard.push(this);
}

Game.PlayerList.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ESC:
			if (this._cb.abort) {
				this.destroy();
				this._cb.abort();
			}
		break;
		case Game.INPUT_ENTER:
			this.destroy();
			if (this._cb.done) { 
				var player = (this._current == -1 ? null : this._players[this._current].player);
				this._cb.done(player); 
			}
		break;
		case Game.INPUT_UP:
		case Game.INPUT_LEFT:
			if (this._current == -1) { break; }
			var index = (this._current ? this._current-1 : this._players.length-1);
			this._select(index);
		break;
		case Game.INPUT_DOWN:
		case Game.INPUT_RIGHT:
			if (this._current == -1) { break; }
			var index = (this._current+1 < this._players.length ? this._current+1 : 0);
			this._select(index);
		break;
		default:
			return false;
		break;
	}
	return true;
	
}

Game.PlayerList.prototype._select = function(index) {
	if (this._current != -1) { OZ.DOM.removeClass(this._players[this._current].node, "active"); }
	this._current = index;
	OZ.DOM.addClass(this._players[this._current].node, "active");
	
	this._name.innerHTML = this._players[this._current].player.getName();
	
	this.dispatch("select", {player:this._players[this._current].player});
}

Game.PlayerList.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	var player = null;
	
	for (var i=0;i<this._players.length;i++) {
		var item = this._players[i];
		if (item.node == target) { player = item.player; }
	}
	
	this.destroy();
	this._cb.done(player);
}

Game.PlayerList.prototype.destroy = function() {
	Game.keyboard.pop();
	while (this._events.length) { OZ.Event.remove(this._events.pop()); }
	for (var i=0;i<this._players.length;i++) { 
		var item = this._players[i];
		item.node.parentNode.removeChild(item.node); 
	}
	this._node.parentNode.removeChild(this._node);
}
