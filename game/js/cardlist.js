Game.CardList = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync);
Game.CardList.prototype.init = function(cards, parent) {
	this._cards = [];
	this._cb = {done: null, abort: null};
	this._current = -1;
	this._events = [];
	
	for (var i=0;i<cards.length;i++) {
		var card = cards[i];
		var node = OZ.DOM.elm("img", {className:"card", src:"img/cards/" + card.getImage() +".png"});
		this._cards.push({
			card: card,
			node: node
		});
		
		(parent || document.body).appendChild(node);
	}
	
	Game.keyboard.push(this);
	this._select(0);
}

Game.CardList.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ESC:
			if (this._cb.abort) {
				this._close();
				this._cb.abort();
			}
		break;
		case Game.INPUT_ENTER:
			this._close();
			this._cb.done(this._cards[this._current].card);
		break;
		case Game.INPUT_UP:
		case Game.INPUT_LEFT:
			var index = (this._current ? this._current-1 : this._cards.length-1);
			this._select(index);
		break;
		case Game.INPUT_DOWN:
		case Game.INPUT_RIGHT:
			var index = (this._current+1 < this._cards.length ? this._current+1 : 0);
			this._select(index);
		break;
		default:
			return false;
		break;
	}
	return true;
	
}

Game.CardList.prototype._select = function(index) {
	if (this._current != -1) { OZ.DOM.removeClass(this._cards[this._current].node, "active"); }
	this._current = index;
	OZ.DOM.addClass(this._cards[this._current].node, "active");
}

Game.CardList.prototype._close = function() {
	Game.keyboard.pop();
	while (this._events.length) { OZ.Event.remove(this._events.pop()); }
	for (var i=0;i<this._cards.length;i++) { this._cards[i].node.parentNode.removeChild(this._cards[i].node); }
}
