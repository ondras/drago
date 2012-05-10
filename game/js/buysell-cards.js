Game.BuySell.Cards = OZ.Class().extend(Game.BuySell);
Game.BuySell.Cards.prototype.init = function(player) {
	this._player = player;
	Game.BuySell.prototype.init.call(this);
	
	this._money = OZ.DOM.elm("span", {styleFloat:"right", cssFloat:"right"});
	this._footer.appendChild(this._money);
	
	this._info = OZ.DOM.elm("span", {styleFloat:"left", cssFloat:"left"});
	this._footer.appendChild(this._info);
	
	this._ec.push(OZ.Event.add(null, "select", this._select.bind(this)));
	this._ec.push(OZ.Event.add(player, "player-change", this._playerChange.bind(this)));
	this._cardListOptions = {parent:this._body, keyboard:false, path:"small/", autoSelect:false};
	
	this._prepare(0);
	this._playerChange();
}

Game.BuySell.Cards.prototype._prepare = function(index) {
	Game.BuySell.prototype._prepare.call(this, index);

	var cards = (index == 0 ? Game.cards : this._player.getCards());
	var option = this._options[index];

	if (!cards.length) {
		if (index != 2) { OZ.DOM.addClass(option, "disabled"); }
		return;
	}

	this._cardListOptions.keyboard = false;
	this._cardListOptions.select = -1;
	this._cardList = new Game.CardList(cards, this._cardListOptions);
	this._cardList.onDone(this._cardListDone.bind(this));
	
	if (!this._body.style.height) { this._body.style.height = this._body.offsetHeight + "px" ;}
}

Game.BuySell.Cards.prototype._clear = function(index) {
	if (this._cardList) { 
		this._cardList.destroy(); 
		this._cardList = null;
	}
	Game.BuySell.prototype._clear.call(this, index);
}

Game.BuySell.Cards.prototype._use = function(index, card) {
	if (OZ.DOM.hasClass(this._options[index], "disabled")) { return; }
	
	Game.BuySell.prototype._use.call(this, index);
	this._clear(index);
	
	var cards = (index == 0 ? Game.cards : this._player.getCards());
	this._cardListOptions.keyboard = true;
	
	var index = 0;
	if (card) {
		var index = cards.indexOf(card);
		if (index == -1) { index = 0; }
	}
	this._cardListOptions.select = index;
	
	this._cardList = new Game.CardList(cards, this._cardListOptions);
	this._cardList.onAbort(this._cardListAbort.bind(this));
	this._cardList.onDone(this._cardListDone.bind(this));
}

Game.BuySell.Cards.prototype._cardListAbort = function() {
	this._cardList = null; /* it was already destroyed */
	this._prepare(this._index);
	
	Game.keyboard.push(this); /* we listen */
}

Game.BuySell.Cards.prototype._cardListDone = function(card) {
	console.log("picked card ", card);
	/* FIXME buy/sell card */
	
	this._cardList = null; /* it was already destroyed */
	Game.keyboard.push(this); /* we listen */

	this._use(this._index, card); /* FIXME select correct card */
	
}

Game.BuySell.Cards.prototype._select = function(e) {
	var card = e.data.card;
	
}

Game.BuySell.Cards.prototype._playerChange = function(e) {
	this._money.innerHTML = Game.formatMoney(this._player.getMoney());
}
