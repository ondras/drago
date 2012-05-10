Game.Player = OZ.Class().extend(Game.Animation).implement(Game.IInputHandler);
Game.Player.FLIGHT_OFFSET = -24;

Game.Player.fromJSON = function(data) {
	var result = new this(data.type, data.name);

	result._orientation = data.orientation;
	result._moves = data.moves;
	result._path = data.path;

	result.setIndex(data.index);
	result.setMoney(data.money);
	for (var i=0;i<data.cards.length;i++) {
		result.addCard(Game.cards[data.cards[i]]);
	}
	
	return result;	
}

Game.Player.prototype.init = function(type, name) {
	this._index = null;
	this._type = type;
	this._name = name;

	this._flight = false;
	this._orientation = 1;
	this._moves = 0;
	this._money = 30000;
	this._path = [];
	this._cards = [];
	this._speed = 10; /* tiles per second */
	this._velocity = [
		[ 0, -1],
		[ 1,  0],
		[ 0,  1],
		[-1,  0]
	];

	this._tile = [0, 0];

	this._target = {
		index: null,
		tile: null,
		distanceTotal: 0,		/* constant distance from current index to target index */
		distanceRemaining: 0,	/* remaining distance; <= distanceTotal */
		source: null
	}
	
	var o = {
		layer: Game.LAYER_PLAYERS,
		size: [3, 2]
	}
	var spriteSize = [
		Game.TILE * o.size[0] * 8,
		Game.TILE * o.size[1] * 4
	];
	var image = HAF.Sprite.get("img/player/" + type + ".png", spriteSize, 0, true);
	Game.Animation.prototype.init.call(this, [0, 0], image, o);

	this._animation.frames = 4;
}

Game.Player.prototype.toJSON = function() {
	var obj = {
		type: this._type,
		name: this._name,
		orientation: this._orientation,
		index: this._index,
		money: this._money,
		moves: this._moves,
		path: this._path,
		cards: []
	};
	
	for (var i=0;i<this._cards.length;i++) {
		var card = this._cards[i];
		var index = Game.cards.indexOf(card);
		obj.cards.push(index);
	}
	
	return obj;
}

Game.Player.prototype.getCards = function() {
	return this._cards;
}

Game.Player.prototype.addCard = function(card) {
	this._cards.push(card);
	this.dispatch("player-change");
	return this;
}

Game.Player.prototype.removeCard = function(card) {
	var index = this._cards.indexOf(card);
	this._cards.splice(index, 1);
	this.dispatch("player-change");
	return this;
}

Game.Player.prototype.setMoney = function(money) {
	this._money = money;
	this.dispatch("player-change");
	return this;
}

Game.Player.prototype.getMoney = function() {
	return this._money;
}

Game.Player.prototype.getType = function() {
	return this._type;
}

Game.Player.prototype.getName = function() {
	return this._name;
}

Game.Player.prototype.getMoves = function() {
	return this._moves;
}

Game.Player.prototype.setIndex = function(index) {
	this._index = index;
	
	var node = GRAPH[this._index];
	this._flight = node.air;
	this._tile = [node.x, node.y];
	
	this._updateImage();
	this._computePosition();
	return this;
}

Game.Player.prototype.getIndex = function() {
	return this._index;
}

Game.Player.prototype.handleInput = function(type, param) {
	if (this._moves || this._path.length > 1) { /* already moving */
		switch (type) {
			case Game.INPUT_LEFT: this._moveDirection(3); break;
			case Game.INPUT_RIGHT: this._moveDirection(1); break;	
			case Game.INPUT_UP: this._moveDirection(0); break;
			case Game.INPUT_DOWN: this._moveDirection(2); break;
			case Game.INPUT_ENTER:
				if (GRAPH[this._index].type == "view") {
					this._disableControl();
					Game.Info.showView(this._index).onDone(this._enableControl.bind(this));
				} else if (this._moves == 0) {
					this._disableControl();
					this._decideTurn();
				}
			break;
			default:
				return false;
			break;
		}
		return true;
	}
	
	switch (type) { /* turn start */
		case Game.INPUT_ENTER:
		case Game.INPUT_ESC:
		case Game.INPUT_LEFT:
		case Game.INPUT_RIGHT:
		case Game.INPUT_UP:
		case Game.INPUT_DOWN:
			this._disableControl();
			new Game.Menu.Player(this)
				.onAbort(this._enableControl.bind(this));
		break;
		default:
			return false;
		break;
	}
	return true;
}

Game.Player.prototype.makeVisible = function() {
	var offsetChanged = false;
	var port = Game.port;
	var size = port.getSize();
	for (var i=0;i<2;i++) {
		var portPosition = this._sprite.position[i] - this._offset[i];
		var limit = Math.round(size[i]/6);

		if (portPosition < limit) {
			offsetChanged = true;
			this._offset[i] -= limit - portPosition;
		} else if (portPosition > size[i]-limit) {
			offsetChanged = true;
			this._offset[i] += portPosition - (size[i]-limit);
		}
	}
	if (offsetChanged) { port.setOffset(this._offset); }
}

Game.Player.prototype.makeCentered = function() {
	var portSize = Game.port.getSize();
	var offset = [];
	for (var i=0;i<2;i++) {
		offset.push(this._sprite.position[i] + this._sprite.size[i]/2 - portSize[i]/2);
	}
	Game.port.setOffset(offset);
}

/**
 * @param {bool} noResetPath Do not reset path; used only when turn started after game load
 */
Game.Player.prototype.turn = function(noResetPath) {
	/* add to top */
	Game.engine.removeActor(this, Game.LAYER_PLAYERS);
	Game.engine.addActor(this, Game.LAYER_PLAYERS);
	
	if (!noResetPath) { this._path = [this._index]; }

	this._enableControl();
	this.dispatch("turn");
}

Game.Player.prototype.tick = function(dt) {
	if (this._target.index !== null) { /* movement */
		for (var i=0;i<2;i++) {
			this._tile[i] += this._velocity[this._orientation][i] * this._speed * dt / 1000;
		}
		
		this._target.distanceTraveled = this._distance(this._tile, this._target.source);

		if (this._target.distanceTraveled >= this._target.distanceTotal) { /* arrived at target */
			this._index = this._target.index;
			this._tile = this._target.tile;
			this._target.index = null;
			this._arrived();
		}
		
		this._computePosition();
		this.makeVisible(); /* adjust port if necessary */
	}
	
	return Game.Animation.prototype.tick.call(this, dt);
}

Game.Player.prototype.moveBy = function(moves) {
	this._moves = moves;
	this.dispatch("player-change");
	
	this._enableControl();
}

Game.Player.prototype._enableControl = function() {
	Game.keyboard.push(this);
	Game.movement.show(this, this._index);	
}

Game.Player.prototype._disableControl = function() {
	Game.keyboard.pop();
	Game.movement.hide();
}

Game.Player.prototype._moveDirection = function(direction) {
	if (this._target.index !== null) { return; } /* already moving */
	var index = GRAPH[this._index].neighbors[direction];
	if (index === null) { return; } /* edge does not exist */
	
	if (this._moves == 0) { /* when we have 0 moves, we can move only backwards */
		var returningBack = (this._path[this._path.length-2] == index);
		var returningThroughView = (GRAPH[index].type == "view" && this._path[this._path.length-2] == GRAPH[index].neighbors[direction]);
		var forwardThroughView = (this._path[this._path.length-1] == index);
		if (!returningBack && !returningThroughView && !forwardThroughView) { return; } /* forbidden */
		
	}
	
	this._disableControl();

	this._target.index = index;
	this._target.source = this._tile.clone();
	this._target.tile = [GRAPH[index].x, GRAPH[index].y];
	this._target.distanceTotal = this._distance(this._tile, this._target.tile);
	this._target.distanceTraveled = 0;
	
	var flight = GRAPH[this._index].flight[direction];
	if (flight && !this._flight) { this._flight = flight; }
	
	this._orientation = direction;
	this._updateImage();	
}

Game.Player.prototype._arrived = function() {
	this._flight = GRAPH[this._index].air;
	this._updateImage();
	
	if (GRAPH[this._index].type != "view") { /* adjust moves and path */
		var returnedFromView = (this._path[this._path.length-1] == this._index);
		var returnedFromNode = (this._path.length > 1 && this._path[this._path.length-2] == this._index);
	
		if (returnedFromView) { /* nothing! */
		} else if (returnedFromNode) {
			this._moves++;
			this._path.pop();
		} else {
			this._moves--;
			this._path.push(this._index);
		}
		
	}
	
	if (this._moves) {
		OZ.Audio.play("move-through");
	} else {
		OZ.Audio.play("move-stop");
	}
	
	this.dispatch("player-change");
	
	this._enableControl();
}

Game.Player.prototype._distance = function(tile1, tile2) {
	var dx = tile1[0] - tile2[0];
	var dy = tile1[1] - tile2[1];
	return Math.sqrt(dx*dx+dy*dy);
}

Game.Player.prototype._updateImage = function() {
	this._animation.column = this._orientation + (this._flight ? 4 : 0);
	this._dirty = true;
}

/**
 * Convert tile coords to sprite pixel coords
 */
Game.Player.prototype._computePosition = function() {
	this._sprite.position[0] = (this._tile[0] + 0.5)*Game.TILE - this._sprite.size[0]/2;
	this._sprite.position[1] = this._tile[1]*Game.TILE - this._sprite.size[1]/2;
	
	/* finetuning */
	var takeOff = (this._flight ? 1 : 0);
	if (this._target.index !== null && this._flight) { /* traveling */
		var threshold = 40/Game.TILE; /* 40 pixels far */
		
		var traveled = this._target.distanceTraveled;
		var remaining = this._target.distanceTotal - traveled;
		
		if (traveled <= threshold && !GRAPH[this._index].air) { /* take off */
			takeOff = traveled/threshold;
		} else if (remaining <= threshold && !GRAPH[this._target.index].air) { /* landing */
			takeOff = remaining/threshold;
		}
	}
	var yOffset = 2 + Game.Player.FLIGHT_OFFSET*takeOff;
	this._sprite.position[1] += yOffset;
	
	/* round */
	for (var i=0;i<2;i++) { this._sprite.position[i] = Math.round(this._sprite.position[i]); }

	/* needs redrawing */
	this._dirty = true;
}

Game.Player.prototype._isVisible = function(size) {
	return true;
}

Game.Player.prototype._decideTurn = function() {

	if (this._index == Game.race.getTarget()) { /* won race */
		new Game.Finish(this).onDone(this._endRace.bind(this));
		return;
	}
	
	var type = GRAPH[this._index].type;
	var bound = this._endTurn.bind(this);
	
	new Game.BuySell.Cards(this)
		.onDone(bound);
	return;

	switch (type) {
		case "blue":
			Game.Info.showWin(this).onDone(bound);
		break;

		case "red":
			Game.Info.showLose(this).onDone(bound);
		break;

		case "yellow":
			Game.Info.showCard(this).onDone(bound);
		break;

		case "purple":
			Game.Info.showBuy(this).onDone(bound);
		break;
		
		default:
			bound();
		break;
	}
}

Game.Player.prototype._endTurn = function() {
	this.dispatch("turn-end");
}

Game.Player.prototype._endRace = function() {
	Game.race.stop();
	
	var index = Game.players.indexOf(this);
	
	/* next player will start race */
	Game.race = Game.Race.createFrom(this._index, (index+1) % Game.players.length);
	Game.race.start();
}
