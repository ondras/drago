Game.Port = OZ.Class();

Game.Port.prototype.init = function(game, node) {
	this._game = game;
	this._node = node;
	
	this._node = OZ.DOM.elm("div", {position:"relative", left:"30px", top:"30px", width:"500px", height:"500px"});
	document.body.appendChild(this._node);
		
	this._offset = [0, 0];
	this._size = [];
	
	var engine = game.getEngine();
	this._node.appendChild(engine.getContainer());
	Game.Border.create(this._node);
	
	this._resize();
	this._mouse = {
		ec: [],
		pos: []
	}
	
	OZ.Event.add(window, "resize", this._resize.bind(this));
	OZ.Event.add(this._node, "mousedown", this._mousedown.bind(this));
}

Game.Port.prototype.getOffset = function() {
	return this._offset;
}

Game.Port.prototype.getSize = function() {
	return this._size;
}

Game.Port.prototype.setOffset = function(offset) {
	var bgSize = this._game.getBackground().getSize();
	for (var i=0;i<2;i++) {
		var o = offset[i];
		o = Math.max(o, 0);
		o = Math.min(o, bgSize[i]-this._size[i]);
		this._offset[i] = o;
	}
	this.dispatch("port-change");
}
 
Game.Port.prototype._resize = function() {
	this._size = [this._node.clientWidth, this._node.clientHeight];
	this.dispatch("port-change");
	this._game.getEngine().setSize(this._size);
}

Game.Port.prototype._mousedown = function(e) {
	this._mouse.pos = [e.clientX, e.clientY];
	this._mouse.ec.push(OZ.Event.add(this._node, "mousemove", this._mousemove.bind(this)));
	this._mouse.ec.push(OZ.Event.add(document, "mouseup", this._mouseup.bind(this)));
	this._node.style.cursor = "move";
}

Game.Port.prototype._mousemove = function(e) {
	var bgSize = this._game.getBackground().getSize();
	var mouse = [e.clientX, e.clientY];

	var changed = false;
	for (var i=0;i<2;i++) {
		var o = this._offset[i] + (this._mouse.pos[i] - mouse[i]);
		o = Math.max(o, 0);
		o = Math.min(o, bgSize[i]-this._size[i]);
		if (o != this._offset[i]) {
			this._mouse.pos[i] = mouse[i];
			this._offset[i] = o;
			changed = true;
		}
	}
	
	if (changed) { this.setOffset(this._offset); }
	
}

Game.Port.prototype._mouseup = function() {
	this._node.style.cursor = "move";
	while (this._mouse.ec.length) { OZ.Event.remove(this._mouse.ec.pop()); }
}
