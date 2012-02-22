var FS = require("fs");

var File = function(name) {
	this._data = [];
	this._index = 0;
	var f = new FS.File(name).open("r");
	this._data = f.read();
	f.close();
}

File.prototype.getLength = function() {
	return this._data.length;
}

File.prototype.getIndex = function() {
	return this._index;
}

File.prototype.hasData = function() {
	return (this._index < this._data.length);
}

File.prototype.rewind = function(index) {
	this._index = index || 0;
}

File.prototype.getByte = function() {
	return this._data[this._index++];
}

File.prototype.getBytes = function(count) {
	var result = 0;
	var pow = 0;
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		result += byte * Math.pow(256, pow++);
	}
	return result;
}

File.prototype.advance = function(offset) {
	this._index += offset;
}

File.prototype.getString = function(count) {
	var str = "";
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		if (byte) { str += String.fromCharCode(byte); }
	}
	return str;
}

exports.File = File;
