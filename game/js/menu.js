Game.Menu = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync);
Game.Menu.prototype.init = function() {
	this._cb = {done: null, abort: null};

	this._node = OZ.DOM.elm("div", {id:"menu", position:"absolute"});
	this._content = OZ.DOM.elm("div");
	this._node.appendChild(this._content);
	
	this._items = {};
	this._events = [];
	this._current = null; /* id of current item */
	this._border = new Game.Border(this._node, "BS", 16);
	this._events.push(OZ.Touch.onActivate(this._node, this._activate.bind(this)));
	
	this._restore();
	this._center();
}

Game.Menu.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ESC:
			this._hide();
			this._destroy();
			if (this._cb.abort) { this._cb.abort(); }
		break;
		case Game.INPUT_ENTER:
			var item = this._items[this._current];
			if (item.disabled) { return; }
			this._go(this._current);
		break;
		case Game.INPUT_UP:
			var node = this._items[this._current].node;
			if (node.previousSibling) {
				this._hover(this._nodeToID(node.previousSibling));
			} else {
				this._hover(this._nodeToID(node.parentNode.lastChild));
			}
		break;
		case Game.INPUT_DOWN:
			var node = this._items[this._current].node;
			if (node.nextSibling) {
				this._hover(this._nodeToID(node.nextSibling));
			} else {
				this._hover(this._nodeToID(node.parentNode.firstChild));
			}
		break;
		default:
			return false;
		break;
	}
	return true;
	
}

Game.Menu.prototype._center = function() {
	var win = OZ.DOM.win(true);
	this._node.style.left = Math.round((win[0]-this._node.offsetWidth)/2) + "px";
	this._node.style.top = Math.round((win[1]-this._node.offsetHeight)/2) + "px";
}

Game.Menu.prototype._addItem = function(id, label, disabled) {
	var item = OZ.DOM.elm("div", {className:"item", innerHTML:label});
	if (disabled) { OZ.DOM.addClass(item, "disabled"); }
	this._content.appendChild(item);
	this._items[id] = {
		node: item,
		disabled: disabled
	};
	
	this._events.push(OZ.Event.add(item, "mouseover", this._over.bind(this)));
	this._border.update();
}

/**
 * Touch/click
 */
Game.Menu.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var id = this._nodeToID(OZ.Event.target(e));
	if (!id) { return; }

	var item = this._items[id];
	if (item.disabled) { return; }
	this._go(id);
}

Game.Menu.prototype._over = function(e) {
	var id = this._nodeToID(OZ.Event.target(e));
	this._hover(id);
}

Game.Menu.prototype._hover = function(id) { 
	OZ.Audio.play("plop");
	if (this._current) { OZ.DOM.removeClass(this._items[this._current].node, "active"); }
	this._current = id;
	OZ.DOM.addClass(this._items[id].node, "active");
}

Game.Menu.prototype._nodeToID = function(node) {
	for (var id in this._items) {
		if (this._items[id].node == node) { return id; }
	}
	return null;
}

Game.Menu.prototype._hide = function() {
	Game.keyboard.pop();
	this._node.parentNode.removeChild(this._node);
}

Game.Menu.prototype._destroy = function() {
	/* always call _hide before _destroy */
	while (this._events.length) { OZ.Event.remove(this._events.pop()); }
}

Game.Menu.prototype._restore = function() {
	document.body.appendChild(this._node);
	Game.keyboard.push(this);
}

/**
 * Confirm an item
 */
Game.Menu.prototype._go = function(id) {}
