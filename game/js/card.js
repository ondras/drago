Game.Card = OZ.Class();
Game.Card.prototype.play = function(owner) {};
Game.Card.prototype.getImage = function() {};

Game.Card.Slot = OZ.Class().extend(Game.Card);
Game.Card.Slot.prototype.init = function(count) {
	this._count = count;
}

Game.Card.Slot.prototype.getImage = function() {
	return "slot" + this._count;
}

Game.Card.Slot.prototype.play = function(owner) {
	var cb = function(turns) {
		owner.moveBy(turns);
	}
	Game.Slot["roll" + this._count](cb);
}
