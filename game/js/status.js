Game.Status = OZ.Class();
Game.Status.prototype.init = function() {
	this._dom = {
		container: OZ.DOM.elm("div", {id:"status"}),
		bottom: OZ.DOM.elm("div", {id:"bottom"}),
		portrait: OZ.DOM.elm("div", {id:"portrait"}),
		name: OZ.DOM.elm("div", {id:"name"})
	};
	OZ.DOM.append([this._dom.container, this._dom.portrait, this._dom.name, this._dom.bottom]);
	this._border = new Game.Border(this._dom.portrait);
	
	OZ.Event.add(null, "turn", this._turn.bind(this));
}

Game.Status.prototype.getContainer = function() {
	return this._dom.container;
}

Game.Status.prototype._turn = function(e) {
	this._border.update();
	var player = e.target;
	var type = player.getType();
	var name = player.getName();

	this._dom.portrait.style.backgroundImage = "url(img/player/portrait/" + type + ".png)";
	this._dom.name.innerHTML = name;
}
