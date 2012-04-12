OZ.Touch = {
	onStart: function(elm, cb) {
		var e = ("ontouchstart" in elm ? "touchstart" : "mousedown");
		return OZ.Event.add(elm, e, cb);
	},
	
	onMove: function(elm, cb) {
		var e = ("ontouchmove" in elm ? "touchmove" : "mousemove");
		return OZ.Event.add(elm, e, cb);
	},
	
	onEnd: function(elm, cb) {
		var e = ("ontouchend" in elm ? "touchend" : "mouseup");
		return OZ.Event.add(elm, e, cb);
	},
	
	onActivate: function(elm, cb) {
		var e = ("ontouchstart" in elm ? "touchstart" : "click");
		return OZ.Event.add(elm, e, cb);
	},
	
	touches: function(e) {
		return (e.touches ? e.touches.length : 0);
	},

	pos: function(e) {
		var event = (this.touches(e) ? e.touches[0] : e);
		return [event.clientX, event.clientY];
	}
};
