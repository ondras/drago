Game.Race = OZ.Class();

Game.Race.createFrom = function(start, firstPlayer) {
	var avail = [];
	for (var i=0;i<GRAPH.length;i++) {
		var node = GRAPH[i];
		if (node.type == "capital" && i != start) { avail.push(i); }
	}
	return new this(start, avail.random(), firstPlayer);
}

Game.Race.fromJSON = function(data) {
	var race = new this(data.start, data.target, data.playerIndex);
	var player = Game.players[data.playerIndex];
	player.startTurn(true);
	return race;
}

Game.Race.prototype.init = function(start, target, firstPlayer) {
	this._start = start;
	this._target = target;
	this._playerIndex = firstPlayer || 0;

	this._event = OZ.Event.add(null, "turn-end", this._turnEnd.bind(this));

	this._computePath(target);
	this.dispatch("race-ready");
}

Game.Race.prototype.toJSON = function() {
	var obj = {
		start: this._start,
		target: this._target,
		playerIndex: this._playerIndex
	};
	return obj;
}

Game.Race.prototype.start = function() {
	this._playerTurn();
}

Game.Race.prototype.stop = function() {
	OZ.Event.remove(this._event);
}

Game.Race.prototype.getStart = function() {
	return this._start;
}

Game.Race.prototype.getTarget = function() {
	return this._target;
}

Game.Race.prototype._turnEnd = function(e) {
	this._playerIndex = (this._playerIndex + 1) % Game.players.length;
	this._playerTurn();
}

Game.Race.prototype._playerTurn = function() {
	var player = Game.players[this._playerIndex];
	player.makeCentered();
	player.startTurn();
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
