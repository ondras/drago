Game.Slot.Animation = OZ.Class().extend(HAF.AnimatedSprite);
Game.Slot.Animation.prototype.init = function(conf) {
	var largeSize = [conf.size[0], conf.size[1]*conf.frames];
	var image = HAF.Sprite.get(conf.img, largeSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, conf.size, {frames:conf.frames, loop:conf.loop});
	
	this._sprite.position = conf.position;
	Game.engine.addActor(this, Game.LAYER_WIN);
}
Game.Slot.Animation.prototype._stop = function() {
	HAF.AnimatedSprite.prototype._stop.call(this);
	Game.engine.removeActor(this, Game.LAYER_WIN);
}
