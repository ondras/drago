Game.Port = OZ.Class();

Game.Port.prototype.init = function(node) {
	this._node = node;
	
	this._node = OZ.DOM.elm("div", {position:"relative", left:"30px", top:"30px", width:"500px", height:"500px"});
	document.body.appendChild(this._node);
		
	this._offset = [0, 0];
	this._size = [];
	
	this._node.appendChild(Game.engine.getContainer());
	Game.Border.create(this._node);
	
	this._resize();
	this._mouse = {
		ec: [],
		pos: []
	}
	
	OZ.Event.add(window, "resize", this._resize.bind(this));

	OZ.Touch.onStart(this._node, this._touchStart.bind(this));
}

Game.Port.prototype.getOffset = function() {
	return this._offset;
}

Game.Port.prototype.getSize = function() {
	return this._size;
}

Game.Port.prototype.setOffset = function(offset) {
	var bgSize = Game.background.getSize();
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
	Game.engine.setSize(this._size);
}

Game.Port.prototype._touchStart = function(e) {
	this._mouse.pos = OZ.Touch.pos(e);
	this._mouse.ec.push(OZ.Touch.onMove(this._node, this._touchMove.bind(this)));
	this._mouse.ec.push(OZ.Touch.onEnd(document, this._touchEnd.bind(this)));
	this._node.style.cursor = "move";
}

Game.Port.prototype._touchMove = function(e) {
	OZ.Event.prevent(e);
	var bgSize = Game.background.getSize();
	var mouse = OZ.Touch.pos(e);

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

Game.Port.prototype._touchEnd = function() {
	this._node.style.cursor = "move";
	while (this._mouse.ec.length) { OZ.Event.remove(this._mouse.ec.pop()); }
}
