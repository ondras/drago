Game.Slot.Hand = OZ.Class().extend(HAF.AnimatedSprite);
Game.Slot.Hand.prototype.init = function() {
	var frames = 19;
	var size = [76, 144];
	var spriteSize = [size[0], size[1]*frames];

	var image = HAF.Sprite.get("img/slot/hand.png", spriteSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, size, {frames:frames, loop:false, fps:14});
	this._sprite.position = [size[0]/2 + 22, size[1]/2 + 112];

	Game.engine.addActor(this, Game.LAYER_WIN);
}
Game.Slot.Hand.prototype.tick = function(dt) {
	var oldFrame = this._animation.frame;
	var changed = HAF.AnimatedSprite.prototype.tick.call(this, dt);
	
	var limitFrame = 10;
	if (this._animation.frame >= limitFrame && oldFrame < limitFrame) { this.dispatch("start"); }
	
	return changed;
}
Game.Slot.Hand.prototype._stop = function() {
	HAF.AnimatedSprite.prototype._stop.call(this);
	Game.engine.removeActor(this, Game.LAYER_WIN);
}
