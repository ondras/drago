Game.Animation.Map = OZ.Class().extend(Game.Animation);

Game.Animation.Map.prototype.init = function(game, position, image, conf) {
	var options = {
		layer: conf.transparent ? Game.LAYER_TOP : Game.LAYER_BG,
		size: conf.size
	}
	Game.Animation.prototype.init.call(this, game, position, image, options);
	
	this._conf = conf;
	this._animation.frames = conf.frames.length;
	this._animation.fps = 1000 / (25 * conf.delay);
	this._animation.wait = conf.wait;
	this._animation.random = conf.random;

	this._wait();
}
