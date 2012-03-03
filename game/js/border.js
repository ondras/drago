Game.Border = {
	create: function(elm) {
		var size = 8;
		var name = "B";
		for (var i=1;i<9;i++) {
			var div = OZ.DOM.elm("div", {position:"absolute", backgroundImage:"url(img/border/"+name+i+".png)"});
			
			if (i == 2 || i == 7) { 
				div.style.width = "100%"; 
			} else {
				div.style.width = size + "px";
			} 
			
			if (i == 4 || i == 5) { 
				div.style.height = "100%"; 
			} else {
				div.style.height = size + "px";
			} 
			
			if (i == 1 || i == 4 || i == 6) {
				div.style.left = (-size) + "px";
			} else if (i == 3 || i == 5 || i == 8) {
				div.style.right = (-size) + "px";
			} else {
				div.style.left = "0px";
			}

			if (i == 1 || i == 2 || i == 3) {
				div.style.top = (-size) + "px";
			} else if (i == 6 || i == 7 || i == 8) {
				div.style.bottom = (-size) + "px";
			} else {
				div.style.top = "0px";
			}

			elm.appendChild(div);
		}
	}
}
