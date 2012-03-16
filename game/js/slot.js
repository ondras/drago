Game.Slot = OZ.Class().extend(HAF.Actor);

Game.Slot.roll1 = function(callback) {
	var conf = {
		size: [256, 265],
		bg: "img/slot/bg1.png",
		score: [144, 210],
		counters: [
		]
	};
	new this(callback, conf);
}

Game.Slot.prototype.init = function(callback, conf) {
	this._callback = callback;
	this._conf = conf;
	this._score = 66;
	this._bg = HAF.Sprite.get(conf.bg, conf.size, 0, true);

	this._digitSize = [22, 32];
	this._digits = HAF.Sprite.get("img/slot/digits.png", [this._digitSize[0], 10*this._digitSize[1]], 0, true);

	var layer = Game.engine.addLayer(Game.LAYER_SLOT, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_ALL}); /* fixme position */
	Game.engine.addActor(this, Game.LAYER_SLOT);
	
	var hand = new Game.Slot.Hand();
	this._event = OZ.Event.add(hand, "start", this._handStart.bind(this));
}

Game.Slot.prototype.tick = function(dt) {
	return true;
}

Game.Slot.prototype.draw = function(ctx) {
	ctx.drawImage(this._bg, 0, 0);
	
	var digits = [Math.floor(this._score/10), this._score % 10];
	var x = this._conf.score[0];
	var y = this._conf.score[1];

	for (var i=0;i<2;i++) {
		
		ctx.drawImage(
			this._digits,
			0, digits[i]*this._digitSize[1], this._digitSize[0], this._digitSize[1],
			x, y, this._digitSize[0], this._digitSize[1]
		);
		
		x += this._digitSize[0];
	}
}

Game.Slot.prototype._handStart = function(e) {
	OZ.Event.remove(this._event);
	OZ.Audio.play("slot");
}

Game.Slot.Hand = OZ.Class().extend(HAF.AnimatedSprite);
Game.Slot.Hand.prototype.init = function() {
	var frames = 19;
	var size = [76, 144];
	var spriteSize = [size[0], size[1]*frames];

	this._image = HAF.Sprite.get("img/slot/hand.png", spriteSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, this._image, size, frames);
	this._sprite.position = [size[0]/2 + 22, size[1]/2 + 112];

	Game.engine.addActor(this, Game.LAYER_SLOT);
}

Game.Slot.Hand.prototype.tick = function(dt) {
	var oldFrame = this._animation.frame;
	var changed = HAF.AnimatedSprite.prototype.tick.call(this, dt);
	
	var limitFrame = 9;
	if (this._animation.frame >= limitFrame && oldFrame < limitFrame) { this.dispatch("start"); }
	
	var frame = Math.floor(this._animation.time * this._animation.fps / 1000);
	if (frame >= this._animation.frames) {
		changed = true;
		this._animation.frame = 0;
		Game.engine.removeActor(this, Game.LAYER_SLOT);
	}
	
	return changed;
}

Game.Slot.Hand.prototype._getSourceImagePosition = function() {
	return [0, this._animation.frame];
}
