OZ.Audio = {
	format: "",
	supported: false,
	template: "{name}.{format}",

	play: function(name) {
		if (!OZ.Audio.supported) { return null; }
		var a = new Audio(this._format(name));
		a.play();
		return a;
	},
	
	background: {
		template: "{name}.{format}",
		queue: [],
		format: "",
		_audio: null,
		
		play: function() {
			if (!OZ.Audio.supported) { return; }
			if (!this._audio.src) { this.next(); }
			if (this._audio.src && this._audio.paused) { this._audio.play(); }
		},
		pause: function() {
			if (!OZ.Audio.supported) { return; }
			if (!this._audio.paused) { this._audio.pause(); }
		},
		next: function() {
			if (!OZ.Audio.supported) { return; }
			if (!this.queue.length) { return; }
			
			var paused = this._audio.paused;
			var name = this.queue.shift();
			this.queue.push(name);
			this._audio.src = this._format(name);
			if (!paused) { this.play(); }
		},
		previous: function() {
			if (!OZ.Audio.supported) { return; }
			if (!this.queue.length) { return; }
			
			var paused = this._audio.paused;
			var name = this.queue.pop();
			this.queue.unshift(name);
			name = this.queue[this.queue.length-1];
			this._audio.src = this._format(name);
			if (!paused) { this.play(); }
		},
		fadeOut: function(time) {
			if (!OZ.Audio.supported) { return; }
			var volume = 1;
			var diff = 1 / ((time || 3) * 10);
			var interval = setInterval(function() {
				volume = Math.max(0, volume-diff);
				this._audio.volume = Math.pow(volume, 2);
				if (!this._audio.volume) { 
					clearInterval(interval);
					this.next(); 
					this._audio.volume = 1;
				}
			}.bind(this), 100);
		}
	},

	_init: function() {
		this.supported = !!window.Audio;
		if (!this.supported) { return; }
		this.format = (new Audio().canPlayType("audio/ogg") ? "ogg" : "mp3");
		this.background.format = this.format;
		this.background._format = this._format;
		
		this.background._audio = new Audio();
		OZ.Event.add(this.background._audio, "ended", function() {
			this.next();
			this.play();
		}.bind(this.background));
		
		this.background.next();
	},
	
	_format: function(name) {
		var subst = {
			"format": this.format,
			"name": name
		}
		var str = this.template;
		for (var p in subst) {
			str = str.replace(new RegExp("{"+p+"}", "g"), subst[p]);
		}
		
		return str;
	}
};

OZ.Audio._init();
