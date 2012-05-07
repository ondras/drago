Game.Overview = OZ.Class().implement(Game.IInputHandler).implement(Game.IAsync)
Game.Overview.prototype.init = function(player) {
	this._cb = {done:null, abort:null};

	var size = 688;
	this._scale = size/256;
	this._node = OZ.DOM.elm("div", {position:"absolute", width:size+"px", height:size+"px", padding:"8px"});
	var img = OZ.DOM.elm("img", {src:"img/map.png"});
	
	this._canvas = OZ.DOM.elm("canvas", {position:"absolute", left:"8px", top:"8px", width:size, height:size});

	this._node.appendChild(img);
	this._node.appendChild(this._canvas);
	
	document.body.appendChild(this._node);
	
	var win = OZ.DOM.win(true);
	this._node.style.left = Math.round((win[0]-this._node.offsetWidth)/2) + "px";
	this._node.style.top = Math.round((win[1]-this._node.offsetHeight)/2) + "px";

	new Game.Border(this._node);
	this._event = OZ.Touch.onActivate(this._node, this._activate.bind(this));
	Game.keyboard.push(this);
	
	this._draw(player);
}

Game.Overview.prototype.handleInput = function(type, param) {
	switch (type) {
		case Game.INPUT_ENTER:
		case Game.INPUT_ESC:
			this._close();
		break;
		default:
			return false;
		break;
	}
	
	return true;
}

Game.Overview.prototype._activate = function(e) {
	OZ.Event.stop(e);
	this._close();
}

Game.Overview.prototype._draw = function(player) {
	this._drawPath(player);
	this._drawStartEnd();
	this._drawPlayers(player);
}

Game.Overview.prototype._drawPath = function(player) {
	var ctx = this._canvas.getContext("2d");
	ctx.strokeStyle = "red";
	ctx.lineWidth = 2;
	ctx.lineCap = "square";
	
	var node = GRAPH[player.getIndex()];
	var todo = [node];
	ctx.beginPath();
	while (todo.length) {
		var newTodo = [];
		while (todo.length) {
			var node = todo.pop();
			if (!node.path) { continue; }
			
			for (var i=0;i<node.path.length;i++) {
				if (!node.path[i]) { continue; }
				var target = GRAPH[node.neighbors[i]];
				
				/* draw segment node->target */
				ctx.moveTo(1+Math.round(this._scale*node.x),   1+Math.round(this._scale*node.y));
				ctx.lineTo(1+Math.round(this._scale*target.x), 1+Math.round(this._scale*target.y));
				
				newTodo.push(target);
			}
		}
		todo = newTodo;
	}
	
	ctx.stroke();
}

Game.Overview.prototype._drawStartEnd = function() {
	var indexes = [Game.race.getStart(), Game.race.getTarget()];
	var colors = ["green", "blue"];
	var ctx = this._canvas.getContext("2d");
	ctx.strokeStyle = "red";
	
	var r = 5;
	
	for (var i=0;i<indexes.length;i++) {
		var node = GRAPH[indexes[i]];
		ctx.fillStyle = colors[i];
		
		var x = 1 + Math.round(node.x * this._scale);
		var y = 1 + Math.round(node.y * this._scale);
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.arc(x, y, r, 0, 2*Math.PI, true);
		ctx.fill();
		ctx.stroke();
	}
	
}

Game.Overview.prototype._drawPlayers = function(player) {
	for (var i=0;i<Game.players.length;i++) {
		var p = Game.players[i];
		if (p == player) { continue; }
		this._drawPlayer(p);
	}
	this._drawPlayer(player);
}

Game.Overview.prototype._drawPlayer = function(player) {
	var node = GRAPH[player.getIndex()];
	var img = OZ.DOM.elm("img", {position:"absolute", src:"img/player/mini/" + player.getType() + ".png"});
	img.style.left = (8 + 1 + Math.round(node.x * this._scale)) + "px";
	img.style.top = (8 + 1 + Math.round(node.y * this._scale)) + "px";
	this._node.appendChild(img);
}

Game.Overview.prototype._close = function() {
	Game.keyboard.pop();
	this._node.parentNode.removeChild(this._node);
	OZ.Event.remove(this._event);
	if (this._cb.done) { this._cb.done(); }
}
