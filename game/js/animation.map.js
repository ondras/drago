Game.Animation.Map = OZ.Class().extend(Game.Animation);

Game.Animation.Map.prototype.init = function(game, position, image, conf) {
	var options = {
		layer: conf.transparent ? Game.LAYER_TOP : Game.LAYER_BG,
		size: conf.size
	}
	Game.Animation.prototype.init.call(this, game, position, image, options);
	
	this._conf = conf;
	this._animation.frames = conf.frames.length;
}
