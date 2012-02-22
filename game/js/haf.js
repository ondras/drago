if (!Date.now) {
	Date.now = function() { return +(new Date); }
}

var HAF = {};

HAF.CLEAR_ALL			= 0; /* clearRect on whole canvas */
HAF.CLEAR_NONE			= 1; /* no clearing */
HAF.CLEAR_ACTORS		= 2; /* clear actors */

HAF.DIRTY_ALL			= 0; /* (re-)draw all actors */
HAF.DIRTY_CHANGED		= 1; /* (re-)draw only changed actors */

/**
 * @class Base animation director
 */
HAF.Engine = OZ.Class();
HAF.Engine.prototype.init = function(size,  options) {
	this._size = null;
	this._options = {
		fps: 60,
		id: "haf",
		debug: false
	};
	for (var p in options) { this._options[p] = options[p]; }
	
	this._ts = {
		tick: 0,
		draw: 0
	}

	this._running = false;
	this._container = OZ.DOM.elm("div", {id:this._options.id, position:"relative"});
	this._layers = {};
	this._schedule = null;
	this.draw = this.draw.bind(this);
	this.tick = this.tick.bind(this);
	this.setSize(size || [0, 0]);

	var prefixes = ["", "moz", "webkit", "ms"];
	for (var i=0;i<prefixes.length;i++) {
		var name = prefixes[i] + (prefixes[i] ? "R" : "r") + "equestAnimationFrame";
		if (name in window) { this._schedule = window[name]; }
	}
	if (!this._schedule) { 
		this._schedule = function(cb) {
			setTimeout(cb, 1000/60); /* 60 fps */
		}
	}
	
	this._debugCanvas = OZ.DOM.elm("canvas", {width:"32", height:"32"});
	var debugContext = this._debugCanvas.getContext("2d");
	debugContext.fillStyle = "rgba(255, 255, 255, 0.2)";
	debugContext.fillRect(0, 0, 16, 16);
	debugContext.fillRect(16, 16, 16, 16);
	debugContext.fillStyle = "rgba(150, 150, 150, 0.2)";
	debugContext.fillRect(0, 16, 16, 16);
	debugContext.fillRect(16, 0, 16, 16);
}

/**
 * @param {int[]} size
 * @param {id || null} layer layer to resize; when null, whole container is resized
 */
HAF.Engine.prototype.setSize = function(size, layerId) {
	if (layerId) {
		var layer = this._layers[layerId];
		layer.canvas.width = size[0];
		layer.canvas.height = size[1];
		this.setDirty(layerId);
	} else {
		this._size = size;
		
		this._container.style.width = size[0]+"px";
		this._container.style.height = size[1]+"px";
		
		for (var id in this._layers) {
			var layer = this._layers[id];
			if (!layer.sync) { continue; }
			layer.canvas.width = this._size[0];
			layer.canvas.height = this._size[1];
			this.setDirty(id);
		}
	}
}

HAF.Engine.prototype.isRunning = function() {
	return this._running;
}

HAF.Engine.prototype.getContainer = function() {
	return this._container;
}

/**
 * @param {id} id Layer ID
 * @param {object} [options]
 * @param {bool} [options.sync] sync Size with the main container?
 * @param {bool} [options.clear] clear Clearing algorithm - HAF.CLEAR_ constatnt
 * @param {bool} [options.dirty] dirty Which actors are dirty? - HAF.DIRTY_ constant
 */
HAF.Engine.prototype.addLayer = function(id, options) {
	if (id in this._layers) { return; }

	var canvas = OZ.DOM.elm("canvas", {position:"absolute", className:id});
	canvas.width = this._size[0];
	canvas.height = this._size[1];

	var o = {
		clear: HAF.CLEAR_ALL,
		dirty: HAF.DIRTY_ALL,
		sync: true
	};
	for (var p in options) { o[p] = options[p]; }
	
	var layer = {
		canvas: canvas,
		ctx: canvas.getContext("2d"),
		clear: o.clear,
		dirty: o.dirty,
		sync: o.sync,
		debugPattern: null,
		actors: []
	}
	layer.debugPattern = layer.ctx.createPattern(this._debugCanvas, "repeat");
	this._layers[id] = layer;
	this._container.appendChild(canvas);

	return canvas;
}

HAF.Engine.prototype.addActor = function(actor, layerId) {
	var layer = this._layers[layerId];
	
	var a = {
		box: null, /* latest drawn bbox; is used to clear the actor */
		changed: true, /* was changed in one of the last ticks? */
		actor: actor, /* user-supplied instance */
		dead: false /* is this one dead, waiting to be collected? */
	};
	layer.actors.push(a); 

	actor.tick(0); /* potential initialization */
	return this;
}

HAF.Engine.prototype.removeActor = function(actor, layerId) {
	var layer = this._layers[layerId];
	for (var i=0;i<layer.actors.length;i++) {
		var a = layer.actors[i];
		if (a.actor == actor) { 
			a.dead = true; 
			break;
		}
	}
	return this;
}

HAF.Engine.prototype.removeActors = function(layerId) {
	var actors = this._layers[layerId].actors;
	for (var i=0;i<actors.length;i++) { actors[i].dead = true;  }
	return this;
}

HAF.Engine.prototype.setDirty = function(layerId) {
	var actors = this._layers[layerId].actors;
	for (var i=0;i<actors.length;i++) { actors[i].changed = true; }
	return this;
}

HAF.Engine.prototype.start = function() {
	this._running = true;
	this.dispatch("start");
	var ts = Date.now();
	this._ts.tick = ts;
	this._ts.draw = ts;
	this.tick();
	this.draw();
	return this;
}

HAF.Engine.prototype.stop = function() {
	this._running = false;
	this.dispatch("stop");
	return this;
}

/**
 * (Physics) Time step
 */
HAF.Engine.prototype.tick = function() {
	if (!this._running) { return; }
	
	setTimeout(this.tick, 1000/this._options.fps);

	var ts1 = Date.now();
	var dt = ts1 - this._ts.tick;
	this._ts.tick = ts1;
	var allActors = 0;
	var changedActors = 0;
	
	for (var id in this._layers) { /* for all layers */
		var layer = this._layers[id];
		var actors = layer.actors;
		var len = actors.length;
		allActors += len;
		
		for (var i=0;i<len;i++) { /* tick all actors, remember if any actor changed */
			var actor = actors[i];
			if (actor.dead) { continue; } /* empty record: was recently removed, will be purged on redraw */
			var changed = actor.actor.tick(dt);
			actor.changed = changed || actor.changed;
			if (changed) { changedActors++; }
		}

	}
	
	this.dispatch("tick", {delay:dt, time:Date.now()-ts1, all:allActors, changed:changedActors});
}

/**
 * Drawing time step
 */
HAF.Engine.prototype.draw = function() {
	if (!this._running) { return; }

	this._schedule.call(window, this.draw); /* schedule next tick */

	var drawnActors = 0;
	var allActors = 0;
	var ts1 = Date.now();
	var dt = ts1 - this._ts.draw;
	this._ts.draw = ts1;
	
	/* clear & draw phase */
	for (var id in this._layers) {
		var layer = this._layers[id];
		var actors = layer.actors;
		var allCount = actors.length;
		allActors += allCount;

		var dirtyCount = this._updateDirtyActors(layer); /* adjust number of actors waiting to be redrawn */
		if (!dirtyCount) { continue; } /* nothing changed, cool */

		/* clear */
		switch (layer.clear) {
			case HAF.CLEAR_ALL:
				layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
			break;
			
			/* clear actors */
			case HAF.CLEAR_ACTORS: 
				for (var i=0;i<allCount;i++) {
					if (!actors[i].changed) { continue; }
					var box = actors[i].box;
					if (box) { layer.ctx.clearRect(box[0][0], box[0][1], box[1][0], box[1][1]); }
				}
			break;
		}
		
		/* draw */
		for (var i=0;i<allCount;i++) {
			var actor = actors[i];
			if (!actor.changed) { continue; }
			if (actor.dead) { /* empty record: was recently deleted and cleared */
				actors.splice(i, 1);
				i--;
				allCount--;
				continue;
			}
			actor.changed = false;
			actor.actor.draw(layer.ctx);
			actor.box = actor.actor.getBox();
			if (this._options.debug && actor.box) { 
				layer.ctx.fillStyle = layer.debugPattern;
				layer.ctx.fillRect(actor.box[0][0], actor.box[0][1], actor.box[1][0], actor.box[1][1]); 
			}
			drawnActors++;
		}
		
	}
	
	this.dispatch("draw", {delay:dt, time:Date.now()-ts1, all:allActors, drawn:drawnActors});
}

HAF.Engine.prototype._updateDirtyActors = function(layer) {
	var actors = layer.actors;
	var len = actors.length;

	switch (layer.dirty) {
		case HAF.DIRTY_ALL: /* once one was changed, mark all as changed */
			var oneChanged = false;
			for (var i=0;i<len;i++) {
				if (actors[i].changed) {
					oneChanged = true;
					break;
				}
			}
			if (oneChanged) {
				for (var i=0;i<len;i++) { actors[i].changed = true; }
				return len;
			} else {
				return 0;
			}
		break;
		
		case HAF.DIRTY_CHANGED:
			if (layer.clear != HAF.CLEAR_ACTORS) {  /* just count how many changed */	
				var count = 0;
				for (var i=0;i<len;i++) {
					if (actors[i].changed) { count++; }
				}
				return count;
			}
			
			/* adjust number of changed in order to prevent overlapping box clear */
			var clean = [];
			var dirty = [];
			for (var i=0;i<len;i++) { /* compute clean actors first */
				if (actors[i].changed) { 
					dirty.push(actors[i]); 
				} else {
					clean.push(actors[i]); 
				}
			}

			var dirtyLength = dirty.length;
			for (var i=0;i<dirtyLength;i++) {
				var dirtyActor = dirty[i];
				if (!dirtyActor.box) { continue; } /* not changed/drawn yet; will not be cleared */
				var cleanLength = clean.length;
				for (var j=0;j<cleanLength;j++) { /* clean actor MUST have a box (was already drawn) */
					var cleanActor = clean[j];
					if (this._intersects(cleanActor.box, dirtyActor.box)) { /* they intersect; mark clean actor dirty */
						cleanActor.changed = true;
						clean.splice(j, 1);
						cleanLength--;
						j--;
						
						dirty.push(cleanActor);
						dirtyLength++;
					}
					
				}
			}

			return dirtyLength;
		break;
	}

}

/**
 * Do two bounding boxes intersect?
 */
HAF.Engine.prototype._intersects = function(box1, box2) {
	if (box1[0][0]+box1[1][0] <= box2[0][0]) { return false; } /* box1 left of box2 */
	if (box1[0][0] >= box2[0][0]+box2[1][0]) { return false; } /* box1 right of box2 */
	if (box1[0][1]+box1[1][1] <= box2[0][1]) { return false; } /* box1 top of box2 */
	if (box1[0][1] >= box2[0][1]+box2[1][1]) { return false; } /* box1 bottom of box2 */
	return true;
}

/**
 * Abstract FPS monitor
 */
HAF.Monitor = OZ.Class();
HAF.Monitor.prototype.init = function(engine, size, event, options) {
	this._size = size;
	this._options = {
		textColor: "#000",
		chart: true
	};
	for (var p in options) { this._options[p] = options[p]; }
	this._canvas = OZ.DOM.elm("canvas", {width:size[0], height:size[1], className:"monitor"});
	this._ctx = this._canvas.getContext("2d");
	this._ctx.textBaseline = "top";
	this._ctx.font = "10px monospace";
	
	this._data = [];
	this._avg = [];
	this._paused = false;
	
	OZ.Event.add(this._canvas, "click", this._click.bind(this));
	OZ.Event.add(engine, "start", this._start.bind(this));
	OZ.Event.add(engine, event, this._event.bind(this));
}

HAF.Monitor.prototype.getContainer = function() {
	return this._canvas;
}

HAF.Monitor.prototype._click = function(e) {
	this._paused = !this._paused;
}

HAF.Monitor.prototype._start = function(e) {
	this._data = [];
}

HAF.Monitor.prototype._event = function(e) {
	if (this._data.length > this._size[0]) { this._data.shift(); }
	this._avg.push(this._data[this._data.length-1]);
	if (this._avg.length > 30) { this._avg.shift(); }
	if (!this._paused) { this._draw(); }
}

HAF.Monitor.prototype._draw = function() {
	this._ctx.clearRect(0, 0, this._size[0], this._size[1]);
}

HAF.Monitor.prototype._drawSet = function(index, color) {
	if (!this._options.chart) { return; }
	this._ctx.beginPath();
	var i = this._data.length;
	var w = this._size[0];
	var h = this._size[1]-0.5;
	while (i--) {
		this._ctx.lineTo(w--, h-this._data[i][index]);
	}
	this._ctx.strokeStyle = color;
	this._ctx.stroke();
}

/**
 * Draw monitor
 */
HAF.Monitor.Draw = OZ.Class().extend(HAF.Monitor);
HAF.Monitor.Draw.prototype.init = function(engine, size, options) {
	HAF.Monitor.prototype.init.call(this, engine, size, "draw", options);
}

HAF.Monitor.Draw.prototype._event = function(e) {
	var frac = e.data.drawn/e.data.all;
	frac *= (this._size[1]-1);
	this._data.push([e.data.delay, e.data.time, Math.round(frac), e.data.drawn, e.data.all]);
	HAF.Monitor.prototype._event.call(this, e);
}

HAF.Monitor.Draw.prototype._draw = function() {
	HAF.Monitor.prototype._draw.call(this);
	
	this._drawSet(0, "#88f");
	this._drawSet(1, "#00f");
	this._drawSet(2, "#ff0");
	
	var avg = [0, 0];
	for (var i=0;i<this._avg.length;i++) {
		avg[0] += this._avg[i][0];
		avg[1] += this._avg[i][1];
	}
	var fps1 = (1000 * this._avg.length / avg[0]).toFixed(1);
	var fps2 = (1000 * this._avg.length / avg[1]).toFixed(1);
	
	var drawn = this._data[this._data.length-1][3];
	var all = this._data[this._data.length-1][4];

	var text = "Draw: " + fps1 + "/" + fps2 + " FPS, " + drawn + "/" + all + " drawn";
	this._ctx.fillStyle = this._options.textColor;
	this._ctx.fillText(text, 5, 5);
}

/**
 * Sim monitor
 */
HAF.Monitor.Sim = OZ.Class().extend(HAF.Monitor);
HAF.Monitor.Sim.prototype.init = function(engine, size, options) {
	HAF.Monitor.prototype.init.call(this, engine, size, "tick", options);
}

HAF.Monitor.Sim.prototype._event = function(e) {
	var frac = e.data.changed/e.data.all;
	frac *= (this._size[1]-1);
	this._data.push([e.data.delay, e.data.time, Math.round(frac), e.data.changed, e.data.all]);
	HAF.Monitor.prototype._event.call(this, e);
}

HAF.Monitor.Sim.prototype._draw = function() {
	HAF.Monitor.prototype._draw.call(this);
	
	this._drawSet(0, "#f88");
	this._drawSet(1, "#f00");
	this._drawSet(2, "#4f4");

	var avg = [0, 0];
	for (var i=0;i<this._avg.length;i++) {
		avg[0] += this._avg[i][0];
		avg[1] += this._avg[i][1];
	}
	var fps1 = (1000 * this._avg.length / avg[0]).toFixed(1);
	var fps2 = (1000 * this._avg.length / avg[1]).toFixed(1);
	
	var changed = this._data[this._data.length-1][3];
	var all = this._data[this._data.length-1][4];
	
	var text = "Sim: " + fps1 + "/" + fps2 + " FPS, " + changed + "/" + all + " changed";
	this._ctx.fillStyle = this._options.textColor;
	this._ctx.fillText(text, 5, 5);
}

/**
 * Abstract actor
 */
HAF.Actor = OZ.Class();
HAF.Actor.prototype.tick = function(dt) { return false; }
HAF.Actor.prototype.draw = function(context) { }
HAF.Actor.prototype.getBox = function() { return null; }

/**
 * Image sprite actor
 */
HAF.Sprite = OZ.Class().extend(HAF.Actor);
HAF.Sprite.prototype.init = function(image, size) {
	this._sprite = {
		size: size,
		position: [0, 0],
		image: image
	}
}
HAF.Sprite.prototype.draw = function(context) {
	var position = this._getSourceImagePosition();
	position[0] *= this._sprite.size[0];
	position[1] *= this._sprite.size[1];

	context.drawImage(
		this._sprite.image, 
		position[0], position[1], this._sprite.size[0], this._sprite.size[1], 
		this._sprite.position[0]-this._sprite.size[0]/2, this._sprite.position[1]-this._sprite.size[1]/2, this._sprite.size[0], this._sprite.size[1]
	);
}
HAF.Sprite.prototype.getBox = function() {
	return [
		[this._sprite.position[0]-this._sprite.size[0]/2, this._sprite.position[1]-this._sprite.size[1]/2],
		this._sprite.size
	];
}
HAF.Sprite.prototype._getSourceImagePosition = function() {
	return [0, 0];
}

/**
 * Static image builder
 * @param {string} url
 * @param {int[]} size
 * @param {int} rotation angle (degrees)
 * @param {bool} cache cache it?
 */
HAF.Sprite.get = function(url, size, rotation, cache) {
	var item = null;
	
	if (!this._cache[url]) { /* image not ready yet */
		item = {
			img: OZ.DOM.elm("img", {src:url}),
			event: null,
			versions: {}
		}
		item.event = OZ.Event.add(item.img, "load", function(e) {
			OZ.Event.remove(item.event);
			item.event = null;
			for (var p in item.versions) { HAF.Sprite._render(url, p); }
		});
		this._cache[url] = item;
	} else { /* this image was already requested */
		item = this._cache[url];
	}
	
	if (!size) { return; } /* just pre-cache */
	
	while (rotation < 0) { rotation += 360; }
	while (rotation >= 360) { rotation -= 360; }
	var key = size.join(",") + "," + rotation + "," + (cache ? 1 : 0);
	if (item.versions[key]) { return item.versions[key]; } /* we already have this */
	
	item.versions[key] = OZ.DOM.elm("canvas", {width:size[0], height:size[1]});
	if (!item.event) { return this._render(url, key); } /* image loaded, render & return */

	return item.versions[key]; /* not loaded yet, wait please */
}
HAF.Sprite._cache = {};
/**
 * Render a pre-requested variant of an image
 */
HAF.Sprite._render = function(url, key) {
	var item = this._cache[url];
	var canvas = item.versions[key];
	var context = canvas.getContext("2d");
	var parts = key.split(",");
	var angle = parseInt(parts[2]);
	
	if (angle) { /* add rotation if requested */
		context.translate(canvas.width/2, canvas.height/2);
		context.rotate(angle * Math.PI / 180);
		context.translate(-canvas.width/2, -canvas.height/2);
	}
	
	context.drawImage(item.img, 0, 0, canvas.width, canvas.height);
	if (parts[3] == "0") { delete item.versions[key]; } /* not to be cached */
	return canvas;
}

/**
 * Animated image sprite, consists of several frames
 */
HAF.AnimatedSprite = OZ.Class().extend(HAF.Sprite);
HAF.AnimatedSprite.prototype.init = function(image, size, frames) {
	HAF.Sprite.prototype.init.call(this, image, size);
	this._animation = {
		fps: 10,
		time: 0,
		frame: 0,
		frames: frames
	}
	
}
HAF.AnimatedSprite.prototype.tick = function(dt) {
	this._animation.time += dt;
	var oldFrame = this._animation.frame;
	this._animation.frame = Math.floor(this._animation.time * this._animation.fps / 1000) % this._animation.frames;
	return (oldFrame != this._animation.frame);
}

/**
 * Particle, suitable for particle fx
 */
HAF.Particle = OZ.Class().extend(HAF.Actor);
HAF.Particle.SQUARE	= 0;
HAF.Particle.CIRCLE	= 1;
HAF.Particle.prototype.init = function(position, options) {
	options = options || {};
	this._particle = {
		position: position,
		pxPosition: [0, 0],
		velocity: options.velocity || [0, 0], /* pixels per second */
		opacity: options.opacity || 1,
		size: options.size || 2,
		color: options.color || [0, 0, 0],
		type: options.type || HAF.Particle.SQUARE,
		decay: options.decay || 0 /* opacity per second */
	}

}

HAF.Particle.prototype.tick = function(dt) {
	var changed = false;

	/* adjust position */
	for (var i=0;i<2;i++) {
		var pos = this._particle.position[i] + this._particle.velocity[i] * dt / 1000;
		this._particle.position[i] = pos;
		var px = Math.round(pos);
		if (px != this._particle.pxPosition[i]) {
			this._particle.pxPosition[i] = px;
			changed = true;
		}
	}
	
	/* adjust opacity */
	if (this._particle.decay) {
		var diff = this._particle.decay * dt / 1000;
		this._particle.opacity = Math.max(0, this._particle.opacity - diff);
		changed = true;
	}
	
	return changed;
}

HAF.Particle.prototype.draw = function(context) {
	context.fillStyle = "rgba("+this._particle.color.join(",")+","+this._particle.opacity+")";
	var half = this._particle.size/2;
	switch (this._particle.type) {
		case HAF.Particle.SQUARE:
			context.fillRect(this._particle.pxPosition[0]-half, this._particle.pxPosition[1]-half, this._particle.size, this._particle.size);
		break;

		case HAF.Particle.CIRCLE:
			context.beginPath();
			context.arc(this._particle.pxPosition[0], this._particle.pxPosition[1], this._particle.size/2, 0, 2*Math.PI, false);
			context.fill();
		break;
	}
}

HAF.Particle.prototype.getBox = function() {
	var half = this._particle.size/2;
	return [
		[this._particle.pxPosition[0]-half, this._particle.pxPosition[1]-half],
		[this._particle.size, this._particle.size]
	];
}
