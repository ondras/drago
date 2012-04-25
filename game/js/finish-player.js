Game.Finish.Player = OZ.Class().extend(HAF.AnimatedSprite);
Game.Finish.Player.prototype.init = function(player, def) {
	var path = "img/finish/players/" + player.getType() + ".png";
	var size = [def.size[0], def.size[1]*def.frames];
	var image = HAF.Sprite.get(path, size, 0, true);
	HAF.AnimatedSprite.prototype.init.call(this, image, def.size, {frames:def.frames, fps:8});
}

Game.Finish.Player.prototype.setPosition = function(pos) {
	this._precisePosition = [pos[0], pos[1]];
	HAF.AnimatedSprite.prototype.setPosition.call(this, pos);
}

Game.Finish.Player.prototype.tick = function(dt) {
	HAF.AnimatedSprite.prototype.tick.call(this, dt);
	if (this._precisePosition[0] < 50) { return true; }
	
	this._precisePosition[0] -= 60 * dt / 1000;
	this._sprite.position[0] = Math.round(this._precisePosition[0]);

	return true;
}
