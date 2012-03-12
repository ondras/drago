Game.Movement = OZ.Class();
Game.Movement.prototype.init = function() {
	this._size = 48;
	this._dom = {};
	this._position = null,

	this._dom.container = OZ.DOM.elm("div", {position:"absolute"});
	this._dom.center = this._buildPart(this._size, this._size);
	this._dom.container.appendChild(this._dom.center);

	this._dom.dir = [];
	for (var i=0;i<4;i++) {
		var left = 0;
		var top = 0;
		var bg = ["50%", "50%"];

		if (i == 0 || i == 2) { left = this._size; }
		if (i == 1) { 
			left = 2*this._size; 
			bg[0] = "0%";
		}
		if (i == 3) {
			bg[0] = "100%";
		}
		
		if (i == 1 || i == 3) { top = this._size; }
		if (i == 2) { 
			top = 2*this._size; 
			bg[1] = "0%";
		}
		if (i == 0) { bg[1] = "100%";	}
		
		var div = this._buildPart(left, top);
		div.style.backgroundImage = "url(img/movement/" + i + ".png)";
		div.style.backgroundPosition = bg.join(" ");
		this._dom.dir.push(div);
		this._dom.container.appendChild(div);
	}

	OZ.Event.add(null, "port-change", this._updatePosition.bind(this));
}

Game.Movement.prototype.show = function(index) {
	Game.engine.getContainer().appendChild(this._dom.container);

	var tile = 16;
	var node = GRAPH[index];
	this._position = [
		tile * node.x + tile/2,
		tile * node.y + 2 - 24
	];
	this._updatePosition();
	
	for (var i=0;i<4;i++) {
		this._dom.dir[i].style.display = (node.neighbors[i] === null ? "none" : "");
		if (node.path) {
			this._dom.dir[i].style.opacity = (node.path[i] ? 1 : 0.5);
		}
	}
}
	
Game.Movement.prototype.hide = function() {
	this._position = null;
	this._dom.container.parentNode.removeChild(this._dom.container);
}
	
Game.Movement.prototype._updatePosition = function() {
	if (!this._position) { return; }
	var offset = Game.port.getOffset();
	var half = 3*this._size/2;
	
	this._dom.container.style.left = (this._position[0] - offset[0] - half) + "px";
	this._dom.container.style.top = (this._position[1] - offset[1] - half) + "px";
}
	
Game.Movement.prototype._buildPart = function(left, top) {
	return OZ.DOM.elm("div", {cursor:"pointer", width:this._size+"px", height:this._size+"px", position:"absolute", left:left+"px", top:top+"px", backgroundRepeat:"no-repeat"});
}
