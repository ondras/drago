var B = OZ.Class();

B.prototype.init = function(file) {
	this._data = [];
	this._index = 0;
	OZ.Request(file, this.response.bind(this));
}

B.prototype.getLength = function() {
	return this._data.length;
}

B.prototype.hasData = function() {
	return (this._indx < this._data.length);
}

B.prototype.response = function(data) {
	for (var i=0;i<data.length;i++) { this._data.push(data.charCodeAt(i) & 0xFF); }
	this.rewind(0);
	this.dispatch("load");
}

B.prototype.rewind = function(index) {
	this._index = index || 0;
}

B.prototype.getByte = function() {
	return this._data[this._index++];
}

B.prototype.getBytes = function(count) {
	var result = 0;
	var pow = 0;
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		result += byte * Math.pow(256, pow++);
	}
	return result;
}

B.prototype.advance = function(offset) {
	this._index += offset;
}

B.prototype.getString = function(count) {
	var str = "";
	for (var i=0;i<count;i++) {
		var byte = this.getByte();
		if (byte) { str += String.fromCharCode(byte); }
	}
	return str;
}
