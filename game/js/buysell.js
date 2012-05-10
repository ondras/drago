Game.BuySell = OZ.Class().implement(Game.IAsync).implement(Game.IInputHandler);

Game.BuySell.prototype.init = function() {
	this._cb = {done: null, abort: null};
	this._options = [];
	this._ec = [];
	this._index = -1;
	this._active = false;
	
	this._build();
	
	
	document.body.appendChild(this._node);
	this._center();
	this._ec.push(OZ.Touch.onActivate(this._header, this._activate.bind(this)));
	Game.keyboard.push(this);
}

Game.BuySell.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ESC:
			Game.keyboard.pop();
			while (this._ec.length) { OZ.Event.remove(this._ec.pop()); }
			this._node.parentNode.removeChild(this._node);
			if (this._cb.done) { this._cb.done(); }
		break;
		case Game.INPUT_ENTER:
			if (this._index == 2) {
				this.handleInput(Game.INPUT_ESC);
			} else {
				this._use(this._index);
			}
		break;
		case Game.INPUT_UP:
		case Game.INPUT_LEFT:
			var index = (this._index ? this._index-1 : this._options.length-1);
			this._prepare(index);
		break;
		case Game.INPUT_DOWN:
		case Game.INPUT_RIGHT:
			var index = (this._index+1 < this._options.length ? this._index+1 : 0);
			this._prepare(index);
		break;
		default:
			return false;
		break;
	}
	return true;
}

Game.BuySell.prototype._center = function() {
	var win = OZ.DOM.win(true);
	this._node.style.left = Math.round((win[0]-this._node.offsetWidth)/2) + "px";
	this._node.style.top = Math.round((win[1]-this._node.offsetHeight)/2) + "px";
}

Game.BuySell.prototype._activate = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	if (target.parentNode == this._node) { return; } /* not an option */
	var index = this._options.indexOf(target);
	this._prepare(index);
	
	if (this._index == 2) {
		this.handleInput(Game.INPUT_ESC);
	} else {
		this._use(this._index);
	}
}

Game.BuySell.prototype._build = function() {
	this._node = OZ.DOM.elm("div", {id:"buysell", position:"absolute"});
	
	this._header = OZ.DOM.elm("div", {className:"header"});
	this._body = OZ.DOM.elm("div", {className:"body"});
	this._footer = OZ.DOM.elm("div", {className:"footer"});
	
	OZ.DOM.append([this._node, this._header, this._body, this._footer]);
	
	var options = ["Buy", "Sell", "Return"];
	for (var i=0;i<options.length;i++) {
		var elm = OZ.DOM.elm("span", {innerHTML:options[i]});
		
		if (i == 0) {
			elm.style.styleFloat = "left";
			elm.style.cssFloat = "left";
		}

		if (i == 2) {
			elm.style.styleFloat = "right";
			elm.style.cssFloat = "right";
		}
		
		this._header.appendChild(elm);
		this._options.push(elm);
	}
}

/* partially select an option */
Game.BuySell.prototype._prepare = function(index) {
	OZ.Audio.play("plop");
	if (this._index != -1) { 
		this._clear(this._index); 
		OZ.DOM.removeClass(this._node, "active");
	}
	
	this._index = index;
	this._active = false;
	
	for (var i=0;i<this._options.length;i++) {
		var elm = this._options[i];
		OZ.DOM.removeClass(elm, "active");
		OZ.DOM.removeClass(elm, "disabled");
		if (i == index) {
			OZ.DOM.addClass(elm, "prepared");
		} else {
			OZ.DOM.removeClass(elm, "prepared");
		}
	}
}

/* clear a previously prepared option */
Game.BuySell.prototype._clear = function(index) {}

/* use an option (non-return) */
Game.BuySell.prototype._use = function(index) {
	OZ.Audio.play("plop");
	OZ.DOM.addClass(this._node, "active");
	for (var i=0;i<this._options.length;i++) {
		var elm = this._options[i];
		OZ.DOM.removeClass(elm, "prepared");
		if (i == index) {
			OZ.DOM.addClass(elm, "active");
		} else {
			OZ.DOM.removeClass(elm, "active");
		}
	}
	
	Game.keyboard.pop(); /* we no longer listen */
}
