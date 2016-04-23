/*

Mapa ma 256x256 (65536) dlazdic. V souboru je mapa dvakrat za sebou (dve vrstvy).
Kazda dlazdice ma 2 byty - soubor ma tedy 2*2*256*256 bytu.

Analyza 2 bytu dlazdice:

  0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
  ---------------         ------- 8 + 4 bity => 12ti bitove cislo (low endian) urcujici poradi obrazku dlazdice v souborech 
                  -               nejvyssi bit druheho bajtu = cosi, animace?
                    -             druhy nejvyssi bit druheho bajtu = zrcadleni dle svisle osy
                      -           treti nejvyssi bit druheho bajtu = ?
                        -         ctvrty nejvyssi bit druheho bajtu = ?

Normalni dlazdice jsou v prvnich 14 souborech. Posledni 4 soubory (a 6 poslednich dlazdic z 14. souboru) 
jsou jednotlive kroky animaci.

Zajimave je, ze 15., 16. a 18. soubor (vse animace) se v adresarich 1/ a 3/ nelisi (jsou duplicitni), 
zatimco 17. soubor (animace) se v 1/ a 3/ nejak (FIXME) lisi.

Poucne bude prozkoumat majak (zapadni cip Francie), jehoz animace je jasne videt na zacatku 15. souboru. 
Dale prvni animace vubec (oblast 3x2 dlazdice) je typek na Sicilii.

Dalsi soubory:
 * .TOW - asi soupis nemovitosti
 * .STR - graf sousednosti, na konci nazvy mest + cosi
 * .PIT - skoro same nuly
 * .OIT - skoro animace, ale pomerne malo dat a ukazuje do nizkych souboru
 * .IND - zajimava struktura, velikost 256x256 bytu - ze by nahledova mapka?
 * .EIT - malo hustych dat
 * .EDT - plno nemeckych retezcu
 * .CVC - 1024 bajtu (32x32?), plnene vzorem 256,256,256,0
 * .CAR - divne nazvy; mesta ale i Fuckopolis
 * .C88 - ?
 * .001 - ?



Analyza radku souboru .STR (graf ma 700 uzlu)

05 05 FF FF  08 00 01 00  FF FF 01 00  00 00 00 00 - modry vlevo nahore, zaznam #0
05 0B 00 00  09 00 02 00  FF FF 01 00  00 00 04 00 - modry pod predchozim, zaznam #1; ma dolu auto-letadlo
0A 0B FF FF  FF FF 0A 00  01 00 01 00  00 00 00 00 - modry vpravo od predchoziho, zaznam #9
0A 0F 09 00  12 00 FF FF  FF FF 01 00  00 00 00 00 - modry pod predchozim, zaznam #10
0A 05 FF FF  10 00 FF FF  00 00 02 00  00 00 00 00 - cerveny vpravo od prvniho, zaznam #8
20 0B FF FF  55 00 FF FF  24 00 02 00  00 00 1A 00 - cerveny vpravo od predchoziho; doleva i doprava letadlo
0F 0B 10 00  24 00 12 00  FF FF 05 00  DC 2B 00 00 - fialovy nad mestem na islandu, zaznam #17
15 0B 23 00  3E 00 FF FF  11 00 03 00  00 00 02 00 - zluty vpravo od fialoveho, zaznam #36 (0x24); ma vpravo auto-letadlo
0F 0F 11 00  FF FF 13 00  0A 00 06 00  DC 2B 04 00 - mesto na islandu, zaznam #18 (0x12); ma dolu auto-letadlo
0F 14 12 00  28 00 FF FF  FF FF 02 00  00 00 13 00 - cervena pod islandem; ma letadlo nahoru a doprava
19 14 FF FF  3F 00 29 00  13 00 02 00  00 00 1E 00 - cervena vpravo od predchozi; ma letadlo doleva, doprava a dolu

X  Y  UP     RIGHT DOWN   LEFT  TYPE   O1 O2 PP QQ - O1+O2 offset v ramci souboru na info o meste, PP typ dopr. prostredku, QQ?

TYPE:
  01 modry
  02 cerveny
  03 zluty
  04
  05 fialovy
  06 mesto

PP (DOPRAVNI PROSTREDKY):
02: 0000 0010 vpravo auto-letadlo
04: 0000 0100 dolu auto-letadlo
13: 0001 0011 nahoru letadlo-auto, doprava letadlo
1A: 0001 1010 doleva letadlo, doprava letadlo
1E: 0001 1110 doleva letadlo, doprava letadlo, dolu letadlo
            | nahoru letet
           | vpravo letet
          | dolu letet
         | vlevo letet
       | na zemi (0), ve vzduchu (1)
      | vzdy 0
     | vzdy 0 
    | vzdy 0

QQ: pouze hodnoty 00 a 40 
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
