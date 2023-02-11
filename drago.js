/*

The map has 256x256 (65536) tiles. The file contains the map twice in a row (two layers).
Each tile has 2 bytes - so the file has 2*2*256*256 bytes.

Analysis of 2 flat tiles:

  0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  ---------------         ------- 8 + 4 bit => 12-bit number (low endian) determining the order of the tile image in the files 
                  -               highest bit of the second byte = something, animation?
                    -             second highest byte of the second byte = mirroring along the vertical axis
                      -           third most significant bit of the second byte = ?
                        -         fourth most significant bit of the second byte = ?

Normal tiles are in the first 14 files. Last 4 files (and last 6 tiles from 14th file)
are the individual steps of the animation.

It is interesting that the 15th, 16th and 18th files (all animations) are not different in directories 1/ and 3/ (they are duplicates),
while the 17th file (animation) is somehow (FIXME) different in 1/ and 3/.

It will be instructive to examine the lighthouse (western chip of France), whose animation can be clearly seen at the beginning of the 15th file.
Also the very first animation (3x2 tile area) is a type in Sicily.

Other files:
 * .TOW - about the real estate inventory
 * .STR - neighborhood graph, at the end of the city name + something
 * .PIT - almost all zeros
 * .OIT - almost an animation, but relatively little data and points to a low file
 * .IND - interesting structure, size 256x256 flat - would you like a map?
 * .EIT - little dense data
 * .EDT - full of German chains
 * .CVC - 1024 bytes (32x32?), filled with the pattern 256,256,256,0
 * .CAR - strange names; cities but also Fuckopolis
 * .C88 - ?
 * .001 - ?



Analysis of a row of a .STR file (graph has 700 nodes)

05 05 FF FF  08 00 01 00  FF FF 01 00  00 00 00 00 - blue top left, record #0
05 0B 00 00  09 00 02 00  FF FF 01 00  00 00 04 00 - blue under previous entry #1; I have a car-plane down
0A 0B FF FF  FF FF 0A 00  01 00 01 00  00 00 00 00 - blue to the right of the previous one, entry #9
0A 0F 09 00  12 00 FF FF  FF FF 01 00  00 00 00 00 - blue under the previous one, entry #10
0A 05 FF FF  10 00 FF FF  00 00 02 00  00 00 00 00 - red ones to the right of the first one, record #8
20 0B FF FF  55 00 FF FF  24 00 02 00  00 00 1A 00 - red to the right of the previous one; left and right plane
0F 0B 10 00  24 00 12 00  FF FF 05 00  DC 2B 00 00 - purples over a city in Iceland, entry #17
15 0B 23 00  3E 00 FF FF  11 00 03 00  00 00 02 00 - yellow to right of purple, entry #36 (0x24); I have a car-plane on the right
0F 0F 11 00  FF FF 13 00  0A 00 06 00  DC 2B 04 00 - city in Iceland, record #18 (0x12); I have a car-plane down
0F 14 12 00  28 00 FF FF  FF FF 02 00  00 00 13 00 - red under Iceland; ma plane up and to the right
19 14 FF FF  3F 00 29 00  13 00 02 00  00 00 1E 00 - red to the right of the previous one; ma plane left, right and down

X  Y  UP     RIGHT DOWN   LEFT  TYPE   O1 O2 PP QQ - O1+O2 offset within the file on city info, PP transport type. medium, QQ?

TYPE:
  01 blue
  02 red
  03 golden
  04
  05 purple
  06 city

PP (MEANS OF TRANSPORTATION):
02: 0000 0010 right car-plane
04: 0000 0100 car-plane down
13: 0001 0011 up plane-car, right plane
1A: 0001 1010 left plane, right plane
1E: 0001 1110 left plane, right plane, down plane
            | fly up
           | fly right
          | fly down
         | fly left
       | on the ground (0), in the air (1)
      | always 0
     | always 0 
    | always 0

QQ: only values 00 and 40 
*/


var Drago = OZ.Class();

Drago.prototype.init = function() {
	this._images = [];
	this._remain = 0;
	
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
		for (var j=0;j<N;j++) {
			var offset = (j * size + i) * bpc;
			this._draw(input, i, j, offset);
			this._draw(input, i, j, offset + half);
/*
			var div1 = this._div(input, i, j, offset);
			var div2 = this._div(input, i, j, offset + half);
			document.body.appendChild(div1);
			document.body.appendChild(div2);
*/
		}
	}	
}

Drago.prototype._draw = function(input, x, y, offset) {
	var px = 16;
	var index = input[offset] + 256*(input[offset+1] & 0xF);

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
