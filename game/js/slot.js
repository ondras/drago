Game.Slot = OZ.Class().extend(HAF.Actor).implement(Game.IInputHandler).implement(Game.IAsync);

Game.Slot.roll1 = function() {
	var conf = {
		size: [256, 265],
		bg: "img/slot/bg1.png",
		score: [144, 210],
		counters: [
			[150, 146]
		],
		animations: []
	};
	return new this(conf);
}

Game.Slot.roll2 = function() {
	var conf = {
		size: [320, 265],
		bg: "img/slot/bg2.png",
		score: [168, 204],
		counters: [
			[108, 204],
			[240, 204]
		],
		animations: []
	};
	return new this(conf);
}

Game.Slot.roll3 = function() {
	var conf = {
		size: [384, 265],
		bg: "img/slot/bg3.png",
		score: [192, 208],
		counters: [
			[122, 178],
			[198, 162],
			[274, 178]
		],
		animations: [
			{
				img: "img/slot/slot3anim1.png",
				size: [192, 32],
				position: [194, 146],
				frames: 12,
				loop: false
			}
		]
	};
	return new this(conf);
}

Game.Slot.roll4 = function() {
	var conf = {
		size: [384, 265],
		bg: "img/slot/bg4.png",
		score: [220, 212],
		counters: [
			[166, 212],
			[200, 160],
			[252, 160],
			[286, 212]
		],
		animations: [
			{
				img: "img/slot/slot4anim1.png",
				size: [192, 48],
				position: [238, 130],
				frames: 3,
				loop: true
			}
		]
	};
	return new this(conf);
}

Game.Slot.roll5 = function() {
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
		],
		animations: [
			{
				img: "img/slot/slot5anim1.png",
				size: [72, 56],
				position: [158, 110],
				frames: 3,
				loop: true
			}, {
				img: "img/slot/slot5anim2.png",
				size: [96, 56],
				position: [304, 84],
				frames: 6,
				loop: true
			}, {
				img: "img/slot/slot5anim3.png",
				size: [72, 64],
				position: [134, 224],
				frames: 6,
				loop: true
			}
		]
	};
	return new this(conf);
}

Game.Slot.prototype.init = function(conf) {
	this._cb = {done:null, abort:null};
	this._conf = conf;

	this._audio = null;
	this._score = 0;
	this._scores = [];
	this._blur = null;
	this._bg = HAF.Sprite.get(conf.bg, conf.size, 0, true);
	this._counters = [];
	this._animations = [];
	this._phase = 0; /* 0 start, 1 running, 2 done */

	this._digitSize = [32, 32];
	this._digits = HAF.Sprite.get("img/slot/digits.png", [this._digitSize[0], 6*this._digitSize[1]], 0, true);

	this._digitSizeBig = [22, 32];
	this._digitsBig = HAF.Sprite.get("img/slot/digits-big.png", [this._digitSizeBig[0], 10*this._digitSizeBig[1]], 0, true);

	var layer = Game.engine.getLayer(Game.LAYER_WIN);
	layer.style.top = "0px";
	layer.style.left = (Game.port.getSize()[0] - conf.size[0])/2 + "px";
	Game.engine.setSize(conf.size, Game.LAYER_WIN);
	Game.engine.addActor(this, Game.LAYER_WIN);
	
	Game.keyboard.push(this);
	this._eventActivate = OZ.Touch.onActivate(layer, this._activate.bind(this));
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
			this._digitsBig,
			0, digits[i]*this._digitSizeBig[1], this._digitSizeBig[0], this._digitSizeBig[1],
			x, y, this._digitSizeBig[0], this._digitSizeBig[1]
		);
		
		x += this._digitSizeBig[0];
	}
	
	for (var i=0;i<this._counters.length;i++) {
		var pos = this._counters[i];
		var score = this._scores[i];
		
		ctx.drawImage(
			this._digits,
			0, (score-1)*this._digitSize[1], this._digitSize[0], this._digitSize[1],
			pos[0], pos[1], this._digitSize[0], this._digitSize[1]
		);
	}
}

Game.Slot.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ENTER:
			if (this._phase == 0) { 
				var hand = new Game.Slot.Hand();
				this._event = OZ.Event.add(hand, "start", this._handStart.bind(this));
			}
			if (this._phase == 2) { this._finish(); }
		break;
		case Game.INPUT_ESC:
			if (this._cb.abort && (this._phase == 0 || this._phase == 2)) { this._finish(); }
		break;
		default:
			return false;
		break;
	}
	return true;
}

Game.Slot.prototype._activate = function(e) {
	OZ.Event.stop(e);
	this.handleInput(Game.INPUT_ENTER);
}

Game.Slot.prototype._handStart = function(e) {
	OZ.Event.remove(this._event);
	setTimeout(this._stop.bind(this), 1500);

	this._phase = 1;
	this._audio = OZ.Audio.play("slot");
	this._blur = new Game.Slot.Blur(this._conf.counters);
	
	for (var i=0;i<this._conf.animations.length;i++) {
		var anim = this._conf.animations[i];
		var inst = new Game.Slot.Animation(anim);
		if (anim.loop) { this._animations.push(inst); }
	}
}

Game.Slot.prototype._stop = function() {
	OZ.Audio.play("slot-stop");
	var counter = this._conf.counters.shift();
	var score = Math.floor(Math.random()*6) + 1;
	this._score += score;
	
	this._counters.push(counter);
	this._scores.push(score);
	
	if (this._conf.counters.length) {
		setTimeout(this._stop.bind(this), 500);
	} else {
		Game.engine.removeActor(this._blur, Game.LAYER_WIN);
		if (this._audio) { this._audio.pause(); }
		while (this._animations.length) {
			Game.engine.removeActor(this._animations.pop(), Game.LAYER_WIN);
		}
		this._phase = 2;
	}
}

Game.Slot.prototype._finish = function() {
	Game.keyboard.pop();
	Game.engine.removeActor(this, Game.LAYER_WIN);
	Game.engine.setSize([0, 0], Game.LAYER_WIN);
	
	OZ.Event.remove(this._eventActivate);
	
	var cb = (this._phase == 0 ? this._cb.abort : this._cb.done);
	if (cb) { cb(this._score); }
}
