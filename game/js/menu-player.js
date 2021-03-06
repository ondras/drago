Game.Menu.Player = OZ.Class().extend(Game.Menu);
Game.Menu.Player.prototype.init = function(player) {
	this._player = player;
	Game.Menu.prototype.init.call(this);
	
	this._addItem("slot", "Slot machine");
	this._addItem("card", "Use card", player.getCards().length == 0);
	this._addItem("overview", "Show map");
	this._addItem("save", "Save game");
	this._hover("slot");
	
	this._center();
}
/**
 * Confirm an item
 */
Game.Menu.Player.prototype._go = function(id) {
	switch (id) {
		case "slot":
			this._hide();

			Game.Slot.roll1()
				.onDone(this._slot.bind(this)) 
				.onAbort(this._restore.bind(this));
		break;
		
		case "card":
			var cards = this._player.getCards();
			if (!cards.length) { return; }
			
			var flags = this._player.getFlags();
			if (flags.block) { /* cards are blocked */
				this._hide();
				Game.Info.showBlock(this._player)
					.onDone(this._restore.bind(this));
				return;
			}
			
			var locked = [];
			var nonDoubleCount = 0;
			var hasDouble = false;
			for (var i=0;i<cards.length;i++) {
				var card = cards[i];
				if (card instanceof Game.Card.Double) {
					hasDouble = card;
				} else {
					nonDoubleCount++;
				}
			}
			
			if (hasDouble && !nonDoubleCount) { locked.push(hasDouble); } /* lock doubles */
			
			this._hide();
			new Game.CardList(cards, {parent:null, keyboard:true, select:0})
				.lock(locked)
				.onDone(this._card.bind(this))
				.onAbort(this._restore.bind(this));
		break;
		
		case "overview":
			this._hide();
			new Game.Overview(this._player)
				.onDone(this._restore.bind(this));
		break;
		
		case "save":
			Game.save();
			this.handleInput(Game.INPUT_ESC);
		break;
	}
}

Game.Menu.Player.prototype._slot = function(result) {
	this._destroy();
	this._player.moveBy(result);
}

Game.Menu.Player.prototype._card = function(card) {
	this._destroy();
	this._player.removeCard(card);
	card.play(this._player);
}
