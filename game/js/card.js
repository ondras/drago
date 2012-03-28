Game.Card = OZ.Class();
Game.Card.prototype.play = function(owner) {};
Game.Card.prototype.getImage = function() {};
Game.Card.prototype.getPrice = function() {};

Game.Card.Slot = OZ.Class().extend(Game.Card);
Game.Card.Slot.prototype.init = function(count) {
	this._count = count;
}

Game.Card.Slot.prototype.getImage = function() {
	return "slot" + this._count;
}

Game.Card.Slot.prototype.getPrice = function() {
	return this._count * 10000;
}

Game.Card.Slot.prototype.play = function(owner) {
	var cb = function(turns) {
		owner.moveBy(turns);
	}
	Game.Slot["roll" + this._count](cb);
}

Game.Card.Move = OZ.Class().extend(Game.Card);
Game.Card.Move.prototype.init = function(count) {
	this._count = count;
}

Game.Card.Move.prototype.getImage = function() {
	return "move" + this._count;
}

Game.Card.Move.prototype.getPrice = function() {
	return (this._count > 3 ? 15000 : 10000);
}

Game.Card.Move.prototype.play = function(owner) {
	owner.moveBy(this._count);
}
