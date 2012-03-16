Game.Slot = OZ.Class().extend(HAF.Actor);

Game.Slot.roll1 = function(callback) {
	var conf = {
		size: [256, 265],
		bg: "img/slot/bg1.png",
		score: [144, 210],
		counters: [
			[150, 146]
		]
	};
	new this(callback, conf);
}

Game.Slot.roll2 = function(callback) {
	var conf = {
		size: [320, 265],
		bg: "img/slot/bg2.png",
		score: [168, 204],
		counters: [
			[108, 204],
			[240, 204]
		]
	};
	new this(callback, conf);
}

Game.Slot.roll3 = function(callback) {
	var conf = {
		size: [384, 265],
		bg: "img/slot/bg3.png",
		score: [192, 208],
		counters: [
			[122, 178],
			[198, 162],
			[274, 178]
		]
	};
	new this(callback, conf);
}

Game.Slot.roll4 = function(callback) {
	var conf = {
		size: [384, 265],
		bg: "img/slot/bg4.png",
		score: [220, 212],
		counters: [
			[166, 212],
			[200, 160],
			[252, 160],
			[286, 212]
		]
	};
	new this(callback, conf);
}

Game.Slot.roll5 = function(callback) {
	var conf = {
		size: [384, 265],
		bg: "img/slot/bg5.png",
		score: [216, 164],
		counters: [
			[174, 154],
			[222, 118],
			[270, 154],
			[246, 204],
			[196, 204]
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
	this._digits = HAF.Sprite.get("img/slot/digits-big.png", [this._digitSize[0], 10*this._digitSize[1]], 0, true);

	var layer = Game.engine.addLayer(Game.LAYER_SLOT, {clear:HAF.CLEAR_NONE, dirty:HAF.DIRTY_ALL}); /* fixme position */
	Game.engine.addActor(this, Game.LAYER_SLOT);
	
	var blur = new Game.Slot.Blur(this._conf.counters);
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

	var image = HAF.Sprite.get("img/slot/hand.png", spriteSize, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, size, frames);
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

Game.Slot.Blur = OZ.Class().extend(HAF.AnimatedSprite);
Game.Slot.Blur.prototype.init = function(positions) {
	this._positions = positions;

	var frames = 4;
	var size = [32, 32];
	var spriteSize = [size[0], size[1]*frames];

	var image = HAF.Sprite.get("img/slot/blur.png", spriteSize, 0, true);
//	var image = HAF.Sprite.get("img/slot/digits.png", [32, 192], 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, size, frames);

	Game.engine.addActor(this, Game.LAYER_SLOT);
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
