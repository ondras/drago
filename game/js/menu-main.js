Game.Menu.Main = OZ.Class().extend(Game.Menu);
Game.Menu.Main.prototype.init = function() {
	Game.Menu.prototype.init.call(this);
	
	this.onAbort(function() { new Game.Menu.Main(); });
	
	this._addItem("new", "New game");
	this._addItem("load", "Continue game", !localStorage.dragoSave);
	this._addItem("help", "Help");
	this._addItem("donate", "Donate");
	this._hover("new");
	
	this._center();
}

Game.Menu.Main.prototype._go = function(id) {
	switch (id) {
		case "donate":
			location.href = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7WXVKF3ZJ9FZE";
		break;
		
		case "help":
			location.href = "help/";
		break;
		
		case "new":
			this._hide();
			new Game.Setup();
		break;
		
		case "load":
			this._hide();
			Game.play(true);
		break;
	}
}

