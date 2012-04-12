Game.Race = OZ.Class();

Game.Race.createFrom = function(start, firstPlayer) {
	var avail = [];
	for (var i=0;i<GRAPH.length;i++) {
		var node = GRAPH[i];
		if (node.type == "capital" && i != start) { avail.push(i); }
	}
	return new this(avail.random(), firstPlayer);
}

Game.Race.fromJSON = function(data) {
	var race = new this(data.target, data.playerIndex);
	var player = Game.players[data.playerIndex];
	player.dispatch("turn");
	/* FIXME neni nahore */
	player._enableControl(); /* fixme */
	return race;
}

Game.Race.prototype.init = function(target, firstPlayer) {
	this._target = target;
	this._playerIndex = firstPlayer || 0;

	OZ.Event.add(null, "turn-end", this._turnEnd.bind(this));

	this._computePath(target);
	this.dispatch("race-ready");
}

Game.Race.prototype.toJSON = function() {
	var obj = {
		target: this._target,
		playerIndex: this._playerIndex
	};
	return obj;
}

Game.Race.prototype.start = function() {
	this._playerTurn();
}

Game.Race.prototype.getTarget = function(index) {
	return this._target;
}

Game.Race.prototype._turnEnd = function(e) {
	this._playerIndex = (this._playerIndex + 1) % Game.players.length;
	this._playerTurn();
}

Game.Race.prototype._playerTurn = function() {
	var player = Game.players[this._playerIndex];
	player.makeCentered();
	player.turn();
}

/**
 * Compute shortest path to a given index
 */
Game.Race.prototype._computePath = function(index) {
	for (var i=0;i<GRAPH.length;i++) { 
		GRAPH[i].path = null;
		GRAPH[i].distance = Infinity;
	}
	
	var target = GRAPH[index];
	target.distance = 0;
	target.path = [false, false, false, false];
	var TODO = [target];
	
	while (TODO.length) { /* there are nodes remaining */
		var node = TODO.shift(); /* pick first node with neighbors that need to be adjusted */
		var dist = node.distance + 1;

		for (var i=0;i<node.neighbors.length;i++) {
			var neighbor = node.neighbors[i];
			if (neighbor === null) { continue; }
			neighbor = GRAPH[neighbor];
			
			if (neighbor.type == "view") { /* views are not considered in this algorithm; skip them */
				neighbor = GRAPH[neighbor.neighbors[i]];
			}
			
			if (neighbor.distance > dist) { /* we can score better this way */
				neighbor.distance = dist;
				neighbor.path = [false, false, false, false];
				TODO.push(neighbor);
			}
			
			if (neighbor.distance == dist) { /* same score */
				var dir = (i+2) % 4;
				neighbor.path[dir] = true;
				
				var test = GRAPH[neighbor.neighbors[dir]];
				if (test.type == "view") { /* we skipped view; let's update its path */
					test.path = [false, false, false, false];
					test.path[dir] = true;
				}
				
			}
		} /* for all neighbors*/
	}
	
}
