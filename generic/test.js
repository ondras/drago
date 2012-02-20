var file = "europe.st3";
var b = new B(file);
var width = 11;
var canvas = null;

var div = OZ.DOM.elm("div", {backgroundColor:"red", width:"300px", height:"30px"});
document.body.appendChild(div);
OZ.Event.add(div, "mousemove", function(e) {
	width = Math.floor(e.clientX/2);
	go();
});

var go = function() {
	if (canvas) { canvas.parentNode.removeChild(canvas); }
	b.rewind(0);
	div.innerHTML = width;
	var cell = 4;
	var bpp = 4;
	var height = Math.ceil(b.getLength()/(width*bpp));
	canvas = OZ.DOM.elm("canvas", {width:cell*width, height:cell*height});
	document.body.appendChild(canvas);
	var ctx = canvas.getContext("2d");
	
	for (var j=0;j<height;j++) {
	for (var i=0;i<width;i++) {
		var value1 = b.getByte();
		var value2 = b.getByte();
		var value3 = b.getByte();
		var value4 = b.getByte();
		var value = value1;
		
		var color = "rgb(" + [value1,value2,value3].join(",") + ")";
		ctx.fillStyle = color;
		ctx.fillRect(i*cell, j*cell, cell, cell);
	}
	}
}


OZ.Event.add(b, "load", go);
