Game.Border = OZ.Class();
Game.Border.prototype.init = function(node, name, size) {
	this._node = node;
	this._parts = [];
	this._size = size || 8;
	var name = name || "B";
	
	for (var i=1;i<9;i++) {
		var div = OZ.DOM.elm("div", {position:"absolute", backgroundImage:"url(img/border/"+name+i+".png)"});
		
		if (i == 2 || i == 7) { 
		} else {
			div.style.width = this._size + "px";
		} 
		
		if (i == 4 || i == 5) { 
		} else {
			div.style.height = this._size + "px";
		} 
		
		if (i == 1 || i == 4 || i == 6) {
			div.style.left = "0px";
		} else if (i == 3 || i == 5 || i == 8) {
			div.style.right = "0px";
		} else {
			div.style.left = this._size + "px";
		}

		if (i == 1 || i == 2 || i == 3) {
			div.style.top = "0px";
		} else if (i == 6 || i == 7 || i == 8) {
			div.style.bottom = "0px";
		} else {
			div.style.top = this._size + "px";
		}

		this._node.appendChild(div);
		this._parts.push(div);
	}
	
	this.update();
}

Game.Border.prototype.update = function() {
	var width = this._node.clientWidth;
	var height = this._node.clientHeight;
	
	width -= 2*this._size;
	height -= 2*this._size;
	this._parts[1].style.width = width + "px";
	this._parts[6].style.width = width + "px";

	this._parts[3].style.height = height + "px";
	this._parts[4].style.height = height + "px";
}
