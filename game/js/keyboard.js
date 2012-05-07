Game.Keyboard = OZ.Class();
Game.Keyboard.prototype.init = function() {
	this._handlers = [];
	
	this._codes = {};
	this._codes[37] = Game.INPUT_LEFT;
	this._codes[39] = Game.INPUT_RIGHT;
	this._codes[38] = Game.INPUT_UP;
	this._codes[40] = Game.INPUT_DOWN;
	this._codes[13] = Game.INPUT_ENTER;
	this._codes[27] = Game.INPUT_ESC;
	
	OZ.Event.add(document, "keydown", this._keydown.bind(this));
	OZ.Touch.onActivate(document, this._activate.bind(this));
}

Game.Keyboard.prototype.push = function(handler) {
	this._handlers.push(handler);
	return this;
}

Game.Keyboard.prototype.pop = function() {
	this._handlers.pop();
	return this;
}

Game.Keyboard.prototype._process = function(type, code) {
	var index = this._handlers.length;
	while (index--) {
		var result = this._handlers[index].handleInput(type, code);
		if (result) { return; }
	}
}

Game.Keyboard.prototype._keydown = function(e) {
	var code = e.keyCode;
	var type = (code in this._codes ? this._codes[code] : Game.INPUT_KEY);
	this._process(type, code);
}

/* click/touch outside map => escape */
Game.Keyboard.prototype._activate = function(e) {
	var node = OZ.Event.target(e);
	var stop = Game.port.getContainer();
	while (node) {
		if (node == stop) { return; }
		node = node.parentNode;
	}
	
	this._process(Game.INPUT_ESC);
}
