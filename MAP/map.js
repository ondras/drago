/*
Mapa ma 256x256 (65536) dlazdic. V souboru je mapa dvakrat za sebou (dve vrstvy).
Kazda dlazdice ma 2 byty - soubor ma tedy 2*2*256*256 bytu.

Analyza 2 bytu dlazdice:

  0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  ---------------         ------- 8 + 4 bity => 12ti bitove cislo (low endian) urcujici poradi obrazku dlazdice v souborech 
                  -               nejvyssi bit druheho bajtu = vykresluje se PRES hrace
                    -             druhy nejvyssi bit druheho bajtu = zrcadleni dle svisle osy
                      -           treti nejvyssi bit druheho bajtu = vzdy 0
                        -         ctvrty nejvyssi bit druheho bajtu = uzel ve vychodni casti, tj. za hranici

Normalni dlazdice jsou v prvnich 14 souborech. Posledni 4 soubory (a 6 poslednich dlazdic z 14. souboru) 
jsou jednotlive kroky animaci.

Poucne bude prozkoumat majak (zapadni cip Francie), jehoz animace je jasne videt na zacatku 15. souboru. 
Dale prvni animace vubec (oblast 3x2 dlazdice) je typek na Sicilii.

Overlay "ryba" ma cislo 0x85 0x0B, tj. 16. soubor a 69. obrazek. Tam zacina cela jeji animace.
*/

String.prototype.lpad = function(l) {
	var s = this;
	while (s.length < l) { s = "0"+s; }
	return s;
}

var Drago = OZ.Class();

Drago.prototype.init = function() {
	this._images = [];
	this._remain = 0;
	this._data = [];
	
	for (var i=0;i<18;i++) { 
		this._remain++;
		var name = i + "";
		if (name.length < 2) { name = "0"+name; }
		name = "1/PART00" + name + ".gif";
		var img = OZ.DOM.elm("img");
		OZ.Event.add(img, "load", this._load.bind(this));
		this._images.push(img); 
		img.src = name;
	}
}

Drago.prototype._load = function() {
	this._remain--;
	if (this._remain) { return; }

	OZ.Request("EUROPE.MAP", this._response.bind(this));
}

Drago.prototype._response = function(data) {
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
	
	this._canvas = OZ.DOM.elm("canvas");
	this._ctx = this._canvas.getContext("2d");
	this._draw();
	document.body.appendChild(this._canvas);
	
	this._debug = OZ.DOM.elm("div", {position:"fixed", top:"0px", right:"0px", fontFamily:"monospace", backgroundColor:"white", border:"1px solid black", padding:"5px"});
	this._cursor = OZ.DOM.elm("div", {position:"absolute", width:"16px", height:"16px", border:"2px solid red"});
	document.body.appendChild(this._debug);
	document.body.appendChild(this._cursor);
	
	OZ.Event.add(document.body, "mousemove", this._move.bind(this));
	
	
	/*
	for (var i=0;i<GRAPH.length;i++) {
		var node = GRAPH[i];
		var x = 16*node.x;
		var y = 16*node.y;
		
		if (node.locked) {
			this._ctx.fillStyle = "yellow";
		} else {
			this._ctx.fillStyle = "green";
		}
		
		this._ctx.fillRect(x, y, 16, 16);
	}
	*/
	
	for (var i=0;i<this._data.length;i++) {
		for (var j=0;j<this._data[i].length;j++) {
			var obj = this._data[i][j];
			if (obj.images[0] in ANIMATIONS) {
				this._ctx.fillStyle = "red";
				this._ctx.fillRect(i*16, j*16, 8, 8);
			}
			if (obj.images[1] in ANIMATIONS) {
				this._ctx.fillStyle = "black";
				this._ctx.fillRect(i*16+8, j*16+8, 8, 8);
			}
		}
	}
	
}

Drago.prototype._draw = function() {
	var cellsPerImage = 192;
	var px = 16;

	this._canvas.width = this._data.length * px;
	this._canvas.height = this._data[0].length * px;
	for (var i=0;i<this._data.length;i++) {
		for (var j=0;j<this._data[i].length;j++) {
			var obj = this._data[i][j];
			for (var k=0;k<obj.images.length;k++) {
				var index = obj.images[k];
				if (index == 31) { continue; }
				var image = this._images[Math.floor(index / cellsPerImage)];
				var imageOffset = index % cellsPerImage;
				this._ctx.save();
				if (obj.mirror[k]) { 
					this._ctx.translate((2*i + 1)*px, 0);
					this._ctx.scale(-1, 1); 
				}
				this._ctx.drawImage(image, 0, imageOffset*px, px, px, i*px, j*px, px, px);
				this._ctx.restore();
			}
		}
	}

}

Drago.prototype._move = function(e) {
	var pos = OZ.DOM.scroll();
	pos[0] += e.clientX;
	pos[1] += e.clientY;
	pos[0] = Math.floor(pos[0]/16);
	pos[1] = Math.floor(pos[1]/16);
	
	this._cursor.style.left = (16*pos[0]-2) + "px";
	this._cursor.style.top = (16*pos[1]-2) + "px";
	
	var cellsPerImage = 192;
	this._debug.innerHTML = "Pos: " + pos + "<br/>";

	var obj = this._data[pos[0]][pos[1]];
	for (var i=0;i<obj.images.length;i++) {
		var index = obj.images[i];
		this._debug.appendChild(OZ.DOM.text(index.toString().lpad(4)));

		var image = this._images[Math.floor(index / cellsPerImage)];
		var imageOffset = index % cellsPerImage;
		var canvas = OZ.DOM.elm("canvas", {width:16, height:16});
		canvas.getContext("2d").drawImage(image, 0, imageOffset*16, 16, 16, 0, 0, 16, 16);

		this._debug.appendChild(canvas);
		this._debug.appendChild(OZ.DOM.elm("br"));
	}
}
