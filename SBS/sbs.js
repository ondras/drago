/*

Struktura SBS:

hlavicka (6B)
pocet zaznamu (1-2B?)
sracky (12B)

Xkrat:
nazev zaznamu (10B)
offset k datum (4B)

Xkrat:
sirka (2B)
vyska (2B)
cosi (4B)
data; u kazdeho radku padding na nasobek 4



*/

String.prototype.lpad = function(l) {
	var s = this;
	while (s.length < l) { s = "0"+s; }
	return s;
}

var SBS = OZ.Class();

SBS.prototype.init = function() {
	this._data = [];
	this._index = 0;
	this._records = [];
	this._palette = [];

	OZ.Request("palette", this.responsePalette.bind(this));
}

SBS.prototype.responsePalette = function(data) {
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

	OZ.Request("data/1_ASSORT.SBS", this.response.bind(this));
}

SBS.prototype.response = function(data) {
	for (var i=0;i<data.length;i++) { this._data.push(data.charCodeAt(i) & 0xFF); }
	this.rewind(6);
	
	var count = this.getBytes(2);
	this.advance(12);
	
	for (var i=0;i<count;i++) {
		var str = this.getString(10);
		var offset = this.getBytes(4);
		var record = new SBS.Record(this, this._palette, str, offset);
		this._records.push(record);
	}
	
	for (var i=0;i<this._records.length;i++) {
		this._records[i].parse();
	}

}

SBS.prototype.rewind = function(index) {
	this._index = index || 0;
}

SBS.prototype.getByte = function() {
	return this._data[this._index++];
}

SBS.prototype.getBytes = function(count) {
	var result = 0;
	var pow = 0;
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		result += byte * Math.pow(256, pow++);
	}
	return result;
}

SBS.prototype.advance = function(offset) {
	this._index += offset;
}

SBS.prototype.getString = function(count) {
	var str = "";
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		if (byte) { str += String.fromCharCode(byte); }
	}
	return str;
}

SBS.Record = function(data, palette, name, offset) {
	this._data = data;
	this._name = name;
	this._offset = offset;
	this._palette = palette;

	this._div = OZ.DOM.elm("div", {innerHTML:name + " " + offset + "<br/>"});
	document.body.appendChild(this._div);
	document.body.appendChild(OZ.DOM.elm("hr"));
}

SBS.Record.prototype.parse = function() {
	this._data.rewind(this._offset);
	var width = this._data.getBytes(2);
	var height = this._data.getBytes(2);
	var tmp = this._data.getBytes(4);
	var cell = 1;
	
	var canvas = OZ.DOM.elm("canvas", {width:cell*width, height:cell*height});
	this._div.appendChild(canvas);
	
	var ctx = canvas.getContext("2d");
	var padding = (4-(width%4)) % 4;
	
	var stats = {};
	var min = Infinity;
	var max = -Infinity;
	
	var paddings = [];

	for (var j=0;j<height;j++) {
		for (var i=0;i<width;i++) {
			var byte = this._data.getByte();
			/* 0 = transparent */
			
			if (!byte) { continue; }
			
			if (!(byte in stats)) { stats[byte] = 0; }
			stats[byte]++;
			min = Math.min(min, byte);
			max = Math.max(max, byte);

			ctx.fillStyle = "#" + this._palette[byte];
			ctx.fillRect(i*cell, (height-j-1)*cell, cell, cell);
			
		}
		var tmp = this._data.getBytes(padding);
		paddings.push(tmp);
	}
	
//	console.log(this._name, paddings);
/*	
	this._div.appendChild(OZ.DOM.elm("br"));
	this._div.appendChild(OZ.DOM.text("MAX: " + max + ", MIN: " + min));
	this._div.appendChild(OZ.DOM.elm("br"));
	this._div.appendChild(OZ.DOM.text(JSON.stringify(stats)));
	*/
}

