OZ.Touch = {
	START: (document.documentElement.ontouchstart ? "touchstart" : "mousedown"),
	MOVE: (document.documentElement.ontouchmove ? "touchmove" : "mousemove"),
	END: (document.documentElement.ontouchend ? "touchend" : "mouseup"),
	touches: function(e) {
		return (e.touches ? e.touches.length : 0);
	},
	pos: function(e) {
		var event = (this.touches(e) ? e.touches[0] : e);
		return [event.clientX, event.clientY];
	}
};
