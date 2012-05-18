Game.Movement = OZ.Class();
Game.Movement.prototype.init = function() {
	this._size = 40;
	this._dom = {};
	this._player = null;

	this._dom.container = OZ.DOM.elm("div", {position:"absolute"});
	this._dom.center = this._buildPart(this._size, this._size);
	this._dom.container.appendChild(this._dom.center);

	this._dom.dir = [];
	for (var i=0;i<4;i++) {
		var left = 0;
		var top = 0;

		if (i == 0 || i == 2) { left = this._size; }
		if (i == 1) { left = 2*this._size; }
		
		if (i == 1 || i == 3) { top = this._size; }
		if (i == 2) { top = 2*this._size; }
		
		var div = this._buildPart(left, top);
		OZ.DOM.addClass(div, "movement-"+i);
		this._dom.dir.push(div);
		this._dom.container.appendChild(div);
	}

	OZ.Event.add(null, "port-change", this._updatePosition.bind(this));
	OZ.Touch.onActivate(this._dom.container, this._activate.bind(this));
}

/**
 * @param {Game.Player} player Where to show
 * @param {int} index Graph index
 */
Game.Movement.prototype.show = function(player, index) {
	this._player = player;
	Game.engine.getContainer().appendChild(this._dom.container);
	this._updatePosition();
	
	var node = GRAPH[index];
	for (var i=0;i<4;i++) {
		this._dom.dir[i].style.display = (node.neighbors[i] === null ? "none" : "");
		if (node.path) {
			this._dom.dir[i].style.opacity = (node.path[i] ? 1 : 0.5);
		} else {
			this._dom.dir[i].style.opacity = 1;
		}
	}
}
	
Game.Movement.prototype.hide = function() {
	if (!this._player) { return; }
	this._player = null;
	this._dom.container.parentNode.removeChild(this._dom.container);
}

Game.Movement.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var node = OZ.Event.target(e);
	var index = this._dom.dir.indexOf(node);
	var inputTypes = [Game.INPUT_UP, Game.INPUT_RIGHT, Game.INPUT_DOWN, Game.INPUT_LEFT];
	if (index != -1) { 
		this._player.handleInput(inputTypes[index]); 
	} else {
		this._player.handleInput(Game.INPUT_ENTER); 
	}
}
	
Game.Movement.prototype._updatePosition = function() {
	if (!this._player) { return; }
	
	var half = 3*this._size/2;
	var box = this._player.getBox();
	this._dom.container.style.left = (box[0][0] + box[1][0]/2 - half) + "px";
	this._dom.container.style.top = (box[0][1] + box[1][1]/2 - half) + "px";
}
	
Game.Movement.prototype._buildPart = function(left, top) {
	return OZ.DOM.elm("div", {cursor:"pointer", width:this._size+"px", height:this._size+"px", position:"absolute", left:left+"px", top:top+"px", backgroundRepeat:"no-repeat"});
}
