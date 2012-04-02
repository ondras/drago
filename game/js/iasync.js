Game.IAsync = OZ.Class();
Game.IAsync.prototype.onDone = function(cb) {
	this._cb.done = cb;
	return this;
};
Game.IAsync.prototype.onAbort = function(cb) {
	this._cb.abort = cb;
	return this;
};
