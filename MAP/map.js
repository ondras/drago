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
	this._data1 = [];
	this._data2 = [];
	
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
	
	this._canvas = OZ.DOM.elm("canvas");
	this._ctx = this._canvas.getContext("2d");
	document.body.appendChild(this._canvas);
	
}

Drago.prototype._load = function() {
	this._remain--;
	if (this._remain) { return; }

	var r = OZ.Request("EUROPE.MAP", this._response.bind(this));
}

Drago.prototype._response = function(data) {
	var input = [];
	for (var i=0;i<data.length;i++) { input.push(data.charCodeAt(i) & 0xFF); }

	var size = 256;
	var bpc = 2;
	var half = size*size*bpc;
	
	var N = size;
	var px = 16;
	this._canvas.width = px * N;
	this._canvas.height = px * N;
	
	for (var i=0;i<N;i++) {
		this._data1.push([]);
		this._data2.push([]);
		for (var j=0;j<N;j++) {
			var obj1 = {};
			var obj2 = {};
			this._data1[i].push(obj1);
			this._data2[i].push(obj2);
			var offset = (j * size + i) * bpc;
			this._draw(input, i, j, offset, obj1);
			this._draw(input, i, j, offset + half, obj2);
			
			
/*
			var div1 = this._div(input, i, j, offset);
			var div2 = this._div(input, i, j, offset + half);
			document.body.appendChild(div1);
			document.body.appendChild(div2);
*/
		}
	}	
	
	this._debug = OZ.DOM.elm("div", {position:"fixed", top:"0px", right:"0px", fontFamily:"monospace", backgroundColor:"white", border:"1px solid black", padding:"5px"});
	this._cursor = OZ.DOM.elm("div", {position:"absolute", width:"16px", height:"16px", border:"2px solid red"});
	document.body.appendChild(this._debug);
	document.body.appendChild(this._cursor);
	
	OZ.Event.add(document.body, "mousemove", this._move.bind(this));
}

Drago.prototype._draw = function(input, x, y, offset, obj) {
	var byte1 = input[offset];
	var byte2 = input[offset+1];
	var px = 16;
	var index = byte1 + 256*(byte2 & 0xF);
	
	obj.byte1 = byte1;
	obj.byte2 = byte2;

	if (byte2 & 128) { 
//		console.log("bit 128", x, y); 
		var tmp = OZ.DOM.elm("div", {position:"absolute", border:"2px solid black", left:(16*x-2)+"px", top:(16*y-2)+"px", width:"16px", height:"16px"});
		document.body.appendChild(tmp);
	}
	if (byte2 & 32) { 
		debugger;
		console.log("bit 32", x, y); 
		var tmp = OZ.DOM.elm("div", {position:"absolute", border:"2px solid #3f3", left:(16*x-2)+"px", top:(16*y-2)+"px", width:"16px", height:"16px"});
		document.body.appendChild(tmp);
	}
	if (byte2 & 16) { 
		//console.log("bit 16", x, y); 
		var tmp = OZ.DOM.elm("div", {position:"absolute", border:"2px solid #ff3", left:(16*x-1)+"px", top:(16*y-1)+"px", width:"16px", height:"16px"});
		document.body.appendChild(tmp);
	}

	var cellsPerImage = 192;
	var image = this._images[Math.floor(index / cellsPerImage)];
	
	var imageOffset = index % cellsPerImage;
	
	this._ctx.save();
	if (input[offset+1] & 64) { 
		this._ctx.translate((2*x + 1)*px, 0);
		this._ctx.scale(-1, 1); 
	}
	
	this._ctx.drawImage(image, 0, imageOffset*px, px, px, x*px, y*px, px, px);
	this._ctx.restore();
}

Drago.prototype._div = function(input, x, y, offset) {
	var px = 16;
	var div = OZ.DOM.elm("div", {width:px+"px",height:px+"px",position:"absolute",backgroundRepeat:"no-repeat",fontSize:"80%",color:"yellow"});
	div.id = x+"_"+y;
	div.style.left = (x*px) + "px";
	div.style.top = (y*px) + "px";
	var index = input[offset] + 256*(input[offset+1] & 0xF);
	
	if (x == 9 && (y == 2 || y == 3)) { console.log(x, y, input[offset], input[offset+1]); }

	if (input[offset+1] & 128) { console.log("bit 128", div); }
	if (input[offset+1] & 32) { console.log("bit 32", div); }
	if (input[offset+1] & 16) { console.log("bit 16", div); }
	
	if (input[offset+1] & 64) { div.style.MozTransform = "scaleX(-1)"; }

	this._background(div, index);

	return div;
}

Drago.prototype._background = function(elm, index) {
	var px = 16;
	var cellsPerImage = 192;
	
	var image = Math.floor(index / cellsPerImage) + "";
	dir = "1";
	
	if (image.length < 2) { image = "0" + image; }
	image = dir + "/PART00" + image + ".gif";
	elm.style.backgroundImage = "url(" + image + ")";
	
	var imageOffset = index % cellsPerImage;
	elm.style.backgroundPosition = "0px -" + (imageOffset*px) + "px";
}

Drago.prototype._move = function(e) {
	var pos = OZ.DOM.scroll();
	pos[0] += e.clientX;
	pos[1] += e.clientY;
	pos[0] = Math.floor(pos[0]/16);
	pos[1] = Math.floor(pos[1]/16);
	
	this._cursor.style.left = (16*pos[0]-2) + "px";
	this._cursor.style.top = (16*pos[1]-2) + "px";
	
	var obj1 = this._data1[pos[0]][pos[1]];
	var obj2 = this._data2[pos[0]][pos[1]];
	
	var str = "Pos: " + pos + "<br/>";
	str += "Layer 1: " + obj1.byte1.toString(2).lpad(8) + " " + obj1.byte2.toString(2).lpad(8) + "<br/>";
	str += "Layer 2: " + obj2.byte1.toString(2).lpad(8) + " " + obj2.byte2.toString(2).lpad(8) + "<br/>";
	this._debug.innerHTML = str;
	
	var cellsPerImage = 192;

	var index = obj1.byte1 + 256*(obj1.byte2 & 0xF);
	var image = this._images[Math.floor(index / cellsPerImage)];
	var imageOffset = index % cellsPerImage;
	var canvas = OZ.DOM.elm("canvas", {width:16, height:16});
	canvas.getContext("2d").drawImage(image, 0, imageOffset*16, 16, 16, 0, 0, 16, 16);
	var br = this._debug.getElementsByTagName("br")[1];
	br.parentNode.insertBefore(canvas, br);

	var index = obj2.byte1 + 256*(obj2.byte2 & 0xF);
	var image = this._images[Math.floor(index / cellsPerImage)];
	var imageOffset = index % cellsPerImage;
	var canvas = OZ.DOM.elm("canvas", {width:16, height:16});
	canvas.getContext("2d").drawImage(image, 0, imageOffset*16, 16, 16, 0, 0, 16, 16);
	var br = this._debug.getElementsByTagName("br")[2];
	br.parentNode.insertBefore(canvas, br);
}
