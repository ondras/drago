Game.Audio = {
	init: function() {
		this._supported = !!window.Audio;
		if (!this._supported) { return; }
		this._format = (new Audio().canPlayType("audio/ogg") ? "ogg" : "mp3");
		this._background = new Audio();
		OZ.Event.add(this._background, "ended", this.nextBackground.bind(this));
		
		var shift = Math.floor(Math.random()*this._backgrounds.length);
		while (shift--) {
			this._backgrounds.push(this._backgrounds.shift());
		}
		
		this.nextBackground();
	},
	
	playBackground: function() {
		if (this._background.paused) { this._background.play(); }
	},
	
	pauseBackground: function() {
		if (!this._background.paused) { this._background.pause(); }
	},
	
	nextBackground: function() {
		var paused = this._background.paused;
		var name = this._backgrounds.shift();
		this._backgrounds.push(name);
		this._background.src = this._buildSrc(name, "music");
		if (!paused) { this.playBackground(); }
	},
	
	prevBackground: function() {
		var paused = this._background.paused;
		var name = this._backgrounds.pop();
		this._backgrounds.unshift(name);
		name = this._backgrounds[this._backgrounds.length-1];
		this._background.src = this._buildSrc(name, "music");
		if (!paused) { this.playBackground(); }
	},

	_buildSrc: function(name, type) {
		return "sound/" + type + "/" + this._format + "/" + name + "." + this._format;
	},
	
	_backgrounds: ["I", "S", "G0", "G1", "G2", "G3", "G4", "G5", "A1"],
	_supported: null,
	_format: "",
	_background: null
	
};

Game.Audio.init();
