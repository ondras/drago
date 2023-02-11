/*
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

var File = require("./file");
var FS = require("fs");

var TR = {
	"Lissabon": "Lisbon",
	"Algier": "Algiers",
	"Brüssel": "Brussels",
	"Luxemburg": "Luxembourg",
	"Rom": "Rome",
	"Kopenhagen": "Copenhagen",
	"Prag": "Prague",
	"Wien": "Vienna",
	"Pressburg": "Bratislava",
	"Belgrad": "Belgrade",
	"Warschau": "Warsaw",
	"Athen": "Athens",
	"Bukarest": "Bucharest",
	"Kischinjow": "Kishinev",
	"Kiew": "Kiev",
	"Moskau": "Moscow",
	"Nikosia": "Nicosia"
};

var CP850 = {};
var data = new FS.File("CP850.TXT").open("r").read().toString("ascii").split("\n");
for (var i=0;i<data.length;i++) {
	var line = data[i];
	if (line.charAt(0) == "#") { continue; }
	var parts = line.split(/\s+/);
	var num1 = parseInt(parts[0]);
	var num2 = parseInt(parts[1]);
	CP850[num1] = num2;
}


var Graph = function(file) {
	this._file = new File.File(file);
	this._nodes = [];
	
	var minOffset = Infinity;
	while (this._file.getIndex() < minOffset) {
		var node = new Node(this._file, this._nodes.length);
		var nodeOffset = node.getOffset();
		if (nodeOffset) { minOffset = Math.min(minOffset, nodeOffset); }
		this._nodes.push(node);
	}
}

Graph.prototype.getNodes = function() {
	return this._nodes;
}

var Node = function(data, index) {
	this._x = data.getByte();
	this._y = data.getByte();
	this._neighbors = [];
	for (var i=0;i<4;i++) {
		var neighbor = data.getBytes(2);
		this._neighbors.push(neighbor == 0xFFFF ? null : neighbor);
	}
	
	this._type = Node.types[data.getBytes(2)];
	
	this._offset = data.getBytes(2);
	this._name = "";
	this._nameData = [];
	
	var altitude = data.getByte();
	this._locked = 1 * !!data.getByte();
	
	this._air = 1 * !!(altitude & 0x10);
	this._flight = [];
	for (var i=0;i<4;i++) {
		var dir = 1 * !!(altitude & (1 << i));
		this._flight.push(dir);
	}
	
	
	if (this._offset && this._type != "purple") {
		var index = data.getIndex();
		data.rewind(this._offset);
		
		for (var i=0;i<14;i++) {
			var byte = data.getByte();
			if (byte) { this._name += String.fromCharCode(CP850[byte]); }
		}
		
		if (this._name in TR) { this._name = TR[this._name]; }
		
		var count = data.getBytes(2);
		for (var i=0;i<count;i++) {
			this._nameData.push(data.getBytes(2));
		}

		data.rewind(index);
	}
}

Node.types = ["wtf", "blue", "red", "yellow", "city", "purple", "capital"];

Node.prototype.getOffset = function() {
	return this._offset;
}

Node.prototype.toJSON = function() {
	return {
		x: this._x, 
		y: this._y,
		air: this._air,
		neighbors: this._neighbors,
		flight: this._flight,
		type: this._type,
		name: this._name,
		nameData: this._nameData,
		locked: this._locked
	}
}

exports.Graph = Graph;
