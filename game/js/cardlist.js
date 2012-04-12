Game.CardList = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync);
Game.CardList.prototype.init = function(cards, parent) {
	this._cards = [];
	this._cb = {done: null, abort: null};
	this._current = -1;
	this._events = [];
	var size = [130, 187];
	var padding = 10;
	
	for (var i=0;i<cards.length;i++) {
		var card = cards[i];
		var node = OZ.DOM.elm("img", {className:"card", src:"img/cards/" + card.getImage() +".png"});
		
		this._events.push(OZ.Touch.onActivate(node, this._activate.bind(this)));
		
		this._cards.push({
			card: card,
			node: node
		});
		
		if (!parent) { /* position within body */
			node.style.position = "absolute";
			var pos = OZ.DOM.pos(Game.port.getContainer());
			var port = Game.port.getSize();
			pos[0] += port[0]/2;
			pos[1] += port[1]/2;
			
			var cardsInRow = Math.min(4, cards.length);
			var rowWidth = cardsInRow * size[0] + padding * (cardsInRow-1);
			pos[0] -= rowWidth/2;
			
			var cardOffset = i % 4;
			pos[0] += cardOffset * (size[0] + padding);
			
			var cardsInCol = Math.ceil(cards.length/4);
			var colHeight = cardsInCol * size[1] + padding * (cardsInCol-1);
			pos[1] -= colHeight/2;
			
			var cardOffset = Math.floor(i/4);
			pos[1] += cardOffset * (size[1] + padding);

			node.style.left = Math.round(pos[0]) + "px";
			node.style.top = Math.round(pos[1]) + "px";
		}
		
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

Game.CardList.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	var card = null;
	for (var i=0;i<this._cards.length;i++) {
		var item = this._cards[i];
		if (item.node == target) { card = item.card; }
	}
	this._close();
	this._cb.done(card);
}

Game.CardList.prototype._close = function() {
	Game.keyboard.pop();
	while (this._events.length) { OZ.Event.remove(this._events.pop()); }
	for (var i=0;i<this._cards.length;i++) { this._cards[i].node.parentNode.removeChild(this._cards[i].node); }
}
