Game.CardList = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync);
Game.CardList.prototype.init = function(cards, options) {
	this._cards = [];
	this._cb = {done: null, abort: null};
	this._current = -1;
	this._events = [];
	this._options = {
		parent: null, /* node */
		keyboard: true, /* use keyboard navigation */
		path: "", /* path to images */
		select: -1, /* pre-select? */
		autoSelect: true /* onactivate => done? if false, onactivate => select */
	}
	for (var p in options) { this._options[p] = options[p]; }
	
	var size = [130, 187];
	var padding = 10;
	
	for (var i=0;i<cards.length;i++) {
		var card = cards[i];
		var node = OZ.DOM.elm("img", {className:"card", src:"img/cards/" + this._options.path + card.getImage() +".png"});
		
		this._events.push(OZ.Touch.onActivate(node, this._activate.bind(this)));
		
		this._cards.push({
			card: card,
			node: node,
			locked: false
		});
		
		if (!this._options.parent) { /* position within body */
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
		
		(this._options.parent || document.body).appendChild(node);
	}
	
	if (this._options.select != -1) { this._select(this._options.select); }
	if (this._options.keyboard) { Game.keyboard.push(this); }
}

Game.CardList.prototype.lock = function(cards) {
	for (var i=0;i<this._cards.length;i++) {
		var item = this._cards[i];
		if (cards.indexOf(item.card) != -1) {
			item.locked = true;
			item.lock = OZ.DOM.elm("img", {src:"img/cards/locked.png", position:"absolute"});
			item.lock.style.left = (item.node.offsetLeft + item.node.clientLeft) + "px";
			item.lock.style.top = (item.node.offsetTop + item.node.clientTop) + "px";
			item.node.parentNode.appendChild(item.lock);
		}
	}
	
	return this;
}

Game.CardList.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ESC:
			if (this._cb.abort) {
				this.destroy();
				this._cb.abort();
			}
		break;
		case Game.INPUT_ENTER:
			if (this._cards[this._current].locked) { break; }
			this.destroy();
			if (this._cb.done) { 
				var card = (this._current == -1 ? null : this._cards[this._current].card);
				this._cb.done(card); 
			}
		break;
		case Game.INPUT_UP:
		case Game.INPUT_LEFT:
			if (this._current == -1) { break; }
			var index = (this._current ? this._current-1 : this._cards.length-1);
			this._select(index);
		break;
		case Game.INPUT_DOWN:
		case Game.INPUT_RIGHT:
			if (this._current == -1) { break; }
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
	this.dispatch("select", {card:this._cards[this._current].card});
}

Game.CardList.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	var card = null;
	var index = -1;
	var locked = false;
	
	for (var i=0;i<this._cards.length;i++) {
		var item = this._cards[i];
		if (item.node == target) { 
			card = item.card; 
			index = i;
			locked = item.locked;
		}
	}
	
	if ((this._options.autoSelect || index == this._current) && !locked) {
		this.destroy();
		this._cb.done(card);
	} else {
		this._select(index);
	}
}

Game.CardList.prototype.destroy = function() {
	if (this._options.keyboard) { Game.keyboard.pop(); }
	while (this._events.length) { OZ.Event.remove(this._events.pop()); }
	for (var i=0;i<this._cards.length;i++) { 
		var item = this._cards[i];
		item.node.parentNode.removeChild(item.node); 
		if (item.lock) { item.lock.parentNode.removeChild(item.lock); }
	}
}
