Game.Race = OZ.Class();

Game.Race.createFrom = function(start) {
}

Game.Race.prototype.init = function(target) {
	this._target = target;
	this._computePath(target);
	this.dispatch("race-ready");
}

Game.Race.prototype.getTarget = function(index) {
	return this._target;
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
	var TODO = [target];
	
	while (TODO.length) { /* there are nodes remaining */
		var node = TODO.shift(); /* pick first node with neighbors that need to be adjusted */
		var dist = node.distance + 1;

		for (var i=0;i<node.neighbors.length;i++) {
			var neighbor = node.neighbors[i];
			if (neighbor === null) { continue; }
			neighbor = GRAPH[neighbor];
			
			if (neighbor.distance > dist) { /* we can score better this way */
				neighbor.distance = dist;
				neighbor.path = [false, false, false, false];
				TODO.push(neighbor);
			}
			
			if (neighbor.distance == dist) { /* same score */
				var dir = (i+2) % 4;
				neighbor.path[dir] = true;
			}
		} /* for all neighbors*/
	}
	
}
