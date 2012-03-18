Game.IKeyboardHandler = OZ.Class();
Game.IKeyboardHandler.prototype.handleKey = function(key) {};

Game.Keyboard = OZ.Class();
Game.Keyboard.LEFT	= 37;
Game.Keyboard.RIGHT	= 39;
Game.Keyboard.UP	= 38;
Game.Keyboard.DOWN	= 40;
Game.Keyboard.ENTER	= 13;
Game.Keyboard.ESC	= 27;

Game.Keyboard.prototype.init = function() {
	this._handlers = [];
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
}

Game.Keyboard.prototype.push = function(handler) {
	this._handlers.push(handler);
	return this;
}

Game.Keyboard.prototype.pop = function() {
	this._handlers.pop();
	return this;
}

Game.Keyboard.prototype._keydown = function(e) {
	var index = this._handlers.length-1;
	while (index >= 0) {
		var result = this._handlers[index].handleKey(e.keyCode);
		if (result) { return; }
		index--;
	}
	
}
