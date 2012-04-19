Game.Slot.Blur = OZ.Class().extend(HAF.AnimatedSprite);
Game.Slot.Blur.prototype.init = function(positions) {
	this._positions = positions;

	var frames = 4;
	var size = [32, 32];
	var spriteSize = [size[0], size[1]*frames];

	var image = HAF.Sprite.get("img/slot/blur.png", spriteSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, size, {frames:frames});

	Game.engine.addActor(this, Game.LAYER_WIN);
}

Game.Slot.Blur.prototype.draw = function(ctx) {
	for (var i=0;i<this._positions.length;i++) {
		var pos = this._positions[i];
		ctx.drawImage(
			this._sprite.image, 
			0, this._sprite.size[1]*this._animation.frame, this._sprite.size[0], this._sprite.size[1], 
			pos[0], pos[1], this._sprite.size[0], this._sprite.size[1]
		);
		
	}
}
