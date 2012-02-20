String.prototype.lpad = function(l) {
	var s = this;
	while (s.length < l) { s = "0"+s; }
	return s;
}

var Drago = OZ.Class();

Drago.prototype.init = function() {
	this._cell = 2;
	this._size = [128, 128];
	this._palette = [];
	
	this._ctxs = [];
	for (var i=0;i<4;i++) {
		var canvas = OZ.DOM.elm("canvas", {width:this._size[0]*this._cell, height:this._size[1]*this._cell});
		this._ctxs.push(canvas.getContext("2d"));
		document.body.appendChild(canvas);
	}
	OZ.Request("palette", this._responsePalette.bind(this));
}

Drago.prototype._responsePalette = function(data) {
	var cell = 4;
	var canvas = OZ.DOM.elm("canvas", {width:16*cell, height:16*cell});
	document.body.appendChild(canvas);
	var ctx = canvas.getContext("2d");
	
	
	for (var i=0;i<256;i++) {
		var r = data.charCodeAt(4*i+2) & 0xFF;
		var g = data.charCodeAt(4*i+1) & 0xFF;
		var b = data.charCodeAt(4*i+0) & 0xFF;
		var rr = r.toString(16).lpad(2);
		var gg = g.toString(16).lpad(2);
		var bb = b.toString(16).lpad(2);
		this._palette.push(rr+gg+bb);
		
		var x = i % 16;
		var y = Math.floor(i / 16);
		ctx.fillStyle = "#" + rr +gg +bb;
		ctx.fillRect(x*cell, y*cell, cell, cell);
	}

	var r = OZ.Request("EUROPE.IND", this._response.bind(this));
}	

Drago.prototype._response = function(data) {
	var input = [];
	for (var i=0;i<data.length;i++) { input.push(data.charCodeAt(i) & 0xFF); }

	var index = 0*32768;
	for (var i=0;i<this._size[0];i++) {
		for (var j=0;j<this._size[1];j++) {
			var b1 = input[index];
			var b2 = input[index+1];
			var b3 = input[index+32768];
			var b4 = input[index+32768+1];
			/*
			b1=255-b1;
			b2=255-b2;
			b3=255-b3;
			b4=255-b4;
			*/
			
			var color = "rgb(" + b1 + "," + b1 + "," + b1 + ")";
			color = "#" + this._palette[b1];
			this._ctxs[0].fillStyle = color;
			this._ctxs[0].fillRect(this._cell*j, this._cell*i, this._cell, this._cell);
			
			var color = "rgb(" + b2 + "," + b2 + "," + b2 + ")";
			color = "#" + this._palette[b2];
			this._ctxs[1].fillStyle = color;
			this._ctxs[1].fillRect(this._cell*j, this._cell*i, this._cell, this._cell);

			var color = "rgb(" + b3 + "," + b3 + "," + b3 + ")";
			color = "#" + this._palette[b3];
			this._ctxs[2].fillStyle = color;
			this._ctxs[2].fillRect(this._cell*j, this._cell*i, this._cell, this._cell);

			var color = "rgb(" + b4 + "," + b4 + "," + b4 + ")";
			color = "#" + this._palette[b4];
			this._ctxs[3].fillStyle = color;
			this._ctxs[3].fillRect(this._cell*j, this._cell*i, this._cell, this._cell);

			index += 2;
		}
	}	
	
}
