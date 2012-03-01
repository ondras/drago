Game.Keyboard = OZ.Class();

Game.Keyboard.prototype.init = function() {
	this._player = null;
	OZ.Event.add(window, "keydown", this._keydown.bind(this));
}

Game.Keyboard.prototype.setPlayer = function(player) {
	this._player = player;
	return this;
}

Game.Keyboard.prototype._keydown = function(e) {
	if (!this._player) { return; }

	switch (e.keyCode) {
		case 37:
			this._player.moveDirection(3);
		break;
		case 39:
			this._player.moveDirection(1);
		break;	
		case 38:
			this._player.moveDirection(0);
		break;
		case 40:
			this._player.moveDirection(2);
		break;
	}
}
