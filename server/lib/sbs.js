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

var FS = require("fs");
var File = require("./file");
var GD = require("gd");

var SBS = function(file, transparentByte) {
	this._data = new File.File(file);
	this._records = [];
	this._palette = [];
	this._transparent = transparentByte || 0;
	
	var palName = module.id.split("/");
	palName.pop();
	palName.push("palette");
	palName = palName.join("/");
	var p = new FS.File(palName).open("r");
	var data = p.read();
	for (var i=0;i<256;i++) {
		var r = data[4*i+2] & 0xFF;
		var g = data[4*i+1] & 0xFF;
		var b = data[4*i+0] & 0xFF;
		this._palette.push([r, g, b]);
	}
	
	this._data.rewind(6);
	
	var count = this._data.getBytes(2);
	this._data.advance(12);
	
	for (var i=0;i<count;i++) {
		var str = this._data.getString(10);
		var offset = this._data.getBytes(4);
		var record = new Record(this._data, this._palette, str, offset, this._transparent);
		this._records.push(record);
	}
	
	for (var i=0;i<this._records.length;i++) {
		this._records[i].parse();
	}
}

SBS.prototype.getRecords = function() {
	return this._records;
}

var Record = function(data, palette, name, offset, transparent) {
	this._data = data;
	this._name = name;
	this._image = null;
	this._offset = offset;
	this._palette = palette;
	this._transparent = transparent;
}

Record.prototype.getName = function() {
	return this._name;
}

Record.prototype.getImage = function() {
	return this._image;
}

Record.prototype.parse = function() {
	this._data.rewind(this._offset);
	var width = this._data.getBytes(2);
	var height = this._data.getBytes(2);
	var tmp = this._data.getBytes(4);
	var cell = 1;
	
	this._image = new GD.Image(GD.Image.TRUECOLOR, width, height);
	
	this._image.alphaBlending(false);
	this._image.saveAlpha(true);
	var empty = this._image.colorAllocateAlpha(0, 0, 0, 127);
	this._image.fill(0, 0, empty);	

	var colors = [];
	for (var i=0;i<this._palette.length;i++) {
		var item = this._palette[i];
		var color = this._image.colorAllocate(item[0], item[1], item[2]);
		colors.push(color);
	}
	
	var padding = (4-(width%4)) % 4;
	
	var transparent = this._
	for (var j=0;j<height;j++) {
		for (var i=0;i<width;i++) {
			var byte = this._data.getByte();
			/* 0 = transparent */
			
			if (byte == this._transparent) { continue; }
			
			this._image.setPixel(i, height-j-1, colors[byte]);
			
		}
		var tmp = this._data.getBytes(padding);
	}
	
}

exports.SBS = SBS;
exports.Record = Record;
