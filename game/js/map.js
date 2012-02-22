Game.Map = OZ.Class();

Game.Map.prototype.init = function() {
	this._data = [];
	OZ.Request("map/EUROPE.MAP", this._response.bind(this));
}

Game.Map.prototype.getSize = function() {
	return [this._data.length, this._data[0].length];
}

Game.Map.prototype.getData = function() {
	return this._data;
}

Game.Map.prototype._response = function(data) {
	var input = [];
	for (var i=0;i<data.length;i++) { input.push(data.charCodeAt(i) & 0xFF); }

	var bpt = 2;
	var N = 256;
	var offsets = [0, N*N*bpt];
	
	for (var i=0;i<N;i++) {
		this._data.push([]);
		for (var j=0;j<N;j++) {
			var obj = {
				images: [],
				top: [],
				mirror: [],
				locked: []
			};
			this._data[i].push(obj);
			
			for (var k=0;k<offsets.length;k++) {
				var offset = (j * N + i) * bpt + offsets[k];
				var byte1 = input[offset];
				var byte2 = input[offset+1];
				var image = byte1 + 256*(byte2 & 0xF);
				obj.images.push(image);
				obj.top.push(1 * !!(byte2 & 0x80));
				obj.mirror.push(1 * !!(byte2 & 0x40));
				obj.locked.push(1 * !!(byte2 & 0x10));
			}
		}
	}
	
	this.dispatch("load");
}
